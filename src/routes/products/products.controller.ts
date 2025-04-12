import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Query,
    Body,
    UploadedFiles,
    UseInterceptors,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { FilesInterceptor } from '@nestjs/platform-express';
  import { ProductsService } from './products.service';
  
  @Controller('admin/products') // Maintaining /admin prefix
  export class ProductsController {
    constructor(private readonly productsService: ProductsService) {
      console.log('ProductsService injected:', !!this.productsService);
    }
  
    @Post('new')
    @UseInterceptors(FilesInterceptor('images', 10)) // Same 10 file limit
    async createProduct(
      @Body() body: any,
      @UploadedFiles() files: Express.Multer.File[],
    ) {
      try {
        return await this.productsService.createProduct(body, files);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get('get')
    async getProducts(@Query() query: any) {
      try {
        return await this.productsService.getProducts(query);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get('get/all')
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
  
    @Get('get/:id')
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
  
    @Put('update/:id')
    @UseInterceptors(FilesInterceptor('images', 10))
    async updateProduct(
      @Param('id') id: string,
      @Body() body: any,
      @UploadedFiles() files: Express.Multer.File[],
    ) {
      try {
        return await this.productsService.updateProduct(id, body, files);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Delete('delete/:id')
    async deleteProduct(@Param('id') id: string) {
      try {
        return await this.productsService.deleteProduct(id);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Post('delete/many')
    async deleteManyProducts(@Body() body: string[]) {
      try {
        return await this.productsService.deleteManyProducts(body);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get('get/store/products/top')
    async getProductsWithMilleurVente() {
      try {
        return await this.productsService.getProductsWithMilleurVente();
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get('get/store/products/new')
    async getProductsWithNewVente() {
      try {
        return await this.productsService.getProductsWithNewVente();
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get('get/store/products/vente-flash')
    async getProductsWithVenteFlashVente() {
      try {
        return await this.productsService.getProductsWithVenteFlashVente();
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get('get/store/products/materiel-de-musculation')
    async getProductsWithMaterielDeMusculation() {
      try {
        return await this.productsService.getProductsWithMaterielDeMusculation();
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get('get/store/products/get-by-slug/:slug')
    async getProductBySlug(@Param('slug') slug: string) {
      try {
        return await this.productsService.getProductBySlug(slug);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get('get-max-price')
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
  }