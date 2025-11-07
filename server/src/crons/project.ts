import { projectSchema } from "../models/project"
import dayjs from 'dayjs'
import { updateProjectToAlgolio } from "../func/algolio";
export const changeToInactive = async () => {
    let currentDate: any = new Date().toISOString();
    console.log('croning..', currentDate);
    try {

        const projects: any = await projectSchema.find({ status: 'ACTIVE', sponsor_count: 0, sponsor_amount: 0 })
        console.log('projects.. croning');

        //console.log({ projects });
        const selectedProject = await projects.filter((prj) => {
            const submission_date = prj.submission_date
            const extend_date = prj.extend_date
            let difference;
            if (extend_date) {
                difference = dayjs(currentDate).diff(dayjs(extend_date), 'd')

            } else {
                difference = dayjs(currentDate).diff(dayjs(submission_date), 'd')

            }
            console.log({ difference });

            return difference >= 60
        })
        console.log({ selectedProject });

        const filteredId = await selectedProject.map((prj) => {
            return prj._id
        })
        console.log({ filteredId });
        if (filteredId.length > 0) {
            const inactiveProject = await projectSchema.updateMany({ $in: [...filteredId] }, { status: 'INACTIVE', $push: { log: { status: 'project  status changed to inactive', date: currentDate } } })
            console.log({ inactiveProject });
            const records = filteredId.map((id) => {
                return {
                    status: 'INACTIVE',
                    objectID: id
                }
            })
            console.log('inactived ', { records });

            updateProjectToAlgolio(records)

        }


    } catch (e) {
        console.error(e);
    }



    try {
        // after 3 month
        const projectsfor3month: any = await projectSchema.find({ status: 'ACTIVE', $lt: ["$sponsor_amount", "$budget"] })
        // sponosramount 300 < budget :3000 we want budget 
        console.log({ projectsfor3month });
        const selectedProjectfor3mnth = await projectsfor3month.filter((prj) => {
            const submission_date = prj.submission_date
            const extend_date = prj.extend_date
            let difference;
            if (extend_date) {
                difference = dayjs(currentDate).diff(dayjs(extend_date), 'd')

            } else {
                difference = dayjs(currentDate).diff(dayjs(submission_date), 'd')

            }
            console.log('parttially sponosred projects', { difference });
            return difference >= 90
        })
        console.log({ selectedProjectfor3mnth });

        const filteredId2 = await selectedProjectfor3mnth.map((prj) => {
            return prj._id
        })
        console.log({ filteredId2 });
        if (filteredId2.length > 0) {
            const inactiveProject2 = await projectSchema.updateMany({ $in: [...filteredId2] }, { status: 'INACTIVE', $push: { log: { status: 'project  status changed to inactive', date: currentDate } } })
            console.log({ inactiveProject2 });
            const records = filteredId2.map((id) => {
                return {
                    status: 'INACTIVE',
                    objectID: id
                }
            })
            console.log('inactived ', { records });

            updateProjectToAlgolio(records)
        }

    } catch (e) {
        console.error(e);

    }
}





export const ToArchive = async () => {

    try {
        let currentDate: any = new Date().toISOString();
        console.log('croning..', currentDate);
        const projects: any = await projectSchema.find({ status: 'EXPIRED' })
        const selectedProject = await projects.filter((prj) => {
            const expire_date = prj.expire_date
            console.log({ expire_date });

            const waiting_time = dayjs(expire_date).add(24, 'hour').format()
            console.log({ waiting_time });
            const today = dayjs(currentDate).format()
            console.log({ today });

            console.log('checked', waiting_time < today);
            return waiting_time < today

        })

        console.log({ projects });
        console.log({ selectedProject });
        const filteredId2 = await selectedProject.map((prj) => {
            return prj._id
        })
        console.log({ filteredId2 });

        const inactiveProject2 = await projectSchema.updateMany({ _id: { $in: [...filteredId2] } }, { status: 'ARCHIVE', $push: { log: { status: 'project  status changed to ARCHIVE', date: currentDate } } })
        const records = filteredId2.map((id) => {
            return {
                status: 'ARCHIVE',
                objectID: id
            }
        })
        console.log('inactived ', { records });

        updateProjectToAlgolio(records)
        console.log({ inactiveProject2 });
        // DELETE documents in project

    } catch (e) {
        console.error(e);

    }

    try {
        let currentDate: any = new Date().toISOString();
        console.log('croning..', currentDate);
        const projects: any = await projectSchema.find({ status: 'CLOSED' })
        const selectedProject = await projects.filter((prj) => {
            const expire_date = prj.expire_date
            console.log({ expire_date });

            const waiting_time = dayjs(expire_date).add(1, 'month').format()
            console.log({ waiting_time });
            const today = dayjs(currentDate).format()
            console.log({ today });

            console.log('checked', waiting_time < today);
            return waiting_time < today

        })

        console.log({ projects });
        console.log({ selectedProject });
        const filteredId2 = await selectedProject.map((prj) => {
            return prj._id
        })
        console.log({ filteredId2 });

        const inactiveProject2 = await projectSchema.updateMany({ _id: { $in: [...filteredId2] } }, { status: 'ARCHIVE', $push: { log: { status: 'project  status changed to ARCHIVE', date: currentDate } } })
        const records = filteredId2.map((id) => {
            return {
                status: 'ARCHIVE',
                objectID: id
            }
        })
        console.log('inactived ', { records });

        updateProjectToAlgolio(records)
        console.log({ inactiveProject2 });
        // DELETE documents in project

    } catch (e) {
        console.error(e);

    }


}

export const queueNotification = async () => {

   // notify to sponsors and applicant when sponsorship in queue list

   // query all project with queue status then query sponsorship in queue list (status :1) in that projects. 
   // also populate sponsor details and applicant details (emails)
   //check 

}
