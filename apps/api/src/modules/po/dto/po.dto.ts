import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { POStatus } from '@prisma/client';

export class CreatePoDto {
  @IsString()
  number: string;

  @IsOptional()
  @IsString()
  supplierId?: string;

  @IsOptional()
  @IsEnum(POStatus)
  status?: POStatus;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  total?: number;

  @IsOptional()
  @IsString()
  currency?: string;
}

export class UpdatePoDto {
  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  supplierId?: string;

  @IsOptional()
  @IsEnum(POStatus)
  status?: POStatus;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  total?: number;

  @IsOptional()
  @IsString()
  currency?: string;
}

export class SubmitPoDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ApprovePoDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
