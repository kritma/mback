import express from 'express'
import { UserRequest, clearCookies } from '../auth';
import { imageOrDefault } from '../imageOrDefault';
import { upload } from '../upload';
import { getUserPosts } from '../getUserPosts';
import { pool } from '../database';
import { RowDataPacket } from 'mysql2';

export const me = express.Router();

me.get('/api/me', async (req, res) => {
    const user = (await pool.execute<({ id: number, name: string, image_url: string | null } & RowDataPacket)[]>("select id, name, image_url from users where id = ?", [(req as UserRequest).userId]))[0][0]
    user!.image_url = imageOrDefault(user!.image_url)
    res.json(user)
})

me.get('/api/me/logout', async (req, res) => {
    clearCookies(res)
    res.send()
})

me.get('/api/me/posts', async (req, res) => {
    const user = (await pool.execute<({ id: number, name: string, image_url: string | null } & RowDataPacket)[]>("select id, name, image_url from users where id = ?", [(req as UserRequest).userId]))[0][0]
    user.image_url = imageOrDefault(user.image_url)
    const posts = await getUserPosts(user)
    res.json(posts)
})

me.post('/api/me', upload.single("image"), async (req, res) => {
    await pool.execute("update users set image_url = ? where id = ?", [req.file?.path, (req as UserRequest).userId])
    res.send()
})
