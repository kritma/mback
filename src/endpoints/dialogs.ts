import express from 'express'
import { UserRequest } from '../auth';
import { imageOrDefault } from '../imageOrDefault';
import { pool } from '../database';
import { RowDataPacket } from 'mysql2';


export const dialogs = express.Router();

type Dialog = { id: number, name: string, type: "chats" | "conversations", image_url: string, last_message: { text: string, name: string, image_url: string } | null }

async function getConversations(user_id: number) {
    const cons = (await pool.execute<({ id: number, name: string, image_url: string | null } & RowDataPacket)[]>("select c.id, if(u1.id = ?, u2.name, u1.name) as name, if(u1.id = ?, u2.image_url, u1.image_url) as image_url from conversations c join users u1 on u1.id = c.user1_id join users u2 on u2.id = c.user2_id where c.user1_id = ? or c.user2_id = ?", [user_id, user_id, user_id, user_id]))[0]

    const dialogs: Dialog[] = []
    for (const ct of cons) {
        ct.image_url = imageOrDefault(ct.image_url)
        const lm = (await pool.query<({ text: string, name: string, image_url: string | null } & RowDataPacket)[]>("select m.text, u.name, u.image_url from conversation_messages m join users u on u.id = m.sender_id where m.conversation_id = ? order by m.created_at desc limit 1", [+ct.id]))[0][0]
        if (lm === undefined) {
            dialogs.push({ id: ct.id, name: ct.name, type: 'conversations', image_url: ct.image_url, last_message: null })
            continue
        }
        dialogs.push({ id: ct.id, name: ct.name, type: 'conversations', image_url: ct.image_url, last_message: { ...lm, image_url: imageOrDefault(lm.image_url) } })
    }

    return dialogs
}


dialogs.get('/api/dialogs', async (req, res) => {
    const dialogs: Dialog[] = []
    dialogs.push(...await getConversations((req as UserRequest).userId))
    res.json(dialogs)
})

