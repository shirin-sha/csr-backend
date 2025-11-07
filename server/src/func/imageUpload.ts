import path from 'path'
import { documentSchema } from '../models/document'
import { imageSchema } from '../models/image'
import sharp from 'sharp'


export default (files: any) => {
    return new Promise((resolve, reject) => {
        if (files) {

            const file_name = Date.now() + files.name
            const file_path = path.join(__dirname, '../../images/' + file_name)
            const thumbnailsPath = path.join(__dirname, '../../images/thumbnails/' + file_name)

            files.mv(file_path, async (err: any) => {
                if (err) {
                    console.error(err);
                    reject({
                        success: false,
                        message: 'some error' + err
                    })

                } else {
                    console.log('upload successfull', file_name);
                    console.log('file',{files});
                    
                    sharp(files.data).resize(320, 200).toFile(thumbnailsPath, (err, resizeImage) => {
                        if (err) {
                            console.log('sharp error',{err});
                        } else {
                            console.log({resizeImage});
                            resolve(file_name)

                        }
                    })




                }

            })


        }
    })

}