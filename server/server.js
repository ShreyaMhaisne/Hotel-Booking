import express from "express"
import "dotenv/config";
import cors from "cors";
import connectDB from "./config/db.js";
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./controllers/clerkWebhooks.js";

connectDB()
const app = express()
app.use(cors())


// middleware
app.use(express.json())
app.use(clerkMiddleware())

// Api to listen to clerk webhook
app.use("/api/clerk",clerkWebhooks);

app.get('/',(req,res)=>res.send("API is working"))

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=> console.log(`server running on port ${PORT}`));