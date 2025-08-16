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
import * as fs from 'fs/promises';
import * as path from 'path';
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
import { BestSellerConfig, BestSellerConfigDocument } from '../../models/bestseller-config.schema';
import { NewArrivalConfig, NewArrivalConfigDocument } from '../../models/newarrival-config.schema';

export interface LocalImage {
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
    @InjectModel(BestSellerConfig.name) private bestSellerConfigModel: Model<BestSellerConfigDocument>,
    @InjectModel(NewArrivalConfig.name) private newArrivalConfigModel: Model<NewArrivalConfigDocument>,
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
    files: { mainImage?: Express.Multer.File[]; images?: Express.Multer.File[] }
  ) {
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

      // Set defaults for missing fields - no validation errors
      const finalDesignation = designation || 'Nouveau Produit';
      const finalPrice = parseFloat(price as any) || 10;
      const finalOldPrice = parseFloat(oldPrice as any) || 0;
      const finalInStock = inStock !== undefined ? inStock : true;
      const finalStatus = status !== undefined ? status : true;
      const finalDescription = description || 'Description du produit';
      const finalSmallDescription = smallDescription || 'Description courte';
      const finalBrand = brand || '';
      const finalVenteflashDate = venteflashDate || '';
      const finalQuestion = question || '';
      const finalCodaBar = codaBar || `SBT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // Parse arrays safely
      let parsedSubCategoryIds: any[] = [];
      if (Array.isArray(subCategoryIds)) {
        parsedSubCategoryIds = subCategoryIds;
      } else if (typeof subCategoryIds === 'string' && subCategoryIds) {
        try {
          parsedSubCategoryIds = JSON.parse(subCategoryIds);
        } catch {
          parsedSubCategoryIds = [];
        }
      }

      let parsedFeatures: any[] = [];
      if (Array.isArray(features)) {
        parsedFeatures = features;
      } else if (typeof features === 'string' && features) {
        try {
          parsedFeatures = JSON.parse(features);
        } catch {
          parsedFeatures = [];
        }
      }

      let parsedNutritionalValues: any[] = [];
      if (Array.isArray(nutritionalValues)) {
        parsedNutritionalValues = nutritionalValues;
      } else if (typeof nutritionalValues === 'string' && nutritionalValues) {
        try {
          parsedNutritionalValues = JSON.parse(nutritionalValues);
        } catch {
          parsedNutritionalValues = [];
        }
      }

      let parsedVariant: any[] = [];
      if (Array.isArray(variant)) {
        parsedVariant = variant;
      } else if (typeof variant === 'string' && variant) {
        try {
          parsedVariant = JSON.parse(variant);
        } catch {
          parsedVariant = [];
        }
      }

      const finalVariant = parsedVariant.length > 0 ? parsedVariant : [{title: finalDesignation, inStock: true}];

      // Use mainImageUrl from frontend if provided
      let coverUrl = '';
      if (createProductDto.mainImageUrl) {
        coverUrl = createProductDto.mainImageUrl;
      }

      // Upload additional images to dashboard public folder
      const images: { url: string; img_id: string; }[] = [];
      const additionalImages = files?.images || [];
      if (additionalImages.length > 0) {
        const now = new Date();
        const monthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' }).replace(' ', '');
        
        // Save to dashboard public folder
        const dashboardPublicDir = path.join(process.cwd(), '..', '..', 'sobitas-dashboard', 'dashboard-app', 'public', 'produits', monthYear);
        await fs.mkdir(dashboardPublicDir, { recursive: true });
        
        for (const imageFile of additionalImages) {
          const ext = path.extname(imageFile.originalname) || '.webp';
          const baseName = path.basename(imageFile.originalname, ext);
          const uniqueName = `${baseName}-${Date.now()}${ext}`;
          const filePath = path.join(dashboardPublicDir, uniqueName);
          
          await fs.writeFile(filePath, imageFile.buffer);
          
          images.push({
            url: `/produits/${monthYear}/${uniqueName}`,
            img_id: uniqueName,
          });
        }
      }
      
      // Create the product with both schema and database fields
      const newProduct = await this.productModel.create({
        // Schema fields
        designation: finalDesignation,
        description: finalDescription,
        smallDescription: finalSmallDescription,
        price: finalPrice,
        oldPrice: finalOldPrice,
        status: finalStatus,
        taxRate: 19, // Default tax rate
        
        // Database fields
        designation_fr: finalDesignation,
        description_fr: finalDescription,
        prix: finalPrice,
        promo: finalOldPrice,
        publier: finalStatus ? "1" : "0",
        
        // Common fields
        inStock: finalInStock,
        brand: finalBrand,
        venteflashDate: finalVenteflashDate,
        question: finalQuestion,
        features: parsedFeatures,
        cover: coverUrl,
        images,
        nutritionalValues: parsedNutritionalValues,
        variant: finalVariant,
        category: categoryId || null,
        subCategory: parsedSubCategoryIds,
        codaBar: finalCodaBar,
      });

      // Update category if provided (ignore errors)
      if (categoryId) {
        await this.categoryModel.findByIdAndUpdate(
          categoryId,
          { $push: { products: newProduct._id } }
        ).catch(() => {});
      }

      // Update all subcategories if provided (ignore errors)
      if (parsedSubCategoryIds.length > 0) {
        await this.subCategoryModel.updateMany(
          { _id: { $in: parsedSubCategoryIds } },
          { $push: { products: newProduct._id } }
        ).catch(() => {});
      }

      return {
        message: "Product created successfully",
        data: newProduct,
      };
    } catch (error) {
      console.error('Product creation error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        createProductDto
      });
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error creating product', error.message);
    }
  }





  
  async deleteProduct(id: string) {
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

      // Simple delete without complex transactions or image cleanup
      await this.productModel.deleteOne({
        $or: [
          { _id: id },
          { id: id }
        ]
      });

      return {
        message: "Product deleted successfully",
        data: product,
      };
    } catch (error) {
      console.error('Delete product error:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error deleting product', error.message);
    }
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
    files: { mainImage?: Express.Multer.File[]; images?: Express.Multer.File[] }
  ) {
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

      // Get existing product with relationships first
      const existingProduct = await this.productModel.findOne({
        $or: [
          { _id: id },
          { id: id }
        ]
      })
      .populate("category subCategory");

      if (!existingProduct) {
        throw new NotFoundException('Product not found');
      }

      // No validation - accept any designation
      const finalDesignationUpdate = designation || existingProduct.designation || 'Produit';

      // Set defaults for missing fields
      const finalPrice = parseFloat(price as any) || existingProduct.price || 10;
      const finalOldPrice = parseFloat(oldPrice as any) || existingProduct.oldPrice || 0;
      const finalInStock = inStock !== undefined ? inStock : existingProduct.inStock || true;
      const finalStatus = status !== undefined ? status : existingProduct.status || true;
      const finalDescription = description || existingProduct.description || 'Description du produit';
      const finalSmallDescription = smallDescription || existingProduct.smallDescription || 'Description courte';
      const finalBrand = brand !== undefined ? brand : existingProduct.brand || '';
      const finalVenteflashDate = venteflashDate !== undefined ? venteflashDate : existingProduct.venteflashDate || '';
      const finalQuestion = question !== undefined ? question : existingProduct.question || '';
      const finalCodaBar = codaBar || (existingProduct as any).codaBar || `SBT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // Parse arrays safely
      let parsedSubCategoryIds: any[] = existingProduct.subCategory || [];
      if (Array.isArray(subCategoryIds)) {
        parsedSubCategoryIds = subCategoryIds;
      } else if (typeof subCategoryIds === 'string' && subCategoryIds) {
        try {
          parsedSubCategoryIds = JSON.parse(subCategoryIds);
        } catch {
          parsedSubCategoryIds = existingProduct.subCategory || [];
        }
      }

      let parsedFeatures: any[] = existingProduct.features || [];
      if (Array.isArray(features)) {
        parsedFeatures = features;
      } else if (typeof features === 'string' && features) {
        try {
          parsedFeatures = JSON.parse(features);
        } catch {
          parsedFeatures = existingProduct.features || [];
        }
      }

      let parsedNutritionalValues: any[] = existingProduct.nutritionalValues || [];
      if (Array.isArray(nutritionalValues)) {
        parsedNutritionalValues = nutritionalValues;
      } else if (typeof nutritionalValues === 'string' && nutritionalValues) {
        try {
          parsedNutritionalValues = JSON.parse(nutritionalValues);
        } catch {
          parsedNutritionalValues = existingProduct.nutritionalValues || [];
        }
      }

      let parsedVariant: any[] = existingProduct.variant || [];
      if (Array.isArray(variant)) {
        parsedVariant = variant;
      } else if (typeof variant === 'string' && variant) {
        try {
          parsedVariant = JSON.parse(variant);
        } catch {
          parsedVariant = existingProduct.variant || [];
        }
      }

      const finalVariant = parsedVariant.length > 0 ? parsedVariant : existingProduct.variant || [{title: finalDesignationUpdate, inStock: true}];

      // CATEGORY VALIDATION (optional, ignore errors)
      let newCategory: CategoryDocument | null = null;
      if (categoryId) {
        newCategory = await this.categoryModel.findById(categoryId).catch(() => null) as CategoryDocument | null;
      }

      // IMAGE HANDLING
      const mainImage = await this.handleMainImageUpdate(existingProduct, files?.mainImage?.[0]);
      const images = await this.handleGalleryImagesUpdate(
        existingProduct,
        files?.images || [],
        deletedImages,
      );

      // Prepare update payload
      const updatePayload = {
        // Schema fields
        designation: finalDesignationUpdate,
        description: finalDescription,
        smallDescription: finalSmallDescription,
        price: finalPrice,
        oldPrice: finalOldPrice,
        inStock: finalInStock,
        status: finalStatus,
        
        // Database fields
        designation_fr: finalDesignationUpdate,
        description_fr: finalDescription,
        prix: finalPrice,
        promo: finalOldPrice,
        publier: finalStatus ? "1" : "0",
        
        // Common fields
        codaBar: finalCodaBar,
        question: finalQuestion,
        venteflashDate: finalVenteflashDate,
        features: parsedFeatures,
        variant: finalVariant,
        nutritionalValues: parsedNutritionalValues,
        brand: finalBrand,
        mainImage: mainImage || existingProduct.mainImage,
        images: images || existingProduct.images,
        category: categoryId || existingProduct.category?._id || null,
        subCategory: parsedSubCategoryIds.length > 0
          ? parsedSubCategoryIds
          : existingProduct.subCategory?.map((sub: any) => sub._id) || [],
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
        { new: true }
      ).populate("category subCategory");

      // HANDLE CATEGORY RELATIONSHIPS (ignore errors)
      await this.handleCategoryRelationships(
        existingProduct,
        updatedProduct,
        newCategory,
        parsedSubCategoryIds
      ).catch(() => {});

      return {
        message: "Product updated successfully",
        data: updatedProduct,
      };
    } catch (error) {
      console.error('Product update service error:', {
        message: error.message,
        stack: error.stack,
        updateProductDto,
        productId: id
      });
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating product', error.message);
    }
  }

  private async handleMainImageUpdate(
    existingProduct: ProductDocument,
    newImageFile: Express.Multer.File | undefined,
  ) {
    if (!newImageFile) return null;

    const now = new Date();
    const monthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' }).replace(' ', '');
    const publicDir = path.join(process.cwd(), 'public', 'produits', monthYear);
    await fs.mkdir(publicDir, { recursive: true });
    
    const ext = path.extname(newImageFile.originalname) || '.webp';
    const baseName = path.basename(newImageFile.originalname, ext);
    const uniqueName = `${baseName}-${Date.now()}${ext}`;
    const filePath = path.join(publicDir, uniqueName);
    
    await fs.writeFile(filePath, newImageFile.buffer);

    return {
      url: `produits/${monthYear}/${uniqueName}`,
      img_id: uniqueName,
    };
  }

  private async handleGalleryImagesUpdate(
    existingProduct: any,
    newImages: Express.Multer.File[],
    deletedImageUrls: string[],
  ) {
    const now = new Date();
    const monthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' }).replace(' ', '');
    const publicDir = path.join(process.cwd(), 'public', 'produits', monthYear);
    await fs.mkdir(publicDir, { recursive: true });

    // Upload new images
    const uploadedImages: { url: string; img_id: string; }[] = [];
    for (const imageFile of newImages || []) {
      const ext = path.extname(imageFile.originalname) || '.webp';
      const baseName = path.basename(imageFile.originalname, ext);
      const uniqueName = `${baseName}-${Date.now()}${ext}`;
      const filePath = path.join(publicDir, uniqueName);
      
      await fs.writeFile(filePath, imageFile.buffer);
      
      uploadedImages.push({
        url: `produits/${monthYear}/${uniqueName}`,
        img_id: uniqueName,
      });
    }

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
    newSubCategoryIds: string[]
  ) {
    // Handle category changes
    if (
      existingProduct.category?.toString() !== updatedProduct.category?.toString()
    ) {
      // Remove from old category
      if (existingProduct.category) {
        await this.categoryModel.findByIdAndUpdate(
          existingProduct.category,
          { $pull: { products: existingProduct._id } }
        );
      }

      // Add to new category
      if (newCategory) {
        await this.categoryModel.findByIdAndUpdate(
          newCategory._id,
          { $addToSet: { products: updatedProduct._id } }
        );
      }
    }

    // Handle subcategory changes
    const existingSubIds = (existingProduct.subCategory || []).map((id: any) =>
      id instanceof mongoose.Types.ObjectId ? id.toString() : id
    );
    const newSubIds = newSubCategoryIds.map((id) => id.toString());

    const subToRemove = existingSubIds.filter((id: string) => !newSubIds.includes(id));
    const subToAdd = newSubIds.filter((id: string) => !existingSubIds.includes(id));

    // Remove from old subcategories
    if (subToRemove.length > 0) {
      await this.subCategoryModel.updateMany(
        { _id: { $in: subToRemove } },
        { $pull: { products: updatedProduct._id } }
      );
    }

    // Add to new subcategories
    if (subToAdd.length > 0) {
      await this.subCategoryModel.updateMany(
        { _id: { $in: subToAdd } },
        { $addToSet: { products: updatedProduct._id } }
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
    console.log('RAW QUERY:', query);
    console.log('QUERY:', query);
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
        //zdnah hahi for filter 
        sous_categorie_id, 
      } = query;

      let queryObj: any = {};


       // --- ADD THIS BLOCK ---
    if (sous_categorie_id) {
      if (Array.isArray(sous_categorie_id)) {
        queryObj.sous_categorie_id = { $in: sous_categorie_id.map(String) };
      } else {
        queryObj.sous_categorie_id = String(sous_categorie_id);
      }
    }
    // --- END BLOCK ---


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
      console.log('QUERY OBJ:', queryObj);
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
          // Images will be cleaned up by file system if needed

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
      // Get configuration
      const config = await this.getBestSellerConfig();
      
      if (!config.showOnFrontend) {
        return {
          success: true,
          count: 0,
          data: [],
          config
        };
      }

      let products = await this.productModel.find({
        best_seller: "1",
        publier: "1"
      })
      .select({
        designation: 1,
        designation_fr: 1,
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
      .populate({
        path: "category",
        select: "designation -_id",
      })
      .populate({
        path: "subCategory",
        select: "designation -_id",
      });

      // Apply custom order if exists
      if (config.productOrder && config.productOrder.length > 0) {
        const orderedProducts: any[] = [];
        const productMap = new Map(products.map(p => [String(p._id), p]));
        
        // Add products in specified order
        for (const id of config.productOrder) {
          if (productMap.has(id)) {
            const product = productMap.get(id);
            if (product) {
              orderedProducts.push(product);
              productMap.delete(id);
            }
          }
        }
        
        // Add remaining products
        orderedProducts.push(...Array.from(productMap.values()));
        products = orderedProducts;
      }

      // Limit products based on config
      if (config.maxDisplay && config.maxDisplay < products.length) {
        products = products.slice(0, config.maxDisplay);
      }

      const productsWithReviews = await this.attachReviews(products);

      return {
        success: true,
        count: productsWithReviews.length,
        data: productsWithReviews,
        config
      };
    } catch (error) {
      throw new InternalServerErrorException('Error fetching best seller products', error.message);
    }
  }

  async getProductsWithNewVente() {
    try {
      // Get configuration
      const config = await this.getNewArrivalConfig();
      
      if (!config.showOnFrontend) {
        return {
          success: true,
          count: 0,
          data: [],
          config
        };
      }

      let products = await this.productModel.find({
        new_product: "1",
        publier: "1"
      })
      .select({
        designation: 1,
        designation_fr: 1,
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
      .populate({
        path: "category",
        select: "designation -_id",
      })
      .populate({
        path: "subCategory",
        select: "designation -_id",
      });

      // Apply custom order if exists
      if (config.productOrder && config.productOrder.length > 0) {
        const orderedProducts: any[] = [];
        const productMap = new Map(products.map(p => [String(p._id), p]));
        
        // Add products in specified order
        for (const id of config.productOrder) {
          if (productMap.has(id)) {
            const product = productMap.get(id);
            if (product) {
              orderedProducts.push(product);
              productMap.delete(id);
            }
          }
        }
        
        // Add remaining products
        orderedProducts.push(...Array.from(productMap.values()));
        products = orderedProducts;
      }

      // Force limit to 8 products maximum
      products = products.slice(0, 8);

      const productsWithReviews = await this.attachReviews(products);

      return {
        success: true,
        count: productsWithReviews.length,
        data: productsWithReviews,
        config
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
    const filter: any = { publier: "1" };
    if (query && query.trim()) {
      filter.$or = [
        { designation: { $regex: query, $options: "i" } },
        { designation_fr: { $regex: query, $options: "i" } }
      ];
    }
    // Return all fields for matched products
    const products = await this.productModel.find(filter).limit(10); // No field selection, no .lean()

    return products; // Return full product documents
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

async recommendProduct(exclude: string[]) {
  // Try to find a random published product not in the exclude list
  let products = await this.productModel.aggregate([
    { $match: { _id: { $nin: exclude.map(id => new mongoose.Types.ObjectId(id)) }, publier: "1" } },
    { $sample: { size: 1 } }
  ]);
  let product = products[0];

  // If no product found (all are excluded), pick any random published product
  if (!product) {
    products = await this.productModel.aggregate([
      { $match: { publier: "1" } },
      { $sample: { size: 1 } }
    ]);
    product = products[0] || null;
  }

  return { product };
}

  // Best Seller Configuration Methods
  async getBestSellerConfig() {
    try {
      let config = await this.bestSellerConfigModel.findOne();
      if (!config) {
        config = await this.bestSellerConfigModel.create({
          sectionTitle: 'Meilleures ventes',
          sectionDescription: 'Découvrez nos meilleures ventes du moment sur une sélection de produits !',
          maxDisplay: 4,
          showOnFrontend: true,
          productOrder: []
        });
      }
      return config;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching best seller config', error.message);
    }
  }

  async updateBestSellerConfig(configData: any) {
    try {
      let config = await this.bestSellerConfigModel.findOne();
      if (!config) {
        config = await this.bestSellerConfigModel.create(configData);
      } else {
        Object.assign(config, configData);
        await config.save();
      }
      
      // Clear cache
      await this.redisService.del('bestseller-products');
      
      return {
        message: 'Best seller configuration updated successfully',
        data: config
      };
    } catch (error) {
      throw new InternalServerErrorException('Error updating best seller config', error.message);
    }
  }

  async updateBestSellerOrder(productOrder: string[]) {
    try {
      let config = await this.bestSellerConfigModel.findOne();
      if (!config) {
        config = await this.bestSellerConfigModel.create({ productOrder });
      } else {
        config.productOrder = productOrder;
        await config.save();
      }
      
      // Clear cache
      await this.redisService.del('bestseller-products');
      
      return {
        message: 'Best seller order updated successfully',
        data: config
      };
    } catch (error) {
      throw new InternalServerErrorException('Error updating best seller order', error.message);
    }
  }

  // New Arrival Configuration Methods
  async getNewArrivalConfig() {
    try {
      let config = await this.newArrivalConfigModel.findOne();
      if (!config) {
        config = await this.newArrivalConfigModel.create({
          sectionTitle: 'Nouveautés',
          sectionDescription: 'Découvrez nos nouveaux produits fraîchement arrivés !',
          maxDisplay: 100,
          showOnFrontend: true,
          productOrder: []
        });
      }
      return config;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching new arrival config', error.message);
    }
  }

  async updateNewArrivalConfig(configData: any) {
    try {
      let config = await this.newArrivalConfigModel.findOne();
      if (!config) {
        config = await this.newArrivalConfigModel.create(configData);
      } else {
        Object.assign(config, configData);
        await config.save();
      }
      
      // Clear cache
      await this.redisService.del('newarrival-products');
      await this.redisService.del('products-new-products');
      
      return {
        message: 'New arrival configuration updated successfully',
        data: config
      };
    } catch (error) {
      throw new InternalServerErrorException('Error updating new arrival config', error.message);
    }
  }

  async updateNewArrivalOrder(productOrder: string[]) {
    try {
      let config = await this.newArrivalConfigModel.findOne();
      if (!config) {
        config = await this.newArrivalConfigModel.create({ productOrder });
      } else {
        config.productOrder = productOrder;
        await config.save();
      }
      
      // Clear cache
      await this.redisService.del('newarrival-products');
      
      return {
        message: 'New arrival order updated successfully',
        data: config
      };
    } catch (error) {
      throw new InternalServerErrorException('Error updating new arrival order', error.message);
    }
  }
}


