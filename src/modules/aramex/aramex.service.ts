
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClientAsync } from 'soap';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Shipment } from '../../models/shipment.schema';
import * as path from 'path';

@Injectable()
export class AramexService {
  private readonly logger = new Logger(AramexService.name);

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @InjectModel(Shipment.name) private shipmentModel: Model<Shipment>,
  ) {}

  private getClientInfo() {
    return {
      UserName: this.configService.get('ARAMEX_USERNAME'),
      Password: this.configService.get('ARAMEX_PASSWORD'),
      AccountNumber: this.configService.get('ARAMEX_ACCOUNT_NUMBER'),
      AccountPin: this.configService.get('ARAMEX_ACCOUNT_PIN'),
      AccountEntity: this.configService.get('ARAMEX_ACCOUNT_ENTITY'),
      AccountCountryCode: this.configService.get('ARAMEX_ACCOUNT_COUNTRY_CODE'),
      Version: 'v1.0',
    };
  }

  async createShipment(shipmentData: any): Promise<any> {
    // Use the local WSDL file
    const wsdlPath = path.join(__dirname, 'aramex.wsdl');
    // Force the public endpoint
    const endpoint = this.configService.get('ARAMEX_BASE_URL');

    try {
      const client = await createClientAsync(wsdlPath, { endpoint });
      const response = await client.CreateShipmentsAsync({
        ClientInfo: this.getClientInfo(),
        Shipments: [this.formatShipmentData(shipmentData)],
        LabelInfo: {
          ReportID: this.configService.get('ARAMEX_LABEL_REPORT_ID'),
          ReportType: 'URL',
        },
      });

      const result = response?.[0]?.Shipments?.ProcessedShipment;
      if (!result) {
        this.logger.error('No shipment result returned from Aramex API');
        throw new Error('No shipment result returned from Aramex API');
      }

      await this.shipmentModel.create({
        awbNumber: result.ID,
        labelUrl: result.ShipmentLabel?.LabelURL,
        shipmentDetails: result,
        status: 'created',
      });

      return result;
    } catch (error) {
      this.logger.error(`Shipment creation failed: ${error.message}`);
      if (error.response) {
        this.logger.error(`Aramex error response: ${JSON.stringify(error.response.data)}`);
      }
      this.logger.error(error.stack);
      throw new Error('Failed to create shipment');
    }
  }

  private formatShipmentData(data: any) {
    return {
      Shipper: {
        Reference1: data.shipperContact?.name || '',
        PartyAddress: {
          Line1: data.shipperAddress?.line1 || '',
          City: data.shipperAddress?.city || '',
          CountryCode: data.shipperAddress?.countryCode || '',
        },
        Contact: {
          PersonName: data.shipperContact?.name || '',
          PhoneNumber1: data.shipperContact?.phone || '',
          EmailAddress: data.shipperContact?.email || '',
        },
      },
      Consignee: {
        Reference1: data.consigneeContact?.name || '',
        PartyAddress: {
          Line1: data.consigneeAddress?.line1 || '',
          City: data.consigneeAddress?.city || '',
          CountryCode: data.consigneeAddress?.countryCode || '',
        },
        Contact: {
          PersonName: data.consigneeContact?.name || '',
          PhoneNumber1: data.consigneeContact?.phone || '',
          EmailAddress: data.consigneeContact?.email || '',
        },
      },
      Details: {
        Dimensions: {
          Length: data.dimensions?.length || 1,
          Width: data.dimensions?.width || 1,
          Height: data.dimensions?.height || 1,
          Unit: 'cm',
        },
        ActualWeight: {
          Value: data.weight || 0.5,
          Unit: 'Kg',
        },
        ProductGroup: data.productGroup,
        ProductType: data.productType,
        PaymentType: 'P',
        DescriptionOfGoods: data.description,
        GoodsOriginCountry: data.originCountry,
      },
    };
  }

  async trackShipment(awb: string): Promise<any> {
    try {
      const url = 'https://ws.aramex.net/ShippingAPI.V2/Tracking/Service_1_0.svc/json/TrackShipments';
      const response = await this.httpService.post(url, {
        ClientInfo: this.getClientInfo(),
        Shipments: [awb],
        Transaction: { Reference1: 'tracking-request' },
      }).toPromise();

      if (!response?.data?.TrackingResults?.Value?.TrackingResult) {
        this.logger.error('No tracking data returned from Aramex API');
        throw new Error('No tracking data returned from Aramex API');
      }

      const trackingData = response.data.TrackingResults.Value.TrackingResult;
      await this.shipmentModel.updateOne(
        { awbNumber: awb },
        { 
          status: trackingData.UpdateCode,
          $push: { trackingUpdates: trackingData }
        }
      );

      return trackingData;
    } catch (error) {
      this.logger.error(`Tracking failed for AWB ${awb}: ${error.message}`);
      throw new Error('Failed to track shipment');
    }
  }

  async createReturnShipment(originalAwb: string): Promise<any> {
    const originalShipment = await this.shipmentModel.findOne({ awbNumber: originalAwb });
    if (!originalShipment) {
      this.logger.error(`Original shipment with AWB ${originalAwb} not found`);
      throw new Error('Original shipment not found');
    }
    if (!originalShipment.shipmentDetails) {
      this.logger.error(`Original shipment details missing for AWB ${originalAwb}`);
      throw new Error('Original shipment details missing');
    }

    const returnData = {
      ...originalShipment.shipmentDetails,
      Shipper: originalShipment.shipmentDetails.Consignee,
      Consignee: originalShipment.shipmentDetails.Shipper,
      Details: {
        ...originalShipment.shipmentDetails.Details,
        Services: 'RTRN',
      },
    };

    const result = await this.createShipment(returnData);
    await this.shipmentModel.updateOne(
      { awbNumber: originalAwb },
      { returnAwbNumber: result.ID }
    );

    return result;
  }
}
