import express from 'express'
import { UserRequest, auth } from '../auth';
import { upload } from '../upload';
import { imageOrDefault } from '../imageOrDefault';
import { spitFilesIntoCategories } from '../spitFilesIntoCategories';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../database';

export const conversation_messages = express.Router();


conversation_messages.get('/api/conversations/:id/messages', auth, async (req, res) => {
    let conId = +req.params.id
    let userId = (req as UserRequest).userId

    let con = (await pool.execute<({ user1_id: number, user2_id: number } & RowDataPacket)[]>("select user1_id, user2_id from conversations where id = ? limit 1", [conId]))[0][0]
    if (con === undefined) {
        res.json({ err: "WRONG_ID" })
        return
    }

    if (userId !== con.user1_id && userId !== con.user2_id) {
        res.json({ err: "PERMISSION_DENIED" })
        return
    }

    let messages = (await pool.execute<({ id: number, sender_id: number, sender_image_url: string, sender_name: string, text: string, created_at: Date } & RowDataPacket)[]>("select cm.id, cm.sender_id, u.image_url as sender_image_url, u.name as sender_name, cm.text, cm.created_at from conversation_messages cm join users u on u.id = cm.sender_id where cm.conversation_id = ? order by cm.created_at", [conId]))[0]
    let messagesExtra: {
        id: number, sender_id: number, sender_image_url: string,
        sender_name: string, is_send_by_user: boolean, text: string, created_at: Date,
        images: string[], music: string[], videos: string[], files: string[]
    }[] = []

    for (const m of messages) {
        m.sender_image_url = imageOrDefault(m.sender_image_url)
        const allFiles = (await pool.execute<({ url: string } & RowDataPacket)[]>("select url from conversation_message_files where conversation_message_id = ?", [m.id]))[0]
        messagesExtra.push({ ...m, ...spitFilesIntoCategories(allFiles.map(file => file.url)), is_send_by_user: m.sender_id === userId })
    }

    res.json(messagesExtra)
})

async function addConversationMessage(conId: number, text: string, senderId: number) {
    const res = (await pool.execute<ResultSetHeader>("insert into conversation_messages (conversation_id, sender_id, text) values (?, ?, ?)", [conId, senderId, text]))[0]
    return res.insertId
}

conversation_messages.post('/api/conversations/:conversationId/messages', upload.array("files"), async (req, res) => {
    const text = req.body.text
    const conversationId = +req.params.conversationId
    const userId = (req as UserRequest).userId

    const conversation = (await pool.execute<({ user1_id: number, user2_id: number } & RowDataPacket)[]>("select user2_id, user1_id from conversations where id = ? limit 1", [conversationId]))[0][0]


    if (conversation === undefined) {
        res.json({ err: "WRONG_ID" })
        return
    }

    if (userId !== conversation.user1_id && userId !== conversation.user2_id) {
        res.json({ err: "PERMISSION_DENIED" })
        return
    }

    const id = await addConversationMessage(conversationId, text, userId)

    let files = req.files as Express.Multer.File[] | undefined
    if (files !== undefined) {
        for (const file of files) {
            await pool.execute("insert into conversation_message_files (conversation_message_id, url) values (?, ?)", [id, file.path])
        }
    }
    res.status(200).send()
})
