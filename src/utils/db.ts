import { Pool, createPool } from '@vercel/postgres';

const db = createPool({
  connectionString: process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_POSTGRES_URL : process.env.POSTGRES_URL
});

export default db;