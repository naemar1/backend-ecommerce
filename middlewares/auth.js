import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

const auth = async (request, response, next) => {
    try {
        // Get token from cookies or Authorization header
        const token =
            request.cookies?.accessToken ||
            request?.headers?.authorization?.split(" ")[1];

        // If no token, return 401 Unauthorized
        if (!token) {
            return response.status(401).json({
                message: "Provide token",
            });
        }

        if (!token && request.headers?.authorization) {
            token = request.headers.authorization.split(" ")[1];
        }

        if (!token && request.query?.token) {
            token = request.query.token;
        }

        if (!token) {
            return response.status(401).json({
                message: "No token provided",
                error: true,
                success: false
            });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
        request.userId = decoded.id;
        request.user = await UserModel.findById(request.userId).select("-password -refresh_token");

        next();
    } catch (error) {
        return response.status(401).json({
            message: "Invalid or expired token",
            error: true,
            success: false
        });
    }
};

export default auth;
