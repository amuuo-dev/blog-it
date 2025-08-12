import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { User } from 'src/user/decorator/user.decorator';
import { JwtGuard } from 'src/user/guard/jwt-guard';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  async getProfile(@Param('username') profileUsername: string) {
    return await this.profileService.findUserProfile(profileUsername);
  }

  @Post(':username/follow')
  @UseGuards(JwtGuard)
  async followProfile(
    @User('id') userId: number,
    @Param('username') followingUsername: string,
  ) {
    const { profile, following } = await this.profileService.follow(
      userId,
      followingUsername,
    );
    return this.profileService.generateProfileResponse(profile, following);
  }
}
