import { imageOrDefault } from "./imageOrDefault"

export function spitFilesIntoCategories(allFiles: string[]) {
    const images = []
    const music = []
    const videos = []
    const files = []

    for (let file of allFiles) {
        file = imageOrDefault(file)
        if (/\.(apng|gif|ico|jpg|jpeg|jfif|pjpeg|pjp|png|svg|webp|bmp)$/i.test(file)) {
            images.push(file)
        } else if (/\.(wav|mp3|ogg)$/i.test(file)) {
            music.push(file)
        } else if (/\.(webm|mp4)$/i.test(file)) {
            videos.push(file)
        } else {
            files.push(file)
        }
    }
    return { images, music, videos, files }
}