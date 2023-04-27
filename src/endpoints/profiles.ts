import express from 'express'
import { Database } from 'sqlite';
import { getUserPosts } from '../getUserPosts';
import { imageOrDefault } from '../imageOrDefault';

var router = express.Router();
let db: Database;

router.get('/api/profiles/:name', async (req, res) => {
    const user = await db.get<{ id: number, name: string, image_url: string | null }>("select id, name, image_url from users where name = ? limit 1", req.params.name)

    if (user === undefined) {
        res.json({ err: "NOT_FOUND" })
        return
    }

    user.image_url = imageOrDefault(user.image_url)

    const posts = await getUserPosts(db, user)

    res.json({ user, posts })
})

export function profiles(database: Database) {
    db = database
    return router
}