import clerkWebhooks from "../controllers/clerkWebhook.js";
import connectDB from "../config/db.js";

export default async function handler(req, res) {
  await connectDB();
  await clerkWebhooks(req, res);
}
