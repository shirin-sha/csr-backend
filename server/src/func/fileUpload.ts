import path from 'path'
import { documentSchema } from '../models/document'



export default (files: any) => {
    return new Promise((resolve, reject) => {
        if (files) {

            const file_name = Date.now() + files.name
            const file_path = path.join(__dirname, '../../uploads/' + file_name)
            files.mv(file_path, (err: any) => {
                if (err) {
                    console.error(err);
                    reject({
                        success:false,
                        message:'s  ome error'+err
                    })

                } else {
                    console.log('upload successfull', file_name);
                    const document_data = {
                        file_name,
                        added_date: new Date()
                    }
                    const file_data = new documentSchema(document_data)
                    file_data.save((err, response) => {
                        if (err) {
                            console.error(err);
                            reject({
                                success:false,
                                message:'some error'+err.message
                            })

                        } else {
                            console.log('response file upload ', response);
                            console.log(typeof (response._id));


                            resolve(response )

                        }
                    })
                }

            })


        }
    })

}