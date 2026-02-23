import { IsString, Length } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @Length(1, 100)
  title!: string;

  @IsString()
  @Length(1, 5000)
  content!: string;
}
