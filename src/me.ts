import express from 'express'
import { Database } from 'sqlite';
import { UserRequest, auth } from './auth';

var router = express.Router();
let db: Database;

router.get('/api/me', auth, async (req, res) => {
    const user = await db.get<{ id: number, name: string, image_url: string | null }>("select id, name, image_url from users where id = ?", (req as UserRequest).userId)
    if (user === undefined) {
        res.json({ err: "NOT_FOUND" })
        return
    }
    res.json(user)
})

export function me(database: Database) {
    db = database
    return router
}