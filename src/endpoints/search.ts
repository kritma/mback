import express from 'express'
import { imageOrDefault } from '../imageOrDefault';
import { UserRequest, auth } from '../auth';
import { pool } from '../database';
import { RowDataPacket } from 'mysql2';

export const search = express.Router();

search.get('/api/search/users/:name', async (req, res) => {
    const users = (await pool.execute<({ id: number, name: string, image_url: string | null } & RowDataPacket)[]>("select id, name, image_url from users where name like ? order by length(name)", [`%${req.params.name}%`]))[0]
    users.forEach(user => user.image_url = imageOrDefault(user.image_url))
    res.json(users)
})

search.get('/api/search/songs/:name', auth, async (req, res) => {
    let userId = (req as UserRequest).userId
    const songs = (await pool.execute<({ id: number, name: string, url: string, user_name: string, fav_id: number | null } & RowDataPacket)[]>
        ("select s.id, s.name, s.url, u.name as user_name, f.song_id as fav_id from songs s join users u on u.id = s.user_id left join favorite_songs f on f.user_id = ? and f.song_id = s.id where s.name like ? order by length(s.name)", [userId, `%${req.params.name}%`]))[0]
    songs.forEach(user => user.url = imageOrDefault(user.url))
    res.json(songs.map(song => ({ ...song, fav_id: undefined, isFavorite: song.fav_id !== null })))
})
