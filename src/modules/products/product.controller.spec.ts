import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { DeleteManyProductsDto } from '../dto/delete-many-products.dto';
import { ProductQueryDto } from '../dto/product-query.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadedFiles } from '@nestjs/common';
import { NotFoundException, BadRequestException } from '@nestjs/common';


describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  // Mock product data
  const mockProduct = {
    _id: '507f1f77bcf86cd799439011',
    designation: 'Test Product',
    price: 100,
    slug: 'test-product',
    mainImage: { url: 'http://example.com/image.jpg' },
    category: 'electronics',
    status: true,
    stock: 10,
  };
  const mockProductArray = [mockProduct];
  const mockPagination = { total: 1, page: 1, limit: 10 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            // Core Methods
            createProduct: jest.fn((dto, files) => Promise.resolve(mockProduct)),
            getProducts: jest.fn((query) => Promise.resolve({ products: mockProductArray, pagination: mockPagination })),
            getAllProductsNormal: jest.fn(() => Promise.resolve(mockProductArray)),
            getMaxPrice: jest.fn(() => Promise.resolve({ maxPrice: 1000 })),

            // Specialized Queries
            getProductsWithMilleurVente: jest.fn(() => Promise.resolve(mockProductArray)),
            getProductsWithNewVente: jest.fn(() => Promise.resolve(mockProductArray)),
            getProductsWithVenteFlashVente: jest.fn(() => Promise.resolve(mockProductArray)),
            getProductsWithMaterielDeMusculation: jest.fn(() => Promise.resolve(mockProductArray)),
            getProductsByCategory: jest.fn((category) => Promise.resolve(mockProductArray)),

            // Single Product Lookups
            getProductById: jest.fn((id) => Promise.resolve(mockProduct)),
            getProductBySlug: jest.fn((slug) => Promise.resolve(mockProduct)),

            // Update & Delete
            updateProduct: jest.fn((id, dto, files) => Promise.resolve(mockProduct)),
            deleteProduct: jest.fn((id) => Promise.resolve(mockProduct)),
            deleteManyProducts: jest.fn((ids) => Promise.resolve({ deletedCount: ids.length })),

            // Admin Methods
            getAdminProducts: jest.fn((query) => Promise.resolve({ products: mockProductArray, pagination: mockPagination })),
            toggleProductStatus: jest.fn((id) => Promise.resolve({ ...mockProduct, status: !mockProduct.status })),

            // Store Methods
            getStoreFeaturedProducts: jest.fn(() => Promise.resolve(mockProductArray)),
            getStoreNewArrivals: jest.fn(() => Promise.resolve(mockProductArray)),
            getStoreDeals: jest.fn(() => Promise.resolve(mockProductArray)),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  // ====================
  // 1. BASIC TESTS
  // ====================
  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  // ====================
  // 2. CREATE PRODUCT
  // ====================
  describe('POST /products', () => {
    it('should create a product', async () => {
      const createDto: CreateProductDto = {
        designation: 'New Product',
        price: 200,
        categoryId: 'electronics',
        status: true,
        inStock: true,
      };
      const mockFiles = [] as Express.Multer.File[];

      await expect(controller.adminCreateProduct(createDto, mockFiles)).resolves.toEqual(mockProduct);
      expect(service.createProduct).toHaveBeenCalledWith(createDto, mockFiles);
    })

    it('should reject invalid file uploads', async () => {
      const createDto: CreateProductDto = {
        designation: 'New Product',
        price: 200,
        categoryId: 'electronics',
      };
      const mockFiles = Array(11).fill({}) as Express.Multer.File[];

      await expect(controller.adminCreateProduct(createDto, mockFiles)).rejects.toThrow(BadRequestException);
    });
  });

  // ====================
  // 3. GET PRODUCTS
  // ====================
  describe('GET /products', () => {
    it('should return paginated products', async () => {
      const query: ProductQueryDto = { status: true, page: '1', limit: '10' };
      const result = await controller.getProducts(query);

      expect(result).toEqual({
        products: mockProductArray,
        pagination: mockPagination,
      });
      expect(service.getProducts).toHaveBeenCalledWith(query);
    });

    it('should handle empty results', async () => {
      jest.spyOn(service, 'getProducts').mockResolvedValueOnce({
        message: 'Success',
        data: {
          products: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 10
          } as any
        }
      });
      const query: ProductQueryDto = { status: false, limit: '10' };
      const result = await controller.getProducts(query);
    
      expect(result.data.products).toHaveLength(0);
    });
  });

  // ====================
  // 4. GET PRODUCT BY ID/SLUG
  // ====================
  describe('GET /products/:id', () => {
    it('should return a product by ID', async () => {
      await expect(controller.getProductById('507f1f77bcf86cd799439011')).resolves.toEqual(mockProduct);
      expect(service.getProductById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw 404 if product not found', async () => {
      jest.spyOn(service, 'getProductById').mockRejectedValueOnce(new NotFoundException());
      await expect(controller.getProductById('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('GET /products/slug/:slug', () => {
    it('should return a product by slug', async () => {
      await expect(controller.getProductBySlug('test-product')).resolves.toEqual(mockProduct);
      expect(service.getProductBySlug).toHaveBeenCalledWith('test-product');
    });
  });

  // ====================
  // 5. SPECIALIZED QUERIES
  // ====================
  describe('GET /products/meilleur-vente', () => {
    it('should return "meilleur vente" products', async () => {
      await expect(controller.getProductsWithMilleurVente()).resolves.toEqual(mockProductArray);
      expect(service.getProductsWithMilleurVente).toHaveBeenCalled();
    });
  });

  describe('GET /products/category/:category', () => {
    it('should return products by category', async () => {
      await expect(controller.getProductsByCategory('electronics')).resolves.toEqual(mockProductArray);
      expect(service.getProductsByCategory).toHaveBeenCalledWith('electronics');
    });
  });

  // ====================
  // 6. UPDATE & DELETE
  // ====================
  describe('PUT /products/:id', () => {
    it('should update a product', async () => {
      const updateDto: UpdateProductDto = { designation: 'Updated Product' };
      const mockFiles = [] as Express.Multer.File[];

      await expect(
        controller.adminUpdateProduct('507f1f77bcf86cd799439011', updateDto, mockFiles),
      ).resolves.toEqual(mockProduct);
      expect(service.updateProduct).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateDto,
        mockFiles,
      );
    });

    it('should reject invalid updates', async () => {
      const updateDto = { price: -100 } as UpdateProductDto;
      await expect(
        controller.adminUpdateProduct('507f1f77bcf86cd799439011', updateDto, []),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete a product', async () => {
      await expect(controller.adminDeleteProduct('507f1f77bcf86cd799439011')).resolves.toEqual(mockProduct);
      expect(service.deleteProduct).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });

  describe('POST /products/delete-many', () => {
    it('should delete multiple products', async () => {
      const deleteDto: DeleteManyProductsDto = { ids: ['507f1f77bcf86cd799439011'] };
      await expect(controller.adminDeleteManyProducts(deleteDto)).resolves.toEqual({ deletedCount: 1 });
      expect(service.deleteManyProducts).toHaveBeenCalledWith(deleteDto.ids);
    });
  });

  // ====================
  // 7. ADMIN ROUTES
  // ====================
  describe('GET /admin/products', () => {
    it('should return admin products with pagination', async () => {
      const query = { page: '1', limit: '10' };
      await expect(controller.getProducts(query)).resolves.toEqual({
        products: mockProductArray,
        pagination: mockPagination,
      });
      expect(service.getProducts).toHaveBeenCalledWith(query);
    });
  });

  describe('PATCH /admin/products/:id/toggle-status', () => {
    it('should toggle product status', async () => {
      await expect(controller.toggleProductStatus('507f1f77bcf86cd799439011')).resolves.toEqual({
        ...mockProduct,
        status: !mockProduct.status,
      });
      expect(service.toggleProductStatus).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });

  // ====================
  // 8. STORE ROUTES
  // ====================
  describe('GET /store/featured', () => {
    it('should return featured products', async () => {
      await expect(controller.getStoreFeaturedProducts()).resolves.toEqual(mockProductArray);
      expect(service.getStoreFeaturedProducts).toHaveBeenCalled();
    });
  });

  describe('GET /store/new-arrivals', () => {
    it('should return new arrival products', async () => {
      await expect(controller.getStoreNewArrivals()).resolves.toEqual(mockProductArray);
      expect(service.getStoreNewArrivals).toHaveBeenCalled();
    });
  });

  describe('GET /store/deals', () => {
    it('should return deal products', async () => {
      await expect(controller.getStoreDeals()).resolves.toEqual(mockProductArray);
      expect(service.getStoreDeals).toHaveBeenCalled();
    });
  });

  // ====================
  // 9. UTILITY ENDPOINTS
  // ====================
  describe('GET /products/max-price', () => {
    it('should return max price', async () => {
      await expect(controller.getMaxPrice()).resolves.toEqual({ maxPrice: 1000 });
      expect(service.getMaxPrice).toHaveBeenCalled();
    });
  });

  describe('GET /products/all-normal', () => {
    it('should return all products without pagination', async () => {
      await expect(controller.getAllProductsNormal()).resolves.toEqual(mockProductArray);
      expect(service.getAllProductsNormal).toHaveBeenCalled();
    });
  });
});