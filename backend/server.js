import dotenv from "dotenv";
import app from "./app.js";
import { connectDb, createCollections } from "./src/config/db.js";
import { seedData } from "./src/seeds/seed.js";
import { seedUsers } from "./src/seeds/seedUsers.js";
import seedAnalytics from "./src/seeds/seed-analytics.js";
import { seedCropCompability } from "./src/seeds/seedCropCompatibility.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDb();
    await createCollections();

    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error.message);
    process.exit(1);
  }
};

startServer();
