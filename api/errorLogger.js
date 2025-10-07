import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.join(__dirname, "error.log");

/**
 * Writes detailed error info into error.log
 */
export function logError(err, req) {
  const time = new Date().toISOString();

  let logEntry = `
================= ERROR =================
Time: ${time}
Message: ${err.message || err}
Stack:
${err.stack || "No stack trace"}

`;

  // Include request details if available
  if (req) {
    logEntry += `Request:
  URL: ${req.originalUrl}
  Method: ${req.method}
  IP: ${req.ip}
  Headers: ${JSON.stringify(req.headers, null, 2)}
  Body: ${JSON.stringify(req.body, null, 2)}

`;
  }

  logEntry += "======================================\n\n";

  // Write to file
  fs.appendFileSync(logFile, logEntry, "utf8");
}

/**
 * Express global error handler
 */
export function errorHandler(err, req, res, next) {
  console.error("🔥 Error middleware caught:", err);

  logError(err, req);

  res.status(500).json({
    success: false,
    error: "Unexpected Error!",
  });
}
