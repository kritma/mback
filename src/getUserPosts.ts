import { Database } from "sqlite"

export type Post = { id: number, description: string, files: string[], created_at: number, images: string[], user: { id: number, name: string, image_url: string | null } }

export async function getUserPosts(db: Database, user: { id: number, name: string, image_url: string | null }) {
    const posts = await db.all<{ id: number, description: string, created_at: number }[]>("select id, description, created_at from posts where user_id = ?", user.id)
    const posts_with_files: Post[] = []
    for (const p of posts) {
        const all_files = await db.all<{ url: string }[]>("select url from post_files where postId = ?", p.id)
        const images = []
        const files = []
        for (const file of all_files) {
            if (/\.(apng|avif|gif|jpg|jpeg|jfif|pjpeg|pjp|png|svg|webp)$/i.test(file.url)) {
                images.push(new URL(file.url, process.env.SERVER!).href)
            } else {
                files.push(new URL(file.url, process.env.SERVER!).href)
            }
        }
        posts_with_files.push({ ...p, files, images, user })
    }
    posts_with_files.sort((a, b) => b.created_at - a.created_at)

    return posts_with_files
}