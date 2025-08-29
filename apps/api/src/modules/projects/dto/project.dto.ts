import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  client?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  savingsTarget?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  client?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  savingsTarget?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
