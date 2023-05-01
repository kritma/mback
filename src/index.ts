import express from 'express';
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv';
import cors from 'cors';
import { initDatabase } from './database';
import { search } from './endpoints/search';
import { login } from './endpoints/login';
import { posts } from './endpoints/posts';
import { dialogs } from './endpoints/dialogs';
import { conversations } from './endpoints/conversations';
import { conversation_messages } from './endpoints/conversation_messages';
import { news } from './endpoints/news';
import { me } from './endpoints/me';
import { profiles } from './endpoints/profiles';
import { subscriptions } from './endpoints/subscriptions';
import { songs } from './endpoints/songs';
import { auth } from './auth';

dotenv.config()
const port = process.env.PORT

initDatabase()

express()
    .use(cors({ origin: "http://localhost:5175", allowedHeaders: "Content-Type, *", exposedHeaders: "*", methods: "GET, POST, PUT, DELETE", credentials: true, maxAge: 60000 }))
    .use(express.json())
    .use(cookieParser())
    .use(express.urlencoded({ extended: true }))
    .use("/uploads", express.static("./uploads/")).use(login)
    .use(auth)
    .use(search).use(posts).use(profiles).use(dialogs).use(conversations).use(conversation_messages).use(news).use(me).use(subscriptions).use(songs)
    .listen(3000, () => {
        console.log(`Example app listening on port ${port}`)
    })
