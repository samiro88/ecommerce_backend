import {
    Injectable,
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import { v2 as cloudinary } from 'cloudinary';
  import { Pack } from '../../models/pack.schema';
  import mongoose from 'mongoose';
  
  @Injectable()
  export class PacksService {
    constructor(
      @InjectModel(Pack.name) private packModel: Model<Pack>,
    ) {}
  
    async createPack(body: any, files: { mainImage?: any[]; images?: any[] }) {
      const session = await mongoose.startSession();
      session.startTransaction();
  
      try {
        const {
          designation,
          price,
          oldPrice,
          smallDescription,
          question,
          description,
          status = true,
        } = body;
  
        // Validate required fields
        const missingFields: string[] = [];
        if (!designation) missingFields.push('designation');
        if (!price) missingFields.push('price');
        if (!files?.mainImage) missingFields.push('mainImage');
  
        if (missingFields.length > 0) {
          throw new BadRequestException(
            `Required fields are missing: ${missingFields.join(', ')}`,
          );
        }
  
        // Upload main image
        const mainImageFile = files.mainImage?.[0];
        const mainImageStr = mainImageFile.buffer.toString('base64');
        const mainImageDataUri = `data:${mainImageFile.mimetype};base64,${mainImageStr}`;
  
        const mainImageResult = await cloudinary.uploader.upload(mainImageDataUri, {
          folder: 'packs/main',
          resource_type: 'auto',
        });
  
        // Upload additional images
        const images: { url: string; img_id: string }[] = [];
        if (files.images && files.images.length > 0) {
          for (const imageFile of files.images) {
            const imageStr = imageFile.buffer.toString('base64');
            const imageDataUri = `data:${imageFile.mimetype};base64,${imageStr}`;
  
            const imageResult = await cloudinary.uploader.upload(imageDataUri, {
              folder: 'packs/additional',
              resource_type: 'auto',
            });
  
            images.push({
              url: imageResult.secure_url,
              img_id: imageResult.public_id,
            });
          }
        }
  
        // Create the pack
        const newPack = await this.packModel.create(
          [
            {
              designation,
              smallDescription,
              description,
              question,
              price,
              oldPrice: parseFloat(oldPrice) || 0,
              products: JSON.parse(body?.products) || [],
              features: JSON.parse(body?.features) || [],
              status,
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
          message: 'Pack created successfully',
          data: newPack[0],
        };
      } catch (error) {
        await session.abortTransaction();
        if (
          error instanceof BadRequestException ||
          error instanceof NotFoundException
        ) {
          throw error;
        }
        throw new InternalServerErrorException('Error creating pack');
      } finally {
        session.endSession();
      }
    }
  
    async updatePack(
      id: string,
      body: any,
      files: { mainImage?: any[]; images?: any[] },
    ) {
      const session = await mongoose.startSession();
      session.startTransaction();
  
      try {
        const rawData = {
          designation: body.designation,
          price: Number(body.price),
          oldPrice: Number(body.oldPrice || 0),
          smallDescription: body.smallDescription,
          question: body.question,
          description: body.description,
          status: body.status === 'true',
          products: JSON.parse(body.products || '[]'),
          features: JSON.parse(body.features || '[]'),
          deletedImages: JSON.parse(body.deletedImages || '[]'),
        };
  
        // Validate required fields
        if (!rawData.designation || !rawData.price) {
          throw new BadRequestException('Designation and price are required fields');
        }
  
        // Get existing pack
        const existingPack = await this.packModel.findById(id).session(session);
        if (!existingPack) {
          throw new NotFoundException('Pack not found');
        }
  
        // Handle image updates
        const [mainImage, images] = await Promise.all([
          this.handleMainImageUpdate(existingPack, files?.mainImage || [], session),
          this.handleGalleryImagesUpdate(
            existingPack,
            files?.images || [],
            rawData.deletedImages,
            session,
          ),
        ]);
  
        // Build update payload
        const updatePayload = {
          designation: rawData.designation,
          price: rawData.price,
          oldPrice: rawData.oldPrice,
          smallDescription: rawData.smallDescription,
          question: rawData.question,
          description: rawData.description,
          status: rawData.status,
          products: rawData.products,
          features: rawData.features,
          mainImage: mainImage || existingPack.mainImage,
          images: images || existingPack.images,
        };
  
        // Update pack
        const updatedPack = await this.packModel
          .findByIdAndUpdate(id, updatePayload, {
            new: true,
            session,
          })
          .populate('products');
  
        await session.commitTransaction();
  
        return {
          message: 'Pack updated successfully',
          data: updatedPack,
        };
      } catch (error) {
        await session.abortTransaction();
        if (
          error instanceof BadRequestException ||
          error instanceof NotFoundException
        ) {
          throw error;
        }
        throw new InternalServerErrorException('Error updating pack');
      } finally {
        session.endSession();
      }
    }
  
    private async handleMainImageUpdate(
      existingPack: Pack,
      newImageFile: any[],
      session: mongoose.ClientSession,
    ) {
      if (!newImageFile) return null;
  
      // Delete old main image
      if (existingPack.mainImage?.img_id) {
        await cloudinary.uploader.destroy(existingPack.mainImage.img_id);
      }
  
      // Upload new main image
      const imageFile = newImageFile[0];
      const imageStr = imageFile.buffer.toString('base64');
      const dataUri = `data:${imageFile.mimetype};base64,${imageStr}`;
  
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'packs/main',
        resource_type: 'auto',
      });
  
      return {
        url: result.secure_url,
        img_id: result.public_id,
      };
    }
  
    private async handleGalleryImagesUpdate(
      existingPack: Pack,
      newImages: any[],
      deletedImageUrls: string[],
      session: mongoose.ClientSession,
    ) {
      // Delete removed images
      const imagesToDelete = existingPack.images.filter((img) =>
        deletedImageUrls.includes(img.url),
      );
  
      await Promise.all(
        imagesToDelete.map(async (img) => {
          await cloudinary.uploader.destroy(img.img_id);
        }),
      );
  
      // Upload new images
      const newImageUploads = (newImages || []).map(async (imageFile) => {
        const imageStr = imageFile.buffer.toString('base64');
        const dataUri = `data:${imageFile.mimetype};base64,${imageStr}`;
  
        const result = await cloudinary.uploader.upload(dataUri, {
          folder: 'packs/additional',
          resource_type: 'auto',
        });
  
        return {
          url: result.secure_url,
          img_id: result.public_id,
        };
      });
  
      const uploadedImages = await Promise.all(newImageUploads);
  
      // Combine remaining and new images
      const remainingImages = existingPack.images.filter(
        (img) => !deletedImageUrls.includes(img.url),
      );
  
      return [...remainingImages, ...uploadedImages];
    }
  
    async deletePack(id: string) {
      try {
        const pack = await this.packModel.findById(id);
        if (!pack) {
          throw new NotFoundException('Pack not found');
        }
  
        // Delete the pack
        await this.packModel.findByIdAndDelete(id);
  
        return {
          message: 'Pack deleted successfully',
          data: pack,
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new InternalServerErrorException('Error deleting pack');
      }
    }
  
    async getPackList(query: {
      page?: string;
      limit?: string;
      minPrice?: string;
      maxPrice?: string;
      inStock?: string;
      sort?: string;
    }) {
      try {
        const page = parseInt(query.page || '1', 10);
        const limit = parseInt(query.limit || '10', 10);
        const skip = (page - 1) * limit;
  
        // Build filter object
        const filter: any = { status: true };
  
        // Price filter
        if (query.minPrice || query.maxPrice) {
          filter.price = {};
          if (query.minPrice) filter.price.$gte = parseFloat(query.minPrice);
          if (query.maxPrice) filter.price.$lte = parseFloat(query.maxPrice);
        }
  
        // Stock filter
        if (query.inStock === 'true') {
          filter.inStock = true;
        }
  
        // Sort options
        const sortOptions: any = {};
        if (query.sort) {
          const sortField = query.sort;
          if (sortField.startsWith('-')) {
            sortOptions[sortField.substring(1)] = -1;
          } else {
            sortOptions[sortField] = 1;
          }
        } else {
          sortOptions.createdAt = -1;
        }
  
        // Execute query
        const [packs, total] = await Promise.all([
          this.packModel
            .find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .select(
              'designation slug price oldPrice mainImage features status inStock rate reviews',
            ),
          this.packModel.countDocuments(filter),
        ]);
  
        const totalPages = Math.ceil(total / limit);
  
        return {
          success: true,
          data: {
            packs,
            pagination: {
              total,
              currentPage: page,
              totalPages,
              limit,
            },
          },
        };
      } catch (error) {
        throw new InternalServerErrorException('Error fetching packs');
      }
    }
  
    async getPackById(id: string) {
      try {
        const pack = await this.packModel.findById(id);
        if (!pack) {
          throw new NotFoundException('Pack not found');
        }
  
        return {
          message: 'Pack retrieved successfully',
          data: pack,
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new InternalServerErrorException('Error retrieving pack');
      }
    }
  
    async deletePacksInBulk(packIds: string[]) {
      const session = await mongoose.startSession();
  
      try {
        await session.startTransaction();
  
        // Validate input
        if (!Array.isArray(packIds) || packIds.length === 0) {
          throw new BadRequestException(
            'Please provide a non-empty array of pack IDs',
          );
        }
  
        // Validate MongoDB IDs
        const invalidIds = packIds.filter(
          (id) => !mongoose.Types.ObjectId.isValid(id),
        );
        if (invalidIds.length > 0) {
          throw new BadRequestException('Invalid pack ID format');
        }
  
        // Find packs
        const packs = await this.packModel
          .find({ _id: { $in: packIds } })
          .session(session);
        if (packs.length !== packIds.length) {
          throw new NotFoundException('Some packs not found');
        }
  
        // Delete database records
        const deleteResult = await this.packModel
          .deleteMany({ _id: { $in: packIds } }, { session })
          .exec();
  
        await session.commitTransaction();
  
        // Process Cloudinary deletions
        const cloudinaryPromises = packs.flatMap((pack) => [
          ...(pack.mainImage?.img_id
            ? [cloudinary.uploader.destroy(pack.mainImage.img_id)]
            : []),
          ...(pack.images?.flatMap((image) =>
            image.img_id ? [cloudinary.uploader.destroy(image.img_id)] : [],
          ) || []),
        ]);
  
        const cloudinaryResults = await Promise.allSettled(cloudinaryPromises);
        const failedDeletions = cloudinaryResults
          .filter((result) => result.status === 'rejected')
          .map((result) => (result as PromiseRejectedResult).reason.message);
  
        return {
          message: 'Bulk delete operation completed',
          data: {
            deletedPacks: deleteResult.deletedCount,
            totalImages: cloudinaryPromises.length,
            failedImageDeletions: failedDeletions.length,
            warnings: failedDeletions,
          },
        };
      } catch (error) {
        await session.abortTransaction();
        if (
          error instanceof BadRequestException ||
          error instanceof NotFoundException
        ) {
          throw error;
        }
        throw new InternalServerErrorException('Bulk delete operation failed');
      } finally {
        session.endSession();
      }
    }
  
    async getAllPacks() {
      try {
        const packs = await this.packModel.find().sort('-createdAt');
        return {
          message: 'Packs retrieved successfully',
          data: packs,
        };
      } catch (error) {
        throw new InternalServerErrorException('Error retrieving packs');
      }
    }
  
    async getPackBySlug(slug: string) {
      try {
        const product = await this.packModel
          .findOne({ slug })
          .select('-_id')
          .exec();
  
        if (!product) {
          throw new NotFoundException('Product not found');
        }
  
        return {
          message: 'Products retrieved successfully',
          data: product,
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new InternalServerErrorException('Error retrieving product by slug');
      }
    }
  
    async getPacksWithPromo() {
      try {
        const packs = await this.packModel
          .find({
            features: { $elemMatch: { $regex: /packs en promo/i } },
            status: true,
          })
          .select({
            designation: 1,
            slug: 1,
            smallDescription: 1,
            price: 1,
            oldPrice: 1,
            'mainImage.url': 1,
            'images.url': 1,
            inStock: 1,
            features: 1,
            products: 1,
            rate: 1,
            reviews: 1,
            createdAt: 1,
            updatedAt: 1,
            venteflashDate: 1,
            __v: 1,
            _id: 0,
          })
          .exec();
  
        if (packs.length === 0) {
          throw new NotFoundException(
            "No packs with 'Packs en Promo' feature found",
          );
        }
  
        return {
          success: true,
          count: packs.length,
          data: packs,
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new InternalServerErrorException('Error fetching promo packs');
      }
    }
  
    async getPacksWithTopPromo() {
      try {
        const packs = await this.packModel
          .find({
            features: { $elemMatch: { $regex: /top promotion/i } },
            status: true,
          })
          .select({
            designation: 1,
            slug: 1,
            smallDescription: 1,
            price: 1,
            oldPrice: 1,
            'mainImage.url': 1,
            'images.url': 1,
            inStock: 1,
            features: 1,
            products: 1,
            rate: 1,
            reviews: 1,
            createdAt: 1,
            updatedAt: 1,
            venteflashDate: 1,
            __v: 1,
            _id: 0,
          })
          .exec();
  
        if (packs.length === 0) {
          throw new NotFoundException(
            "No packs with 'Top Promotion' feature found",
          );
        }
  
        return {
          success: true,
          count: packs.length,
          data: packs,
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new InternalServerErrorException('Error fetching top promo packs');
      }
    }
  }