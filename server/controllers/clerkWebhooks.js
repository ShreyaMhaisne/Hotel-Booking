import mongoose from "mongoose";
import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
    try {
        console.log("🔔 Webhook received");
        // crete svix  instacnce with clerk webhook secret.
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

        //getting headers
        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };
        // verifying headers
        const payload = whook.verify(JSON.stringify(req.body), headers);

        // getting data from request body
        const { data, type } = req.body

        console.log("📦 Webhook type:", type);
        console.log("👤 Incoming data:", data);

        const userData = {
            _id: data.id,
            email: data.email_addresses?.[0]?.email_address || "",
            username: `${data.first_name || " "} ${data.last_name || ""}`,
            image: data.image_url,
            recentSearchedCities: [],
        };

        // switch cases for different events
        switch (type) {
            case "user.created": {
                await User.create(userData);
                console.log("✅ User created in MongoDB");
                break;
            }

            case "user.updated": {

                await User.findByIdAndUpdate(data.id, userData);
                console.log("user updated");
                break;

            }
            case "user.deleted": {
                await User.findByIdAndDelete(data.id);
                console.log("user deleted");
                break;
            }

            default:
                console.log("⚠️ Unhandled event type");
                break;
        }
        res.json({ success: true, message: "Webhook Recieved" })
    } catch (error) {
        console.log(error.message);
        res.status(200).json({ success: false, message: error.message });
    }

}
export default clerkWebhooks;
