import connectDB from "../server/config/db.js";
import clerkWebhooks from "../server/controllers/clerkWebhook.js";

export default async function handler(req, res) {
  if (req.method === "POST") {
    await connectDB(); // Connect to MongoDB
    await clerkWebhooks(req, res); // Handle Clerk webhook
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
