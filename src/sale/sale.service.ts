import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SaleRepo } from './sale.repository';
import { ProductRepo } from 'src/product/product.repository';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SaleService {
  constructor(
    private readonly saleRepo: SaleRepo,
    private readonly productRepo: ProductRepo,
  ) {}

  async getSales(
    page: number,
    pageSize: number,
    q?: string,
    branch_id?: number,
    cashier_id?: number,
    from?: Date,
    to?: Date,
  ) {
    return this.saleRepo.getSales(
      page,
      pageSize,
      q,
      branch_id,
      cashier_id,
      from,
      to,
    );
  }

  async selectDailySale() {
    const result = await this.saleRepo.selectDailySale();
    let sum = 0;

    for (const res of result) {
      sum += Number(res.cashier_price);
    }

    return {
      data: result,
      total_price: sum,
    };
  }

  async searchNameBarcode(q: string) {
    const result = await this.saleRepo.searchNameBarcode(q);
    return result;
  }

  async searchNameBranch(q: string, branch_id: number) {
    const result = await this.saleRepo.searchNameBarBranch(q, branch_id);
    return result;
  }
  async searchBranchCashier(q: string, branch_id: number, cashier_id: number) {
    if (!branch_id) {
      throw new BadRequestException(
        'send branch_id, without branch_id is not working this search query ',
      );
    }
    const result = await this.saleRepo.searchBranchCashier(
      q,
      branch_id,
      cashier_id,
    );
    return result;
  }
  async searchDate(
    q: string,
    branch_id: number,
    cashier_id: number,
    from: Date,
    to: Date,
  ) {
    if (!branch_id) {
      throw new BadRequestException(
        'send branch_id, without branch_id is not working this search query ',
      );
    }
    if (!cashier_id) {
      throw new BadRequestException(
        'send cashier, without cashier is not working this search query ',
      );
    }
    const result = await this.saleRepo.searchDate(
      q,
      branch_id,
      cashier_id,
      from,
      to,
    );
    return result;
  }
  async createSale(data: CreateSaleDto[]) {
    for (const sale of data) {
      const product = await this.productRepo.selectByIDProduct(
        sale.item_barcode,
      );
      const cashier = await this.saleRepo.selectByIDCashier(sale.cashier_id);
      if (cashier.length == 0) {
        throw new NotFoundException(
          `cashier not found with id: ${sale.cashier_id}`,
        );
      }
      if (!product) {
        throw new NotFoundException(
          `Product not found with barcode: ${sale.item_barcode}`,
        );
      }
    }

    const result = await this.saleRepo.createSales(data);
    return result;
  }
}
