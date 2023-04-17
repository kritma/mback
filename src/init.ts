import { Database } from "sqlite";

export async function initDatabase(db: Database) {
    await db.run("create table if not exists users(id integer primary key autoincrement, name nvarchar(50) not null unique, email nvarchar(50), password_hash nvarchar(50) not null, image_url nvarchar(200))")
    await db.run("create table if not exists posts(id integer primary key autoincrement, description nvarchar(50) not null, user_id integer not null, created_at datetime not null)")
    await db.run("create table if not exists post_files(postId integer not null, url nvarchar(200) not null)")
    await db.run("create table if not exists conversations(id integer primary key autoincrement, user1_id integer not null, user2_id integer not null)")
    await db.run("create table if not exists conversation_messages(id integer primary key autoincrement, conversation_id integer not null, sender_id integer not null, text nvarchar(1000) not null, created_at datetime not null)")
    await db.run("create table if not exists conversation_message_files(conversation_message_id integer not null, url nvarchar(200) not null)")
    await db.run("create table if not exists friends(user1_id integer not null, user2_id integer not null)")
}