import express from 'express';
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv';
import cors from 'cors';
import { initDatabase } from './init';
import { searchUsers } from './endpoints/searchUsers';
import { login } from './endpoints/login';
import { posts } from './endpoints/posts';
import { dialogs } from './endpoints/dialogs';
import { conversations } from './endpoints/conversations';
import { conversation_messages } from './endpoints/conversation_messages';
import { news } from './endpoints/news';
import { me } from './endpoints/me';
import { profiles } from './endpoints/profiles';
import { subscriptions } from './endpoints/subscriptions';

dotenv.config()

const db = await open({
    filename: 'database.db',
    driver: sqlite3.cached.Database,
})

await initDatabase(db)
const port = process.env.PORT

express()
    .use(cors({ origin: "http://localhost:5175", allowedHeaders: "Content-Type, *", exposedHeaders: "*", methods: "GET, POST, PUT, DELETE", credentials: true, maxAge: 60000 }))
    .use(express.json())
    .use(cookieParser())
    .use(express.urlencoded({ extended: true }))
    .use("/uploads", express.static("./uploads/"))
    .use(login(db))
    .use(searchUsers(db))
    .use(posts(db))
    .use(profiles(db))
    .use(dialogs(db))
    .use(conversations(db))
    .use(conversation_messages(db))
    .use(news(db))
    .use(me(db))
    .use(subscriptions(db))
    .listen(3000, () => {
        console.log(`Example app listening on port ${port}`)
    })
