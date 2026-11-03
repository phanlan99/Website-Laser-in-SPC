import "server-only";
import mysql, { type Pool } from "mysql2/promise";

/**
 * Kết nối MySQL – database NewLaserMarking.
 * Mật khẩu (và các thông số khác nếu muốn đổi) đặt trong file .env.local ở thư mục gốc dự án:
 *
 *   DB_HOST=192.168.122.10
 *   DB_PORT=3307
 *   DB_NAME=NewLaserMarking
 *   DB_USER=root
 *   DB_PASSWORD=mat_khau_cua_ban
 *
 * "server-only" đảm bảo file này không bao giờ bị đóng gói xuống trình duyệt.
 */
const globalForDb = globalThis as unknown as { lmPool?: Pool };

function createPool(): Pool {
  return mysql.createPool({
    host: process.env.DB_HOST ?? "192.168.122.10",
    port: Number(process.env.DB_PORT ?? 3307),
    database: process.env.DB_NAME ?? "NewLaserMarking",
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "Spc123@@@",
    waitForConnections: true,
    connectionLimit: 10,
    // Trả DATETIME dạng chuỗi "YYYY-MM-DD HH:mm:ss" để không bị lệch múi giờ
    dateStrings: true,
    charset: "utf8mb4",
  });
}

// Giữ 1 pool duy nhất, tránh tạo thêm kết nối mỗi lần hot-reload khi dev
export const db: Pool = globalForDb.lmPool ?? createPool();
if (process.env.NODE_ENV !== "production") globalForDb.lmPool = db;