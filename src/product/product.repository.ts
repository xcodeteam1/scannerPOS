import { Injectable } from '@nestjs/common';
import knex from 'knex';
import knexConfig from '../../knexfile';
const db = knex(knexConfig);

const selectAllProductQuery: string = `
        SELECT *FROM product 
        ORDER BY updated_at DESC
        LIMIT ? OFFSET ?;
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
        category_id,
        description,
        image
        )
         VALUES(?,?,?,?,?,?,?,?,?)
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
            category_id = ?,
            description = ?,
            image = ?,
            updated_at = NOW()
        WHERE barcode = ?
        RETURNING *;
`;
const patchProductQuery = `
    UPDATE product
    SET
        barcode = COALESCE(?, barcode),
        name = COALESCE(?, name),
        branch_id = COALESCE(?, branch_id),
        price = COALESCE(?, price),
        stock = COALESCE(?, stock),
        real_price = COALESCE(?, real_price),
        category_id = COALESCE(?, category_id),
        description = COALESCE(?, description),
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
    category_id: number;
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
      data.category_id,
      data.description || null,
      imageArrayPg || null,
    ]);
    return res.rows[0];
  }
  async updateProduct(
    barcode: string,
    data: {
      barcode?: string;
      name?: string;
      branch_id?: number;
      price?: number;
      stock?: number;
      real_price?: number;
      category_id?: number;
      description?: string;
      imageUrls?: string[];
    },
  ) {
    const updateData: any = {};

    if (data.barcode !== undefined) updateData.barcode = data.barcode;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.branch_id !== undefined) updateData.branch_id = data.branch_id;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.real_price !== undefined) updateData.real_price = data.real_price;
    if (data.category_id !== undefined)
      updateData.category_id = data.category_id;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.imageUrls !== undefined) updateData.image = data.imageUrls;

    if (Object.keys(updateData).length === 0) {
      throw new Error('Hech qanday field yuborilmadi!');
    }

    const [updated] = await db('product')
      .where({ barcode })
      .update(updateData)
      .returning('*');

    if (!updated) {
      throw new Error(`Product with barcode ${barcode} not found`);
    }

    return updated;
  }

  async patchProduct(
    barcode: string,
    data: {
      barcode?: string;
      name?: string;
      branch_id?: number;
      price?: number;
      stock?: number;
      real_price?: number;
      category_id?: number;
      description?: string;
    },
  ) {
    const res = await db.raw(patchProductQuery, [
      data.barcode ?? null,
      data.name ?? null,
      data.branch_id ?? null,
      data.price ?? null,
      data.stock ?? null,
      data.real_price ?? null,
      data.category_id ?? null,
      data.description ?? null,
      barcode,
    ]);

    return res.rows[0];
  }
  async deleteProductQuery(barcode: string) {
    const res = await db.raw(deleteProductQuery, [barcode]);
    return res.rows;
  }
}
