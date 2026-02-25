import { IsIn, IsString } from 'class-validator';

export class ToggleReactionDto {
  @IsString()
  userId!: string;

  @IsIn(['LIKE', 'DISLIKE'])
  type!: 'LIKE' | 'DISLIKE';
}
