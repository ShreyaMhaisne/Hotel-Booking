import User from "../models/User.js";
import { Webhook } from "svix";
import { clerkClient } from "@clerk/clerk-sdk-node"; // ✅ added this

const clerkWebhooks = async (req, res) => {
  try {
    console.log("Received Clerk Webhook:", req.body);

    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // getting headers
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    // verifying headers
    const payload = whook.verify(JSON.stringify(req.body), headers);

    const { data, type } = req.body;

    console.log("📦 Webhook type:", type);
    console.log("👤 Incoming data:", data);

    let userData = {
      _id: data.id,
      email: "", // will be populated from Clerk API
      username: `${data.first_name || ""} ${data.last_name || ""}`,
      image: data.image_url,
      recentSearchedCities: [],
    };

    switch (type) {
      case "user.created": {
        try {
          // ✅ Fetch full user details from Clerk
          const fullUser = await clerkClient.users.getUser(data.id);

          userData = {
            _id: fullUser.id,
            email: fullUser.emailAddresses?.[0]?.emailAddress || "",
            username: `${fullUser.firstName || ""} ${fullUser.lastName || ""}`,
            image: fullUser.imageUrl,
            recentSearchedCities: [],
          };

          console.log("🚀 userData to save:", userData);
          await User.create(userData);
          console.log("✅ User created in MongoDB");
        } catch (error) {
          console.log("❌ Error saving user to MongoDB:", error.message);
        }
        break;
      }

      case "user.updated": {
        try {
          const fullUser = await clerkClient.users.getUser(data.id);

          userData = {
            email: fullUser.emailAddresses?.[0]?.emailAddress || "",
            username: `${fullUser.firstName || ""} ${fullUser.lastName || ""}`,
            image: fullUser.imageUrl,
          };

          await User.findByIdAndUpdate(data.id, userData);
          console.log("🔄 User updated in MongoDB");
        } catch (error) {
          console.log("❌ Error updating user:", error.message);
        }
        break;
      }

      case "user.deleted": {
        try {
          await User.findByIdAndDelete(data.id);
          console.log("🗑️ User deleted from MongoDB");
        } catch (error) {
          console.log("❌ Error deleting user:", error.message);
        }
        break;
      }

      default:
        console.log("⚠️ Unhandled event type");
        break;
    }

    res.json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.log("❌ Error in webhook handler:", error.message);
    res.status(200).json({ success: false, message: error.message });
  }
};

export default clerkWebhooks;
