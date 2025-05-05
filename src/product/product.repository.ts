import { Injectable } from '@nestjs/common';
import knex from 'knex';
import knexConfig from '../../knexfile';
const db = knex(knexConfig);

const selectAllProductQuery: string = `
        SELECT *FROM product  LIMIT ? OFFSET ?;
`;

const selectByIDProductQuery: string = `
        SELECT *FROM product
            WHERE barcode = ?;
`;

const searchProductQuery: string = `
    SELECT product.*, branch.name AS branch_name
    FROM product
    JOIN branch ON branch.id = product.branch_id
    WHERE  (
        to_tsvector('simple', product.name) @@ plainto_tsquery(?)
        OR product.name ILIKE ?
        OR product.barcode ILIKE ?
      );
`;

const createProductQuery: string = `
        INSERT INTO product(
        barcode,
        name,
        branch_id,
        price,
        stock,
        real_price,
        description,
        image
        )
         VALUES(?,?,?,?,?,?,?,?)
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
            real_price = ?,
            description = ?,
            image = ?,
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
    // 1. Jami yozuvlar soni
    const totalCountResult = await db.raw(`SELECT COUNT(*) FROM product`);
    const totalRecords = parseInt(totalCountResult.rows[0].count);

    const dataResult = await db.raw(selectAllProductQuery, [pageSize, offset]);
    const data = dataResult.rows;

    // 3. Paginatsiya hisoblash
    const totalPages = Math.ceil(totalRecords / pageSize);
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    // 4. Yakuniy natija
    return {
      data,
      pagination: {
        total_records: totalRecords,
        current_page: page,
        total_pages: totalPages,
        next_page: nextPage,
        prev_page: prevPage,
      },
    };
  }
  async selectByIDProduct(id: string) {
    const res = await db.raw(selectByIDProductQuery, [id]);
    return res.rows[0];
  }
  async searchProduct(q: string) {
    const fullText = q; // plainto_tsquery uchun
    const ilikeText = `%${q}%`; // ILIKE uchun

    const res = await db.raw(searchProductQuery, [
      fullText,
      ilikeText,
      ilikeText,
    ]);
    return res.rows;
  }
  async createProduct(data: {
    barcode: string;
    name: string;
    branch_id: number;
    price: number;
    stock: number;
    description: string;
    real_price: number;
    imageUrls?: string[];
  }) {
    const imageArrayPg = `{${data.imageUrls.join(',')}}`;

    const res = await db.raw(createProductQuery, [
      data.barcode,
      data.name,
      data.branch_id,
      data.price,
      data.stock,
      data.real_price,
      data.description,
      imageArrayPg,
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
      real_price: number;
      description: string;
      imageUrls?: string[];
    },
  ) {
    const imageArrayPg = `{${data.imageUrls.join(',')}}`;

    const res = await db.raw(updateProductQuery, [
      data.barcode,
      data.name,
      data.branch_id,
      data.price,
      data.stock,
      data.real_price,
      data.description,
      imageArrayPg,
      barcode,
    ]);
    return res.rows[0];
  }
  async deleteProductQuery(barcode: string) {
    const res = await db.raw(deleteProductQuery, [barcode]);
    return res.rows;
  }
}
