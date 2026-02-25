import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({ example: 'Seoul Strikers', maxLength: 100 })
  @IsString()
  @Length(1, 100)
  name!: string;

  @ApiProperty({ example: 'Seoul', maxLength: 50 })
  @IsString()
  @Length(1, 50)
  region!: string;

  @ApiPropertyOptional({ example: 3, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  skillRating?: number;
}
