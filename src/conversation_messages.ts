import express from 'express'
import { Database } from 'sqlite';
import { UserRequest, auth } from './auth';
import { upload } from './upload';
var router = express.Router();

let db: Database;

router.get('/api/conversations/:id/messages', auth, async (req, res) => {
    let conId = +req.params.id
    let userId = (req as UserRequest).userId
    let con = await db.get<{ user1_id: number, user2_id: number }>("select user1_id, user1_id from conversations where id = ?", conId)
    if (con === undefined) {
        res.json({ err: "WRONG_ID" })
        return
    }

    if (userId !== con.user1_id && userId !== con.user2_id) {
        res.json({ err: "PERMISSION_DENIED" })
        return
    }

    let messages = await db.all<{ id: number, sender_id: number, sender_image_url: string, sender_name: string, text: string, created_at: Date }[]>("select cm.id, cm.sender_id, u.image_url as sender_image_url, u.name as sender_name, cm.text, cm.created_at from conversation_messages cm join users u on u.id = cm.sender_id where cm.conversation_id = ? order by cm.created_at", conId)
    let messages_with_files: { id: number, sender_id: number, sender_image_url: string, sender_name: string, text: string, created_at: Date, images: string[], files: string[] }[] = []

    for (const m of messages) {
        const all_files = await db.all<string[]>("select url from conversation_message_files where conversation_message_id = ?", m.id)
        const images = []
        const files = []
        for (const file of all_files) {
            if (/\.(apng|avif|gif|jpg|jpeg|jfif|pjpeg|pjp|png|svg|webp)$/i.test(file)) {
                images.push(file)
            } else {
                files.push(file)
            }
        }
        messages_with_files.push({ ...m, files, images })
    }
    res.json(messages_with_files)
})

function addConversationMessage(conId: number, text: string, senderId: number) {
    return new Promise<number>((resolve, reject) => {
        db.db.run("insert into conversation_messages (conversation_id, sender_id, text, created_at) values (?, ?)", [conId, senderId, text, new Date()], function (err: any) {
            if (err) {
                reject(err)
            }
            resolve(this.lastID)
        })
    })
}

router.post('/api/conversations/:id/messages', auth, upload.array("files"), async (req, res) => {
    const conId = +req.params.id
    const userId = (req as UserRequest).userId
    const con = await db.get<{ user1_id: number, user2_id: number }>("select user1_id, user1_id from conversations where id = ?", conId)
    if (con === undefined) {
        res.json({ err: "WRONG_ID" })
        return
    }

    if (userId !== con.user1_id && userId !== con.user2_id) {
        res.json({ err: "PERMISSION_DENIED" })
        return
    }

    const id = await addConversationMessage(conId, req.body.text, userId)
    let files = req.files as Express.Multer.File[] | undefined
    if (files !== undefined) {
        for (const file of files) {
            await db.run("insert into conversation_message_files (conversation_message_id, url) values (?, ?)", id, file.path)
        }
    }
    res.status(200).send()
})



export function conversation_messages(database: Database) {
    db = database
    return router
}