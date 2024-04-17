import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './categories.model';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId, isValidObjectId } from 'mongoose';
import { error } from 'console';
import { ComplaintsService } from 'src/complaints/complaints.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private complaintService: ComplaintsService,
  ) {}
  async findAllPaginated(page: number, limit: number) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const totalCount = await this.categoryModel.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    const categories = await this.categoryModel
      .find()
      .limit(limit)
      .skip(startIndex)
      .sort({ createdAt: -1 })
      .select('name description');

    const paginationInfo = {
      currentPage: page,
      totalPages: totalPages,
      totalCategories: totalCount,
    };

    return { paginationInfo, categories };
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const createdCategory = new this.categoryModel(createCategoryDto);
    return createdCategory.save();
  }

  async findAll() {
    return this.categoryModel.find().select('name description');
  }

  async findOne(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('id not objectId');
    }
    return await this.categoryModel.findById(id);
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('id not objectId');
    }
    const updatedCategory = await this.categoryModel.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: updateCategoryDto },
    );
    if (updatedCategory.matchedCount > 0) {
      return;
    } else {
      throw new NotFoundException();
    }
  }

  async remove(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('id not objectId');
    }
    let hasComplaint = await this.complaintService.hasComplaint(id);
    if (hasComplaint) {
      throw new ConflictException();
    }
    const deletedCategory = await this.categoryModel.deleteOne(
      new mongoose.Types.ObjectId(id),
    );
    if (deletedCategory.deletedCount > 0) {
      return;
    } else {
      throw new NotFoundException();
    }
  }
}
