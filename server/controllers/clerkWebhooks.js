import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import { Webhook } from "svix";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    console.log("🔔 Webhook received");

    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    const payload = whook.verify(JSON.stringify(req.body), headers);

    const { data, type } = req.body;

    console.log("📦 Webhook type:", type);
    console.log("👤 Incoming data:", data);

    const userData = {
      _id: data.id,
      email: data.email_addresses?.[0]?.email_address || "",
      username: `${data.first_name || ""} ${data.last_name || ""}`,
      image: data.image_url,
      recentSearchedCities: [],
    };

    switch (type) {
      case "user.created":
        try {
          console.log("🚀 userData to save:", userData);
          await User.create(userData);
          console.log("✅ User created in MongoDB");
        } catch (error) {
          console.log("❌ Error saving user to MongoDB:", error.message);
        }
        break;

      case "user.updated":
        await User.findByIdAndUpdate(data.id, userData);
        console.log("✅ User updated");
        break;

      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        console.log("🗑️ User deleted");
        break;

      default:
        console.log("⚠️ Unhandled event type:", type);
        break;
    }

    res.json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.log("❌ Webhook error:", error.message);
    res.status(200).json({ success: false, message: error.message });
  }
});

export default router;
