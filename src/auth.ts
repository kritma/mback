import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface UserRequest extends Request {
    userId: number
}

export function clearCookies(res: Response) {
    res.clearCookie("token")
}

export function setAuthCookies(res: Response, userId: number) {
    const token = jwt.sign({ userId }, process.env.TOKEN_KEY!, { expiresIn: "1d" });
    res.cookie("token", token, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true, secure: true, sameSite: "none" })
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
        res.status(401).send()
        return
    }

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY!) as JwtPayload
        (req as UserRequest).userId = decoded.userId
    } catch (err) {
        res.status(401).send()
        return
    }
    return next()
};