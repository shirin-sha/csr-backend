import dayjs from "dayjs";
import { updateEventToAlgolio } from "../func/algolio";
import { eventSchema } from "../models/event";


export const closeEvent=async()=>{
    try {
        let currentDate: any =new Date().toISOString();
        console.log('croning..', currentDate);
        const events: any = await eventSchema.find({to_date:{$lte:currentDate},status:'ACTIVE'},{status:1,to_date:1}).lean().catch(e=>{
            console.log({e});
            
        })
        
    console.log('expired events',{events});
    
       
        const filteredId = await events.map((prj) => {
            return prj._id
        })
        console.log({ filteredId });
    
        const inactiveEvents = await eventSchema.updateMany({ _id: { $in: [...filteredId] } }, { status: 'INACTIVE', $push: { log: { status: 'event  status changed to INACTIVE', date: currentDate } } }).lean()
        const records = filteredId.map((id) => {
            return {
                status: 'INACTIVE',
                objectID: id
            }
        })
        console.log('inactived ',{records});
        
        updateEventToAlgolio(records,true)
        console.log({ inactiveEvents });
        // DELETE documents in project
    
    } catch (e) {
        console.error(e);
    
    }

}
