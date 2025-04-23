import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(
    `
        CREATE TABLE IF NOT EXISTS branch(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        address VARCHAR(255),
        contact VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `,
  );
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(
    `
        DROP TABLE IF EXISTS branch;
        `,
  );
}
