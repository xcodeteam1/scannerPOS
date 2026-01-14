import { Injectable } from '@nestjs/common';
import knex from 'knex';
import knexConfig from '../../knexfile';
const db = knex(knexConfig);

const selectDailySaleQurey: string = `
        SELECT
        SUM(COALESCE(sale.price, 0)) AS cashier_price,
        COUNT(*) AS cashier_order,
        cashier.name AS cashier_name,
        cashier.id AS cashier_id,
        branch.name AS branch_name
        FROM sale
        LEFT JOIN cashier ON cashier.id = sale.cashier_id 
        LEFT JOIN branch ON branch.id = cashier.branch_id
        WHERE DATE(sale.created_at) = CURRENT_DATE AND sale.is_debt = false
        GROUP BY  cashier.name, branch.name, cashier.id
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
        sale.*,
        product.name AS product_name,
        cashier.branch_id
      FROM sale
      LEFT JOIN product ON product.barcode = sale.item_barcode
      LEFT JOIN cashier ON cashier.id = sale.cashier_id
      WHERE  
        sale.item_barcode ILIKE ?
        OR product.name ILIKE ?;
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
        AND sale.item_barcode ILIKE ?
        OR product.name ILIKE ?;
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
        ANDsale.item_barcode ILIKE ?
        OR product.name ILIKE ?;
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
        AND sale.item_barcode ILIKE ?
        OR product.name ILIKE ?;
`;
const selectByIDCashierQuery: string = `
    SELECT *FROM cashier WHERE id = ?;`;
@Injectable()
export class SaleRepo {
  async selectDailySale() {
    const res = await db.raw(selectDailySaleQurey);
    return res.rows;
  }
  async getNetProfit(
    from?: string,
    to?: string,
    branch_id?: number,
    cashier_id?: number,
  ) {
    const params: any[] = [];

    let saleFilter = 'WHERE 1=1';
    let debtFilter = 'WHERE 1=1';
    let returnFilter = 'WHERE 1=1';

    // ------------------ DATE FILTER ------------------

    if (from) {
      saleFilter += ' AND s.created_at >= ?';
      debtFilter += ' AND d.created_at >= ?';
      returnFilter += ' AND r.created_at >= ?';
      params.push(from, from, from);
    }

    if (to) {
      saleFilter += ' AND s.created_at <= ?';
      debtFilter += ' AND d.created_at <= ?';
      returnFilter += ' AND r.created_at <= ?';
      params.push(to, to, to);
    }

    // ------------------ BRANCH FILTER ------------------

    if (branch_id) {
      saleFilter += ' AND p.branch_id = ?';
      debtFilter += ' AND p.branch_id = ?';
      returnFilter += ' AND p.branch_id = ?';
      params.push(branch_id, branch_id, branch_id);
    }

    // ------------------ CASHIER FILTER ------------------

    if (cashier_id) {
      saleFilter += ' AND s.cashier_id = ?';
      debtFilter += ' AND d.customer_id = ?'; // agar debt ham kassirga bog‘langan bo‘lsa shu
      params.push(cashier_id, cashier_id);
    }

    const query = `
      SELECT
        -- sotuvdan sof foyda
        COALESCE((
          SELECT SUM((p.price - p.real_price) * s.quantity)
          FROM sale s
          JOIN product p ON p.barcode = s.item_barcode
          ${saleFilter}
        ), 0)
        +
        -- qarz savdosidan sof foyda
        COALESCE((
          SELECT SUM((p.price - p.real_price) * d.quantity)
          FROM debt d
          JOIN product p ON p.barcode = d.item_barcode
          ${debtFilter}
        ), 0)
        -
        -- qaytgan tovar zarar
        COALESCE((
          SELECT SUM((p.price - p.real_price) * r.quantity)
          FROM return r
          JOIN product p ON p.barcode = r.item_barcode
          ${returnFilter}
        ), 0)
        AS net_profit;
    `;

    const res = await db.raw(query, params);
    return res.rows[0];
  }

  async searchNameBarcode(q: string) {
    const res = await db.raw(searchNameBarcodeQuery, [`%${q}%`, `%${q}%`]);
    return res.rows;
  }

  async searchNameBarBranch(q: string, branch_id: number) {
    const res = await db.raw(searchNameBarBranchQuery, [
      branch_id,
      `%${q}%`,
      `%${q}%`,
    ]);
    return res.rows;
  }
  async searchBranchCashier(q: string, branch_id: number, cashier_id: number) {
    const res = await db.raw(searchBranchCashierQuery, [
      cashier_id,
      branch_id,
      `%${q}%`,
      `%${q}%`,
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
      `%${q}%`,
      `%${q}%`,
    ]);

    return res.rows;
  }

