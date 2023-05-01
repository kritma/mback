import express from 'express'
import { UserRequest } from '../auth';
import { pool } from '../database';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export const conversations = express.Router();

async function addConversation(user1_id: number, user2_id: number) {
    const res = (await pool.execute<ResultSetHeader>("insert into conversations (user1_id, user2_id) values (?, ?)", [user1_id, user2_id]))[0]
    return res.insertId
}

conversations.post('/api/conversations', async (req, res) => {
    const user1_id = (req as UserRequest).userId
    const user2_id = +req.body.userId
    let data = (await pool.execute<({ conversation_id: number } & RowDataPacket)[]>("select id from conversations where user1_id = ? and user2_id = ? or user2_id = ? and user1_id = ? limit 1", [user1_id, user2_id, user1_id, user2_id]))[0][0];

    if (data === undefined) {
        res.json({ conversation_id: await addConversation(user1_id, user2_id) })
        return
    }

    res.send({ conversation_id: data.conversation_id })
})