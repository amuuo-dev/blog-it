import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './decorator/user.decorator';
import { JwtGuard } from './guard/jwt-guard';
import { JwtPayloadType } from 'types/jwtPayload-types';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.userService.loginUser(loginDto);
    return this.userService.generateUserResponse(user);
  }
  @Get()
  @UseGuards(JwtGuard)
  getCurrentUser(@User() user: JwtPayloadType) {
    return this.userService.generateUserResponse(user);
  }

  @Patch('update')
  @UseGuards(JwtGuard)
  async update(@User('id') userId: number, @Body() updateUser: UpdateUserDto) {
    const updatedUser = await this.userService.update(userId, updateUser);
    return this.userService.generateUserResponse(updatedUser);
  }
}
