import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// In packs.service.ts - Use this import:
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryService } from '../../shared/utils/cloudinary/cloudinary/cloudinary.service';
import { Pack } from '../../models/pack.schema'; // Fixed path
import mongoose from 'mongoose';

@Injectable()
export class PacksService {
  constructor(
      @InjectModel(Pack.name) private packModel: Model<Pack>,
      private readonly cloudinaryService: CloudinaryService
  ) {}

  async createPack(body: any, files: Express.Multer.File[]) {
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

          const missingFields: string[] = []; // Added type annotation
          if (!designation) missingFields.push('designation');
          if (!price) missingFields.push('price');
          if (!files || files.length === 0) missingFields.push('mainImage');

          if (missingFields.length > 0) {
              throw new BadRequestException(
                  `Required fields are missing: ${missingFields.join(', ')}`,
              );
          }

          const mainImageFile = files[0];
          const mainImageStr = mainImageFile.buffer.toString('base64');
          const mainImageDataUri = `data:${mainImageFile.mimetype};base64,${mainImageStr}`;

          const mainImageResult = await cloudinary.uploader.upload(mainImageDataUri, {
              folder: 'packs/main',
              resource_type: 'auto',
              transformation: [{ width: 800, crop: 'limit' }, { quality: 'auto' }],
          });

          const images: Array<{ url: string; img_id: string }> = []; // Added type annotation
          if (files.length > 1) {
              for (const imageFile of files.slice(1)) {
                  const imageStr = imageFile.buffer.toString('base64');
                  const imageDataUri = `data:${imageFile.mimetype};base64,${imageStr}`;

                  const imageResult = await cloudinary.uploader.upload(imageDataUri, {
                      folder: 'packs/additional',
                      resource_type: 'auto',
                      transformation: [{ width: 800, crop: 'limit' }, { quality: 'auto' }],
                  });

                  images.push({
                      url: imageResult.secure_url,
                      img_id: imageResult.public_id,
                  });
              }
          }

          const newPack = await this.packModel.create(
              [
                  {
                      designation,
                      price,
                      oldPrice: parseFloat(oldPrice) || 0,
                      smallDescription,
                      question,
                      description,
                      status,
                      products: JSON.parse(body?.products || '[]'),
                      features: JSON.parse(body?.features || '[]'),
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
          const page = parseInt(query.page) || 1;
          const limit = parseInt(query.limit) || 10;
          const skip = (page - 1) * limit;

          const filter: any = { status: true };
          if (query.minPrice || query.maxPrice) {
              filter.price = {};
              if (query.minPrice) filter.price.$gte = parseFloat(query.minPrice);
              if (query.maxPrice) filter.price.$lte = parseFloat(query.maxPrice);
          }
          if (query.inStock === 'true') filter.inStock = true;

          const sortOptions: any = {};
          if (query.sort) {
              if (query.sort.startsWith('-')) {
                  sortOptions[query.sort.substring(1)] = -1;
              } else {
                  sortOptions[query.sort] = 1;
              }
          } else {
              sortOptions.createdAt = -1;
          }

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
          throw new InternalServerErrorException('Error fetching packs');
      }
  }

  async updatePack(id: string, body: any, files: Express.Multer.File[]) {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
          const existingPack = await this.packModel.findById(id).session(session);
          if (!existingPack) {
              throw new NotFoundException('Pack not found');
          }

          if (files && files.length > 0) {
              if (existingPack.mainImage?.img_id) {
                  await cloudinary.uploader.destroy(existingPack.mainImage.img_id);
              }

              const mainImageFile = files[0];
              const mainImageStr = mainImageFile.buffer.toString('base64');
              const mainImageDataUri = `data:${mainImageFile.mimetype};base64,${mainImageStr}`;
              const mainImageResult = await cloudinary.uploader.upload(mainImageDataUri, {
                  folder: 'packs/main',
                  transformation: [{ width: 800, crop: 'limit' }, { quality: 'auto' }],
              });

              existingPack.mainImage = {
                  url: mainImageResult.secure_url,
                  img_id: mainImageResult.public_id,
              };

              if (files.length > 1) {
                  const newImages = await Promise.all(
                      files.slice(1).map(async (file) => {
                          const imageStr = file.buffer.toString('base64');
                          const dataUri = `data:${file.mimetype};base64,${imageStr}`;
                          const result = await cloudinary.uploader.upload(dataUri, {
                              folder: 'packs/additional',
                              transformation: [{ width: 800, crop: 'limit' }, { quality: 'auto' }],
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

  async getAllPacks() {
      try {
          const packs = await this.packModel.find({ status: true });
          return {
              success: true,
              data: packs,
          };
      } catch (error) {
          throw new InternalServerErrorException('Error fetching all packs');
      }
  }

  async getPackById(id: string) {
      try {
          const pack = await this.packModel.findById(id);
          if (!pack) {
              throw new NotFoundException('Pack not found');
          }
          return {
              success: true,
              data: pack,
          };
      } catch (error) {
          if (error instanceof NotFoundException) {
              throw error;
          }
          throw new InternalServerErrorException('Error fetching pack');
      }
  }

  async deletePack(id: string) {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
          const pack = await this.packModel.findById(id).session(session);
          if (!pack) {
              throw new NotFoundException('Pack not found');
          }

          if (pack.mainImage?.img_id) {
              await cloudinary.uploader.destroy(pack.mainImage.img_id);
          }

          if (pack.images?.length > 0) {
              await Promise.all(
                  pack.images.map((image) =>
                      cloudinary.uploader.destroy(image.img_id)
                  )
              );
          }

          await this.packModel.findByIdAndDelete(id).session(session);
          await session.commitTransaction();

          return {
              success: true,
              message: 'Pack deleted successfully',
          };
      } catch (error) {
          await session.abortTransaction();
          if (error instanceof NotFoundException) {
              throw error;
          }
          throw new InternalServerErrorException('Error deleting pack');
      } finally {
          session.endSession();
      }
  }

  async deletePacksInBulk(ids: string[]) {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
          const packs = await this.packModel.find({ _id: { $in: ids } }).session(session);
          
          const imageDeletions: Promise<any>[] = []; // Added type annotation
          for (const pack of packs) {
              if (pack.mainImage?.img_id) {
                  imageDeletions.push(cloudinary.uploader.destroy(pack.mainImage.img_id));
              }
              if (pack.images?.length > 0) {
                  pack.images.forEach((image) => {
                      imageDeletions.push(cloudinary.uploader.destroy(image.img_id));
                  });
              }
          }
          await Promise.all(imageDeletions);

          await this.packModel.deleteMany({ _id: { $in: ids } }).session(session);
          await session.commitTransaction();

          return {
              success: true,
              message: 'Packs deleted successfully',
          };
      } catch (error) {
          await session.abortTransaction();
          throw new InternalServerErrorException('Error deleting packs in bulk');
      } finally {
          session.endSession();
      }
  }

  async getPackBySlug(slug: string) {
      try {
          const pack = await this.packModel.findOne({ slug, status: true });
          if (!pack) {
              throw new NotFoundException('Pack not found');
          }
          return {
              success: true,
              data: pack,
          };
      } catch (error) {
          if (error instanceof NotFoundException) {
              throw error;
          }
          throw new InternalServerErrorException('Error fetching pack by slug');
      }
  }

  async getPacksWithPromo() {
      try {
          const packs = await this.packModel.find({ 
              status: true,
              oldPrice: { $gt: 0 }
          }).limit(10);

          return {
              success: true,
              data: packs,
          };
      } catch (error) {
          throw new InternalServerErrorException('Error fetching promo packs');
      }
  }
}