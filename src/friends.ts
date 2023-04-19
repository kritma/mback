import express from 'express'
import { Database } from 'sqlite';
import { UserRequest, auth } from './auth';

var router = express.Router();
let db: Database;

router.get('/api/friends', auth, async (req, res) => {
    let userId = (req as UserRequest).userId
    const users = await db.all<{ id: number, name: string, image_url: string | null }>("select u.id, u.name, u.image_url from friends f where iif(f.user1_id = ?, f.user1_id, f.user2_id) = u.id and (f.user1_id = ? or f.user2_id = ?)", userId, userId, userId)
    res.json(users)
})

router.post('/api/friends', auth, async (req, res) => {
    let userId = (req as UserRequest).userId
    await db.run("insert into friends values (?, ?)", userId, req.body.id)
    res.status(200).send()
})

export function friends(database: Database) {
    db = database
    return router
}