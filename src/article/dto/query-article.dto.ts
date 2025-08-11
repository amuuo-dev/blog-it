import { IsNumber, IsString } from 'class-validator';
import { IsOptional } from 'class-validator';

export class QueryArticleDto {
  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;
}
