import express from 'express'
import { Database } from 'sqlite';

var router = express.Router();
let db: Database;

router.get('/api/search/users/:name', async (req, res) => {
    const users = await db.all<{ id: number, name: string, image_url: string | null }>("select id, name, image_url from users where name like ?", `%${req.params.name}%`)
    res.json(users)
})

export function searchUsers(database: Database) {
    db = database
    return router
}