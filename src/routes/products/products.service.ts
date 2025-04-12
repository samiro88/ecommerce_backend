import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
    Inject,
    forwardRef,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import { v2 as cloudinary } from 'cloudinary';
  import { Product } from '../../models/product.schema';
  import mongoose from 'mongoose';
  import { VentesService } from '../../controllers/vente/vente.service'; // Correct path
  
  @Injectable()
  export class ProductsService {
    constructor(
      @InjectModel(Product.name) private productModel: Model<Product>,
      @Inject(forwardRef(() => VentesService)) // Use forwardRef for circular dependency
      private readonly ventesService: VentesService,
    ) {}
  
    async createProduct(body: any, files: Express.Multer.File[]) {
      const session = await mongoose.startSession();
      session.startTransaction();
  
      try {
        // Same validation as original
        const { designation, price, category, subCategory } = body;
        if (!designation || !price || !category || !files || files.length === 0) {
          throw new BadRequestException('Required fields are missing');
        }
  
        // Same image processing
        const images = await Promise.all(
          files.map(async (file) => {
            const imageStr = file.buffer.toString('base64');
            const dataUri = `data:${file.mimetype};base64,${imageStr}`;
            const result = await cloudinary.uploader.upload(dataUri, {
              folder: 'products',
              transformation: [{ width: 800, crop: 'limit' }, { quality: 'auto' }],
            });
            return {
              url: result.secure_url,
              img_id: result.public_id,
            };
          })
        );
  
        // Same product creation
        const newProduct = await this.productModel.create(
          [
            {
              ...body,
              price: parseFloat(price),
              oldPrice: parseFloat(body.oldPrice) || 0,
              images,
              status: body.status || true,
              features: JSON.parse(body.features || '[]'),
              variations: JSON.parse(body.variations || '[]'),
            },
          ],
          { session }
        );
  
        await session.commitTransaction();
        return {
          success: true,
          message: 'Product created successfully',
          data: newProduct[0],
        };
      } catch (error) {
        await session.abortTransaction();
        if (error instanceof BadRequestException) throw error;
        throw new InternalServerErrorException('Error creating product');
      } finally {
        session.endSession();
      }
    }
  
    async getProducts(query: any) {
      try {
        // Same pagination logic
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;
  
        // Same filter construction
        const filter: any = {};
        if (query.category) filter.category = query.category;
        if (query.subCategory) filter.subCategory = query.subCategory;
        if (query.status) filter.status = query.status === 'true';
        if (query.search) {
          filter.$or = [
            { designation: { $regex: query.search, $options: 'i' } },
            { description: { $regex: query.search, $options: 'i' } },
          ];
        }
  
        // Same sorting
        const sortOptions: any = { createdAt: -1 }; // Default sort
        if (query.sort) {
          if (query.sort.startsWith('-')) {
            sortOptions[query.sort.substring(1)] = -1;
          } else {
            sortOptions[query.sort] = 1;
          }
        }
  
        // Same query execution
        const [products, total] = await Promise.all([
          this.productModel
            .find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .populate('category subCategory'),
          this.productModel.countDocuments(filter),
        ]);
  
        return {
          success: true,
          data: {
            products,
            pagination: {
              total,
              currentPage: page,
              totalPages: Math.ceil(total / limit),
              limit,
            },
          },
        };
      } catch (error) {
        throw new InternalServerErrorException('Error fetching products');
      }
    }
  
    async getAllProductsNormal() {
      try {
        const products = await this.productModel
          .find()
          .sort({ createdAt: -1 })
          .select('designation price images status');
        return {
          success: true,
          data: products,
        };
      } catch (error) {
        throw new InternalServerErrorException('Error fetching all products');
      }
    }
  
    async getProductById(id: string) {
      try {
        const product = await this.productModel
          .findById(id)
          .populate('category subCategory');
        if (!product) throw new NotFoundException('Product not found');
        return {
          success: true,
          data: product,
        };
      } catch (error) {
        if (error instanceof NotFoundException) throw error;
        throw new InternalServerErrorException('Error fetching product');
      }
    }
  
    async updateProduct(id: string, body: any, files: Express.Multer.File[]) {
      const session = await mongoose.startSession();
      session.startTransaction();
  
      try {
        const product = await this.productModel.findById(id).session(session);
        if (!product) throw new NotFoundException('Product not found');
  
        // Same image handling
        if (files && files.length > 0) {
          // Delete old images
          await Promise.all(
            product.images.map(img => 
              cloudinary.uploader.destroy(img.img_id)
          ));
  
          // Upload new images
          const newImages = await Promise.all(
            files.map(async (file) => {
              const imageStr = file.buffer.toString('base64');
              const dataUri = `data:${file.mimetype};base64,${imageStr}`;
              const result = await cloudinary.uploader.upload(dataUri, {
                folder: 'products',
                transformation: [{ width: 800, crop: 'limit' }, { quality: 'auto' }],
              });
              return {
                url: result.secure_url,
                img_id: result.public_id,
              };
            })
          );
          product.images = newImages;
        }
  
        // Same field updates
        product.designation = body.designation || product.designation;
        product.price = parseFloat(body.price) || product.price;
        product.oldPrice = parseFloat(body.oldPrice) || product.oldPrice;
        product.category = body.category || product.category;
        product.subCategory = body.subCategory || product.subCategory;
        product.description = body.description || product.description;
        product.smallDescription = body.smallDescription || product.smallDescription;
        product.status = body.status !== undefined ? body.status : product.status;
        product.features = body.features ? JSON.parse(body.features) : product.features;
        product.variations = body.variations ? JSON.parse(body.variations) : product.variations;
  
        await product.save({ session });
        await session.commitTransaction();
  
        return {
          success: true,
          message: 'Product updated successfully',
          data: product,
        };
      } catch (error) {
        await session.abortTransaction();
        if (error instanceof NotFoundException) throw error;
        throw new InternalServerErrorException('Error updating product');
      } finally {
        session.endSession();
      }
    }
  
    async deleteProduct(id: string) {
      const session = await mongoose.startSession();
      session.startTransaction();
  
      try {
        const product = await this.productModel.findByIdAndDelete(id).session(session);
        if (!product) throw new NotFoundException('Product not found');
  
        // Delete images from Cloudinary
        await Promise.all(
          product.images.map(img => 
            cloudinary.uploader.destroy(img.img_id)
        ));
  
        await session.commitTransaction();
        return {
          success: true,
          message: 'Product deleted successfully',
          data: product,
        };
      } catch (error) {
        await session.abortTransaction();
        if (error instanceof NotFoundException) throw error;
        throw new InternalServerErrorException('Error deleting product');
      } finally {
        session.endSession();
      }
    }
  
    async deleteManyProducts(ids: string[]) {
      const session = await mongoose.startSession();
      session.startTransaction();
  
      try {
        // Validate IDs
        const invalidIds = ids.filter(id => !mongoose.Types.ObjectId.isValid(id));
        if (invalidIds.length > 0) {
          throw new BadRequestException('Invalid product IDs');
        }
  
        // Find and delete products
        const products = await this.productModel
          .find({ _id: { $in: ids } })
          .session(session);
        
        if (products.length !== ids.length) {
          throw new NotFoundException('Some products not found');
        }
  
        // Delete images first
        await Promise.all(
          products.flatMap(product =>
            product.images.map(img => 
              cloudinary.uploader.destroy(img.img_id))
        ));
  
        // Then delete products
        const deleteResult = await this.productModel
          .deleteMany({ _id: { $in: ids } })
          .session(session);
  
        await session.commitTransaction();
        return {
          success: true,
          message: 'Products deleted successfully',
          data: {
            deletedCount: deleteResult.deletedCount,
          },
        };
      } catch (error) {
        await session.abortTransaction();
        if (error instanceof NotFoundException || error instanceof BadRequestException) {
          throw error;
        }
        throw new InternalServerErrorException('Error deleting products');
      } finally {
        session.endSession();
      }
    }
  
    async getProductsWithMilleurVente() {
      try {
        const products = await this.productModel
          .find({
            'features': { $regex: /meilleur vente/i },
            status: true
          })
          .select('designation price images slug')
          .limit(10);
        return {
          success: true,
          data: products,
        };
      } catch (error) {
        throw new InternalServerErrorException('Error fetching top products');
      }
    }
  
    async getProductsWithNewVente() {
      try {
        const products = await this.productModel
          .find({
            'features': { $regex: /nouveau/i },
            status: true
          })
          .select('designation price images slug')
          .sort({ createdAt: -1 })
          .limit(10);
        return {
          success: true,
          data: products,
        };
      } catch (error) {
        throw new InternalServerErrorException('Error fetching new products');
      }
    }
  
    async getProductsWithVenteFlashVente() {
      try {
        const products = await this.productModel
          .find({
            'features': { $regex: /vente flash/i },
            status: true
          })
          .select('designation price oldPrice images slug venteflashDate')
          .sort({ venteflashDate: -1 })
          .limit(10);
        return {
          success: true,
          data: products,
        };
      } catch (error) {
        throw new InternalServerErrorException('Error fetching flash sale products');
      }
    }
  
    async getProductsWithMaterielDeMusculation() {
      try {
        const products = await this.productModel
          .find({
            'features': { $regex: /matériel de musculation/i },
            status: true
          })
          .select('designation price images slug')
          .limit(10);
        return {
          success: true,
          data: products,
        };
      } catch (error) {
        throw new InternalServerErrorException('Error fetching equipment products');
      }
    }
  
    async getProductBySlug(slug: string) {
      try {
        const product = await this.productModel
          .findOne({ slug })
          .populate('category subCategory');
        if (!product) throw new NotFoundException('Product not found');
        return {
          success: true,
          data: product,
        };
      } catch (error) {
        if (error instanceof NotFoundException) throw error;
        throw new InternalServerErrorException('Error fetching product by slug');
      }
    }
  
    async getMaxPrice() {
      try {
        const result = await this.productModel
          .findOne()
          .sort({ price: -1 })
          .select('price');
        return {
          success: true,
          data: {
            maxPrice: result?.price || 0
          },
        };
      } catch (error) {
        throw new InternalServerErrorException('Error getting max price');
      }
    }
  }