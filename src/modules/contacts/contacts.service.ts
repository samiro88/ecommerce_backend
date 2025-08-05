import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from '../../models/contact.schema';
import { CreateContactDto } from '../dto/create-contact.dto';
import { UpdateContactDto } from '../dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
  ) {}

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const exists = await this.contactModel.findOne({ id: createContactDto.id });
    if (exists) {
      throw new ConflictException('Contact with this id already exists');
    }
    const created = new this.contactModel(createContactDto);
    return created.save();
  }

  async findAll(): Promise<Contact[]> {
    return this.contactModel.find().sort({ id: 1 }).exec();
  }

  async findOne(id: string): Promise<Contact> {
    const contact = await this.contactModel.findOne({ id });
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    return contact;
  }

  async update(id: string, updateContactDto: UpdateContactDto): Promise<Contact> {
    const updated = await this.contactModel.findOneAndUpdate(
      { id },
      { $set: updateContactDto },
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException('Contact not found');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.contactModel.findOneAndDelete({ id });
    if (!deleted) {
      throw new NotFoundException('Contact not found');
    }
  }
}