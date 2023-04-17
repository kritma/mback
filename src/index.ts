import express from 'express';
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv';
import { initDatabase } from './init';
import { search } from './search';
import { login } from './login';
import { post } from './posts';
import { dialogs } from './dialogs';
import { conversations } from './conversations';
import { conversation_messages } from './conversation_messages';
import { friends } from './friends';

dotenv.config()

// open the database
const db = await open({
    filename: 'database.db',
    driver: sqlite3.cached.Database,
})



await initDatabase(db)
const port = 3000


express()
    .use(express.json())
    .use(cookieParser())
    .use(express.urlencoded({ extended: true }))
    .use(express.static("uploads/"))
    .use(login(db))
    .use(search(db))
    .use(post(db))
    .use(dialogs(db))
    .use(conversations(db))
    .use(conversation_messages(db))
    .use(friends(db))
    .listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
