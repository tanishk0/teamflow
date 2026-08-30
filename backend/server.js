import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import mongoose from "mongoose"
import authRoutes from "./src/routes/authRoute.js"
import workspaceRoutes from "./src/routes/workspaceRoute.js"
import invitationRoutes from "./src/routes/invitationRoute.js"
import cookieParser from "cookie-parser";
dotenv.config();

const app = express()

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json())
app.use(cookieParser());

//

app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/invitations", invitationRoutes);


// base req
app.get("/" , (req , res)=> {
    res.json({message: "Teamflow API running"})
})

//connecting db
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("MongoDB Connected Successfully")
    }
    catch (error) {
        console.error("MongoDB Connection Failed" , error.message);
        process.exit(1);
    }
}

const PORT = process.env.PORT

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});