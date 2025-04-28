import { Injectable } from '@nestjs/common';
import knex from 'knex';
import knexConfig from '../../knexfile';
const db = knex(knexConfig);

const selectDailySaleQurey: string = `
        SELECT
        DATE(created_at) AS created_date,
        SUM(COALESCE(price, 0)) AS total_price,
        COUNT(*) AS total_order
        FROM sale
        WHERE DATE(created_at) = CURRENT_DATE AND is_debt = false
        GROUP BY created_date;

`;
const createSaleQuery: string = `
        INSERT INTO sale(
        item_barcode,
        price,
        quantity,
        description
        )
        VALUES(?,?,?,?)
        RETURNING *;
`;

const updateProductQuantityQuery: string = `
        UPDATE product
            SET 
            stock = stock - ?
        WHERE barcode = ?
        RETURNING *;
`;

@Injectable()
export class SaleRepo {
  async selectDailySale() {
    const res = await db.raw(selectDailySaleQurey);
    return res.rows;
  }
  async createSales(
    data: {
      item_barcode: string;
      price: number;
      quantity: number;
      description: string;
    }[],
  ) {
    const results = [];

    for (const sale of data) {
      const res = await db.raw(createSaleQuery, [
        sale.item_barcode,
        sale.price,
        sale.quantity,
        sale.description,
      ]);
      await db.raw(updateProductQuantityQuery, [
        sale.quantity,
        sale.item_barcode,
      ]);
      results.push(res.rows[0]);
    }

    return results;
  }
}
