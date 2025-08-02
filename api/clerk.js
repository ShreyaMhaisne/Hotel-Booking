import connectDB from "../server/config/db.js";
import clerkWebhooks from "../server/controllers/clerkWebhook.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    await connectDB();
    await clerkWebhooks(req, res);
  } catch (err) {
    console.error("❌ Error in API:", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
