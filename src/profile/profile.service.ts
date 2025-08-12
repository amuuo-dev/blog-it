import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { UserEntity } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { FollowEntity } from './entity/follow.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {}

  async findUserProfile(profileUsername: string) {
    const userProfile = await this.userRepository.findOne({
      where: { username: profileUsername },
    });

    if (!userProfile) throw new NotFoundException('Profile not found');

    return {
      profile: {
        ...instanceToPlain(userProfile),
      },
    };
  }

  async follow(userId: number, followingUsername: string) {
    const followingProfile = await this.userRepository.findOne({
      where: { username: followingUsername },
    });
    if (!followingProfile) throw new NotFoundException('profile not found');

    if (userId === followingProfile.id)
      throw new BadGatewayException('you cant follow yourself');

    const follow = await this.followRepository.findOne({
      where: { followerId: userId, followingId: followingProfile.id },
    });

    if (!follow) {
      const newFollow = this.followRepository.create({
        followerId: userId,
        followingId: followingProfile.id,
      });
      await this.followRepository.save(newFollow);
    }
    return { profile: followingProfile, following: true };
  }

  generateProfileResponse(profile, following: boolean) {
    return {
      profile: {
        ...instanceToPlain(profile),
        following,
      },
    };
  }
}
