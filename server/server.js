import express from "express";
import cors from "cors";
import 'dotenv/config';
import connectDB from "./config/connect.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";

const PORT = 5000;

const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/api/auth", authRoutes);

connectDB()
.then(()=>{
    app.listen(PORT,()=> console.log("Server running"))}) // console
.catch((err)=>console.log("DB Connection Failed", err)) // console

app.get('/',(req,res)=>res.send("App running..")); // response
app.use("/api/user",userRoutes)
app.use("/api/admin", adminRoutes);
app.use("/api/seller", sellerRoutes);

app.listen(PORT, () =>
  console.log("Server running on port: http://localhost:" + PORT)
); // console

