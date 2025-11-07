import nodemailer from 'nodemailer'
import { Mail } from '../config/variables';

export default (mail_data) => {

  return new Promise((resolve,reject)=>{
    const transporter = nodemailer.createTransport({
      port: 465,               // true for 465, false for other ports
      host: "smtp.gmail.com",
      auth: {
          user: Mail,
          pass: process.env.PASS,
      },
 
      secure: true,
  });

  transporter.sendMail(mail_data, function (err, info) {
      if(err){
        console.log("err  :",err)
        reject(err)
      }
        
        
      else{
        console.log("info  :",info)
        resolve(info)
      }
       
   });
  })
    
}


console.log("heloo")