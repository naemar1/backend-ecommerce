
import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model.js';

async function generatedRefreshToken(userId) {
    const token = await jwt.sign(
        { id: userId },
        process.env.SECRET_KEY_REFRESH_TOKEN,
        { expiresIn: '20d' })

    const updateRefreshTokenUser = await UserModel.updateOne(
        { id: userId },
        {
            refresh_token: token
        }
    )

    return token;
}

export default generatedRefreshToken;