import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateArticleDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'title cant be an empty string' })
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagList?: string[];
}
