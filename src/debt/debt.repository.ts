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
        debt_amount,
        description
        )
        VALUES(?,?,?,?,?,?)
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
          debt.id,
          SUM(debt.amount) AS all_amount,
          customer.customer_name,
          product.name AS product_name,
          debt.created_at
        FROM debt
        LEFT JOIN customer ON customer.id = debt.customer_id
        LEFT JOIN product ON product.barcode = debt.item_barcode
        GROUP BY 
            customer.customer_name, debt.created_at, product_name, debt.id;
`;
const searchDebtQuery: string = `
    SELECT
        debt.id,
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
        customer.customer_name, debt.created_at, product.name, debt.id;
`;
const selectRecentQuery: string = `
        SELECT 
        COALESCE(SUM(debt_amount), 0) AS all_amount ,
        COUNT(*) AS count_debt
        FROM debt
        WHERE created_at != updated_at;
`;

const amountDebtQuery: string = `
        UPDATE debt 
          SET
          amount = 0,
          updated_at = NOW()
        WHERE id = ?
        RETURNING *;
`;

const selectPendingQuery: string = `
        SELECT
          COALESCE(SUM(debt_amount), 0) - COALESCE(SUM(amount), 0) AS total_pending,
          SUM(CASE WHEN amount != 0.00 THEN 1 ELSE 0 END) AS count
        FROM debt;
  `;

const selectOldestQuery: string = `
          SELECT 
          d.id,
          d.amount,
          d.created_at,
          customer.customer_name
          FROM debt AS d
          LEFT JOIN customer ON customer.id = d.customer_id
          WHERE d.amount !=0 
          ORDER BY d.created_at ASC
          LIMIT 1;
`;
@Injectable()
export class DebtRepo {
  async selectPending() {
    const res = await db.raw(selectPendingQuery);
    return res.rows;
  }
  async selectOldest() {
    const res = await db.raw(selectOldestQuery);
    return res.rows;
  }
  async amountDebt(id: number) {
    const res = await db.raw(amountDebtQuery, [id]);
    return res.rows[0];
  }
  async selectAllDebt() {
    const res = await db.raw(selectAllDebtQuery);
    return res.rows;
  }
  async selectRecent() {
    const res = await db.raw(selectRecentQuery);
    return res.rows[0];
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
