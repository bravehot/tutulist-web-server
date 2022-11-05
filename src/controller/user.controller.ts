import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Put,
  Query,
} from '@midwayjs/decorator';
import { Validate } from '@midwayjs/validate';
import { Context } from '@midwayjs/koa';
import { JwtService } from '@midwayjs/jwt';

import { UserService } from '@/service/user.service';

import { LocalPassportMiddleware } from '../middleware/local.middleware';

import {
  UserDTO,
  SendCodeDTO,
  LoginDTO,
  UpdatePasswordDTO,
  UserByCodeDTO,
  RefreshTokenDTO,
  UserInfoUpdateDTO,
} from '@/dto/user';

@Controller('/user')
export class UserController {
  @Inject()
  userService: UserService;

  @Inject()
  jwt: JwtService;

  @Inject()
  ctx: Context;

  @Post('/register')
  @Validate()
  async register(@Body() user: UserDTO) {
    return this.userService.register(user);
  }

  @Get('/sendCode')
  @Validate()
  async sendCode(@Query() { mobile }: SendCodeDTO) {
    return await this.userService.sendCode(mobile, 'register');
  }

  @Post('/loginByCode')
  @Validate()
  async loginByCode(@Body() user: UserByCodeDTO) {
    return await this.userService.loginByCode(user);
  }

  @Post('/loginByPassword', { middleware: [LocalPassportMiddleware] })
  @Validate()
  async loginByPassword(@Body() user: LoginDTO) {
    return await this.userService.loginByPassword(user);
  }

  @Post('/refreshToken')
  @Validate()
  async getRefreshToken(@Body() info: RefreshTokenDTO) {
    return await this.userService.handleRefreshToken(info);
  }

  @Put('/changeMobile')
  @Validate()
  async changeMobile(@Body() user: UserByCodeDTO) {
    return await this.userService.changeMobile(user);
  }

  @Put('/updatePassword')
  @Validate()
  async updateUserPassword(@Body() user: UpdatePasswordDTO) {
    return await this.userService.updatePassword(user);
  }

  @Post('/forgetPassword')
  @Validate()
  async handleForgetPassword(@Body() user: UserDTO) {
    return await this.userService.forgetPassword(user);
  }

  @Get('/info')
  async getUserInfo() {
    return await this.userService.getUserInfo();
  }

  @Put('/update')
  async updateUserInfo(@Body() user: UserInfoUpdateDTO) {
    return await this.userService.updateUserInfo(user);
  }

  @Get('/cancellation')
  async cancellation() {
    // return await this.userService.
  }
}
