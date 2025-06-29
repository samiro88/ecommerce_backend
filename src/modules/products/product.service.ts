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
import * as mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { Product } from '../../models/product.schema';
import { ProductDocument } from '../../models/product.schema';
import { Category } from '../../models/category.schema';
import { CategoryDocument } from '../../models/category.schema';
import { SubCategory } from '../../models/sub-category.schema';
import { SubCategoryDocument } from '../../models/sub-category.schema';
import { CreateProductDto } from 'src/modules/dto/create-product.dto';
import { UpdateProductDto } from 'src/modules/dto/update-product.dto';
import { DeleteManyProductsDto } from 'src/modules/dto/delete-many-products.dto';
import { ProductQueryDto } from 'src/modules/dto/product-query.dto';
import { VentesService } from '../ventes/vente.service';
import { HttpStatus } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { RedisService } from '../../shared/utils/redis/redis.service';

export interface CloudinaryImage {
  url: string;
  img_id: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(SubCategory.name)
    private subCategoryModel: Model<SubCategoryDocument>,
    @InjectModel('Review') private reviewModel: Model<any>,
    @Inject(forwardRef(() => VentesService))
    private readonly ventesService: VentesService,
    private readonly redisService: RedisService,
  ) {}

  async getStoreDeals(): Promise<Product[]> {
    try {
      const deals = await this.productModel.find({ isDeal: true, publier: "1" });
      if (!deals || deals.length === 0) {
        throw new NotFoundException('No deals found');
      }
      return deals;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve deals');
    }
  }

  async getStoreNewArrivals(): Promise<Product[]> {
    try {
      const newArrivals = await this.productModel.find({ 
        new_product: "1", 
        publier: "1" 
      });
      if (!newArrivals || newArrivals.length === 0) {
        throw new NotFoundException('No new arrivals found');
      }
      return newArrivals;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve new arrivals');
    }
  }

  async getStoreFeaturedProducts(): Promise<Product[]> {
    try {
      const featuredProducts = await this.productModel.find({ 
        best_seller: "1", 
        publier: "1" 
      });
      if (!featuredProducts || featuredProducts.length === 0) {
        throw new NotFoundException('No featured products found');
      }
      return featuredProducts;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve featured products');
    }
  }

  async toggleProductStatus(id: string) {
    try {
      const product = await this.productModel.findOne({
        $or: [
          { _id: id },
          { id: id }
        ]
      });
      
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      product.publier = product.publier === "1" ? "0" : "1";
      await product.save();
      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error toggling product status', error.message);
    }
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const products = await this.productModel.find({ 
        categoryId: category,
        publier: "1"
      })
      .select({
      designation_fr: 1, // <-- Add this
      designation: 1,    // <-- And this (for fallback)
      cover: 1,
      slug: 1,
      smallDescription: 1,
      prix: 1,
      promo: 1,
      "mainImage.url": 1,
      "images.url": 1,
      inStock: 1,
      features: 1,
      variant: 1,
      nutritionalValues: 1,
      category: 1,
      subCategory: 1,
      brand: 1,
      rate: 1,
      reviews: 1
    })
      
      .exec();
      
      if (!products || products.length === 0) {
        throw new HttpException(
          'No products found for this category',
          HttpStatus.NOT_FOUND,
        );
      }

      return products;
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createProduct(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        designation,
        inStock,
        smallDescription,
        brand,
        status,
        description,
        question,
        price,
        oldPrice,
        venteflashDate,
        categoryId,
        subCategoryIds = [],
        features = [],
        nutritionalValues = [],
        variant = [],
        codaBar = '',
      } = createProductDto;

      // Validate required fields
      if (!designation || !price || !files?.find(f => f.fieldname === 'mainImage')) {
        throw new BadRequestException(
          `Required fields are missing: ${!designation ? 'designation, ' : ''}${
            !price ? 'price, ' : ''
          }${!files?.find(f => f.fieldname === 'mainImage') ? 'mainImage' : ''}`.replace(/,\s*$/, '')
        );
      }

      // Validate category exists if provided
      if (categoryId) {
        const category = await this.categoryModel.findById(categoryId).session(session);
        if (!category) {
          throw new NotFoundException('Category not found');
        }
      }

      // Validate subCategoryIds
      if (!Array.isArray(subCategoryIds)) {
        throw new BadRequestException('subCategoryIds must be an array');
      }

      const isValidSubCategoryIds = subCategoryIds.every(id => mongoose.Types.ObjectId.isValid(id));
      if (!isValidSubCategoryIds) {
        throw new BadRequestException('Invalid subCategoryIds');
      }

      // Validate all subcategories if provided
      if (subCategoryIds.length > 0) {
        const subCategories = await this.subCategoryModel.find({
          _id: { $in: subCategoryIds },
        }).session(session);

        if (subCategories.length !== subCategoryIds.length) {
          throw new NotFoundException('One or more sub-categories not found');
        }

        if (categoryId) {
          const invalidSubCategories = subCategories.filter(
            subCat => subCat.category && subCat.category.toString() !== categoryId
          );

          if (invalidSubCategories.length > 0) {
            throw new BadRequestException({
              message: 'Some sub-categories do not belong to the specified category',
              invalidSubCategories: invalidSubCategories.map(sc => sc._id),
            });
          }
        }
      }

      // Upload main image
      const mainImageFile = files.find(f => f.fieldname === 'mainImage');
      if (!mainImageFile) {
        throw new BadRequestException('Main image is required');
      }
      const mainImageStr = mainImageFile.buffer.toString('base64');
      const mainImageDataUri = `data:${mainImageFile.mimetype};base64,${mainImageStr}`;

      const mainImageResult = await cloudinary.uploader.upload(mainImageDataUri, {
        folder: "products/main",
        resource_type: "auto",
      });

      // Upload additional images
      const images: CloudinaryImage[] = [];
      const additionalImages = files.filter(f => f.fieldname === 'images');
      if (additionalImages.length > 0) {
        for (const imageFile of additionalImages) {
          const imageStr = imageFile.buffer.toString('base64');
          const imageDataUri = `data:${imageFile.mimetype};base64,${imageStr}`;

          const imageResult = await cloudinary.uploader.upload(imageDataUri, {
            folder: "products/additional",
            resource_type: "auto",
          });

          images.push({
            url: imageResult.secure_url,
            img_id: imageResult.public_id,
          });
        }
      }
      
      // Create the product with both schema and database fields
      const newProduct = await this.productModel.create(
        [{
          // Schema fields
          designation,
          description,
          smallDescription,
          price,
          oldPrice: parseFloat(oldPrice as any) || 0,
          status,
          
          // Database fields
          designation_fr: designation,
          description_fr: description,
          prix: price,
          promo: parseFloat(oldPrice as any) || 0,
          publier: status ? "1" : "0",
          
          // Common fields
          inStock,
          brand,
          venteflashDate,
          features,
          mainImage: {
            url: mainImageResult.secure_url,
            img_id: mainImageResult.public_id,
          },
          images,
          nutritionalValues,
          variant,
          category: categoryId || null,
          subCategory: subCategoryIds,
          codaBar,
        }],
        { session }
      );

      // Update category if provided
      if (categoryId) {
        await this.categoryModel.findByIdAndUpdate(
          categoryId,
          { $push: { products: newProduct[0]._id } },
          { session }
        );
      }

      // Update all subcategories if provided
      if (subCategoryIds.length > 0) {
        await this.subCategoryModel.updateMany(
          { _id: { $in: subCategoryIds } },
          { $push: { products: newProduct[0]._id } },
          { session }
        );
      }

      await session.commitTransaction();

      return {
        message: "Product created successfully",
        data: newProduct[0],
      };
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error creating product', error.message);
    } finally {
      session.endSession();
    }
  }

  async deleteProduct(id: string) {
    try {
      const product = await this.productModel.findOne({
        $or: [
          { _id: id },
          { id: id }
        ]
      })
      .populate("category")
      .populate("subCategory");

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Remove product reference from category if exists
        if (product.category) {
          await this.categoryModel.findByIdAndUpdate(
            product.category._id,
            { $pull: { products: product._id } },
            { session }
          );
        }

        // Remove product reference from all subcategories if exists
        if (product.subCategory && product.subCategory.length > 0) {
          await this.subCategoryModel.updateMany(
            { _id: { $in: product.subCategory } },
            { $pull: { products: product._id } },
            { session }
          );
        }

        // Delete product images from storage
        if (product.mainImage) {
          await cloudinary.uploader.destroy(product.mainImage.img_id);
        }

        if (product.images && product.images.length > 0) {
          for (const image of product.images) {
            await cloudinary.uploader.destroy(image.img_id);
          }
        }

        // Delete the product
        await this.productModel.deleteOne({
          $or: [
            { _id: id },
            { id: id }
          ]
        }, { session });

        await session.commitTransaction();

        return {
          message: "Product deleted successfully",
          data: product,
        };
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error deleting product', error.message);
    }
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
    files: Express.Multer.File[],
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        designation,
        codaBar = "",
        question,
        description,
        smallDescription,
        venteflashDate = "",
        price,
        oldPrice = 0,
        inStock = false,
        status = false,
        features = [],
        categoryId,
        variant = [],
        subCategoryIds = [],
        brand,
        nutritionalValues = [],
        deletedImages = [],
      } = updateProductDto;

      // Validate required fields
      if (!designation || !price) {
        throw new BadRequestException('Designation and price are required fields');
      }

      // Get existing product with relationships
      const existingProduct = await this.productModel.findOne({
        $or: [
          { _id: id },
          { id: id }
        ]
      })
      .populate("category subCategory")
      .session(session);

      if (!existingProduct) {
        throw new NotFoundException('Product not found');
      }

      // CATEGORY VALIDATION
      let newCategory: CategoryDocument | null = null;
      if (categoryId) {
        newCategory = await this.categoryModel.findById(categoryId).session(session) as CategoryDocument | null;
        if (!newCategory) {
          throw new NotFoundException('New category not found');
        }
      }

      // SUBCATEGORY VALIDATION
      if (subCategoryIds.length > 0) {
        const validObjectIds = subCategoryIds.every(id =>
          mongoose.Types.ObjectId.isValid(id)
        );

        if (!validObjectIds) {
          throw new BadRequestException('Invalid subcategory IDs format');
        }

        const subCategories = await this.subCategoryModel.find({
          _id: { $in: subCategoryIds },
          category: categoryId || existingProduct.category._id,
        }).session(session);

        if (subCategories.length !== subCategoryIds.length) {
          throw new BadRequestException(
            'Some subcategories don\'t exist or don\'t belong to the selected category'
          );
        }
      }

      // IMAGE HANDLING
      const mainImage = await this.handleMainImageUpdate(existingProduct, files?.find(f => f.fieldname === 'mainImage'));
      const images = await this.handleGalleryImagesUpdate(
        existingProduct,
        files?.filter(f => f.fieldname === 'images'),
        deletedImages,
      );

      // Prepare update payload
      const updatePayload = {
        // Schema fields
        designation,
        description,
        smallDescription,
        price,
        oldPrice,
        inStock,
        status,
        
        // Database fields
        designation_fr: designation,
        description_fr: description,
        prix: price,
        promo: oldPrice,
        publier: status ? "1" : "0",
        
        // Common fields
        codaBar,
        question,
        venteflashDate,
        features,
        variant,
        nutritionalValues,
        brand,
        mainImage: mainImage || existingProduct.mainImage,
        images: images || existingProduct.images,
        category: categoryId || existingProduct.category._id,
        subCategory: subCategoryIds.length > 0
          ? subCategoryIds
          : existingProduct.subCategory.map((sub: any) => sub._id),
      };

      // Update product
      const updatedProduct = await this.productModel.findOneAndUpdate(
        {
          $or: [
            { _id: id },
            { id: id }
          ]
        },
        updatePayload,
        { new: true, session }
      ).populate("category subCategory");

      // HANDLE CATEGORY RELATIONSHIPS
      await this.handleCategoryRelationships(
        existingProduct,
        updatedProduct,
        newCategory,
        subCategoryIds,
        session
      );

      await session.commitTransaction();

      return {
        message: "Product updated successfully",
        data: updatedProduct,
      };
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating product', error.message);
    } finally {
      session.endSession();
    }
  }

  private async handleMainImageUpdate(
    existingProduct: ProductDocument,
    newImageFile: Express.Multer.File | undefined,
  ) {
    if (!newImageFile) return null;

    // Delete old main image
    if (existingProduct.mainImage?.img_id) {
      await cloudinary.uploader.destroy(existingProduct.mainImage.img_id);
    }

    // Upload new main image
    const imageStr = newImageFile.buffer.toString('base64');
    const dataUri = `data:${newImageFile.mimetype};base64,${imageStr}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "products/main",
      resource_type: "auto",
    });

    return {
      url: result.secure_url,
      img_id: result.public_id,
    };
  }

  private async handleGalleryImagesUpdate(
    existingProduct: any,
    newImages: Express.Multer.File[],
    deletedImageUrls: string[],
  ) {
    // Delete removed images
    const imagesToDelete = existingProduct.images.filter((img: any) =>
      deletedImageUrls.includes(img.url)
    );

    await Promise.all(
      imagesToDelete.map(async (img: any) => {
        await cloudinary.uploader.destroy(img.img_id);
      })
    );

    // Upload new images
    const newImageUploads = (newImages || []).map(async (imageFile) => {
      const imageStr = imageFile.buffer.toString('base64');
      const dataUri = `data:${imageFile.mimetype};base64,${imageStr}`;

      const result = await cloudinary.uploader.upload(dataUri, {
        folder: "products/additional",
        resource_type: "auto",
      });

      return {
        url: result.secure_url,
        img_id: result.public_id,
      };
    });

    const uploadedImages = await Promise.all(newImageUploads);

    // Combine remaining and new images
    const remainingImages = existingProduct.images.filter(
      (img: any) => !deletedImageUrls.includes(img.url)
    );

    return [...remainingImages, ...uploadedImages];
  }

  private async handleCategoryRelationships(
    existingProduct: any,
    updatedProduct: any,
    newCategory: any,
    newSubCategoryIds: string[],
    session: mongoose.ClientSession
  ) {
    // Handle category changes
    if (
      existingProduct.category?.toString() !== updatedProduct.category?.toString()
    ) {
      // Remove from old category
      if (existingProduct.category) {
        await this.categoryModel.findByIdAndUpdate(
          existingProduct.category,
          { $pull: { products: existingProduct._id } },
          { session }
        );
      }

      // Add to new category
      if (newCategory) {
        await this.categoryModel.findByIdAndUpdate(
          newCategory._id,
          { $addToSet: { products: updatedProduct._id } },
          { session }
        );
      }
    }

    // Handle subcategory changes
    const existingSubIds = existingProduct.subCategory.map((id: any) =>
      id instanceof mongoose.Types.ObjectId ? id.toString() : id
    );
    const newSubIds = newSubCategoryIds.map((id) => id.toString());

    const subToRemove = existingSubIds.filter((id: string) => !newSubIds.includes(id));
    const subToAdd = newSubIds.filter((id: string) => !existingSubIds.includes(id));

    // Remove from old subcategories
    if (subToRemove.length > 0) {
      await this.subCategoryModel.updateMany(
        { _id: { $in: subToRemove } },
        { $pull: { products: updatedProduct._id } },
        { session }
      );
    }

    // Add to new subcategories
    if (subToAdd.length > 0) {
      await this.subCategoryModel.updateMany(
        { _id: { $in: subToAdd } },
        { $addToSet: { products: updatedProduct._id } },
        { session }
      );
    }
  }

  // Helper to attach reviews to a product or array of products
  private async attachReviews(products: any | any[]): Promise<any | any[]> {
  if (Array.isArray(products)) {
  const ids = products.map(p => String(p.id));
  const reviews = await this.reviewModel.find({ product_id: { $in: ids }, publier: "1" }).lean();
  const reviewsByProduct = reviews.reduce((acc, review) => {
  (acc[review.product_id] = acc[review.product_id] || []).push(review);
  return acc;
  }, {} as Record<string, any[]>);
  return products.map(p => ({
  ...p.toObject?.() || p,
  reviews: reviewsByProduct[String(p.id)] || [],
  }));
  } else if (products && (products._id || products.id)) {
  //const productId = String(products.id);
const businessId = products.id;
console.log('attachReviews (single): businessId =', businessId);
const reviews = await this.reviewModel.find({ product_id: businessId, publier: "1" }).lean();
  return {
  ...products.toObject?.() || products,
  reviews,
  };
  }
  return products;
  }

  async getProducts(query: ProductQueryDto) {
    try {
      const {
        sort = "-created_at",
        category,
        subCategory,
        search,
        minPrice,
        maxPrice,
        status = "1",
        promo,
        page = 1,
        limit = 10,
        brand,
      } = query;

      let queryObj: any = {};


      // Handle category filtering using designation
      if (category) {
        const categoryDesignations = Array.isArray(category)
          ? category
          : [category];
        const categories = await this.categoryModel.find({
          designation: { $in: categoryDesignations },
        }).select("_id");

        if (categories.length > 0) {
          const categoryIds = categories.map((cat) => cat._id);
          queryObj.category = { $in: categoryIds };
        } else {
          // If no categories match, return no products
          queryObj.category = { $in: [] };
        }
      }

      // Handle subcategory filtering using designation
      if (subCategory) {
        const subCategoryDesignations = Array.isArray(subCategory)
          ? subCategory
          : [subCategory];
        const subCategories = await this.subCategoryModel.find({
          designation: { $in: subCategoryDesignations },
        }).select("_id");

        if (subCategories.length > 0) {
          const subCategoryIds = subCategories.map((subCat) => subCat._id);
          queryObj.subCategory = { $in: subCategoryIds };
        } else {
          // If no subcategories match, return no products
          queryObj.subCategory = { $in: [] };
        }
      }

      

      // Search filter
      if (search) {
        queryObj.$or = [
          { designation_fr: { $regex: search, $options: "i" } },
          { description_fr: { $regex: search, $options: "i" } },
          { designation: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }
        ];
      }

if (brand) {
  queryObj.brand_id = brand;
}


      // Price range filter
      if (minPrice !== undefined || maxPrice !== undefined) {
        queryObj.prix = {};
        if (minPrice !== undefined) queryObj.prix.$gte = Number(minPrice);
        if (maxPrice !== undefined) queryObj.prix.$lte = Number(maxPrice);
      }

      if (promo === "true") {
        queryObj.promo = { $exists: true, $ne: null, $gt: 0 };
      }

      // Get total matching products
      const totalProducts = await this.productModel.countDocuments(queryObj);
      const skip = (Number(page) - 1) * Number(limit);

      // Fetch products with populated category and subcategory designations
      const products = await this.productModel.find(queryObj)
        .populate("category", "designation")
        .populate("subCategory", "designation")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit));

      // Attach reviews to each product
      const productsWithReviews = await this.attachReviews(products);

      return {
        message: "Products retrieved successfully",
        data: {
          products: productsWithReviews,
          pagination: {
            total: totalProducts,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(totalProducts / Number(limit)),
          },
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving products', error.message);
    }
  }

  async getAllProductsNormal() {
    try {
      const products = await this.productModel.find({})
        .populate("category", "designation")
        .populate("subCategory", "designation")
        .sort("-createdAt");
      const productsWithReviews = await this.attachReviews(products);
      return {
        message: "Products retrieved successfully",
        data: productsWithReviews,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving products', error.message);
    }
  }

  async getProductById(id: string) {
    const cacheKey = `product:${id}`;
    
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return {
          message: "Product retrieved from cache",
          data: JSON.parse(cached),
        };
      }

      const product = await this.productModel.findOne({
        $or: [
          { _id: id },
          { id: id }
        ]
      })
      //.select('+designation_fr +description_fr +prix +promo +publier +cover')
      .select('+designation_fr +description_fr +prix +promo +publier +cover +id')
      .populate("category")
      .populate("subCategory")
      .lean(); // <-- Add this

      if (!product) {
        throw new NotFoundException("Product not found");
      }

      const productWithReviews = await this.attachReviews(product);

      await this.redisService.set(cacheKey, JSON.stringify(productWithReviews), 3600);

      return {
        message: "Product retrieved successfully",
        data: productWithReviews,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error retrieving product', error.message);
    }
  }

  async deleteManyProducts(deleteManyProductsDto: DeleteManyProductsDto) {
    try {
      const ids = deleteManyProductsDto.ids;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestException("Please provide an array of product IDs to delete");
      }

      // Find all products with their category and subcategory references
      const products = await this.productModel.find({ _id: { $in: ids } })
        .populate("category")
        .populate("subCategory");

      if (products.length === 0) {
        throw new NotFoundException("No products found with the provided IDs");
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Collect unique category and subcategory IDs
        const categoryIds = new Set();
        const subCategoryIds = new Set();

        // Delete images from Cloudinary
        for (const product of products) {
          // Delete main image
          if (product.mainImage && product.mainImage.img_id) {
            await cloudinary.uploader.destroy(product.mainImage.img_id);
          }

          // Delete additional images
          if (product.images && product.images.length > 0) {
            for (const image of product.images) {
              if (image.img_id) {
                await cloudinary.uploader.destroy(image.img_id);
              }
            }
          }

          // Collect category and subcategory IDs for reference cleanup
          if (product.category && product.category._id) {
            categoryIds.add((product.category._id as mongoose.Types.ObjectId).toString());
          }
          if (product.subCategory && product.subCategory.length > 0) {
            product.subCategory.forEach((subCat: any) => {
              subCategoryIds.add(subCat._id.toString());
            });
          }
        }

        // Update categories to remove product references
        if (categoryIds.size > 0) {
          await this.categoryModel.updateMany(
            { _id: { $in: Array.from(categoryIds) } },
            { $pull: { products: { $in: ids } } },
            { session }
          );
        }

        // Update subcategories to remove product references
        if (subCategoryIds.size > 0) {
          await this.subCategoryModel.updateMany(
            { _id: { $in: Array.from(subCategoryIds) } },
            { $pull: { products: { $in: ids } } },
            { session }
          );
        }

        // Delete the products
        const deleteResult = await this.productModel.deleteMany(
          { _id: { $in: ids } },
          { session }
        );

        await session.commitTransaction();

        return {
          message: "Products deleted successfully",
          data: {
            deletedCount: deleteResult.deletedCount,
            productsFound: products.length,
            categoriesUpdated: categoryIds.size,
            subCategoriesUpdated: subCategoryIds.size,
          },
        };
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error deleting products', error.message);
    }
  }

 async getProductBySlug(slug: string) {
  try {
    const product = await this.productModel.findOne({ slug })
      .select('+designation_fr +description_fr +prix +promo +publier +cover +new_product +best_seller +code_product +brand_id +mainImage +images +qte +nutrition_values +questions')
      .populate("category", "designation _id")
      .populate("subCategory", "designation _id");

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const productWithReviews = await this.attachReviews(product);

    return {
      message: "Product retrieved successfully",
      product: productWithReviews,
    };
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw error;
    }
    throw new InternalServerErrorException('Error retrieving product by slug', error.message);
  }
}

  async getProductsWithMilleurVente() {
    try {
      const products = await this.productModel.find({
        best_seller: "1",
        publier: "1"
      })
      .select({
        designation: 1,
          designation_fr: 1, // <-- ADD THIS
          cover: 1,          // <-- ADD THIS
        slug: 1,
        smallDescription: 1,
        prix: 1,
        promo: 1,
        "mainImage.url": 1,
        "images.url": 1,
        inStock: 1,
        features: 1,
        variant: 1,
        nutritionalValues: 1,
        category: 1,
        subCategory: 1,
        brand: 1,
        rate: 1,
        reviews: 1
      })
      .populate({
        path: "category",
        select: "designation -_id",
      })
      .populate({
        path: "subCategory",
        select: "designation -_id",
      });

      const productsWithReviews = await this.attachReviews(products);

      return {
        success: true,
        count: productsWithReviews.length,
        data: productsWithReviews,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error fetching best seller products', error.message);
    }
  }

  async getProductsWithNewVente() {
    try {
      const products = await this.productModel.find({
        new_product: "1",
        publier: "1"
      })
      .select({
        designation: 1,
        slug: 1,
        smallDescription: 1,
        prix: 1,
        promo: 1,
        "mainImage.url": 1,
        "images.url": 1,
        inStock: 1,
        features: 1,
        variant: 1,
        nutritionalValues: 1,
        category: 1,
        subCategory: 1,
        brand: 1,
        rate: 1,
        reviews: 1
      })
      .populate({
        path: "category",
        select: "designation -_id",
      })
      .populate({
        path: "subCategory",
        select: "designation -_id",
      });

      const productsWithReviews = await this.attachReviews(products);

      return {
        success: true,
        count: productsWithReviews.length,
        data: productsWithReviews,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error fetching new products', error.message);
    }
  }

  async getProductsWithVenteFlashVente() {
    try {
      const products = await this.productModel.find({
        features: { $elemMatch: { $regex: /vente-flash/i } },
        publier: "1"
      })
      .select({
        designation: 1,
        slug: 1,
        smallDescription: 1,
        prix: 1,
        promo: 1,
        "mainImage.url": 1,
        "images.url": 1,
        inStock: 1,
        features: 1,
        variant: 1,
        nutritionalValues: 1,
        category: 1,
        subCategory: 1,
        brand: 1,
        rate: 1,
        reviews: 1,
        venteflashDate: 1
      })
      .populate({
        path: "category",
        select: "designation -_id",
      })
      .populate({
        path: "subCategory",
        select: "designation -_id",
      });

      const productsWithReviews = await this.attachReviews(products);

      return {
        success: true,
        count: productsWithReviews.length,
        data: productsWithReviews,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error fetching flash sale products', error.message);
    }
  }

  async getProductsWithMaterielDeMusculation() {
    try {
      const products = await this.productModel.find({
        features: { $elemMatch: { $regex: /materiel-de-musculation/i } },
        publier: "1"
      })
      .select({
        designation: 1,
        slug: 1,
        smallDescription: 1,
        prix: 1,
        promo: 1,
        "mainImage.url": 1,
        "images.url": 1,
        inStock: 1,
        features: 1,
        variant: 1,
        nutritionalValues: 1,
        category: 1,
        subCategory: 1,
        brand: 1,
        rate: 1,
        reviews: 1
      })
      .populate({
        path: "category",
        select: "designation -_id",
      })
      .populate({
        path: "subCategory",
        select: "designation -_id",
      });

      const productsWithReviews = await this.attachReviews(products);

      return {
        success: true,
        count: productsWithReviews.length,
        data: productsWithReviews,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error fetching fitness equipment products', error.message);
    }
  }

  async getMaxPrice() {
    try {
      const product = await this.productModel.findOne().sort("-prix").select("prix");
      const maxPrice = product?.prix || 0;
      return { maxPrice };
    } catch (error) {
      throw new InternalServerErrorException('Error fetching max price', error.message);
    }
  }

  async calculateProductWithTax(productId: string): Promise<{ 
    originalPrice: number, 
    taxAmount: number, 
    priceWithTax: number 
  }> {
    const product = await this.productModel.findOne({
      $or: [
        { _id: productId },
        { id: productId }
      ]
    });
    
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const taxAmount = (product.price * product.taxRate) / 100;
    const priceWithTax = product.price + taxAmount;

    return {
      originalPrice: product.price,
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      priceWithTax: parseFloat(priceWithTax.toFixed(2))
    };
  }

  async calculateTaxForMultipleProducts(productIds: string[]): Promise<{ 
    totalOriginalPrice: number, 
    totalTax: number, 
    totalWithTax: number 
  }> {
    const products = await this.productModel.find({ 
      _id: { $in: productIds } 
    });
    
    if (products.length !== productIds.length) {
      throw new NotFoundException('Some products were not found');
    }

    let totalOriginalPrice = 0;
    let totalTax = 0;

    products.forEach(product => {
      totalOriginalPrice += product.price;
      totalTax += (product.price * product.taxRate) / 100;
    });

    return {
      totalOriginalPrice: parseFloat(totalOriginalPrice.toFixed(2)),
      totalTax: parseFloat(totalTax.toFixed(2)),
      totalWithTax: parseFloat((totalOriginalPrice + totalTax).toFixed(2))
    };
  }

  /**
   * Autocomplete product names for search bar suggestions
   * Returns up to 10 products with designation and slug matching the query.
   */
 async autocompleteProducts(query: string) {
  console.log("autocompleteProducts called with query:", query);
  try {
    const filter: any = { publier: "1" }; // Only published products
    if (query && query.trim()) {
      filter.$or = [
        { designation: { $regex: query, $options: "i" } },
        { designation_fr: { $regex: query, $options: "i" } }
      ];
    }
    const products = await this.productModel.find(
      filter,
      { designation: 1, designation_fr: 1, slug: 1, _id: 0 }
    ).lean(); // No .limit()

    // Return only the fields needed for autocomplete
    return products.map(p => ({
      name: p.designation_fr || p.designation,
      slug: p.slug
    }));
  } catch (err) {
    console.error("Autocomplete error:", err);
    throw new InternalServerErrorException('Autocomplete failed', err.message);
  }
}

// Get products with promotions new method 
async getPromotions() {
  // Find products where promo < prix and both are numbers
  const products = await this.productModel.find({
    $expr: {
      $and: [
        { $lt: [ { $toDouble: "$promo" }, { $toDouble: "$prix" } ] },
        { $ne: [ "$promo", null ] },
        { $ne: [ "$prix", null ] }
      ]
    }
  }).exec();

  return {
    message: "success",
    data: products,
  };
}
}


