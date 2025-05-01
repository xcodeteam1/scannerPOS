import { diskStorage } from 'multer';
import { extname, resolve } from 'path';
import { Multer } from 'multer'; // Multer tipini bu yerda import qilamiz

export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, resolve(__dirname, '..', '..', '..', 'public', 'images'));
    },
    filename: (req, file, cb) => {
      const uniqueName =
        Date.now() + '-' + file.originalname.replace(/\s+/g, '');
      cb(null, uniqueName);
    },
  }),
};
