import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Roles } from 'src/decorators/roles.decorators';
import { ObjectId } from 'mongoose';
import { CmsAuthGuard } from 'src/guards/cms.authentication';
import { PaginationQueryDto } from './dto/pagination-Query.dto';
import { IdParamDto } from './dto/id-Params.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  @UseGuards(CmsAuthGuard)
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoriesService.create(createCategoryDto);
  }

  @Get()
  async findAll() {
    return await this.categoriesService.findAll();
  }

  @UseGuards(CmsAuthGuard)
  @Get('paginated')
  async findAllPaginated(@Query() query: PaginationQueryDto) {
    return await this.categoriesService.findAllPaginated(
      query.page,
      query.limit,
    );
  }

  @UseGuards(CmsAuthGuard)
  @Get(':id')
  async findOne(@Param() param: IdParamDto) {
    return await this.categoriesService.findOne(param.id);
  }

  @UseGuards(CmsAuthGuard)
  @Patch(':id')
  async update(
    @Param() param: IdParamDto,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.categoriesService.update(param.id, updateCategoryDto);
  }

  @UseGuards(CmsAuthGuard)
  @Delete(':id')
  remove(@Param() param: IdParamDto) {
    return this.categoriesService.remove(param.id);
  }
}
