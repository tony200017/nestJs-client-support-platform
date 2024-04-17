import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ComplaintStatus,
  CreateComplaintDto,
} from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { Complaint } from './complaints.model';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { NotificationGateway } from 'src/notification/notification.gateway';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectModel(Complaint.name) private complaintModel: Model<Complaint>,
    private notification: NotificationGateway,
  ) {}
  async create(createComplaintDto: CreateComplaintDto) {
    const createdBird = new this.complaintModel(createComplaintDto);
    return createdBird.save();
  }

  async findAllComplaints(
    page: number,
    limit: number,
    userId: string,
    status: ComplaintStatus,
  ) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let query: object = {};
    if (userId) {
      query['createdBy'] = userId; // Ensure status is in uppercase
    }
    if (status) {
      query['status'] = status; // Ensure status is in uppercase
    }
    const totalCount = await this.complaintModel.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const complaints = await this.complaintModel
      .find(query)
      .limit(limit)
      .skip(startIndex)
      .populate('categories', 'name')
      .select('title description categories')
      .sort({ createdAt: -1 });

    const paginationInfo = {
      currentPage: page,
      totalPages: totalPages,
      totalComplaints: totalCount,
    };

    return { paginationInfo, complaints };
  }
  async findAll(userId: string, page: number, limit: number) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const totalCount = await this.complaintModel
      .find({ createdBy: userId })
      .countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    const complaints = await this.complaintModel
      .find({ createdBy: userId })
      .limit(limit)
      .select('title description _id')
      .skip(startIndex)
      .sort({ createdAt: -1 });

    const paginationInfo = {
      currentPage: page,
      totalPages: totalPages,
      totalComplaints: totalCount,
    };

    return { paginationInfo, complaints };
  }

  async findOne(id: string, userId: string) {
    const complaint = await this.complaintModel
      .findById(new mongoose.Types.ObjectId(id))
      .populate('categories');
    if (complaint) {
      if (complaint.createdBy.toString() == userId) {
        return complaint;
      } else {
        throw new ForbiddenException('not your complaint');
      }
    } else {
      throw new NotFoundException();
    }
  }

  async update(id: string, updateComplaintDto: UpdateComplaintDto) {
    const updatedComplaint = await this.complaintModel.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: updateComplaintDto },
    );
    if (updatedComplaint.matchedCount > 0) {
      let complaint = await this.complaintModel.findById(id);
      this.notification.sendMessageToRoom(
        complaint.createdBy.toString(),
        'statusUpdated to ' + updateComplaintDto.status,
      );
      return;
    } else {
      throw new NotFoundException();
    }
  }

  async remove(id: string, userId: string) {
    const deletedComplaint = await this.complaintModel.findById(
      new mongoose.Types.ObjectId(id),
    );
    if (deletedComplaint) {
      if (deletedComplaint.createdBy.toString() == userId) {
        await deletedComplaint.deleteOne();
        return;
      } else {
        throw new ForbiddenException('not your complaint');
      }
    } else {
      throw new NotFoundException();
    }
  }
  getGroupedComplaints(id: string) {
    let complaints = this.complaintModel.aggregate([
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $unwind: {
          path: '$categories',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'results',
        },
      },
      {
        $unwind: {
          path: '$results',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: '$_id',
          status: {
            $first: '$status',
          },
          title: {
            $first: '$title',
          },
          categories: {
            $push: '$results.name',
          },
          description: {
            $first: '$description',
          },
          createdAt: {
            $first: '$createdAt',
          },
          updatedAt: {
            $first: '$updatedAt',
          },
        },
      },
      {
        $group: {
          _id: '$status',
          complaint: {
            $push: {
              title: '$title',
              categories: '$categories',
              description: '$description',
              createdAt: '$createdAt',
              updatedAt: '$updatedAt',
            },
          },
        },
      },
    ]);
    return complaints;
  }

  async countDocuments() {
    return await this.complaintModel.countDocuments().exec();
  }

  async hasComplaint(id: string) {
    let numberComplaint = await this.complaintModel
      .find({ categories: id })
      .countDocuments();
    if (numberComplaint > 0) {
      return true;
    } else {
      return false;
    }
  }
}
