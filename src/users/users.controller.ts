import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { statusUpdateDto } from './dto/status-update.dto';
import { RoleUpdatDto } from './dto/role-update.dto';
import { ObjectId } from 'mongoose';
import { CmsAuthGuard } from 'src/guards/cms.authentication';
import { AdminGuard } from 'src/guards/adminauthorization';
import { PaginationQueryDto } from './dto/pagination-Query.dto';
import { IdParamDto } from './dto/id-Params.dto';
import { ChangePasswordrDto } from './dto/change-password.dto';
import { AuthGuard } from 'src/guards/authentication';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.usersService.register(registerDto);
  }

  @UseGuards(AuthGuard)
  @Patch('changepassword')
  async changePassword(
    @Body() changePasswordrDto: ChangePasswordrDto,
    @Request() req: any,
  ) {
    return this.usersService.changePassword(
      changePasswordrDto.newPassword,
      changePasswordrDto.oldPassword,
      req.id,
    );
  }

  @Get('login')
  async login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  @Get('cmslogin')
  async cmsLogin(@Body() loginDto: LoginDto) {
    return this.usersService.cmslogin(loginDto);
  }

  @UseGuards(CmsAuthGuard)
  @Get('cmsuser/:id')
  async getCmsUser(@Param() param: IdParamDto) {
    return this.usersService.getCmsUser(param.id);
  }

  @UseGuards(CmsAuthGuard)
  @Get('cmsusers')
  async getCmsUsersPaginated(@Query() paginationQueryDto: PaginationQueryDto) {
    return this.usersService.getCmsUsersPaginated(
      paginationQueryDto.page,
      paginationQueryDto.limit,
    );
  }

  @UseGuards(CmsAuthGuard, AdminGuard)
  @Post('addCmsUser')
  async addCmsUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.addCmsUser(createUserDto);
  }

  @UseGuards(CmsAuthGuard)
  @Patch('updateUserStatus/:id')
  async updateUserStatus(
    @Param() param: IdParamDto,
    @Body() statusUpdateDto: statusUpdateDto,
  ) {
    return await this.usersService.updateUserStatus(param.id, statusUpdateDto);
  }

  @UseGuards(CmsAuthGuard, AdminGuard)
  @Patch('updateUserRole/:id')
  async updateUserRole(
    @Param() param: IdParamDto,
    @Body() roleUpdatDto: RoleUpdatDto,
  ) {
    return await this.usersService.updateUserRole(param.id, roleUpdatDto);
  }

  @Get('cmsuserRefreshToken/:refreshToken')
  async jwtfromrefreshTokenClient(@Param('refreshToken') refreshToken: string) {
    return this.usersService.RefreshTokenForCmsUser(refreshToken);
  }

  @Get('client/:refreshToken')
  async jwtfromrefreshTokenCms(@Param('refreshToken') refreshToken: string) {
    return this.usersService.RefreshTokenForClient(refreshToken);
  }
}
