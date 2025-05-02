import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
        CREATE TABLE IF NOT EXISTS product(
            barcode VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255),
            branch_id INTEGER REFERENCES branch(id) ON DELETE CASCADE,
            price NUMERIC(15,2),
            stock INTEGER DEFAULT 1,
            image VARCHAR(100)[],
            is_deleted BOOLEAN DEFAULT FALSE,
            real_price NUMERIC(15,2),
            description VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
        DROP TABLE IF EXISTS product;
    `);
}
