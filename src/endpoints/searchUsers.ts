import express from 'express'
import { Database } from 'sqlite';
import { imageOrDefault } from '../imageOrDefault';

var router = express.Router();
let db: Database;

router.get('/api/search/users/:name', async (req, res) => {
    const users = await db.all<{ id: number, name: string, image_url: string | null }[]>("select id, name, image_url from users where name like ? order by length(name)", `%${req.params.name}%`)
    users.forEach(user => user.image_url = imageOrDefault(user.image_url))
    res.json(users)
})


export function searchUsers(database: Database) {
    db = database
    return router
}