import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './users.model';
import mongoose, { Model, ObjectId, isValidObjectId } from 'mongoose';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { statusUpdateDto } from './dto/status-update.dto';
import { RoleUpdatDto } from './dto/role-update.dto';
import { randomBytes } from 'crypto';
import { RefreshTokenService } from 'src/refresh-token/refresh-token.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
    private config: ConfigService,
  ) {}
  async hashPassword(password: string) {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }
  async register(registerDto: RegisterDto) {
    //hash password
    registerDto.password = await this.hashPassword(registerDto.password);
    //check if user exist
    let user = await this.getUserByEmail(registerDto.email);
    if (user) {
      throw new ConflictException('user exist');
    }
    //createUser
    const createdUser = new this.userModel(registerDto);
    createdUser.save();
    //createJwtToken
    const { token, tokenInfo } = await this.createJwtforClient(createdUser._id);
    //create refreshToken
    let refreshToken = await this.generateVerificationToken();
    //add the info of the refresh Token to the database
    this.createRefreshToken(createdUser._id, refreshToken);
    //return important info
    return { token, tokenInfo, refreshToken: refreshToken };
  }
  async comparePassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }
  async login(loginDto: LoginDto) {
    //getUser
    const user = await this.userModel.findOne({ email: loginDto.email });
    //userExist
    if (!user) {
      throw new UnauthorizedException("user don't exist");
    }
    //ifAccountActive
    if (!user.isActive) {
      throw new UnauthorizedException('account not active');
    }
    //check password
    const isMatch = await this.comparePassword(
      loginDto.password,
      user.password.toString(),
    );
    //return error if it didn t match
    if (!isMatch) {
      throw new UnauthorizedException();
    }
    //return token info
    const { token, tokenInfo } = await this.createJwtforClient(user._id);
    //generate refreshToken
    let refreshToken = await this.generateVerificationToken();
    //add it to the database
    this.createRefreshToken(user._id, refreshToken);
    //the return
    return { token, tokenInfo, refreshToken: refreshToken };
  }
  async createJwtforClient(id: mongoose.Types.ObjectId) {
    const token = this.jwtService.sign({ id: id });
    let tokenInfo = this.jwtService.decode(token);
    return { token, tokenInfo };
  }

  async createJwtforCmsUser(id: mongoose.Types.ObjectId) {
    const token = this.jwtService.sign(
      { id: id },
      { secret: this.config.get('secrets.adminJwtSecret') },
    );
    let tokenInfo = this.jwtService.decode(token);
    return { token, tokenInfo };
  }
  async createRefreshToken(id: mongoose.Types.ObjectId, refreshToken: string) {
    await this.refreshTokenService.create({
      refreshToken: refreshToken,
      tokenExpires: new Date(Date.now() + 10 * 60000),
      userId: id,
    });
  }
  async RefreshTokenForClient(refreshToken: string) {
    const refreshTokenInfo =
      await this.refreshTokenService.findOne(refreshToken);

    if (!refreshTokenInfo) {
      throw new NotFoundException();
    }

    if (refreshTokenInfo.tokenExpires < new Date()) {
      throw new HttpException('expired', 400);
    }
    const { token, tokenInfo } = await this.createJwtforClient(
      refreshTokenInfo.userId,
    );
    let newrefreshToken = await this.generateVerificationToken();
    await this.createRefreshToken(refreshTokenInfo.userId, newrefreshToken);
    refreshTokenInfo.deleteOne();
    return { token, tokenInfo, refreshToken: newrefreshToken };
  }

  async RefreshTokenForCmsUser(refreshToken: string) {
    const refreshTokenInfo =
      await this.refreshTokenService.findOne(refreshToken);
    if (!refreshTokenInfo) {
      return;
    }
    if (refreshTokenInfo.tokenExpires < new Date()) {
      throw new HttpException('expired', 400);
    }
    const user = await this.getUserById(refreshTokenInfo.userId.toString());
    if (user.isEmployee || user.isAdmin) {
      const { token, tokenInfo } = await this.createJwtforCmsUser(
        refreshTokenInfo.userId,
      );
      let newrefreshToken = await this.generateVerificationToken();
      this.createRefreshToken(refreshTokenInfo.userId, newrefreshToken);
      refreshTokenInfo.deleteOne();
      return { token, tokenInfo, refreshToken: newrefreshToken };
    } else {
      throw new UnauthorizedException();
    }
  }

  async cmslogin(loginDto: LoginDto) {
    //getUser
    const user = await this.userModel.findOne({ email: loginDto.email });
    //user Don t exist
    if (!user) {
      throw new UnauthorizedException("user don't exist");
    }
    //isActive
    if (!user.isActive) {
      throw new UnauthorizedException('account not active');
    }
    //comparePassword
    const isMatch = await this.comparePassword(
      loginDto.password,
      user.password.toString(),
    );
    //get cms fields
    const isEmployee = user.isEmployee;
    const isAdmin = user.isAdmin;
    //if password match and is a cms user
    if (!(isMatch && (isEmployee || isAdmin))) {
      throw new UnauthorizedException();
    }
    //create jwt for CmsUser
    const { token, tokenInfo } = await this.createJwtforCmsUser(user._id);
    //generate refresh token
    let refreshToken = await this.generateVerificationToken();
    //add it to the database
    this.createRefreshToken(user._id, refreshToken);
    //return info
    return { token, tokenInfo, refreshToken: refreshToken };
  }

  async getRole(id: string) {
    const user = await this.userModel.findOne({ _id: id });
    return { isAdmin: user.isAdmin, isEmployee: user.isEmployee };
  }

  async getUserByEmail(email: string) {
    const user = await this.userModel.findOne({ email: email });
    return user;
  }

  async getUserById(id: string) {
    const user = await this.userModel.findById(id);
    return user;
  }

  async resetpassword(id: ObjectId, newpassword: string) {
    const user = await this.userModel.findOne({ _id: id });
    if (user) {
      const saltOrRounds = 10;
      user.password = await bcrypt.hash(newpassword, saltOrRounds);

      user.save();
      return;
    } else {
      throw new UnauthorizedException("user don't exist");
    }
  }

  async addCmsUser(createUserDto: CreateUserDto) {
    createUserDto.password = await this.hashPassword(createUserDto.password);
    let user = await this.getUserByEmail(createUserDto.email);
    if (user) {
      throw new ConflictException('user exist');
    }
    //cms always an employee
    createUserDto.isEmployee = true;
    const createdUser = new this.userModel(createUserDto);
    createdUser.save();
  }
  async updateUserStatus(id: string, statusUpdateDto: statusUpdateDto) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('id not objectid');
    }
    let role = await this.getRole(id);
    if (role.isEmployee) {
      throw new ForbiddenException('this user is an cms user not a client');
    }
    const updated = await this.userModel.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: statusUpdateDto },
    );
    if (updated.matchedCount > 0) {
      return;
    } else {
      throw new NotFoundException();
    }
  }
  async updateUserRole(id: string, roleUpdatDto: RoleUpdatDto) {
    await this.getCmsUser(id);
    const updatedUser = await this.userModel.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: roleUpdatDto },
    );
    return;
  }
  async getCmsUser(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('not a valid objectId');
    }
    const cmsUser = await this.userModel.findById(id).select('-password');
    //if it exist
    if (!cmsUser) {
      throw new NotFoundException();
    }
    //check if a cmsuser
    if (cmsUser.isEmployee || cmsUser.isAdmin) {
      return cmsUser;
    } else {
      throw new ForbiddenException('not cms user');
    }
  }

  async getCmsUsersPaginated(page: number, limit: number) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const totalCount = await this.userModel
      .find({ isEmployee: true })
      .countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    const cmsUsers = await this.userModel
      .find({ isEmployee: true })
      .select('_id name email isAdmin')
      .limit(limit)
      .skip(startIndex)
      .sort({ createdAt: -1 });

    const paginationInfo = {
      currentPage: page,
      totalPages: totalPages,
      totalCmsUser: totalCount,
    };

    return { paginationInfo, cmsUsers };
  }

  async generateVerificationToken() {
    const token = randomBytes(20).toString('hex');
    return token;
  }

  async changePassword(newPassword: string, oldPassword: string, id: any) {
    let user = await this.getUserById(id);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    let result = await this.comparePassword(oldPassword, user.password);
    if (!result) {
      throw new ForbiddenException('wrong oldpassword');
    }
    newPassword = await this.hashPassword(newPassword);
    user.password = newPassword;
    user.save();
    return;
  }
}
