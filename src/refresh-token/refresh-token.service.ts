import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRefreshTokenDto } from './dto/create-refresh-token.dto';
import { UpdateRefreshTokenDto } from './dto/update-refresh-token.dto';
import { RefreshToken } from './refresh-token.model';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,
  ) {}
  create(createRefreshTokenDto: CreateRefreshTokenDto) {
    const createdCategory = new this.RefreshTokenModel(createRefreshTokenDto);
    return createdCategory.save();
  }

  findOne(refreshToken: string) {
    return this.RefreshTokenModel.findOne({ refreshToken: refreshToken });
  }

  async remove(id: string) {
    const deletedCategory = await this.RefreshTokenModel.deleteOne(
      new mongoose.Types.ObjectId(id),
    );
    if (deletedCategory.deletedCount > 0) {
      return;
    } else {
      throw new NotFoundException();
    }
  }
}
