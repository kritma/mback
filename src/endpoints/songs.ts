import express from 'express'
import { UserRequest } from '../auth';
import { upload } from '../upload';
import { imageOrDefault } from '../imageOrDefault';
import { pool } from '../database';
import { RowDataPacket } from 'mysql2';

export const songs = express.Router();

songs.post('/api/songs', upload.single("audio"), async (req, res) => {
    let userId = (req as UserRequest).userId
    await pool.execute("insert into songs (user_id, name, url) values (?, ?, ?)", [userId, req.body.name, req.file?.path])
    res.send()
})

songs.delete('/api/favorite/songs', async (req, res) => {
    let userId = (req as UserRequest).userId
    await pool.execute("delete from favorite_songs where song_id = ? and user_id = ?", [+req.body.id, userId])
    res.send()
})

songs.post('/api/favorite/songs', async (req, res) => {
    let userId = (req as UserRequest).userId
    await pool.execute("insert into favorite_songs (song_id, user_id) values (?, ?)", [+req.body.id, userId])
    res.send()
})

songs.get('/api/favorite/songs', async (req, res) => {
    let userId = (req as UserRequest).userId
    let songs = (await pool.execute<({ id: number, name: string, url: string, user_name: string } & RowDataPacket)[]>("select s.id, s.name, s.url, u.name as user_name from favorite_songs f join songs s on s.id = f.song_id join users u on u.id = s.user_id where f.user_id = ?", [userId]))[0]
    songs.forEach(song => song.url = imageOrDefault(song.url))
    res.json(songs.map(song => ({ ...song, isFavorite: true })))
})

