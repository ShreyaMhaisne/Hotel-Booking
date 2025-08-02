import User from "../models/User.js";
import { buffer } from "micro";
import { Webhook } from "svix";



const clerkWebhooks = async (req, res) => {
    try {
        console.log("📩 Clerk Webhook Hit");

        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };
        console.log("📦 Headers Received:", headers);

        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)
        const payload = (await buffer(req)).toString();
        console.log("🛡️ Clerk Secret Key:", process.env.CLERK_WEBHOOK_SECRET);
        const evt = whook.verify(payload, headers);
        // await whook.verify(JSON.stringify(req.body),headers);

        const { data, type } = JSON.parse(payload);
        console.log("✅ Final parsed type:", type);
        console.log("✅ Final user payload:", JSON.stringify(data, null, 2));

        console.log("✅ Webhook Type:", type);
        console.log("🧑‍💻 Clerk Data:", data);

        const userData = {
            _id: data.id,
            email: data.email_addresses[0].email_address,
            username: data.first_name + " " + data.last_name,
            image: data.image_url,
        };
        // switch cases for different events
        console.log("📄 Parsed User Data:", userData);

        switch (type) {
            case "user.created":
                try {
                    console.log("📝 Attempting to create user in MongoDB...");
                    console.log("📄 Data being saved:", userData);
                    await User.create(userData);
                    console.log("user created saved to mongodb");
                } catch (err) {
                    console.log("error creating user", err.message);
                }
                break;

            case "user.updated":
                try {
                    await User.findByIdAndUpdate(data.id, userData);
                    console.log("user updated");
                } catch (err) {
                    console.log("error updating user", err.message);
                }
                break;


            case "user.deleted":
                try {
                    await User.findByIdAndDelete(data.id);
                    console.log("user deleted");
                } catch (err) {
                    console.log("error deletd user", err.message);
                }
                break;
            case "session.created":
                try {
                    await User.findByIdAndUpdate(data.user_id, {
                        $push: {
                            activity: {
                                type: "login",
                                timestamp: new Date(),
                            },
                        },
                    });
                    console.log("🟢 Login activity recorded");
                } catch (err) {
                    console.log("❌ Error logging login:", err.message);
                }
                break;

            // ✅ Add this block to track logout
            case "session.ended":
                try {
                    await User.findByIdAndUpdate(data.user_id, {
                        $push: {
                            activity: {
                                type: "logout",
                                timestamp: new Date(),
                            },
                        },
                    });
                    console.log("🔴 Logout activity recorded");
                } catch (err) {
                    console.log("❌ Error logging logout:", err.message);
                }
                break;

            default:
                console.log("unhandled event :", type);

                break;
        }
        return res.status(200).json({ success: true, message: "Webhook Recieved" })
    } catch (error) {
        console.log(error.message);
        return res.status(200).json({ success: false, message: error.message });
    }

};

export default clerkWebhooks;


export const config = {
    api: {
        bodyParser: false, // ⛔ disables Next.js JSON parsing
    },
};