import mongoose from "mongoose";
import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
    try {
        // crete svix  instacnce with clerk webhook secret.
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

        //getting headers
        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };
        // verifying headers
        await whook.verify(JSON.stringify(req.body), headers);

        // getting data from request body
        const { data, type } = req.body

        const userData = new mongoose.Schema({
            _id: data.id,
            email: data.email_addresses[0].email_address,
            username: data.first_name + " " + data.last_name,
            image: data.image_url,
        }, { _id: false });

        // switch cases for different events
        switch (type) {
            case "user.created": {
                await User.create(userData);
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
                break;
        }
         res.json({ success: true, message: "Webhook Recieved" })
    } catch (error) {
        console.log(error.message);
         res.status(200).json({ success: false, message: error.message });
    }

}
export default clerkWebhooks;
