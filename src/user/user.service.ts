import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

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

    const { password, ...otherDetails } = createUserDto;

    const salt = await bcrypt.genSalt();

    const userPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      ...otherDetails,
      password: userPassword,
    });

    return await this.userRepository.save(user);
  }
}
