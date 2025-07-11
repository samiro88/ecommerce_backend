import { Controller, Get, Post, Put, Delete, Param, Body, Query, DefaultValuePipe, ParseBoolPipe } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Review, ReviewSchema } from '../../models/reviews.schema';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}


    // GET /reviews/testimonials?publishedOnly=true
  @Get('testimonials')
  async getTestimonials(
    @Query('publishedOnly', new DefaultValuePipe('false'), ParseBoolPipe) publishedOnly: boolean,
  ): Promise<any[]> {
    console.log('Received GET /reviews/testimonials with publishedOnly:', publishedOnly);
    const result = await this.reviewsService.findAllWithUser(publishedOnly);
    console.log('Result from findAllWithUser:', result);
    return result || [];
  }

  // GET /reviews?publishedOnly=true
  @Get()
  async getAll(
    @Query('publishedOnly', new DefaultValuePipe('false'), ParseBoolPipe) publishedOnly: boolean,
  ): Promise<Review[]> {
    return this.reviewsService.findAll(publishedOnly);
  }

  // GET /reviews/:id
  @Get(':id')
  async getById(@Param('id') id: string): Promise<Review> {
    return this.reviewsService.findById(id);
  }

  // POST /reviews
  @Post()
  async create(@Body() body: Partial<Review>): Promise<Review> {
    return this.reviewsService.create(body);
  }

  // PUT /reviews/:id
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Partial<Review>): Promise<Review> {
    return this.reviewsService.update(id, body);
  }

  // DELETE /reviews/:id
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return this.reviewsService.delete(id);
  }

  // GET /reviews/product/:product_id
  @Get('/product/:product_id')
  async getByProduct(@Param('product_id') product_id: string): Promise<Review[]> {
    return this.reviewsService.findByProduct(product_id);
  }

  // GET /reviews/user/:user_id
  @Get('/user/:user_id')
  async getByUser(@Param('user_id') user_id: string): Promise<Review[]> {
    return this.reviewsService.findByUser(user_id);
  }


}