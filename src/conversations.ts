import express from 'express'
import { Database } from 'sqlite';
import { UserRequest, auth } from './auth';
var router = express.Router();

let db: Database;

router.post('/api/conversations', auth, async (req, res) => {
    let userId = (req as UserRequest).userId
    let friendId = +req.body.userId
    await db.run("insert into conversations (user1_id, user2_id) values (?, ?)", userId, friendId)
    res.status(200).send()
})


export function conversations(database: Database) {
    db = database
    return router
}