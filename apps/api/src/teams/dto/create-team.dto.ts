import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TeamSport } from '@prisma/client';

export class CreateTeamDto {
  @ApiProperty({ example: 'Seoul Strikers', maxLength: 100 })
  @IsString()
  @Length(1, 100)
  name!: string;

  @ApiProperty({
    enum: TeamSport,
    example: TeamSport.SOCCER,
    description:
      'SOCCER/BASKETBALL/BASEBALL 또는 별칭(FOOTBALL, 축구, soccer, 농구, 야구)',
  })
  @IsString()
  @Length(1, 30)
  sport!: string;

  @ApiPropertyOptional({ example: 'Seoul', maxLength: 50 })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  region?: string;

  @ApiPropertyOptional({ example: 'https://example.com/team-logo.png' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ example: '주말 풋살 정기전 팀' })
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  description?: string;

  @ApiPropertyOptional({ example: 3, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skillRating?: number;
}
