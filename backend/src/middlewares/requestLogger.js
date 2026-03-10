import morgan from "morgan";
import path from "path";
import fs from "fs";
import { createStream } from "rotating-file-stream";

const logDirectory = path.join(process.cwd(), "logs");

fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

const accessLogStream = createStream("access.log", {
  size: "10M",
  interval: "1d",
  path: logDirectory,
  maxFiles: 14,
  compress: "gzip",
});

export const requestLoggerFile = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream: accessLogStream },
);

export const requestLoggerConsole = morgan("dev");
