import dotenv from "dotenv";
import app from "./app.js";
import { connectDb, createCollections } from "./src/config/db.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const startServer = async () => {
  try {
    await connectDb();
    await createCollections();

    app.listen(PORT, HOST, () => {
      console.log(`Server started on  ${HOST}:${PORT} `);
    });
  } catch (error) {
    console.error("Server startup error:", error.message);
    process.exit(1);
  }
};

startServer();
