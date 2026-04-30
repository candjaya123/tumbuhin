import { IsArray, IsUUID, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SaleItemDto {
  @IsUUID()
  product_id: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;
}

export class PaymentLineDto {
  @IsUUID()
  account_id: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  method?: string;
}

export class ProcessSaleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentLineDto)
  payments?: PaymentLineDto[];

  @IsOptional()
  @IsUUID()
  payment_account_id?: string; // For backward compatibility

  @IsUUID()
  revenue_account_id: string;

  @IsUUID()
  hpp_account_id: string;

  @IsUUID()
  inventory_account_id: string;

  @IsOptional()
  @IsUUID()
  tax_account_id?: string;

  @IsOptional()
  @IsUUID()
  discount_account_id?: string;

  @IsOptional()
  @IsNumber()
  tax_amount?: number;

  @IsOptional()
  @IsNumber()
  discount_amount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  entity_id: string;

  @IsOptional()
  @IsUUID()
  branch_id?: string;
}
