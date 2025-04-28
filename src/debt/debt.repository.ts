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

@Injectable()
export class DebtRepo {
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
