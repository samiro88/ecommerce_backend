// information.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Information } from '../models/information';
import * as cloudinary from '../utils/cloudinary';

@Injectable()
export class InformationService {
  constructor(
    @InjectModel(Information.name) private informationModel: Model<Information>,
  ) {}

  async getInformation() {
    try {
      let information = await this.informationModel.findOne().select('-_id').exec();

      if (!information) {
        information = await this.informationModel.create({});
        information = await this.informationModel.findById(information._id).select('-_id').exec();
      }

      return {
        message: 'Information fetched successfully',
        data: information,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getGeneralData() {
    try {
      const generalInfo = await this.informationModel
        .findOne()
        .select('general -_id')
        .exec();
      return generalInfo;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateGeneralInformation(body: any, file?: Express.Multer.File) {
    try {
      const information = await this.informationModel.findOne().exec();

      if (!information) {
        throw new Error('Information document not found');
      }

      let logoResult = null;
      if (file) {
        if (information.general?.logo?.img_id) {
          await cloudinary.uploader.destroy(information.general.logo.img_id);
        }

        const fileStr = file.buffer.toString('base64');
        const fileType = file.mimetype;
        const dataUri = `data:${fileType};base64,${fileStr}`;

        logoResult = await cloudinary.uploader.upload(dataUri, {
          folder: 'general',
          resource_type: 'auto',
          transformation: [{ width: 500, crop: 'limit' }, { quality: 'auto' }],
        });
      }

      const updateObject = {
        'general.contact': {
          phone: body.contact?.phone || information.general.contact.phone,
          fax: body.contact?.fax || information.general.contact.fax,
          email: body.contact?.email || information.general.contact.email,
          address: body.contact?.address || information.general.contact.address,
        },
        'general.social': {
          facebookUrl: body.social?.facebookUrl || information.general.social.facebookUrl,
          twitterUrl: body.social?.twitterUrl || information.general.social.twitterUrl,
          linkedInUrl: body.social?.linkedInUrl || information.general.social.linkedInUrl,
          instagramUrl: body.social?.instagramUrl || information.general.social.instagramUrl,
          pinterestUrl: body.social?.pinterestUrl || information.general.social.pinterestUrl,
          youtubeUrl: body.social?.youtubeUrl || information.general.social.youtubeUrl,
          whatsAppUrl: body.social?.whatsAppUrl || information.general.social.whatsAppUrl,
        },
        'general.playStoreUrl': body.playStoreUrl || information.general.playStoreUrl,
        'general.appStoreUrl': body.appStoreUrl || information.general.appStoreUrl,
      };

      if (logoResult) {
        updateObject['general.logo'] = {
          url: logoResult.secure_url,
          img_id: logoResult.public_id,
        };
      }

      const updatedInformation = await this.informationModel
        .findOneAndUpdate({}, { $set: updateObject }, { new: true, runValidators: true })
        .exec();

      return {
        success: true,
        message: 'General information updated successfully',
        data: updatedInformation.general,
      };
    } catch (error) {
      console.error('Error updating general information:', error);
      throw new Error('Error updating general information');
    }
  }

  async getAdvancedData() {
    try {
      const advancedInfo = await this.informationModel
        .findOne()
        .select('advanced -_id')
        .exec();
      return advancedInfo;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateAdvancedInformation(body: any) {
    try {
      const information = await this.informationModel.findOne().exec();
      if (!information) {
        throw new Error('Information document not found');
      }

      const updateObject = {
        'advanced.matricule': body.matricule || information.advanced.matricule,
        'advanced.rib': body.rib || information.advanced.rib,
        'advanced.registerDeCommerce':
          body.registerDeCommerce || information.advanced.registerDeCommerce,
        'advanced.livraison': body.livraison || information.advanced.livraison,
        'advanced.timber': body.timber || information.advanced.timber,
        'advanced.tva': body.tva || information.advanced.tva,
      };

      const updatedInformation = await this.informationModel
        .findOneAndUpdate({}, { $set: updateObject }, { new: true, runValidators: true })
        .exec();

      return {
        success: true,
        message: 'Advanced information updated successfully',
        data: updatedInformation.advanced,
      };
    } catch (error) {
      console.error('Error updating advanced information:', error);
      throw new Error('Error updating advanced information');
    }
  }

  async updateMaterielImageSection(file: Express.Multer.File) {
    try {
      if (!file) {
        throw new Error('No file uploaded');
      }

      let information = await this.informationModel.findOne().exec();
      if (!information) {
        information = new this.informationModel({});
      }

      const fileStr = file.buffer.toString('base64');
      const fileType = file.mimetype;
      const dataUri = `data:${fileType};base64,${fileStr}`;

      if (
        information.homePage &&
        information.homePage.images &&
        information.homePage.images.materielImageSection &&
        information.homePage.images.materielImageSection.img_id
      ) {
        await cloudinary.uploader.destroy(
          information.homePage.images.materielImageSection.img_id,
        );
      }

      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'materiel-section',
        resource_type: 'auto',
        transformation: [
          { width: 1200, crop: 'limit' },
          { quality: 'auto' },
        ],
      });

      if (!information.homePage) {
        information.homePage = {};
      }
      if (!information.homePage.images) {
        information.homePage.images = {};
      }

      information.homePage.images.materielImageSection = {
        url: result.secure_url,
        img_id: result.public_id,
      };

      await information.save();

      return {
        message: 'Materiel image section updated successfully',
        data: information.homePage.images.materielImageSection,
      };
    } catch (error) {
      console.error('Error:', error);
      throw new Error(error.message || 'Error uploading image');
    }
  }

  async deleteMaterielImageSection() {
    try {
      const information = await this.informationModel.findOne().exec();

      if (!information) {
        throw new Error('Information not found');
      }

      if (
        !information.homePage ||
        !information.homePage.images ||
        !information.homePage.images.materielImageSection ||
        !information.homePage.images.materielImageSection.img_id
      ) {
        throw new Error('Materiel image not found');
      }

      await cloudinary.uploader.destroy(
        information.homePage.images.materielImageSection.img_id,
      );

      information.homePage.images.materielImageSection = undefined;
      await information.save();

      return {
        message: 'Materiel image section deleted successfully',
      };
    } catch (error) {
      console.error('Error:', error);
      throw new Error(error.message || 'Error deleting image');
    }
  }

  async getMaterielImageSection() {
    try {
      const information = await this.informationModel.findOne().exec();

      if (
        !information ||
        !information.homePage ||
        !information.homePage.images ||
        !information.homePage.images.materielImageSection
      ) {
        throw new Error('Materiel image not found');
      }

      return {
        message: 'Materiel image fetched successfully',
        data: information.homePage.images.materielImageSection,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getAllSlides() {
    try {
      const information = await this.informationModel.findOne().exec();

      if (!information || !information.homePage || !information.homePage.images) {
        return {
          message: 'No slides found',
          data: [],
        };
      }

      return {
        message: 'Slides fetched successfully',
        data: information.homePage.images.slides || [],
      };
    } catch (error) {
      throw new Error('Error fetching slides');
    }
  }

  async addSlideImages(files: Express.Multer.File[]) {
    try {
      if (!files || files.length === 0) {
        throw new Error('No files uploaded');
      }

      let information = await this.informationModel.findOne().exec();
      if (!information) {
        information = new this.informationModel({});
      }

      if (!information.homePage) information.homePage = {};
      if (!information.homePage.images) information.homePage.images = {};
      if (!information.homePage.images.slides) information.homePage.images.slides = [];

      const uploadPromises = files.map(async (file) => {
        const fileStr = file.buffer.toString('base64');
        const fileType = file.mimetype;
        const dataUri = `data:${fileType};base64,${fileStr}`;

        const result = await cloudinary.uploader.upload(dataUri, {
          folder: 'slides',
          resource_type: 'auto',
          transformation: [
            { width: 1920, crop: 'limit' },
            { quality: 'auto' },
          ],
        });

        return {
          url: result.secure_url,
          img_id: result.public_id,
        };
      });

      const newSlides = await Promise.all(uploadPromises);
      information.homePage.images.slides.push(...newSlides);
      await information.save();

      return {
        message: 'Slide images uploaded successfully',
        data: information.homePage.images.slides,
      };
    } catch (error) {
      console.error('Error uploading slides:', error);
      throw new Error('Error uploading slide images');
    }
  }

  async deleteSlideImage(imgId: string) {
    try {
      const information = await this.informationModel.findOne().exec();

      if (
        !information ||
        !information.homePage ||
        !information.homePage.images ||
        !information.homePage.images.slides
      ) {
        throw new Error('Slides not found');
      }

      const slideIndex = information.homePage.images.slides.findIndex(
        (slide) => slide.img_id === 'slides/' + imgId,
      );

      if (slideIndex === -1) {
        throw new Error('Slide image not found');
      }

      await cloudinary.uploader.destroy(`slides/${imgId}`);
      information.homePage.images.slides.splice(slideIndex, 1);
      await information.save();

      return {
        message: 'Slide image deleted successfully',
        data: information.homePage.images.slides,
      };
    } catch (error) {
      console.error('Error deleting slide:', error);
      throw new Error('Error deleting slide image');
    }
  }

  async updateSlidesOrder(slides: any[]) {
    try {
      if (!Array.isArray(slides)) {
        throw new Error('Invalid slides data');
      }

      const information = await this.informationModel.findOne().exec();

      if (!information) {
        throw new Error('Information document not found');
      }

      if (!information.homePage) information.homePage = {};
      if (!information.homePage.images) information.homePage.images = {};

      const existingIds = new Set(
        (information.homePage.images.slides || []).map((slide) => slide.img_id),
      );

      const allSlidesExist = slides.every((slide) => existingIds.has(slide.img_id));
      if (!allSlidesExist) {
        throw new Error('One or more slide IDs are invalid');
      }

      information.homePage.images.slides = slides;
      await information.save();

      return {
        message: 'Slides order updated successfully',
        data: information.homePage.images.slides,
      };
    } catch (error) {
      console.error('Error updating slides order:', error);
      throw new Error('Error updating slides order');
    }
  }

  async getAllBrands() {
    try {
      const information = await this.informationModel.findOne().exec();
      if (!information || !information.homePage || !information.homePage.images) {
        return {
          message: 'No brands found',
          data: [],
        };
      }
      return {
        message: 'Brands fetched successfully',
        data: information.homePage.images.brands || [],
      };
    } catch (error) {
      throw new Error('Error fetching brands');
    }
  }

  async addBrandImages(files: Express.Multer.File[]) {
    try {
      if (!files || files.length === 0) {
        throw new Error('No files uploaded');
      }

      let information = await this.informationModel.findOne().exec();
      if (!information) {
        information = new this.informationModel({});
      }

      if (!information.homePage) information.homePage = {};
      if (!information.homePage.images) information.homePage.images = {};
      if (!information.homePage.images.brands) information.homePage.images.brands = [];

      const uploadPromises = files.map(async (file) => {
        const fileStr = file.buffer.toString('base64');
        const fileType = file.mimetype;
        const dataUri = `data:${fileType};base64,${fileStr}`;
        const result = await cloudinary.uploader.upload(dataUri, {
          folder: 'brands',
          resource_type: 'auto',
          transformation: [
            { width: 500, crop: 'limit' },
            { quality: 'auto' },
          ],
        });
        return {
          url: result.secure_url,
          img_id: result.public_id,
        };
      });

      const newBrands = await Promise.all(uploadPromises);
      information.homePage.images.brands.push(...newBrands);
      await information.save();

      return {
        message: 'Brand images uploaded successfully',
        data: information.homePage.images.brands,
      };
    } catch (error) {
      console.error('Error uploading brands:', error);
      throw new Error('Error uploading brand images');
    }
  }

  async deleteBrandImage(imgId: string) {
    try {
      const information = await this.informationModel.findOne().exec();

      if (
        !information ||
        !information.homePage ||
        !information.homePage.images ||
        !information.homePage.images.brands
      ) {
        throw new Error('Brands not found');
      }

      const brandIndex = information.homePage.images.brands.findIndex(
        (brand) => brand.img_id === `brands/${imgId}`,
      );
      if (brandIndex === -1) {
        throw new Error('Brand image not found');
      }

      await cloudinary.uploader.destroy(`brands/${imgId}`);
      information.homePage.images.brands.splice(brandIndex, 1);
      await information.save();

      return {
        message: 'Brand image deleted successfully',
        data: information.homePage.images.brands,
      };
    } catch (error) {
      console.error('Error deleting brand:', error);
      throw new Error('Error deleting brand image');
    }
  }

  async updateBrandsOrder(brands: any[]) {
    try {
      if (!Array.isArray(brands)) {
        throw new Error('Invalid brands data');
      }

      const information = await this.informationModel.findOne().exec();
      if (!information) {
        throw new Error('Information document not found');
      }

      if (!information.homePage) information.homePage = {};
      if (!information.homePage.images) information.homePage.images = {};

      const existingIds = new Set(
        (information.homePage.images.brands || []).map((brand) => brand.img_id),
      );
      const allBrandsExist = brands.every((brand) => existingIds.has(brand.img_id));
      if (!allBrandsExist) {
        throw new Error('One or more brand IDs are invalid');
      }

      information.homePage.images.brands = brands;
      await information.save();

      return {
        message: 'Brands order updated successfully',
        data: information.homePage.images.brands,
      };
    } catch (error) {
      console.error('Error updating brands order:', error);
      throw new Error('Error updating brands order');
    }
  }
}