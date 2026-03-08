import mysql from "mysql2/promise";

let pool;

export const connectDB = async () => {
  if (!process.env.DB_HOST) {
    console.log("No DB_HOST provided, using in-memory fallback for database");
    return null;
  }

  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    console.log("Connected to MySQL RDS");
    return pool;
  } catch (error) {
    console.error("MySQL connection error:", error);
    return null;
  }
};

export const getPool = () => pool;
