import express from 'express';
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv';
import { initDatabase } from './init';
import { searchUsers } from './searchUsers';
import { login } from './login';
import { posts } from './posts';
import { dialogs } from './dialogs';
import { conversations } from './conversations';
import { conversation_messages } from './conversation_messages';
import { friends } from './friends';
import cors from 'cors';
import { me } from './me';

dotenv.config()

const db = await open({
    filename: 'database.db',
    driver: sqlite3.cached.Database,
})

await initDatabase(db)
const port = process.env.PORT

express()
    .use(cors({ origin: "*" }))
    .use(express.json())
    .use(cookieParser())
    .use(express.urlencoded({ extended: true }))
    .use(express.static("uploads/"))
    .use(login(db))
    .use(searchUsers(db))
    .use(posts(db))
    .use(dialogs(db))
    .use(conversations(db))
    .use(conversation_messages(db))
    .use(friends(db))
    .use(me(db))
    .listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
