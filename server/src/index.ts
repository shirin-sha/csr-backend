// modules
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import cron from 'node-cron'
// local modules
import { PORT, DB, adminLogData } from './config/variables'
import applicantRouter from './Routes/applicant'
import sponsorRouter from './Routes/sponsor'
import organizerRouter from './Routes/organizer'
import adminRouter from './Routes/admin'
import publicRouter from './Routes/public'
import { addEventToAlgolio, addProjectToAlgolio } from './func/algolio'
import swaggerAutogen from "swagger-autogen"
import winston, { format } from 'winston'
import 'winston-mongodb'
import fs from 'fs'
import path from 'path'
import { changeToInactive, ToArchive } from './crons/project'
import { deleteInactiveAccountsApplicant, deleteInactiveAccountsSponsor, deleteInactiveAccountsOrganizer, expireOrganizer } from './crons/user'
import { closeEvent } from './crons/event'




// config
const app = express()
//--------

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// swagger configuration


const outputFile = './swagger-output.json';
const endpointsFiles = [
    swaggerAutogen.script === "swagger"
        ? "dist/index.js"
        : "src/index.ts",
];
swaggerAutogen({ autoBody: true })(outputFile, endpointsFiles);

app.use('/api-docs', (req, res) => {
    const swaggerDocument = fs.readFileSync('swagger-output.json', { encoding: 'utf-8' })
    res.json(JSON.parse(swaggerDocument))
})
app.post('/ping',(req,res)=>{
res.status(200).json({message:'hai ping'})
    
    
})

//crons
cron.schedule('0 1 * * *', changeToInactive);
cron.schedule('0 1 * * *', ToArchive);
cron.schedule('0 1 * * *', deleteInactiveAccountsApplicant);
cron.schedule('0 1 * * *', deleteInactiveAccountsSponsor);
cron.schedule('0 1 * * *', deleteInactiveAccountsOrganizer);
cron.schedule('0 1 * * *', expireOrganizer);
cron.schedule('0 1 * * *', closeEvent);

//  addProjectToAlgolio()
//  addEventToAlgolio()

//set routes
app.use('/applicant', applicantRouter)
app.use('/sponsor', sponsorRouter)
app.use('/organizer', organizerRouter)
app.use('/admin', adminRouter)
app.use('/public', publicRouter)





app.use(express.static(path.join(__dirname, '../../client/build')));
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
})
//database connection
mongoose.connect(DB, (err) => {
    if (err) {
        console.error(err)
    } else {
        console.info('database is connected')
    }
})



//server connection
app.listen(PORT, () => {
    console.log(`server running in port ${PORT} `);

})

export const logger = winston.createLogger({
    format:format.metadata(),
    transports: [
        new winston.transports.MongoDB({
            level: 'info', 
            db: DB,
            collection: 'logs',
            options: { useUnifiedTopology: true }, 
        }),
 
    ],
});



