import express from 'express'
import { Database } from 'sqlite';
import { imageOrDefault } from '../imageOrDefault';
import { UserRequest, auth } from '../auth';

var router = express.Router();
let db: Database;

router.get('/api/search/users/:name', auth, async (req, res) => {
    const users = await db.all<{ id: number, name: string, image_url: string | null }[]>("select id, name, image_url from users where name like ? order by length(name)", `%${req.params.name}%`)
    users.forEach(user => user.image_url = imageOrDefault(user.image_url))
    res.json(users)
})

router.get('/api/search/songs/:name', auth, async (req, res) => {
    let userId = (req as UserRequest).userId
    const songs = await db.all<{ id: number, name: string, url: string, user_name: string, fav_id: number | null }[]>("select s.id, s.name, s.url, u.name as user_name, f.song_id as fav_id from songs s join users u on u.id = s.user_id left join favorite_songs f on f.user_id = ? and f.song_id = s.id where s.name like ? order by length(s.name)", userId, `%${req.params.name}%`)
    songs.forEach(user => user.url = imageOrDefault(user.url))
    res.json(songs.map(song => ({ ...song, fav_id: undefined, isFavorite: song.fav_id !== null })))
})

export function search(database: Database) {
    db = database
    return router
}