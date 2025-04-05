import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import * as mongoose from 'mongoose';
  import * as cloudinary from 'cloudinary';
  import {
    Product,
    ProductDocument,
    Category,
    CategoryDocument,
    SubCategory,
    SubCategoryDocument,
  } from '../schemas';
  import {
    CreateProductDto,
    UpdateProductDto,
    DeleteManyProductsDto,
    ProductQueryDto,
  } from './dto';
  
  @Injectable()
  export class ProductsService {
    constructor(
      @InjectModel(Product.name) private productModel: Model<ProductDocument>,
      @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
      @InjectModel(SubCategory.name)
      private subCategoryModel: Model<SubCategoryDocument>,
    ) {}
  
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
              subCat => subCat.category.toString() !== categoryId
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
        const mainImageStr = mainImageFile.buffer.toString('base64');
        const mainImageDataUri = `data:${mainImageFile.mimetype};base64,${mainImageStr}`;
  
        const mainImageResult = await cloudinary.uploader.upload(mainImageDataUri, {
          folder: "products/main",
          resource_type: "auto",
        });
  
        // Upload additional images
        const images = [];
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
  
        // Create the product
        const newProduct = await this.productModel.create(
          [{
            designation,
            description,
            smallDescription,
            price,
            question,
            oldPrice: parseFloat(oldPrice as any) || 0,
            inStock,
            brand,
            venteflashDate,
            status,
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
        const product = await this.productModel.findById(id)
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
          await this.productModel.findByIdAndDelete(id, { session });
  
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
        const existingProduct = await this.productModel.findById(id)
          .populate("category subCategory")
          .session(session);
  
        if (!existingProduct) {
          throw new NotFoundException('Product not found');
        }
  
        // CATEGORY VALIDATION
        let newCategory = null;
        if (categoryId) {
          newCategory = await this.categoryModel.findById(categoryId).session(session);
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
        const [mainImage, images] = await Promise.all([
          this.handleMainImageUpdate(existingProduct, files?.find(f => f.fieldname === 'mainImage'), session),
          this.handleGalleryImagesUpdate(
            existingProduct,
            files?.filter(f => f.fieldname === 'images'),
            deletedImages,
            session
          ),
        ]);
  
        // Prepare update payload
        const updatePayload = {
          designation,
          description,
          smallDescription,
          venteflashDate,
          codaBar,
          question,
          price,
          oldPrice,
          inStock,
          status,
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
        const updatedProduct = await this.productModel.findByIdAndUpdate(
          id,
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
      existingProduct: any,
      newImageFile: Express.Multer.File,
      session: mongoose.ClientSession
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
      session: mongoose.ClientSession
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
  
    async getProducts(query: ProductQueryDto) {
      try {
        const {
          sort = "-createdAt",
          category,
          subCategory,
          search,
          minPrice,
          maxPrice,
          status = true,
          promo,
        } = query;
  
        let queryObj: any = { status };
  
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
            { designation: { $regex: search, $options: "i" } },
            { smallDescription: { $regex: search, $options: "i" } },
          ];
        }
  
        // Price range filter
        if (minPrice !== undefined || maxPrice !== undefined) {
          queryObj.price = {};
          if (minPrice !== undefined) queryObj.price.$gte = Number(minPrice);
          if (maxPrice !== undefined) queryObj.price.$lte = Number(maxPrice);
        }
  
        if (promo === "true") {
          queryObj.oldPrice = { $exists: true, $ne: null, $gt: 0 };
        }
  
        // Get total matching products
        const totalProducts = await this.productModel.countDocuments(queryObj);
  
        // Fetch products with populated category and subcategory designations
        const products = await this.productModel.find(queryObj)
          .populate("category", "designation")
          .populate("subCategory", "designation")
          .sort(sort);
  
        return {
          message: "Products retrieved successfully",
          data: {
            products,
            pagination: {
              total: totalProducts,
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
  
        return {
          message: "Products retrieved successfully",
          data: products,
        };
      } catch (error) {
        throw new InternalServerErrorException('Error retrieving products', error.message);
      }
    }
  
    async getProductById(id: string) {
      try {
        const product = await this.productModel.findById(id)
          .populate("category")
          .populate("subCategory");
  
        if (!product) {
          throw new NotFoundException("Product not found");
        }
  
        return {
          message: "Product retrieved successfully",
          data: product,
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
        const { productIds } = deleteManyProductsDto;
  
        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
          throw new BadRequestException("Please provide an array of product IDs to delete");
        }
  
        // Find all products with their category and subcategory references
        const products = await this.productModel.find({ _id: { $in: productIds } })
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
            if (product.category) {
              categoryIds.add(product.category._id.toString());
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
              { $pull: { products: { $in: productIds } } },
              { session }
            );
          }
  
          // Update subcategories to remove product references
          if (subCategoryIds.size > 0) {
            await this.subCategoryModel.updateMany(
              { _id: { $in: Array.from(subCategoryIds) } },
              { $pull: { products: { $in: productIds } } },
              { session }
            );
          }
  
          // Delete the products
          const deleteResult = await this.productModel.deleteMany(
            { _id: { $in: productIds } },
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
          .select("-_id")
          .populate("category")
          .populate("subCategory");
  
        if (!product) {
          throw new NotFoundException("Product not found");
        }
  
        return {
          message: "Product retrieved successfully",
          data: product,
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
          features: { $elemMatch: { $regex: /meilleur vente/i } },
          status: true,
        })
          .select({
            designation: 1,
            slug: 1,
            smallDescription: 1,
            price: 1,
            oldPrice: 1,
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
            createdAt: 1,
            updatedAt: 1,
            __v: 1,
            _id: 0,
          })
          .populate({
            path: "category",
            select: "designation -_id",
          })
          .populate({
            path: "subCategory",
            select: "designation -_id",
          });
  
        if (products.length === 0) {
          return {
            success: false,
            message: "No products with 'meilleur vente' feature found",
          };
        }
  
        return {
          success: true,
          count: products.length,
          data: products,
        };
      } catch (error) {
        throw new InternalServerErrorException('Error fetching meilleur vente products', error.message);
      }
    }
  
    async getProductsWithNewVente() {
      try {
        const products = await this.productModel.find({
          features: { $elemMatch: { $regex: /nouveau/i } },
          status: true,
        })
          .select({
            designation: 1,
            slug: 1,
            smallDescription: 1,
            price: 1,
            oldPrice: 1,
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
            createdAt: 1,
            updatedAt: 1,
            __v: 1,
            _id: 0,
          })
          .populate({
            path: "category",
            select: "designation -_id",
          })
          .populate({
            path: "subCategory",
            select: "designation -_id",
          });
  
        if (products.length === 0) {
          return {
            success: false,
            message: "No products with 'nouveau vente' feature found",
          };
        }
  
        return {
          success: true,
          count: products.length,
          data: products,
        };
      } catch (error) {
        throw new InternalServerErrorException('Error fetching nouveau vente products', error.message);
      }
    }
  
    async getProductsWithVenteFlashVente() {
      try {
        const products = await this.productModel.find({
          features: { $elemMatch: { $regex: /vente-flash/i } },
          status: true,
        })
          .select({
            designation: 1,
            slug: 1,
            smallDescription: 1,
            price: 1,
            oldPrice: 1,
            "mainImage.url": 1,
            "images.url": 1,
            inStock: 1,
            features: 1,
            variant: 1,
            nutritionalValues: 1,
            category: 1,
            brand: 1,
            rate: 1,
            subCategory: 1,
            reviews: 1,
            createdAt: 1,
            updatedAt: 1,
            venteflashDate: 1,
            __v: 1,
            _id: 0,
          })
          .populate({
            path: "category",
            select: "designation -_id",
          })
          .populate({
            path: "subCategory",
            select: "designation -_id",
          });
  
        if (products.length === 0) {
          return {
            success: false,
            message: "No products with 'vente flash' feature found",
          };
        }
  
        return {
          success: true,
          count: products.length,
          data: products,
        };
      } catch (error) {
        throw new InternalServerErrorException('Error fetching vente flash products', error.message);
      }
    }
  
    async getProductsWithMaterielDeMusculation() {
      try {
        const products = await this.productModel.find({
          features: { $elemMatch: { $regex: /materiel-de-musculation/i } },
          status: true,
        })
          .select({
            designation: 1,
            slug: 1,
            smallDescription: 1,
            price: 1,
            oldPrice: 1,
            "mainImage.url": 1,
            "images.url": 1,
            inStock: 1,
            features: 1,
            variant: 1,
            nutritionalValues: 1,
            category: 1,
            brand: 1,
            rate: 1,
            subCategory: 1,
            reviews: 1,
            createdAt: 1,
            updatedAt: 1,
            venteflashDate: 1,
            __v: 1,
            _id: 0,
          })
          .populate({
            path: "category",
            select: "designation -_id",
          })
          .populate({
            path: "subCategory",
            select: "designation -_id",
          });
  
        if (products.length === 0) {
          return {
            success: false,
            message: "No products with 'vente flash' feature found",
          };
        }
  
        return {
          success: true,
          count: products.length,
          data: products,
        };
      } catch (error) {
        throw new InternalServerErrorException('Error fetching vente flash products', error.message);
      }
    }
  
    async getMaxPrice() {
      try {
        const product = await this.productModel.findOne().sort("-price").select("price");
        const maxPrice = product?.price || 0;
        return { maxPrice };
      } catch (error) {
        throw new InternalServerErrorException('Error fetching max price', error.message);
      }
    }
  }