import { Pool, createPool } from "mysql2/promise";

export let pool: Pool

export async function initDatabase() {
    pool = await createPool({
        host: 'localhost',
        user: 'root',
        password: 'hardpass',
        database: 'social',
        port: 3307
    })

    await pool.query("create table if not exists users(id integer primary key AUTO_INCREMENT, name nvarchar(50) not null unique, email nvarchar(50), password_hash nvarchar(50) not null, image_url nvarchar(200))")
    await pool.query("create table if not exists posts(id integer primary key AUTO_INCREMENT, description nvarchar(50) not null, user_id integer not null references users(id), created_at datetime not null DEFAULT CURRENT_TIMESTAMP)")
    await pool.query("create table if not exists post_files(postId integer not null references posts(id), url nvarchar(200) not null)")
    await pool.query("create table if not exists conversations(id integer primary key AUTO_INCREMENT, user1_id integer not null references users(id), user2_id integer not null references users(id))")
    await pool.query("create table if not exists conversation_messages(id integer primary key AUTO_INCREMENT, conversation_id integer not null references conversations(id), sender_id integer not null references users(id), text nvarchar(1000) not null, created_at datetime not null DEFAULT CURRENT_TIMESTAMP)")
    await pool.query("create table if not exists conversation_message_files(conversation_message_id integer not null references conversation_messages(id), url varchar(200) not null)")
    await pool.query("create table if not exists followers(user_id integer not null references users(id), follows_id integer not null references users(id), primary key(user_id, follows_id))")
    await pool.query("create table if not exists songs(id integer primary key AUTO_INCREMENT, user_id integer not null references users(id), name nvarchar(150) not null, url varchar(200) not null)")
    await pool.query("create table if not exists favorite_songs(song_id integer not null references songs(id), user_id integer not null references users(id), primary key(song_id, user_id))")
}
