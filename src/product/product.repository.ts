import { Injectable } from '@nestjs/common';
import knex from 'knex';
import knexConfig from '../../knexfile';
const db = knex(knexConfig);

const selectAllProductQuery: string = `
        SELECT *FROM product LIMIT ? OFFSET ?;
`;

const selectByIDProductQuery: string = `
        SELECT *FROM product
            WHERE barcode = ?;
`;

const searchProductQuery: string = `
  SELECT product.*, 
  branch.name AS branch_name 
  FROM product
  JOIN branch ON branch.id = product.branch_id
  WHERE 
    (
      to_tsvector('simple', product.name) @@ plainto_tsquery(?)
    )
    OR product.barcode ILIKE ?;
`;

const createProductQuery: string = `
        INSERT INTO product(
        barcode,
        name,
        branch_id,
        price,
        stock,
        description
        )
         VALUES(?,?,?,?,?,?)
         RETURNING *;
`;

const updateProductQuery: string = `
        UPDATE product
            SET 
            barcode = ?,
            name = ?,
            branch_id = ?,
            price = ?,
            stock = ?,
            description = ?,
            updated_at = NOW()
        WHERE barcode = ?
        RETURNING *;
`;

const deleteProductQuery: string = `
        DELETE FROM product
            WHERE barcode = ?
            RETURNING *; 
`;

@Injectable()
export class ProductRepo {
  async selectAllProduct(page: number, pageSize: number) {
    const offset = (page - 1) * pageSize;
    const res = await db.raw(selectAllProductQuery, [pageSize, offset]);
    return res.rows;
  }
  async selectByIDProduct(id: string) {
    const res = await db.raw(selectByIDProductQuery, [id]);
    return res.rows[0];
  }
  async searchProduct(q: string) {
    if (!q.trim()) return [];

    const fullText = q; // plainto_tsquery uchun
    const ilikeText = `%${q}%`; // ILIKE uchun

    const res = await db.raw(searchProductQuery, [fullText, ilikeText]);
    return res.rows;
  }
  async createProduct(data: {
    barcode: string;
    name: string;
    branch_id: number;
    price: number;
    stock: number;
    description: string;
  }) {
    const res = await db.raw(createProductQuery, [
      data.barcode,
      data.name,
      data.branch_id,
      data.price,
      data.stock,
      data.description,
    ]);
    return res.rows[0];
  }
  async updateProduct(
    barcode: string,
    data: {
      barcode: string;
      name: string;
      branch_id: number;
      price: number;
      stock: number;
      description: string;
    },
  ) {
    const res = await db.raw(updateProductQuery, [
      data.barcode,
      data.name,
      data.branch_id,
      data.price,
      data.stock,
      data.description,
      barcode,
    ]);
    console.log(res.rows);
    return res.rows[0];
  }
  async deleteProductQuery(barcode: string) {
    const res = await db.raw(deleteProductQuery, [barcode]);
    return res.rows;
  }
}
