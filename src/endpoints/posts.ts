import express from 'express'
import { UserRequest } from '../auth';
import { upload } from '../upload';
import { pool } from '../database';
import { ResultSetHeader } from 'mysql2';


export const posts = express.Router();

async function addPost(description: string, user_id: number) {
    const res = (await pool.execute<ResultSetHeader>("insert into posts (description, user_id) values (?, ?)", [description, user_id]))[0]
    return res.insertId
}

posts.post('/api/posts', upload.array("files", 10), async (req, res) => {
    let { description } = req.body as { description: string }
    let id = await addPost(description, (req as UserRequest).userId)

    let files = req.files as Express.Multer.File[] | undefined
    if (files !== undefined) {
        for (const file of files) {
            await pool.execute("insert into post_files (postId, url) values (?, ?)", [id, file.path])
        }
    }
    res.send()
})
