import bcrypt from 'bcryptjs'

//local modules
import { saltRounds } from '../config/variables'


export const bcrypt_data = (data: string) => {
  return new Promise((resolve,reject)=>{
    console.log("password:", data);
    console.log("salt:", saltRounds);

    bcrypt.hash(data, saltRounds, function (err, hash) {
        if (err) {console.error(err)
        }else {
            hash.toString()
            console.log('hashed',hash);
            
            resolve(hash)
        }


    });
  })
        
    

}

export const validate_data = (password: string, hash ) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hash, function (err, result) {
            console.log('password:',password+'\n hashcode:',hash);
            
            if (err) {
                console.log('p error',err);
                
                reject(err.message)
            }else{
                console.log('reuslt:',result);
                resolve(result as boolean)
            }
            
           
        });
    })
  

}
