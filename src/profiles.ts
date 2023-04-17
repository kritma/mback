import express from 'express'
import { Database } from 'sqlite';
import { getUser } from './auth';

var router = express.Router();
let db: Database;

router.get('/api/profiles/:name', async (req, res) => {
    const user = await db.get<{ id: number, name: string, image_url: string | null }>("select id, name, image_url from users where name = ? limit 1", req.params.name)
    if (user === undefined) {
        res.json({ err: "NOT_FOUND" })
        return
    }

    const posts = await db.all<{ id: number, description: string }[]>("select id, description, created_at from post where p.user_id = ?", user.id)
    const posts_with_files: { id: number, description: string, files: string[], images: string[] }[] = []
    for (const p of posts) {
        const all_files = await db.all<string[]>("select url from post_files where postId = ?", p.id)
        const images = []
        const files = []
        for (const file of all_files) {
            if (/\.(apng|avif|gif|jpg|jpeg|jfif|pjpeg|pjp|png|svg|webp)$/i.test(file)) {
                images.push(file)
            } else {
                files.push(file)
            }
        }
        posts_with_files.push({ ...p, files, images })
    }

    let conversation_id: null | number = null
    const user_id = getUser(req);
    if (user_id !== undefined) {
        const conversation = await db.get<{ id: number }>("select id from conversations user1_id = ? and user2_id = ? or user2_id = ? and user1_id = ? limit 1", user.id, user_id, user.id, user_id)
        if (conversation !== undefined) {
            conversation_id = conversation.id
        }
    }

    res.json({ user, posts, conversation_id })
})

export function profiles(database: Database) {
    db = database
    return router
}