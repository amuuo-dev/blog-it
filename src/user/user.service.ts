/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { LoginDto } from './dto/login.dto';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });

    if (existingUser)
      throw new UnauthorizedException('user with this email already exists!');

    const salt = await bcrypt.genSalt();

    const userPassword = await bcrypt.hash(createUserDto.password, salt);

    const user = this.userRepository.create({
      email: createUserDto.email,
      username: createUserDto.username,
      password: userPassword,
    });

    const savedUser = await this.userRepository.save(user);
    return this.generateUserResponse(savedUser);
  }

  generateToken(user: UserEntity) {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET!,
    );
  }

  generateUserResponse(user: any) {
    return {
      user: {
        ...instanceToPlain(user),
        token: this.generateToken(user),
      },
    };
  }

  async loginUser(loginDto: LoginDto) {
    const user = await this.userRepository.findOneBy({ email: loginDto.email });
    if (!user) throw new UnauthorizedException('wrong password or email');

    const isMatch = await bcrypt.compare(loginDto.password, user.password);

    if (!isMatch) throw new UnauthorizedException('wrong password or email');

    return user;
  }
}
