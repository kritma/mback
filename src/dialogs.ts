import express from 'express'
import { Database } from 'sqlite';
import { UserRequest, auth } from './auth';
var router = express.Router();

let db: Database;
type Dialog = { id: number, name: string, type: "CHAT" | "CONVERSATION", last_message: { text: string, name: string, image_url: string } | undefined }

async function getConversations(user_id: number) {
    const cons = await db.all<{ id: number, name: string }[]>("select c.id, iif(u1.id = ?, u1.name, u2.name) as name from conversations c join users u1 on u1.id = c.user1_id join users u2 on u2.id = c.user2_id where u1.id = ? or u2.id = ?", user_id, user_id, user_id)

    const dialogs: Dialog[] = []
    for (const ct of cons) {
        const lm = await db.get<{ text: string, name: string, image_url: string }>("select m.text, u.name, u.image_url from conversation_messages m join users u on u.id = u.sender_id where m.conversation_id = ? order by m.createdAt limit 1", +ct.id)
        dialogs.push({ id: ct.id, name: ct.name, type: 'CONVERSATION', last_message: lm })
    }
    return dialogs
}


router.get('/api/dialogs', auth, async (req, res) => {
    const dialogs: Dialog[] = []
    dialogs.push(...await getConversations((req as UserRequest).userId))
    res.json(dialogs)
})


export function dialogs(database: Database) {
    db = database
    return router
}