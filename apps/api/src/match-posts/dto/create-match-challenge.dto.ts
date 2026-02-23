import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateMatchChallengeDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  slotId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  challengerTeamId!: number;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  message?: string;
}
