import { Injectable } from '@nestjs/common';
import knex from 'knex';
import knexConfig from '../../knexfile';
const db = knex(knexConfig);

const selectAllProductQuery: string = `
        SELECT *FROM product;
`;

const selectByIDProductQuery: string = `
        SELECT *FROM product
            WHERE barcode = ?;
`;

const searchProductQuery: string = `
  SELECT * FROM product
  WHERE 
    (
      to_tsvector('simple', name) @@ plainto_tsquery(?)
    )
    OR barcode ILIKE ?;
`;

const createProductQuery: string = `
        INSERT INTO product(
        barcode,
        name,
        price,
        stock,
        description
        )
         VALUES(?,?,?,?,?)
         RETURNING *;
`;

const updateProductQuery: string = `
        UPDATE product
            SET 
            barcode = ?,
            name = ?,
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
  async selectAllProduct() {
    const res = await db.raw(selectAllProductQuery);
    return res.rows;
  }
  async selectByIDProduct(id: number) {
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
    price: number;
    stock: number;
    description: string;
  }) {
    const res = await db.raw(createProductQuery, [
      data.barcode,
      data.name,
      data.price,
      data.stock,
      data.description,
    ]);
    return res.rows[0];
  }
  async updateProduct(
    id: number,
    data: {
      barcode: string;
      name: string;
      price: number;
      stock: number;
      description: string;
    },
  ) {
    const res = await db.raw(updateProductQuery, [
      data.barcode,
      data.name,
      data.price,
      data.stock,
      data.description,
      id,
    ]);
    return res.rows[0];
  }
  async deleteProductQuery(id: number) {
    const res = await db.raw(deleteProductQuery, [id]);
    return res.rows;
  }
}
