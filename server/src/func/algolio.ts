import algoliasearch from 'algoliasearch'
import { eventSchema } from '../models/event'
import { projectSchema } from '../models/project'
import genToken from 'rand-token'
import { object } from 'joi'

const client = algoliasearch('5ZF2PO58F1', '3dd9e848d0ca02b3fcf8d2662682287a')

export const addProjectToAlgolio = async (id?) => {

    console.log('algolio updates...');
    let filter = {}
    if (id) {
        filter = { _id: id }
    }
    // Create a new index and add a record
    const index = client.initIndex('projects')
    let records: any = await projectSchema.find(filter).populate('category').lean()

    console.log({ records });
    records = records.map((item, idx) => {
        // let item = {...dta}
        item.objectID = item._id.toString()
        delete item._id
        console.log({ item });

        return item

    })
    index.saveObjects(records).catch(e => {
        console.log('error', e);

    })
}
export const updateProjectToAlgolio = (records) => {
   
    console.log({records});
 
    const index = client.initIndex('projects')

    index.partialUpdateObject(records).then((res) => {
        console.log('object idesss', res);
    }).catch(e => {
        console.error('algolia error', e);

    })
}
export const updateEventToAlgolio = (records,isArray) => {
   
    console.log({records});
 
    const index = client.initIndex('events')
if(isArray){
    index.partialUpdateObjects(records).then((res) => {
        console.log('object idesss', res);
    }).catch(e => {
        console.error('algolia error', e);

    })
}else{
    index.partialUpdateObject(records).then((res) => {
        console.log('object idesss', res);
    }).catch(e => {
        console.error('algolia error', e);

    })
}
   
}
export const addEventToAlgolio = async (id?) => {

    console.log('algolio updates...');
    let filter = {}
    if (id) {
        filter = { _id: id }
    }
    // Create a new index and add a record
    const index = client.initIndex('events')
    let records: any = await eventSchema.find(filter).populate('category').lean()
    records = records.map((item: any, idx) => {
        // let item = {...dta}
        item.objectID = item._id.toString()
        delete item._id
        console.log({ item });

        return item

    })
    console.log({ records });
    index.saveObjects(records).catch(e => {
        console.log('error', e);

    })
}
