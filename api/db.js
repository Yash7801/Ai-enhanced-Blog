import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test connection
try {
  const conn = await db.getConnection();
  console.log("Connected to MySQL successfully!");
  console.log("Connected to host:", process.env.DB_HOST);
  conn.release();
} catch (err) {
  console.error("MySQL connection error:", err);
}
