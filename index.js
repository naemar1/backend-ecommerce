import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import connectDB from "./config/connectDB.js";
// Load environment variables
dotenv.config();
// importing routes
import userRouter from "./route/user.route.js";
import categoryRouter from "./route/category.route.js";
import productRouter from "./route/product.route.js";
import cartRouter from "./route/cart.route.js";
import homeSlidesRouter from "./route/homeSlides.route.js";
import addressRouter from './route/address.route.js';
import bannerV1Router from './route/bannerV1.route.js';
import myListRouter from './route/mylist.route.js';
import blogRouter from "./route/blog.route.js";
import orderRouter from "./route/order.route.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // handles OPTIONS preflight automatically
app.use(morgan("dev"));
app.use(
    helmet({
        crossOriginResourcePolicy: false,
    })
);
app.use(cookieParser());

// // Example API route
app.get("/", (request, response) => {
    response.json({ message: "server is running " + process.env.PORT });
});

app.use('/api/user', userRouter);
app.use('/api/category', categoryRouter);
app.use('/api/product', productRouter);
app.use('/api/address', addressRouter);
app.use('/api/bannerV1', bannerV1Router);
app.use('/api/cart', cartRouter);
app.use('/api/homeSlides', homeSlidesRouter);
app.use('/api/myList',myListRouter);
app.use('/api/blog',blogRouter);
app.use("/api/order", orderRouter); 

// Start server after DB connection
const PORT = process.env.PORT || 8000;
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Database connection failed:", err);
    });



