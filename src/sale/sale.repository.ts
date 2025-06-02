import { Injectable } from '@nestjs/common';
import knex from 'knex';
import knexConfig from '../../knexfile';
const db = knex(knexConfig);

const selectDailySaleQurey: string = `
        SELECT
        SUM(COALESCE(sale.price, 0)) AS cashier_price,
        COUNT(*) AS cashier_order,
        cashier.name AS cashier_name,
        branch.name AS branch_name
        FROM sale
        LEFT JOIN cashier ON cashier.id = sale.cashier_id 
        LEFT JOIN branch ON branch.id = cashier.branch_id
        WHERE DATE(sale.created_at) = CURRENT_DATE AND sale.is_debt = false
        GROUP BY  cashier.name, branch.name
        ORDER BY cashier_price DESC;

`;
const createSaleQuery: string = `
        INSERT INTO sale(
        item_barcode,
        price,
        quantity,
        cashier_id,
        description
        )
        VALUES(?,?,?,?,?)
        RETURNING *;
`;

const updateProductQuantityQuery: string = `
        UPDATE product
            SET 
            stock = stock - ?
        WHERE barcode = ?
        RETURNING *;
`;

const searchNameBarcodeQuery: string = `
        SELECT 
        sale.* ,
        product.name AS product_name,
        cashier.id AS branch_id
        FROM sale
        JOIN product ON product.barcode = sale.item_barcode
        JOIN cashier ON cashier.id = sale.cashier_id
        WHERE  
        to_tsvector('simple', sale.item_barcode) @@ plainto_tsquery(?)
        OR to_tsvector('simple', product.name ) @@ plainto_tsquery(?);
`;
const searchNameBarBranchQuery: string = `
        SELECT
        sale.* ,
        product.name AS product_name
        FROM sale
        JOIN product ON product.barcode = sale.item_barcode
        JOIN cashier ON cashier.id = sale.cashier_id
        WHERE  
        cashier.branch_id = ? 
        AND (to_tsvector('simple', sale.item_barcode) @@ plainto_tsquery(?)
        OR to_tsvector('simple', product.name ) @@ plainto_tsquery(?));
`;

const searchBranchCashierQuery: string = `
        SELECT
        sale.* ,
        product.name AS product_name
        FROM sale
        JOIN product ON product.barcode = sale.item_barcode
        JOIN cashier ON cashier.id = sale.cashier_id
        WHERE  
        cashier.branch_id = ? 
        AND cashier.id = ?
        AND (to_tsvector('simple', sale.item_barcode) @@ plainto_tsquery(?)
        OR to_tsvector('simple', product.name ) @@ plainto_tsquery(?));
`;

const searchDateQuery: string = `
        SELECT
        sale.* ,
        product.name AS product_name
        FROM sale
        JOIN product ON product.barcode = sale.item_barcode
        JOIN cashier ON cashier.id = sale.cashier_id
        WHERE  
        sale.created_at >=? --from
        AND sale.created_at <=? --to
        AND cashier.branch_id = ? 
        AND cashier.id = ?
        AND (to_tsvector('simple', sale.item_barcode) @@ plainto_tsquery(?)
        OR to_tsvector('simple', product.name ) @@ plainto_tsquery(?));
`;
const selectByIDCashierQuery: string = `
    SELECT *FROM cashier WHERE id = ?;`;
@Injectable()
export class SaleRepo {
  async selectDailySale() {
    const res = await db.raw(selectDailySaleQurey);
    return res.rows;
  }
  async searchNameBarcode(q: string) {
    const res = await db.raw(searchNameBarcodeQuery, [q, q]);
    return res.rows;
  }

  async searchNameBarBranch(q: string, branch_id: number) {
    const res = await db.raw(searchNameBarBranchQuery, [branch_id, q, q]);
    return res.rows;
  }
  async searchBranchCashier(q: string, branch_id: number, cashier_id: number) {
    const res = await db.raw(searchBranchCashierQuery, [
      cashier_id,
      branch_id,
      q,
      q,
    ]);
    return res.rows;
  }
  async searchDate(
    q: string,
    branch_id: number,
    cashier_id: number,
    from: Date,
    to: Date,
  ) {
    const res = await db.raw(searchDateQuery, [
      from,
      to,
      cashier_id,
      branch_id,
      q,
      q,
    ]);

    return res.rows;
  }
  async selectByIDCashier(id: number) {
    const res = await db.raw(selectByIDCashierQuery, [id]);
    return res.rows;
  }
  async createSales(
    data: {
      item_barcode: string;
      cashier_id: number;
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
        sale.cashier_id,
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
