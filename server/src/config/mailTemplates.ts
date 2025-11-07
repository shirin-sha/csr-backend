import { client_url, activating_link_string, Mail } from '../config/variables'

export const ActivationLink = (email, token, role) => {
    return {
        from: Mail,  // sender address
        to: email,   // list of receivers
        subject: 'Account verification Email',
        html: `<div style="text-align:center;background: ghostwhite;
        padding: 20px;
        color: black;"><h1>Welcome to Loops</h1>
        <div > 
         <p>To activate your account,Click on the button below </p>
         <a href="${client_url}login?token=${token}&role=${role}"> 
          <button  style="color:white;background:#9e8959;font-weight: 600;
          padding: 10px;border:none;border-radius:5px">Activate Account</button></a>
          
           
           </div><div>`,
        // text: 'Your Account Verification Link is : ' + {client_url}+ 'login?token='+{token}
        // <button style={{background:"red"}}>Activate Account<button/>
    }
}
// <a href="${client_url}login?token=${token}&role=${role}"> </a> 

export const resetPasswordMail = (email,token) => {
    return {
        from: Mail,  // sender address
        to: email,   // list of receivers
        subject: 'Reset Password Link - L.com',
        // html: `<h1>You requested for reset password, kindly use this <a href="${client_url}/new-password?token=${token}">link</a> to reset your password</h1>`
        html: `<div style="text-align:center;background: ghostwhite;
            padding: 20px;
            color: black;"><h2>Loop Password Reset</h2>
            <div > 
             <p>To get a new password reset link,Click on the button below </p>
             <a href="${client_url}/new-password?token=${token}"> 
              <button  style="color:white;background:#9e8959;font-weight: 600;
              padding: 10px;border:none;border-radius:5px">Reset Password</button></a>
              
               
               </div><div>`

    }

}
export const EventConformationLink = (email) => {
    return {
        from: Mail,  // sender address
        to: email,   // list of receivers
        subject: 'Notification',
        // html: `Your event is selected by organiser `,
        text: 'Your event is quoted by organiser  : '
        // + {client_url}+ 'login?token='+{token}
    }
}
export const sponsorProjectConfirmation = (applicant, project, mySponsorship) => {
    return {
        // const mail_data = {
        from: Mail,  // sender address
        to: applicant.email,   // list of receivers
        subject: 'Your project sponsorship is confirmed',
        text: `Hello ${applicant.first_name || applicant.company_name} ,
        Your project "${project.name} " sponsorship confirmed by sponsor ${mySponsorship.sponsor_id.first_name || mySponsorship.sponsor_id.company_name} as amount of ${mySponsorship.amount} `
        // }
    }
}
export const applicantProjectConfirmation = (sponsor) => {
    return {

        from: Mail,  // sender address
        to: sponsor.email,   // list of receivers
        subject: 'Your project sponsorship is accepted by applicant',
        text: `Hello ${sponsor.company_name} ,
            Your project sponsorship is accepted by applicant `


    }

}
export const applicantProjectSponsorRemove = (sponsor) => {
    return {

        from: Mail,  // sender address
        to: sponsor.email,   // list of receivers
        subject: 'Your project sponsorship is removed by applicant',
        text: `Hello ${sponsor.company_name} ,
            Your project sponsorship is removed by applicant `

    }
}
export const sponsorProjectRemove = (applicant, mySponsorship) => {
    return {

        from: Mail,  // sender address
        to: applicant.email,   // list of receivers
        subject: 'sponsorship offer removed form your project',
        text: `Hello ${applicant.first_name || applicant.company_name} ,
            Your project  sponsorship offer removed by sponsor ${mySponsorship.sponsor_id.first_name || mySponsorship.sponsor_id.company_name} as amount of ${mySponsorship.amount} `

    }
}
export const applicantQueedProject = (sponsor) => {
    return {

        from: Mail,  // sender address
        to: sponsor.email,   // list of receivers
        subject: 'Your  sponsorship request is accepted by applicant',
        text: `Dear ${sponsor.company_name} ,
            Your bid  is accepted by applicant `

    }
}

export const closeProjectTemplate = (sponsors, name) => {
    return {

        from: Mail,  // sender address
        to: sponsors.email,   // list of receivers
        subject: ` ${name}project is closed by applicant`,
        text: `Dear ${sponsors.company_name} ,
            ${name}  is deleted by applicant `

    }
}