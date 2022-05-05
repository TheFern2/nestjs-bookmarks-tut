import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EditBookmarkDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  title?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  description?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  link?: string;
}
