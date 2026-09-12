import dotenv from "dotenv";
import app from "./src/app.js";
import ConnectDB from "./src/config/db.js";

dotenv.config();

const requiredEnv = ["MONGODB_URI", "JWT_SECRET"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]?.trim());

if (missingEnv.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnv.join(", ")}`
  );
  console.error("Check Backend/.env and restart the server.");
  process.exit(1);
}

ConnectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


