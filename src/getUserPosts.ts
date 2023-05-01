import { RowDataPacket } from "mysql2"
import { pool } from "./database"
import { spitFilesIntoCategories } from "./spitFilesIntoCategories"

export type Post = { id: number, description: string, created_at: Date, images: string[], music: string[], videos: string[], files: string[], user: { id: number, name: string, image_url: string | null } }

export async function getUserPosts(user: { id: number, name: string, image_url: string | null }) {
    const posts = (await pool.execute<({ id: number, description: string, created_at: Date } & RowDataPacket)[]>("select id, description, created_at from posts where user_id = ? order by created_at desc", [user.id]))[0]
    const posts_with_files: Post[] = []
    for (const p of posts) {
        const allFiles = (await pool.execute<({ url: string } & RowDataPacket)[]>("select url from post_files where postId = ?", [p.id]))[0]
        posts_with_files.push({ ...p, ...spitFilesIntoCategories(allFiles.map(file => file.url)), user })
    }
    return posts_with_files
}