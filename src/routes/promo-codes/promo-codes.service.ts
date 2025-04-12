import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import { PromoCode } from '../../models/promo-code.schema';;
  import mongoose from 'mongoose';
  
  @Injectable()
  export class PromoCodesService {
    constructor(
      @InjectModel(PromoCode.name) private promoCodeModel: Model<PromoCode>,
    ) {}
  
    async getPromoCodes() {
      try {
        const promoCodes = await this.promoCodeModel
          .find()
          .sort({ createdAt: -1 })
          .exec();
        return {
          success: true,
          data: promoCodes,
        };
      } catch (error) {
        throw new InternalServerErrorException('Error fetching promo codes');
      }
    }
  
    async getPromoCodeById(id: string) {
      try {
        const promoCode = await this.promoCodeModel.findById(id).exec();
        if (!promoCode) {
          throw new NotFoundException('Promo code not found');
        }
        return {
          success: true,
          data: promoCode,
        };
      } catch (error) {
        if (error instanceof NotFoundException) throw error;
        throw new InternalServerErrorException('Error fetching promo code');
      }
    }
  
    async createPromoCode(body: any) {
      const session = await mongoose.startSession();
      session.startTransaction();
  
      try {
        // Same validation as original
        const { code, discountType, discountValue, validFrom, validUntil, minOrderAmount } = body;
        
        if (!code || !discountType || !discountValue || !validFrom) {
          throw new BadRequestException('Required fields are missing');
        }
  
        // Check if code already exists (same as original)
        const existingCode = await this.promoCodeModel.findOne({ code }).session(session);
        if (existingCode) {
          throw new BadRequestException('Promo code already exists');
        }
  
        // Same creation logic
        const newPromoCode = await this.promoCodeModel.create([{
          code,
          discountType,
          discountValue: parseFloat(discountValue),
          validFrom: new Date(validFrom),
          validUntil: validUntil ? new Date(validUntil) : null,
          minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
          isActive: true,
        }], { session });
  
        await session.commitTransaction();
        return {
          success: true,
          message: 'Promo code created successfully',
          data: newPromoCode[0],
        };
      } catch (error) {
        await session.abortTransaction();
        if (error instanceof BadRequestException) throw error;
        throw new InternalServerErrorException('Error creating promo code');
      } finally {
        session.endSession();
      }
    }
  
    async updatePromoCode(id: string, body: any) {
      const session = await mongoose.startSession();
      session.startTransaction();
  
      try {
        const promoCode = await this.promoCodeModel.findById(id).session(session);
        if (!promoCode) {
          throw new NotFoundException('Promo code not found');
        }
  
        // Same update logic as original
        if (body.code && body.code !== promoCode.code) {
          const existingCode = await this.promoCodeModel
            .findOne({ code: body.code })
            .session(session);
          if (existingCode) {
            throw new BadRequestException('Promo code already exists');
          }
          promoCode.code = body.code;
        }
  
        promoCode.discountType = body.discountType || promoCode.discountType;
        promoCode.discountValue = body.discountValue 
          ? parseFloat(body.discountValue) 
          : promoCode.discountValue;
        promoCode.validFrom = body.validFrom 
          ? new Date(body.validFrom) 
          : promoCode.validFrom;
        promoCode.validUntil = body.validUntil 
          ? new Date(body.validUntil) 
          : promoCode.validUntil;
        promoCode.minOrderAmount = body.minOrderAmount 
          ? parseFloat(body.minOrderAmount) 
          : promoCode.minOrderAmount;
        promoCode.isActive = body.isActive !== undefined 
          ? body.isActive 
          : promoCode.isActive;
  
        await promoCode.save({ session });
        await session.commitTransaction();
  
        return {
          success: true,
          message: 'Promo code updated successfully',
          data: promoCode,
        };
      } catch (error) {
        await session.abortTransaction();
        if (error instanceof NotFoundException || error instanceof BadRequestException) {
          throw error;
        }
        throw new InternalServerErrorException('Error updating promo code');
      } finally {
        session.endSession();
      }
    }
  
    async deletePromoCodes(ids: string[]) {
      const session = await mongoose.startSession();
      session.startTransaction();
  
      try {
        // Same validation as original
        const invalidIds = ids.filter(id => !mongoose.Types.ObjectId.isValid(id));
        if (invalidIds.length > 0) {
          throw new BadRequestException('Invalid promo code IDs');
        }
  
        // Check all exist (same as original)
        const promoCodes = await this.promoCodeModel
          .find({ _id: { $in: ids } })
          .session(session);
        
        if (promoCodes.length !== ids.length) {
          throw new NotFoundException('Some promo codes not found');
        }
  
        // Same deletion logic
        const deleteResult = await this.promoCodeModel
          .deleteMany({ _id: { $in: ids } })
          .session(session);
  
        await session.commitTransaction();
        return {
          success: true,
          message: 'Promo codes deleted successfully',
          data: {
            deletedCount: deleteResult.deletedCount,
          },
        };
      } catch (error) {
        await session.abortTransaction();
        if (error instanceof NotFoundException || error instanceof BadRequestException) {
          throw error;
        }
        throw new InternalServerErrorException('Error deleting promo codes');
      } finally {
        session.endSession();
      }
    }
  
    async validatePromoCode(code: string) {
      try {
        // Same validation logic as original
        const promoCode = await this.promoCodeModel.findOne({ code });
        if (!promoCode) {
          throw new NotFoundException('Promo code not found');
        }
  
        const now = new Date();
        if (now < promoCode.validFrom) {
          throw new BadRequestException('Promo code not yet valid');
        }
  
        if (promoCode.validUntil && now > promoCode.validUntil) {
          throw new BadRequestException('Promo code has expired');
        }
  
        if (!promoCode.isActive) {
          throw new BadRequestException('Promo code is inactive');
        }
  
        return {
          success: true,
          data: {
            valid: true,
            discountType: promoCode.discountType,
            discountValue: promoCode.discountValue,
            minOrderAmount: promoCode.minOrderAmount,
          },
        };
      } catch (error) {
        if (error instanceof NotFoundException || error instanceof BadRequestException) {
          return {
            success: true,
            data: {
              valid: false,
              message: error.message,
            },
          };
        }
        throw new InternalServerErrorException('Error validating promo code');
      }
    }
  }