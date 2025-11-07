


export const NotifEventConformation=()=>{
    return 'Your event is quoted by organizer '
      
     
}
export const NotifSponsorProjectConfirmation=(applicant,project, mySponsorship)=>{
    
    return `Your project "${project.name} " sponsorship confirmed by sponsor ${mySponsorship.sponsor_id.first_name || mySponsorship.sponsor_id.company_name} as amount of ${mySponsorship.amount} `
    
}

export const NotifApplicantProjectConfirmation=(sponsor)=>{
    return  `Hai  ${sponsor.company_name} ,
            Your project sponsorship is accepted by applicant `
        

    

}
export const NotifApplicantProjectSponsorRemove=(sponsor)=>{
    return  `Hello ${sponsor.company_name} ,
            Your project sponsorship is removed by applicant `
        
    
}
export const NotifSponsorProjectRemove=(applicant,mySponsorship)=>{
    return  `Hello ${applicant.first_name || applicant.company_name} ,
            Your project  sponsorship offer removed by sponsor  as amount of ${mySponsorship.amount} `
        
    
}
export const NotifApplicantQueedProject=(sponsor)=>{
    return  `Dear ${sponsor.company_name} ,
            Your bid  is accepted by applicant `
        
     
}

export const NotifCloseProjectTemplate=(sponsors,name)=>{
    return  `Dear ${sponsors.company_name} ,
            ${name }  is deleted by applicant `
        
    
}