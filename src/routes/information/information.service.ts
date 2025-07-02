import { Injectable } from '@nestjs/common';
import { UpdateGeneralDto, UpdateAdvancedDto, UpdateMaterielDto, UpdateSlidesDto, UpdateBrandsDto } from './dto';

@Injectable()
export class InformationService {
  getGeneralData() {
    return { message: 'General data fetched successfully' };
  }

  updateGeneralInformation(file: Express.Multer.File, updateGeneralDto: UpdateGeneralDto) {
    return { message: 'General information updated', logo: file?.filename, data: updateGeneralDto };
  }

  getAdvancedData() {
    return { message: 'Advanced data fetched successfully' };
  }

  updateAdvancedInformation(updateAdvancedDto: UpdateAdvancedDto) {
    return { message: 'Advanced information updated', data: updateAdvancedDto };
  }

  getInformation() {
    // Replace with your actual company info or fetch from DB if needed
    return {
      phone_1: "+216 27 612 500",
      phone_2: "+216 73 200 169",
      adresse_fr: "Rue Ribat, 4000 Sousse Tunisie",
      // Add other fields as needed
    };
  }

  getMaterielImageSection() {
    return { message: 'Materiel image section fetched' };
  }

  updateMaterielImageSection(file: Express.Multer.File, updateMaterielDto: UpdateMaterielDto) {
    return { message: 'Materiel image updated', image: file?.filename, data: updateMaterielDto };
  }

  deleteMaterielImageSection() {
    return { message: 'Materiel image section deleted' };
  }

  getAllSlides() {
    return { message: 'All slides retrieved' };
  }

  uploadSlideImages(file: Express.Multer.File) {
    return { message: 'Slide image uploaded', filename: file.filename };
  }

  addSlideImages(updateSlidesDto: UpdateSlidesDto) {
    return { message: 'Slide images added', data: updateSlidesDto };
  }

  updateSlidesOrder(updateSlidesDto: UpdateSlidesDto) {
    return { message: 'Slides order updated', data: updateSlidesDto };
  }

  deleteSlideImage(imgId: string) {
    return { message: `Slide with ID ${imgId} deleted` };
  }

  getAllBrands() {
    return { message: 'All brands retrieved' };
  }

  addBrandImages(file: Express.Multer.File) {
    return { message: 'Brand image added', filename: file.filename };
  }

  deleteBrandImage(imgId: string) {
    return { message: `Brand with ID ${imgId} deleted` };
  }

  updateBrandsOrder(updateBrandsDto: UpdateBrandsDto) {
    return { message: 'Brands order updated', data: updateBrandsDto };
  }
}
