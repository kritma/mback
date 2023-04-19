import express from 'express'
import { Database } from 'sqlite';
import md5 from 'md5'
import { UserRequest, auth, setAuthCookies } from './auth';

var router = express.Router();
let db: Database;

async function register(name: string, password: string) {
    return new Promise<number>((resolve, reject) => {
        db.db.run("insert into users (name, password_hash) values (?, ?)", [name, md5(password)], function (err: any) {
            if (err) {
                reject(err)
            }
            resolve(this.lastID)
        })
    })
}

router.post('/api/login', async (req, res) => {
    const { name, password } = req.body as { name: string, password: string }
    if (name === undefined || password === undefined) {
        res.status(400).json({ err: "INVALID_NAME_OR_PASSWORD" })
        return
    }
    const user = await db.get<{ id: number, name: string, image_url: string, password_hash: string }>("select id, name, image_url, password_hash from users where name = ?", name)
    if (user === undefined) {
        if (/^[a-z0-9_]+$/i.test(name)) {
            const id = await register(name, password)
            setAuthCookies(res, id)
            res.json({ id, name, image_url: null })
        } else {
            res.status(404).json({ err: "INVALID_NAME_OR_PASSWORD" })
        }
        return
    }

    if (user.password_hash === md5(password)) {
        setAuthCookies(res, user.id)
        res.json({ id: user.id, name: user.name, image_url: user.image_url })
    } else {
        res.status(403).json({ err: "INVALID_NAME_OR_PASSWORD" })
    }
})

router.get('/api/login', auth, async (req, res) => {
    setAuthCookies(res, (req as UserRequest).userId)
    res.status(200).send()
})

export function login(database: Database) {
    db = database
    return router
}