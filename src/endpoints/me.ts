import express from 'express'
import { Database } from 'sqlite';
import { UserRequest, auth, clearCookies, setAuthCookies } from '../auth';
import { imageOrDefault } from '../imageOrDefault';
import { upload } from '../upload';
import { getUserPosts } from '../getUserPosts';

var router = express.Router();
let db: Database;

router.get('/api/me', auth, async (req, res) => {
    const user = await db.get<{ id: number, name: string, image_url: string | null }>("select id, name, image_url from users where id = ?", (req as UserRequest).userId)
    user!.image_url = imageOrDefault(user!.image_url)
    res.json(user)
})

router.get('/api/me/logout', auth, async (req, res) => {
    clearCookies(res)
    res.send()
})


router.get('/api/me/posts', auth, async (req, res) => {
    const user = await db.get<{ id: number, name: string, image_url: string | null }>("select id, name, image_url from users where id = ?", (req as UserRequest).userId)
    user!.image_url = imageOrDefault(user!.image_url)
    const posts = await getUserPosts(db, user!)
    res.json(posts)
})

router.post('/api/me', auth, upload.single("image"), async (req, res) => {
    const user = await db.get<{ id: number, name: string, image_url: string | null }>("update users set image_url = ? where id = ?", req.file?.path, (req as UserRequest).userId)
    res.send()
})


export function me(database: Database) {
    db = database
    return router
}