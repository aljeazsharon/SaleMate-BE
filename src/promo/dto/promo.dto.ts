/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { Promo_type } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsDate, IsNotEmpty, IsString, MinDate } from 'class-validator';

export class CreatePromoDto {
  @IsInt()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({example: 1})
  product_id?: number;
  
  @IsNotEmpty()
  @IsString()
  @ApiProperty({example: "Promo 1"})
  promo_name: string;

  @IsEnum(Promo_type)
  @ApiProperty({example: "Discount / Sales"})
  promo_type: Promo_type;

  @IsInt()
  @ApiProperty({example: 20, description: "Prothis will be added as percentage"})
  promo_value: number;

  @IsDate()
  @IsOptional()
  @ApiProperty({example: "2022-01-01T00:00:00.000Z", description: "will be using calendar system in frontend"})
  @MinDate(new Date(), { message: "Start date cannot be before today." })
  @Type(() => Date)
  start_date?: Date;

  @IsDate()
  @IsOptional()
  @ApiProperty({example: "2022-01-01T00:00:00.000Z", description: "will be using calendar system in frontend"})
  @Type(() => Date)
  end_date?: Date;
}

export class UpdatePromoDto {
  @IsOptional()
  @IsInt()
  @ApiProperty({example: 1})
  product_id?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({example: "Promo 2"})
  promo_name?: string;

  @IsOptional()
  @IsEnum(Promo_type)
  @ApiProperty({example: "Discount"})
  promo_type?: Promo_type;

  @IsOptional()
  @IsInt()
  @ApiProperty({example: 20, description: "will be added as percentage / number"})
  promo_value?: number;

  @IsOptional()
  @IsDate()
  @ApiProperty({example: "2022-01-01T00:00:00.000Z", description: "will be using calendar system in frontend"})
  @MinDate(new Date(), { message: "Start date cannot be before today." })
  @Type(() => Date)
  start_date?: Date;

  @IsOptional()
  @IsDate()
  @ApiProperty({example: "2022-01-01T00:00:00.000Z", description: "will be using calendar system in frontend"})
  @Type(() => Date)
  end_date?: Date;
}

export class ApplyPromoDto {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({example: 1})
  product_id: number;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({example: 1})
  promo_id: number;
}

export class UnapplyPromoDto {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ example: 1 })
  product_id: number;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ example: 1 })
  promo_id: number;
}