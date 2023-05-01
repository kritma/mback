import express from 'express'
import { UserRequest, auth, getUser } from '../auth';
import { pool } from '../database';
import { RowDataPacket } from 'mysql2';

export const subscriptions = express.Router();

subscriptions.post('/api/subscriptions', async (req, res) => {
    let userId = (req as UserRequest).userId
    if (req.body.to) {
        await pool.execute("insert into followers (user_id, follows_id) values (?, ?)", [userId, req.body.userId])
    } else {
        await pool.execute("delete from followers where user_id = ? and follows_id = ?", [userId, req.body.userId])
    }
    res.send()
})

subscriptions.get('/api/subscriptions/:id', auth, async (req, res) => {
    let userId = (req as UserRequest).userId

    let follows = (await pool.execute<({ follows_id: number } & RowDataPacket)[]>("select follows_id from followers where user_id = ? and follows_id = ?", [userId, +req.params.id]))[0]

    if (follows.length === 0) {
        res.json({ isSubscribed: false })
        return
    }

    res.json({ isSubscribed: true })
})
