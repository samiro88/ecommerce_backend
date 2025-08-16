import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UploadedFiles,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Inject,
  Req
} from '@nestjs/common';
import { FileFieldsInterceptor, FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { ProductsService } from './product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { DeleteManyProductsDto } from '../dto/delete-many-products.dto';
import { ProductQueryDto } from '../dto/product-query.dto';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject('PRODUCTS_SERVICE') // Supports both injection methods
    private readonly productsService: ProductsService
  ) {}

  @Get('store/deals')
  async getStoreDeals() {
    try {
      return await this.productsService.getStoreDeals();
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/tax')
  async calculateProductTax(@Param('id') id: string) {
    try {
      return await this.productsService.calculateProductWithTax(id);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Calculate tax for multiple products
   * @param productIds Comma-separated list of product IDs
   */
  @Get('tax')
  async calculateMultipleProductsTax(@Query('productIds') productIds: string) {
    try {
      const ids = productIds.split(',');
      return await this.productsService.calculateTaxForMultipleProducts(ids);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('store/new-arrivals')
async getStoreNewArrivals() {
  try {
    return await this.productsService.getStoreNewArrivals();
  } catch (error) {
    throw new HttpException(
      error.message,
      error.status || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
 /* Admin Routes (original from second file) */
  @Post('admin/new-with-file')
  @UseInterceptors(FileInterceptor('file'))
  async adminCreateProductWithFile(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      console.log('=== PRODUCT WITH FILE ENDPOINT HIT ===');
      console.log('Body received:', createProductDto);
      console.log('File received:', file ? {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      } : 'No file');
      
      console.log('Form data received:', {
        designation: createProductDto.designation,
        prix: createProductDto.prix,
        promo: createProductDto.promo
      });

      let mainImageUrl = '';
      
      // Upload file if provided
      if (file) {
        const now = new Date();
        const monthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' }).replace(' ', '');
        
        const dashboardPublicDir = path.join(
          process.cwd(), 
          '..', 
          '..', 
          'sobitas-dashboard', 
          'dashboard-app', 
          'public', 
          'produits', 
          monthYear
        );
        
        const fs = require('fs/promises');
        await fs.mkdir(dashboardPublicDir, { recursive: true });
        
        const ext = path.extname(file.originalname) || '.jpg';
        const baseName = path.basename(file.originalname, ext);
        const uniqueName = `${baseName}-${Date.now()}${ext}`;
        const filePath = path.join(dashboardPublicDir, uniqueName);
        
        await fs.writeFile(filePath, file.buffer);
        mainImageUrl = `/produits/${monthYear}/${uniqueName}`;
        
        console.log('File saved successfully:', {
          path: filePath,
          url: mainImageUrl
        });
      }
      
      // Create product with form data and image URL
      const productData = {
        ...createProductDto,
        mainImageUrl
      };
      
      const result = await this.productsService.createProduct(productData, {});
      console.log('Product with file created successfully');
      
      return {
        success: true,
        message: 'Product created successfully',
        imageUrl: mainImageUrl,
        product: result.data
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw new HttpException(
        error.message || 'Upload failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('admin/new')
  async adminCreateProduct(
    @Body() createProductDto: CreateProductDto,
  ) {
    try {
      console.log('=== ENDPOINT HIT (NO FILES) ===');
      console.log('Body received:', JSON.stringify(createProductDto, null, 2));
      
      const result = await this.productsService.createProduct(createProductDto, {});
      console.log('Product created successfully:', result.message);
      return result;
    } catch (error) {
      console.error('Controller error:', error);
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('admin/new-with-files')
  async adminCreateProductWithFiles(
    @Req() req: any,
  ) {
    try {
      console.log('=== RAW FILE UPLOAD ENDPOINT HIT ===');
      
      const busboy = require('busboy');
      const fields: any = {};
      const files: any = { mainImage: [], images: [] };
      
      return new Promise((resolve, reject) => {
        const bb = busboy({ headers: req.headers });
        
        bb.on('field', (name: string, val: string) => {
          fields[name] = val;
        });
        
        bb.on('file', (name: string, file: any, info: any) => {
          const { filename, mimetype } = info;
          const chunks: Buffer[] = [];
          
          file.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
          });
          
          file.on('end', () => {
            const buffer = Buffer.concat(chunks);
            const fileObj = {
              originalname: filename,
              mimetype,
              buffer,
              size: buffer.length
            };
            
            if (name === 'mainImage') {
              files.mainImage.push(fileObj);
            } else if (name === 'images') {
              files.images.push(fileObj);
            }
          });
        });
        
        bb.on('finish', async () => {
          try {
            console.log('Fields received:', fields);
            console.log('Files received:', {
              mainImage: files.mainImage.length,
              images: files.images.length
            });
            
            const result = await this.productsService.createProduct(fields, files);
            console.log('Product with files created successfully');
            resolve(result);
          } catch (error) {
            console.error('Processing error:', error);
            reject(error);
          }
        });
        
        bb.on('error', (error: any) => {
          console.error('Busboy error:', error);
          reject(error);
        });
        
        req.pipe(bb);
      });
    } catch (error) {
      console.error('File upload error:', error);
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('admin/update/:id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'mainImage', maxCount: 1 },
      { name: 'images', maxCount: 10 },
    ])
  )
  async adminUpdateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files: { mainImage?: Express.Multer.File[]; images?: Express.Multer.File[] },
  ) {
    try {
      return await this.productsService.updateProduct(id, updateProductDto, files);
    } catch (error) {
      console.error('Product update controller error:', error);
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('admin/delete/:id')
  async adminDeleteProduct(@Param('id') id: string) {
    try {
      return await this.productsService.deleteProduct(id);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('admin/delete/many')
  async adminDeleteManyProducts(@Body() deleteManyProductsDto: DeleteManyProductsDto) {
    try {
      return await this.productsService.deleteManyProducts(deleteManyProductsDto);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('admin/:id/toggle-status')
  async toggleProductStatus(@Param('id') id: string) {
    try {
      return await this.productsService.toggleProductStatus(id);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /* Storefront Routes (original from first file) */
  @Get('store/all')
  async getAllProductsNormal() {
    try {
      return await this.productsService.getAllProductsNormal();
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
  @Get('store/top')
  async getProductsWithMilleurVente() {
    try {
      const result = await this.productsService.getProductsWithMilleurVente();
      // Normalize each product to match the frontend's expectations
      const normalizedProducts = result.data.map((p) => ({
        id: p.id || p._id,
        _id: p._id,
        title: p.title || p.designation_fr || p.designation || "",
        designation: p.designation || "",
        designation_fr: p.designation_fr || "",
        price: p.price ?? p.prix ?? 0,
        discountedPrice: p.discountedPrice ?? p.promo ?? p.promo_ht ?? p.price ?? p.prix ?? 0,
        oldPrice: p.oldPrice ?? p.prix_ht ?? p.promo ?? 0,
        imgs: {
          thumbnails: p.images?.map((img) => img.url) || (p.mainImage?.url ? [p.mainImage.url] : []),
          previews: p.images?.map((img) => img.url) || (p.mainImage?.url ? [p.mainImage.url] : []),
        },
        mainImage: p.mainImage || { url: p.cover || "" },
        cover: p.cover || p.mainImage?.url || "",
        inStock: p.inStock ?? (p.rupture === "0" ? true : false),
        reviews: p.reviews || [],
        features: p.features || [],
        subCategory: p.subCategory || [],
        slug: p.slug || "",
        isBestSeller: true,
        isNewProduct: false,
        // Add any other fields your frontend expects here
      }));
      return {
        success: true,
        count: normalizedProducts.length,
        products: normalizedProducts,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('store/new')
  async getProductsWithNewVente() {
    try {
      const result = await this.productsService.getProductsWithNewVente();
      return {
        success: true,
        count: result.data.length,
        products: result.data,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('store/vente-flash')
  async getProductsWithVenteFlashVente(): Promise<any> {
    try {
      const result = await this.productsService.getProductsWithVenteFlashVente();
      return {
        success: true,
        count: result.data.length,
        products: result.data.map(p => ({
          ...p,
          endTime: p.venteflashDate?.toISOString() || new Date(Date.now() + 86400000).toISOString()
        }))
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
  @Get('store/materiel-de-musculation')
  async getProductsWithMaterielDeMusculation() {
    try {
      const result = await this.productsService.getProductsWithMaterielDeMusculation();
      return {
        success: true,
        count: result.data.length,
        products: result.data,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('store/featured')
  async getStoreFeaturedProducts() {
    try {
      return await this.productsService.getStoreFeaturedProducts();
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /* Category Route - New addition */
  @Get('category/:category')
  async getProductsByCategory(@Param('category') category: string) {
    try {
      return await this.productsService.getProductsByCategory(category);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /* Common Routes (merged from both) */
  @Get()
  async getProducts(@Query() query: ProductQueryDto) {
     console.log('CONTROLLER QUERY:', query);
    try {
      return await this.productsService.getProducts(query);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('max-price')
  async getMaxPrice() {
    try {
      return await this.productsService.getMaxPrice();
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Autocomplete product names for search bar suggestions
   * Example: GET /products/autocomplete?query=pro
   */
  @Get('autocomplete')
  async autocompleteProducts(@Query('query') query: string) {
    console.log("Controller: autocompleteProducts called with query:", query);
    try {
      return await this.productsService.autocompleteProducts(query);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('store/promotions')
  async getPromotions() {
  try {
  return await this.productsService.getPromotions();
  } catch (error) {
  throw new HttpException(
  error.message,
  error.status || HttpStatus.INTERNAL_SERVER_ERROR,
  );
  }
  }
  
  // Place dynamic routes AFTER specific ones!
  @Get(':id')
  async getProductById(@Param('id') id: string) {
  try {
  return await this.productsService.getProductById(id);
  } catch (error) {
  throw new HttpException(
  error.message,
  error.status || HttpStatus.INTERNAL_SERVER_ERROR,
  );
  }
  }
  
  @Get('slug/:slug')
  async getProductBySlug(@Param('slug') slug: string) {
  try {
  const product = await this.productsService.getProductBySlug(slug);
  if (!product) {
  throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
  }
  return {
  success: true,
  product
  };
  } catch (error) {
  throw new HttpException(
  error.message,
  error.status || HttpStatus.INTERNAL_SERVER_ERROR,
  );
  }
  }

  @Post('recommendation')
async recommendProduct(@Body('exclude') exclude: string[]) {
  try {
    return await this.productsService.recommendProduct(exclude);
  } catch (error) {
    throw new HttpException(
      error.message,
      error.status || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

  // Best Seller Configuration Routes
  @Get('admin/bestseller-config')
  async getBestSellerConfig() {
    try {
      return await this.productsService.getBestSellerConfig();
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('admin/bestseller-config')
  async updateBestSellerConfig(@Body() config: any) {
    try {
      return await this.productsService.updateBestSellerConfig(config);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('admin/bestseller-order')
  async updateBestSellerOrder(@Body('productOrder') productOrder: string[]) {
    try {
      return await this.productsService.updateBestSellerOrder(productOrder);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // New Arrival Configuration Routes
  @Get('admin/newarrival-config')
  async getNewArrivalConfig() {
    try {
      return await this.productsService.getNewArrivalConfig();
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('admin/newarrival-config')
  async updateNewArrivalConfig(@Body() config: any) {
    try {
      return await this.productsService.updateNewArrivalConfig(config);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('admin/newarrival-order')
  async updateNewArrivalOrder(@Body('productOrder') productOrder: string[]) {
    try {
      return await this.productsService.updateNewArrivalOrder(productOrder);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

}
