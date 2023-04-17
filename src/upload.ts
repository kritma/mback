import multer from 'multer';
import crypto from 'crypto'

export const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/')
        },
        filename: function (req, file, cb) {
            cb(null, crypto.randomUUID() + file.originalname)
        }
    })
})