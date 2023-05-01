import express from 'express'
import { UserRequest } from '../auth';
import { Post, getUserPosts } from '../getUserPosts';
import { imageOrDefault } from '../imageOrDefault';
import { pool } from '../database';
import { RowDataPacket } from 'mysql2';

export const news = express.Router();

news.get('/api/news', async (req, res) => {
    let userId = (req as UserRequest).userId
    const users = (await pool.execute<({ id: number, name: string, image_url: string | null } & RowDataPacket)[]>("select u.id, u.name, u.image_url from followers f join users u on u.id = f.follows_id where f.user_id = ?", [userId]))[0]
    const posts: Post[] = []
    for (const user of users) {
        user.image_url = imageOrDefault(user.image_url)
        posts.push(...await getUserPosts(user))
    }
    posts.sort((a, b) => a.created_at > b.created_at ? -1 : a.created_at < b.created_at ? 1 : 0)
    res.json(posts)
})
