import express from 'express'
import { Database } from 'sqlite';
import { UserRequest, auth } from '../auth';
var router = express.Router();

let db: Database;

function addConversation(user1_id: number, user2_id: number) {
    return new Promise<number>((resolve, reject) => {
        db.db.run("insert into conversations (user1_id, user2_id) values (?, ?)", [user1_id, user2_id], function (err: any) {
            if (err) {
                reject(err)
            }
            resolve(this.lastID)
        })
    })
}

router.post('/api/conversations', auth, async (req, res) => {
    const user1_id = (req as UserRequest).userId
    const user2_id = +req.body.userId
    let data = await db.get<{ conversation_id: number }>("select id from conversations where user1_id = ? and user2_id = ? or user2_id = ? and user1_id = ? limit 1", user1_id, user2_id, user1_id, user2_id);


    if (data === undefined) {
        res.json({ conversation_id: await addConversation(user1_id, user2_id) })
        return
    }

    res.send({ conversation_id: data.conversation_id })
})


export function conversations(database: Database) {
    db = database
    return router
}