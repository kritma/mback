import express from 'express'
import { getUserPosts } from '../getUserPosts';
import { imageOrDefault } from '../imageOrDefault';
import { pool } from '../database';
import { RowDataPacket } from 'mysql2';

export const profiles = express.Router();

profiles.get('/api/profiles/:name', async (req, res) => {
    const user = (await pool.execute<({ id: number, name: string, image_url: string | null } & RowDataPacket)[]>("select id, name, image_url from users where name = ? limit 1", req.params.name))[0][0]

    if (user === undefined) {
        res.json({ err: "NOT_FOUND" })
        return
    }

    user.image_url = imageOrDefault(user.image_url)

    const posts = await getUserPosts(user)

    res.json({ user, posts })
})

