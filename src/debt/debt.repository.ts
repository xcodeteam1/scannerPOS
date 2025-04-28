import { Injectable } from '@nestjs/common';
import knex from 'knex';
import knexConfig from '../../knexfile';
const db = knex(knexConfig);

const createDebtQuery: string = `
        INSERT INTO debt(
        item_barcode,
        quantity,
        customer_id,
        amount,
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

const deleteDebtQuery: string = `
        DELETE FROM debt 
        WHERE id = ? 
        RETURNING *;
`;

const selectAllDebtQuery: string = `
        SELECT 
          SUM(debt.amount) AS all_amount,
          customer.customer_name,
          product.name AS product_name,
          debt.created_at
        FROM debt
        LEFT JOIN customer ON customer.id = debt.customer_id
        LEFT JOIN product ON product.barcode = debt.item_barcode
        GROUP BY 
            customer.customer_name, debt.created_at, product_name;
`;
const searchDebtQuery: string = `
    SELECT
        SUM(debt.amount) AS all_amount,
        customer.customer_name,
        product.name AS product_name,
        debt.created_at
    FROM debt
    LEFT JOIN customer ON customer.id = debt.customer_id
    LEFT JOIN product ON product.barcode = debt.item_barcode
    WHERE
        (
          to_tsvector('simple', customer.customer_name) @@ to_tsquery('simple', ? || ':*')
          OR customer.customer_name ILIKE ? || '%'
        )
    GROUP BY
        customer.customer_name, debt.created_at, product.name;
`;

@Injectable()
export class DebtRepo {
  async selectAllDebt() {
    const res = await db.raw(selectAllDebtQuery);
    return res.rows;
  }
  async searchCustomer(name: string) {
    if (!name.trim()) return [];

    const fullText = name; // plainto_tsquery uchun
    const ilikeText = `%${name}%`; // ILIKE uchun
    const res = await db.raw(searchDebtQuery, [fullText, ilikeText]);
    return res.rows;
  }
  async createDebt(
    data: {
      item_barcode: string;
      quantity: number;
      customer_id: number;
      amount: number;
      description: string;
    }[],
  ) {
    //birinchi sale yaratadi
    const results = [];
    for (const debt of data) {
      const res = await db.raw(createDebtQuery, [
        debt.item_barcode,
        debt.quantity,
        debt.customer_id,
        debt.amount,
        debt.description,
      ]);
      await db.raw(updateProductQuantityQuery, [
        debt.quantity,
        debt.item_barcode,
      ]);
      results.push(res.rows[0]);
    }
    return results;
  }
}
