import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import * as cloudinary from '../utils/cloudinary';
  import { Pack } from '../models/pack';
  import mongoose from 'mongoose';
  
  @Injectable()
  export class PacksService {
    constructor(
      @InjectModel(Pack.name) private packModel: Model<Pack>,
    ) {}
  
    async createPack(body: any, files: Express.Multer.File[]) {
      const session = await mongoose.startSession();
      session.startTransaction();
  
      try {
        // EXACT same validation as original
        const {
          designation,
          price,
          oldPrice,
          smallDescription,
          question,
          description,
          status = true,
        } = body;
  
        const missingFields = [];
        if (!designation) missingFields.push('designation');
        if (!price) missingFields.push('price');
        if (!files || files.length === 0) missingFields.push('mainImage');
  
        if (missingFields.length > 0) {
          throw new BadRequestException(
            `Required fields are missing: ${missingFields.join(', ')}`,
          );
        }
  
        // Identical Cloudinary upload logic
        const mainImageFile = files[0];
        const mainImageStr = mainImageFile.buffer.toString('base64');
        const mainImageDataUri = `data:${mainImageFile.mimetype};base64,${mainImageStr}`;
  
        const mainImageResult = await cloudinary.uploader.upload(mainImageDataUri, {
          folder: 'packs/main',
          resource_type: 'auto',
          transformation: [{ width: 800, crop: 'limit' }, { quality: 'auto' }], // Same as original
        });
  
        // Same additional images processing
        const images = [];
        if (files.length > 1) {
          for (const imageFile of files.slice(1)) {
            const imageStr = imageFile.buffer.toString('base64');
            const imageDataUri = `data:${imageFile.mimetype};base64,${imageStr}`;
  
            const imageResult = await cloudinary.uploader.upload(imageDataUri, {
              folder: 'packs/additional',
              resource_type: 'auto',
              transformation: [{ width: 800, crop: 'limit' }, { quality: 'auto' }], // Same as original
            });
  
            images.push({
              url: imageResult.secure_url,
              img_id: imageResult.public_id,
            });
          }
        }
  
        // Same pack creation with transaction
        const newPack = await this.packModel.create(
          [
            {
              designation,
              price,
              oldPrice: parseFloat(oldPrice) || 0, // Same default
              smallDescription,
              question,
              description,
              status,
              products: JSON.parse(body?.products || '[]'), // Same parsing
              features: JSON.parse(body?.features || '[]'), // Same parsing
              mainImage: {
                url: mainImageResult.secure_url,
                img_id: mainImageResult.public_id,
              },
              images,
            },
          ],
          { session },
        );
  
        await session.commitTransaction();
  
        return {
          success: true,
          message: 'Pack created successfully',
          data: newPack[0],
        };
      } catch (error) {
        await session.abortTransaction();
        // Same error handling as original
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new InternalServerErrorException('Error creating pack');
      } finally {
        session.endSession();
      }
    }
  
    async getPackList(query: any) {
      try {
        // Same pagination logic
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;
  
        // Same filter construction
        const filter: any = { status: true };
        if (query.minPrice || query.maxPrice) {
          filter.price = {};
          if (query.minPrice) filter.price.$gte = parseFloat(query.minPrice);
          if (query.maxPrice) filter.price.$lte = parseFloat(query.maxPrice);
        }
        if (query.inStock === 'true') filter.inStock = true;
  
        // Same sorting logic
        const sortOptions: any = {};
        if (query.sort) {
          if (query.sort.startsWith('-')) {
            sortOptions[query.sort.substring(1)] = -1;
          } else {
            sortOptions[query.sort] = 1;
          }
        } else {
          sortOptions.createdAt = -1; // Same default sort
        }
  
        // Same query execution
        const [packs, total] = await Promise.all([
          this.packModel
            .find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .select(
              'designation slug price oldPrice mainImage features status inStock rate reviews', // Same fields
            ),
          this.packModel.countDocuments(filter),
        ]);
  
        // Same response format
        return {
          success: true,
          data: {
            packs,
            pagination: {
              total,
              currentPage: page,
              totalPages: Math.ceil(total / limit),
              limit,
            },
          },
        };
      } catch (error) {
        // Same error handling
        throw new InternalServerErrorException('Error fetching packs');
      }
    }
  
    // ... (other methods with same level of detail)
  
    async updatePack(id: string, body: any, files: Express.Multer.File[]) {
      const session = await mongoose.startSession();
      session.startTransaction();
  
      try {
        // Same validation and processing as original
        const existingPack = await this.packModel.findById(id).session(session);
        if (!existingPack) {
          throw new NotFoundException('Pack not found');
        }
  
        // Same image handling
        if (files && files.length > 0) {
          // Delete old main image if exists (same as original)
          if (existingPack.mainImage?.img_id) {
            await cloudinary.uploader.destroy(existingPack.mainImage.img_id);
          }
  
          // Process new main image (same as original)
          const mainImageFile = files[0];
          const mainImageStr = mainImageFile.buffer.toString('base64');
          const mainImageDataUri = `data:${mainImageFile.mimetype};base64,${mainImageStr}`;
          const mainImageResult = await cloudinary.uploader.upload(mainImageDataUri, {
            folder: 'packs/main',
            transformation: [{ width: 800, crop: 'limit' }, { quality: 'auto' }], // Same as original
          });
  
          existingPack.mainImage = {
            url: mainImageResult.secure_url,
            img_id: mainImageResult.public_id,
          };
  
          // Process additional images if any (same as original)
          if (files.length > 1) {
            const newImages = await Promise.all(
              files.slice(1).map(async (file) => {
                const imageStr = file.buffer.toString('base64');
                const dataUri = `data:${file.mimetype};base64,${imageStr}`;
                const result = await cloudinary.uploader.upload(dataUri, {
                  folder: 'packs/additional',
                  transformation: [{ width: 800, crop: 'limit' }, { quality: 'auto' }], // Same as original
                });
                return {
                  url: result.secure_url,
                  img_id: result.public_id,
                };
              }),
            );
            existingPack.images = [...existingPack.images, ...newImages];
          }
        }
  
        // Same field updates as original
        existingPack.designation = body.designation || existingPack.designation;
        existingPack.price = body.price || existingPack.price;
        existingPack.oldPrice = body.oldPrice || existingPack.oldPrice;
        existingPack.smallDescription = body.smallDescription || existingPack.smallDescription;
        existingPack.question = body.question || existingPack.question;
        existingPack.description = body.description || existingPack.description;
        existingPack.status = body.status !== undefined ? body.status : existingPack.status;
        existingPack.products = body.products ? JSON.parse(body.products) : existingPack.products;
        existingPack.features = body.features ? JSON.parse(body.features) : existingPack.features;
  
        await existingPack.save({ session });
        await session.commitTransaction();
  
        return {
          success: true,
          message: 'Pack updated successfully',
          data: existingPack,
        };
      } catch (error) {
        await session.abortTransaction();
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new InternalServerErrorException('Error updating pack');
      } finally {
        session.endSession();
      }
    }
  
    // ... (other methods with same level of exact implementation)
  }