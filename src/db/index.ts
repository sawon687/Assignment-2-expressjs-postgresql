import { Pool } from 'pg';
import config from '../config';

export const pool = new Pool({
  connectionString:config.connectionString
});
//  insialt database table and connection function
export const initDB = async () => {
  try {
    await pool.query(
      `
            CREATE TABLE IF NOT EXISTS users(
                id SERIAL PRIMARY KEY UNIQUE,
                name VARCHAR(100),
                email VARCHAR(255) UNIQUE NOT NULL ,
                password TEXT NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'contributor',
                create_at TIMESTAMPTZ DEFAULT NOW(),
                updatae_at TIMESTAMPTZ DEFAULT NOW() )
            `
    );

    await pool.query(`
        CREATE TABLE IF NOT EXISTS issues(
                id SERIAL PRIMARY KEY UNIQUE,
                title  VARCHAR(150) NOT NULL,
                description	TEXT NOT NULL ,
                type VARCHAR(20) NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'open',
                reporter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE ,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW() )`)
    console.log("Database connection is successfully");
  } catch (error) {
    console.log(error);
  }
};



