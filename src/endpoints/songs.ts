import express from 'express'
import { Database } from 'sqlite';
import { UserRequest, auth, getUser } from '../auth';
import { upload } from '../upload';
import { imageOrDefault } from '../imageOrDefault';

var router = express.Router();
let db: Database;

router.post('/api/songs', auth, upload.single("audio"), async (req, res) => {
    let userId = (req as UserRequest).userId
    await db.run("insert into songs (user_id, name, url) values (?, ?, ?)", userId, req.body.name, req.file?.path)
    res.send()
})

router.delete('/api/favorite/songs', auth, async (req, res) => {
    let userId = (req as UserRequest).userId
    await db.run("delete from favorite_songs where song_id = ? and user_id = ?", +req.body.id, userId)
    res.send()
})

router.post('/api/favorite/songs', auth, async (req, res) => {
    let userId = (req as UserRequest).userId
    await db.run("insert into favorite_songs (song_id, user_id) values (?, ?)", +req.body.id, userId)
    res.send()
})

router.get('/api/favorite/songs', auth, async (req, res) => {
    let userId = (req as UserRequest).userId
    let songs = await db.all<{ id: number, name: string, url: string, user_name: string, }[]>("select s.id, s.name, s.url, u.name as user_name from favorite_songs f join songs s on s.id = f.song_id join users u on u.id = s.user_id where f.user_id = ?", userId)
    songs.forEach(song => song.url = imageOrDefault(song.url))
    res.json(songs.map(song => ({ ...song, isFavorite: true })))
})

export function songs(database: Database) {
    db = database
    return router
}