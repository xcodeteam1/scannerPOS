import { Injectable } from '@nestjs/common';
import knex from 'knex';
import knexConfig from '../../knexfile';
import { hashPassword } from 'lib/bcrypt';
const db = knex(knexConfig);

const selectByLoginAdminQuery: string = `
    SELECT *FROM admin WHERE login = ?;
`;

const selectByLoginCashierQuery: string = `
    SELECT *FROM cashier WHERE name = ?;
`;
const selectAllCashierQuery: string = `
        SELECT 
            c.id,
            c.name,
            b.name AS branch_name
            FROM cashier AS c
            LEFT JOIN branch AS b ON b.id = c.id;
`;
const createAdminQuery: string = `
 INSERT INTO admin (login, password)
  SELECT ?, ?
  WHERE NOT EXISTS (
    SELECT 1 FROM admin WHERE login = ?
  )
  RETURNING *;`;
const selectByIDCashierQuery: string = `
        SELECT 
            c.id,
            c.name,
            b.name AS branch_name
            FROM cashier AS c
            LEFT JOIN branch AS b ON b.id = c.id
            WHERE c.id = ?;
`;

const createCashierQuery: string = `
        INSERT INTO cashier (
        name,
        branch_id,
        password
        )
        VALUES(?,?,?)
        RETURNING *;
`;

const updateCashierQuery: string = `
        UPDATE cashier 
            SET 
            name = ?,
            branch_id = ?,
            password = ?,
            updated_at = NOW()
        WHERE id = ?
        RETURNING *;
`;
const deleteCashierQuery: string = `
        DELETE FROM cashier
            WHERE id = ?
            RETURNING *;
`;

@Injectable()
export class CashiersRepo {
  async selectByLoginAdmin(login: string) {
    const res = await db.raw(selectByLoginAdminQuery, [login]);
    return res.rows;
  }
  async selectByloginCashier(login: string) {
    const res = await db.raw(selectByLoginCashierQuery, [login]);
    return res.rows;
  }

  async createAdminIfNotExists(login: string, password: string) {
    const hashed = await hashPassword(password);
    const res = await db.raw(createAdminQuery, [login, hashed, login]);
    console.log(res.rows);
  }
  async selectAllCashier() {
    const res = await db.raw(selectAllCashierQuery);
    return res.rows;
  }
  async selectByIDCashier(id: number) {
    const res = await db.raw(selectByIDCashierQuery, [id]);
    return res.rows[0];
  }
  async createCashier(data: {
    name: string;
    branch_id: number;
    password: string;
  }) {
    const hashedPassword = await hashPassword(data.password);
    const res = await db.raw(createCashierQuery, [
      data.name,
      data.branch_id,
      hashedPassword,
    ]);
    return res.rows[0];
  }
  async updateCashier(
    id: number,
    data: {
      name: string;
      branch_id: number;
      password: string;
    },
  ) {
    const hashedPassword = await hashPassword(data.password);
    const res = await db.raw(updateCashierQuery, [
      data.name,
      data.branch_id,
      hashedPassword,
      id,
    ]);
    return res.rows[0];
  }
  async deleteCashier(id: number) {
    const res = await db.raw(deleteCashierQuery, [id]);
    return res.rows;
  }
}
