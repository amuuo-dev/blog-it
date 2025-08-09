import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  readonly username: string;
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
  @MinLength(6, { message: 'password must be longer than 6 characters' })
  @IsNotEmpty()
  readonly password: string;
}
