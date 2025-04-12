import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UploadedFiles,
    UseInterceptors,
  } from '@nestjs/common';
  import { FilesInterceptor } from '@nestjs/platform-express';
  import { ProductsService } from '../../routes/products/products.service'; // Correct path
  import { CreateProductDto } from './dto/create-product.dto';
  import { UpdateProductDto } from './dto/update-product.dto';
  import { DeleteManyProductsDto } from './dto/delete-many-products.dto';
  import { ProductQueryDto } from './dto/product-query.dto';
  
  
  @Controller('products')
  export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}
  
    @Post()
    @UseInterceptors(FilesInterceptor('files'))
    async createProduct(
      @Body() createProductDto: CreateProductDto,
      @UploadedFiles() files: Express.Multer.File[],
    ) {
      return this.productsService.createProduct(createProductDto, files);
    }
  
    @Get()
    async getProducts(@Query() query: ProductQueryDto) {
      return this.productsService.getProducts(query);
    }
  
    @Get('all')
    async getAllProductsNormal() {
      return this.productsService.getAllProductsNormal();
    }
  
    @Get('max-price')
    async getMaxPrice() {
      return this.productsService.getMaxPrice();
    }
  
    @Get('meilleur-vente')
    async getProductsWithMilleurVente() {
      return this.productsService.getProductsWithMilleurVente();
    }
  
    @Get('nouveau')
    async getProductsWithNewVente() {
      return this.productsService.getProductsWithNewVente();
    }
  
    @Get('vente-flash')
    async getProductsWithVenteFlashVente() {
      return this.productsService.getProductsWithVenteFlashVente();
    }
  
    @Get('materiel-de-musculation')
    async getProductsWithMaterielDeMusculation() {
      return this.productsService.getProductsWithMaterielDeMusculation();
    }
  
    @Get(':id')
    async getProductById(@Param('id') id: string) {
      return this.productsService.getProductById(id);
    }
  
    @Get('slug/:slug')
    async getProductBySlug(@Param('slug') slug: string) {
      return this.productsService.getProductBySlug(slug);
    }
  
    @Put(':id')
    @UseInterceptors(FilesInterceptor('files'))
    async updateProduct(
      @Param('id') id: string,
      @Body() updateProductDto: UpdateProductDto,
      @UploadedFiles() files: Express.Multer.File[],
    ) {
      return this.productsService.updateProduct(id, updateProductDto, files);
    }
  
    @Delete(':id')
    async deleteProduct(@Param('id') id: string) {
      return this.productsService.deleteProduct(id);
    }
  
    @Delete()
    async deleteManyProducts(@Body() deleteManyProductsDto: DeleteManyProductsDto) {
      return this.productsService.deleteManyProducts(deleteManyProductsDto.ids);
    }  
  }