import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  UseGuards,
  Request,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import {
  ComplaintStatus,
  CreateComplaintDto,
} from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { AuthGuard } from 'src/guards/authentication';
import { CreateUserComplaintDto } from './dto/create-complaint-user.dto';
import { CmsAuthGuard } from 'src/guards/cms.authentication';
import { AdminGuard } from 'src/guards/adminauthorization';
import { IdAppender } from 'src/interceptors/custominterceptor';
import { IdParamDto } from './dto/id-Params.dto';
import { PaginationQueryDto } from './dto/pagination-Query';
import { query } from 'express';
import { QueryDto } from './dto/Query.dto';

@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  @UseInterceptors(IdAppender)
  @UseGuards(AuthGuard)
  async create(
    @Body() createUserComplaintDto: CreateUserComplaintDto,
    @Request() req: any,
  ) {
    const createComplaintDto: CreateComplaintDto = {
      createdBy: req.id,
      ...createUserComplaintDto,
    };

    return this.complaintsService.create(createComplaintDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Query() query: QueryDto, @Request() req: any) {
    return this.complaintsService.findAll(req.id, query.page, query.limit);
  }

  @UseGuards(CmsAuthGuard)
  @Get('all')
  async findAllcomplaint(@Query() query: PaginationQueryDto) {
    return this.complaintsService.findAllComplaints(
      query.page,
      query.limit,
      query.userId,
      query.status,
    );
  }

  @UseGuards(AuthGuard)
  @Get('mycomplaint/:id')
  async findOne(@Param() param: IdParamDto, @Request() req: any) {
    return this.complaintsService.findOne(param.id, req.id);
  }
  @UseGuards(CmsAuthGuard, AdminGuard)
  @Patch(':id')
  async update(
    @Param() param: IdParamDto,
    @Body() updateComplaintDto: UpdateComplaintDto,
  ) {
    return this.complaintsService.update(param.id, updateComplaintDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param() param: IdParamDto, @Request() req: any) {
    return this.complaintsService.remove(param.id, req.id);
  }

  @UseGuards(AuthGuard)
  @Get('complaintsbystatus')
  async getGroupedComplaints(@Request() req: any) {
    return this.complaintsService.getGroupedComplaints(req.id);
  }
}
