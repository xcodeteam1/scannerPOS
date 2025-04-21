import { Injectable } from '@nestjs/common';
import knex from 'knex';
import knexConfig from '../../knexfile';
const db = knex(knexConfig);

const selectAllBranchQuery: string = `
    SELECT *FROM branch;
`;

const selectByIDBranch: string = `
    SELECT *FROM branch 
        WHERE id = ?;
`;
const createBranchQuery: string = `
    INSERT INTO branch(
    name,
    description
    )
    VALUES(?,?)
    RETURNING *;
    `;
const updateBranchQuery: string = `
    UPDATE branch
      SET
      name = ?,
      description = ?,
      updated_at = NOW()
    WHERE id = ?
    RETURNING *;
`;
const deleteBranchQuery: string = `
    DELETE FROM branch 
      WHERE id = ? 
      RETURNING *; 
`;
@Injectable()
export class BranchRepo {
  async selectAllBranch() {
    const res = await db.raw(selectAllBranchQuery);
    return res.rows;
  }
  async selectByIDBranch(id: number) {
    const res = await db.raw(selectByIDBranch, [id]);
    return res.rows[0];
  }
  async createBranch(data: { name: string; description: string }) {
    const res = await db.raw(createBranchQuery, [data.name, data.description]);
    return res.rows[0];
  }
  async updateBranch(id: number, data: { name: string; description: string }) {
    const res = await db.raw(updateBranchQuery, [
      data.name,
      data.description,
      id,
    ]);
    return res.rows[0];
  }
  async deleteBranch(id: number) {
    const res = await db.raw(deleteBranchQuery, [id]);
    return res.rows;
  }
}
