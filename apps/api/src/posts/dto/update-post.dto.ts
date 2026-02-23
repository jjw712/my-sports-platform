import { IsOptional, IsString, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePostDto {
  @ApiPropertyOptional({ example: 'new title', maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  title?: string;

  @ApiPropertyOptional({ example: 'new content', maxLength: 5000 })
  @IsOptional()
  @IsString()
  @Length(1, 5000)
  content?: string;
}
