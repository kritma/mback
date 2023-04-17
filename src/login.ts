import express from 'express'
import { Database } from 'sqlite';
import md5 from 'md5'
import { setAuthCookies } from './auth';

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
        res.status(400).json({ err: "Error" })
        return
    }
    const user = await db.get<{ id: number, password_hash: string }>("select id, password_hash from users where name = ?", name)
    if (user === undefined) {
        if (/^[a-z0-9_]+$/i.test(name)) {
            const id = await register(name, password)
            setAuthCookies(res, id)
            res.json({})
        } else {
            res.json({ err: "WRONG_NAME" })
        }
        return
    }

    if (user.password_hash === md5(password)) {
        setAuthCookies(res, user.id)
        res.json({})
    } else {
        res.json({ err: "WRONG_PASS" })
    }
})

export function login(database: Database) {
    db = database
    return router
}