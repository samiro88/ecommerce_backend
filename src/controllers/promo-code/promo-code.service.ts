import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model, isValidObjectId } from 'mongoose';
  import { PromoCode} from '../../models/promo-code.schema';
  import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
  import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
  
  @Injectable()
  export class PromoCodesService {
    constructor(
      @InjectModel(PromoCode.name) private promoCodeModel: Model<PromoCode>,
    ) {}
  
    async getAllPromoCodes() {
      const promoCodes = await this.promoCodeModel.find().sort('-createdAt').exec();
      return { message: 'successful', data: promoCodes };
    }
  
    async createPromoCode(createPromoCodeDto: CreatePromoCodeDto) {
      const existingCode = await this.promoCodeModel.findOne({
        code: createPromoCodeDto.code,
      });
  
      if (existingCode) {
        throw new BadRequestException('Promo code already exists');
      }
  
      const createdPromoCode = await this.promoCodeModel.create(createPromoCodeDto);
      return { message: 'Success', data: createdPromoCode };
    }
  
    async getPromoCodeById(id: string) {
      if (!isValidObjectId(id)) {
        throw new BadRequestException('Invalid promo code ID');
      }
  
      const promoCode = await this.promoCodeModel.findById(id).exec();
  
      if (!promoCode) {
        throw new NotFoundException('Promo code not found');
      }
  
      return { message: 'Success', data: promoCode };
    }
  
    async updatePromoCode(id: string, updatePromoCodeDto: UpdatePromoCodeDto) {
      if (!isValidObjectId(id)) {
        throw new BadRequestException('Invalid promo code ID');
      }
  
      const promoCode = await this.promoCodeModel.findById(id).exec();
  
      if (!promoCode) {
        throw new NotFoundException('Promo code not found');
      }
  
      const updatedPromoCode = await this.promoCodeModel
        .findByIdAndUpdate(id, updatePromoCodeDto, { new: true })
        .exec();
  
      return { message: 'Success', data: updatedPromoCode };
    }
  
    async deletePromoCodes(ids: string[]) {
      // Validate input
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestException(
          'Please provide a non-empty array of promo code IDs',
        );
      }
  
      // Validate MongoDB IDs
      const invalidIds = ids.filter((id) => !isValidObjectId(id));
      if (invalidIds.length > 0) {
        throw new BadRequestException({
          message: 'Invalid promo code ID format',
          invalidIds,
        });
      }
  
      // Delete operation
      const deleteResult = await this.promoCodeModel.deleteMany({
        _id: { $in: ids },
      });
  
      if (deleteResult.deletedCount === 0) {
        throw new NotFoundException('No matching promo codes found to delete');
      }
  
      return {
        message: 'Bulk delete operation completed',
        data: { deletedCount: deleteResult.deletedCount },
      };
    }
  }