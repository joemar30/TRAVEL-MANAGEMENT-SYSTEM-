import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Create pool for better performance with concurrent connections
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'wayfarer',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper for quick queries
export async function query(sql: string, params: any[] = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error("Database Query Error:", error);
    throw error;
  }
}

// Initial health check
(async () => {
    try {
        const conn = await pool.getConnection();
        console.log("Connected to MySQL Database via pool");
        conn.release();
    } catch (err: any) {
        console.error("Could not connect to database:", err.message);
        console.warn("Ensure MySQL is running and database 'wayfarer' is created via phpMyAdmin with db_schema.sql");
    }
})();