  async getSales(
    page: number,
    pageSize: number,
    q?: string,
    branch_id?: number,
    cashier_id?: number,
    from?: Date,
    to?: Date,
  ) {
    const offset = (page - 1) * pageSize;

    let totalCountResult, dataResult;

    if (q && !branch_id && !cashier_id && !from && !to) {
      totalCountResult = await db.raw(
        `
        SELECT COUNT(*) 
        FROM sale
        LEFT JOIN product ON product.barcode = sale.item_barcode
        LEFT JOIN cashier ON cashier.id = sale.cashier_id
        WHERE sale.item_barcode ILIKE ? OR product.name ILIKE ?;
        `,
        [`%${q}%`, `%${q}%`],
      );

      dataResult = await db.raw(
        `
        SELECT sale.*, product.name AS product_name, cashier.branch_id
        FROM sale
        LEFT JOIN product ON product.barcode = sale.item_barcode
        LEFT JOIN cashier ON cashier.id = sale.cashier_id
        WHERE sale.item_barcode ILIKE ? OR product.name ILIKE ?
        ORDER BY sale.created_at DESC
        LIMIT ? OFFSET ?;
        `,
        [`%${q}%`, `%${q}%`, pageSize, offset],
      );
    } else if (q && branch_id && !cashier_id && !from && !to) {
      totalCountResult = await db.raw(
        `
        SELECT COUNT(*)
        FROM sale
        JOIN product ON product.barcode = sale.item_barcode
        JOIN cashier ON cashier.id = sale.cashier_id
        WHERE cashier.branch_id = ?
        AND (sale.item_barcode ILIKE ? OR product.name ILIKE ?);
        `,
        [branch_id, `%${q}%`, `%${q}%`],
      );

      dataResult = await db.raw(
        `
        SELECT sale.*, product.name AS product_name
        FROM sale
        JOIN product ON product.barcode = sale.item_barcode
        JOIN cashier ON cashier.id = sale.cashier_id
        WHERE cashier.branch_id = ?
        AND (sale.item_barcode ILIKE ? OR product.name ILIKE ?)
        ORDER BY sale.created_at DESC
        LIMIT ? OFFSET ?;
        `,
        [branch_id, `%${q}%`, `%${q}%`, pageSize, offset],
      );
    } else if (q && branch_id && cashier_id && !from && !to) {
      totalCountResult = await db.raw(
        `
        SELECT COUNT(*)
        FROM sale
        JOIN product ON product.barcode = sale.item_barcode
        JOIN cashier ON cashier.id = sale.cashier_id
        WHERE cashier.branch_id = ? AND cashier.id = ?
        AND (sale.item_barcode ILIKE ? OR product.name ILIKE ?);
        `,
        [branch_id, cashier_id, `%${q}%`, `%${q}%`],
      );

      dataResult = await db.raw(
        `
        SELECT sale.*, product.name AS product_name
        FROM sale
        JOIN product ON product.barcode = sale.item_barcode
        JOIN cashier ON cashier.id = sale.cashier_id
        WHERE cashier.branch_id = ? AND cashier.id = ?
        AND (sale.item_barcode ILIKE ? OR product.name ILIKE ?)
        ORDER BY sale.created_at DESC
        LIMIT ? OFFSET ?;
        `,
        [branch_id, cashier_id, `%${q}%`, `%${q}%`, pageSize, offset],
      );
    } else if (q && branch_id && cashier_id && from && to) {
      totalCountResult = await db.raw(
        `
        SELECT COUNT(*)
        FROM sale
        JOIN product ON product.barcode = sale.item_barcode
        JOIN cashier ON cashier.id = sale.cashier_id
        WHERE sale.created_at >= ? AND sale.created_at <= ?
        AND cashier.branch_id = ? AND cashier.id = ?
        AND (sale.item_barcode ILIKE ? OR product.name ILIKE ?);
        `,
        [from, to, branch_id, cashier_id, `%${q}%`, `%${q}%`],
      );

      dataResult = await db.raw(
        `
        SELECT sale.*, product.name AS product_name
        FROM sale
        JOIN product ON product.barcode = sale.item_barcode
        JOIN cashier ON cashier.id = sale.cashier_id
        WHERE sale.created_at >= ? AND sale.created_at <= ?
        AND cashier.branch_id = ? AND cashier.id = ?
        AND (sale.item_barcode ILIKE ? OR product.name ILIKE ?)
        ORDER BY sale.created_at DESC
        LIMIT ? OFFSET ?;
        `,
        [from, to, branch_id, cashier_id, `%${q}%`, `%${q}%`, pageSize, offset],
      );
    } else {
      totalCountResult = await db.raw(`SELECT COUNT(*) FROM sale`);
      dataResult = await db.raw(
        `
        SELECT sale.*, product.name AS product_name, cashier.branch_id
        FROM sale
        LEFT JOIN product ON product.barcode = sale.item_barcode
        LEFT JOIN cashier ON cashier.id = sale.cashier_id
        ORDER BY sale.created_at DESC
        LIMIT ? OFFSET ?;
        `,
        [pageSize, offset],
      );
    }

    const totalRecords = parseInt(totalCountResult.rows[0].count);
    const data = dataResult.rows;

    const totalPages = Math.ceil(totalRecords / pageSize);
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

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
