import express from 'express'
import { Database } from 'sqlite';
import { UserRequest, auth, getUser } from '../auth';

var router = express.Router();
let db: Database;

router.post('/api/subscriptions', auth, async (req, res) => {
    console.debug("optimize this");

    let userId = (req as UserRequest).userId
    if (req.body.to) {
        await db.run("insert into followers values (?, ?)", userId, req.body.userId)
    } else {
        await db.run("delete from followers where user_id = ? and follows_id = ?", userId, req.body.userId)
    }
    res.send()
})

router.get('/api/subscriptions/:id', async (req, res) => {
    let id = getUser(req)
    if (id === undefined) {
        res.json({ isSubscribed: false })
        return
    }
    let follows = await db.get<{ follows_id: number }>("select follows_id from followers where user_id = ? and follows_id = ?", id, +req.params.id)

    if (follows === undefined) {
        res.json({ isSubscribed: false })
        return
    }
    res.json({ isSubscribed: true })
})

export function subscriptions(database: Database) {
    db = database
    return router
}