import express from 'express'
import { Database } from 'sqlite';
import { UserRequest, auth } from './auth';
import { upload } from './upload';

let db: Database;

var router = express.Router();


type Post = { id: number, description: string, user_id: number, user_name: string, files: string[] }

function addPost(description: string, user_id: number) {
    return new Promise<number>((resolve, reject) => {
        db.db.run("insert into posts (description, user_id) values (?, ?)", [description, user_id], function (err: any) {
            if (err) {
                reject(err)
            }
            resolve(this.lastID)
        })
    })
}

router.post('/api/posts', auth, upload.array("files", 10), async (req, res) => {
    let { description } = req.body as { description: string }
    let id = await addPost(description, (req as UserRequest).userId)

    let files = req.files as Express.Multer.File[] | undefined
    if (files !== undefined) {
        for (const file of files) {
            await db.run("insert into post_files (postId, url) values (?, ?)", id, file.path)
        }
    }
    res.status(200).send()

})

export function post(database: Database) {
    db = database
    return router
}