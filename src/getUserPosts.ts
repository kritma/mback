import { Database } from "sqlite"
import { spitFilesIntoCategories } from "./spitFilesIntoCategories"

export type Post = { id: number, description: string, created_at: number, images: string[], music: string[], videos: string[], files: string[], user: { id: number, name: string, image_url: string | null } }

export async function getUserPosts(db: Database, user: { id: number, name: string, image_url: string | null }) {
    const posts = await db.all<{ id: number, description: string, created_at: number }[]>("select id, description, created_at from posts where user_id = ?", user.id)
    const posts_with_files: Post[] = []
    for (const p of posts) {
        const allFiles = await db.all<{ url: string }[]>("select url from post_files where postId = ?", p.id)
        posts_with_files.push({ ...p, ...spitFilesIntoCategories(allFiles.map(file => file.url)), user })
    }
    posts_with_files.sort((a, b) => b.created_at - a.created_at)

    return posts_with_files
}