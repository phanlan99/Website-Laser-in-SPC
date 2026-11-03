import { Be_Vietnam_Pro } from "next/font/google";

/**
 * Font dùng chung cho toàn giao diện.
 * Be Vietnam Pro: sans-serif hiện đại, dễ đọc, hỗ trợ dấu tiếng Việt rất tốt.
 */
export const appFont = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});