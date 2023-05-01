import express from 'express'
import md5 from 'md5'
import { setAuthCookies } from '../auth';
import { pool } from '../database';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export const login = express.Router();

async function register(name: string, password: string) {
    let res = (await pool.execute<ResultSetHeader>("insert into users (name, password_hash) values (?, ?)", [name, md5(password)]))[0]
    return res.insertId
}

login.post('/api/login', async (req, res) => {
    console.debug("needs check")

    const { name, password } = req.body as { name: string, password: string }
    if (name === undefined || password === undefined) {
        res.json({ err: "INVALID_NAME_OR_PASSWORD" })
        return
    }
    const user = (await pool.execute<({ id: number, name: string, image_url: string, password_hash: string } & RowDataPacket)[]>("select id, name, image_url, password_hash from users where name = ? limit 1", [name]))[0][0]

    if (user === undefined) {
        if (/^[a-z0-9_]+$/i.test(name)) {
            const id = await register(name, password)
            setAuthCookies(res, id)
            res.json({ id, name, image_url: null })
        } else {
            res.json({ err: "INVALID_NAME_OR_PASSWORD" })
        }
        return
    }

    if (user.password_hash === md5(password)) {
        setAuthCookies(res, user.id)
        res.json({ id: user.id, name: user.name, image_url: user.image_url })
    } else {
        res.json({ err: "INVALID_NAME_OR_PASSWORD" })
    }
})
