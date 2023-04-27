import express from 'express'
import { Database } from 'sqlite';
import { UserRequest, auth } from '../auth';
import { Post, getUserPosts } from '../getUserPosts';
import { imageOrDefault } from '../imageOrDefault';

var router = express.Router();
let db: Database;

router.get('/api/news', auth, async (req, res) => {
    let userId = (req as UserRequest).userId
    const users = await db.all<{ id: number, name: string, image_url: string | null }[]>("select u.id, u.name, u.image_url from followers f join users u on u.id = f.follows_id where f.user_id = ?", userId)
    const posts: Post[] = []
    for (const user of users) {
        user.image_url = imageOrDefault(user.image_url)
        posts.push(...await getUserPosts(db, user))
    }
    posts.sort((a, b) => b.created_at - a.created_at)
    res.json(posts)
})


export function news(database: Database) {
    db = database
    return router
}