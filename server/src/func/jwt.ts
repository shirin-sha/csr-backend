import jwt from 'jsonwebtoken'
import { resolve } from 'path';
import { secretKey } from '../config/variables'

export const signing = (data) => {
    return new Promise((resolve,reject)=>{
        console.log('key:', secretKey);

        jwt.sign({
            data: data,
        }, secretKey, { expiresIn: "3d" }, (err, decoded) => {
            if (err) {
                console.error(err);
    
            } else {
                const token = decoded
                console.log('decoded', decoded);
                resolve (token)
            }
        })
    
    })
   
}

export const verifyLogin = (req, res, next) => {
    const token = req.headers.token;
    console.log("tk", token);
    jwt.verify(token, secretKey, (err, value) => {
      if (err) {
        console.log(err.message);
        res.status(401).send(err.message);
      } else {
        console.log(value.data);
        next();
      }
    });
  };