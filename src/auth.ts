import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface UserRequest extends Request {
    userId: number
}
export function setAuthCookies(res: Response, userId: number) {
    const token = jwt.sign({ userId: userId }, process.env.TOKEN_KEY!, { expiresIn: "1h" });
    res.cookie("token", token, { maxAge: 1000 * 60 * 60, httpOnly: true })
}

export function getUser(req: Request): number | undefined {
    const token: string | undefined = req.cookies.token;

    if (!token) {
        return undefined
    }
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY!) as JwtPayload
        return decoded.userId
    } catch (err) {
        return undefined
    }
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
    const token: string | undefined = req.cookies.token;

    if (!token) {
        return res.status(403).json({ err: "A token is required for authentication" })
    }

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY!) as JwtPayload
        (req as UserRequest).userId = decoded.userId
    } catch (err) {
        return res.status(401).send({ err: "Invalid Token" })
    }
    return next()
};