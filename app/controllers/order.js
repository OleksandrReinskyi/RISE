import { SQLUserType } from "../helpers/data.js";
import { timeCheck } from "../helpers/Helpers.js";
import { getViewPupil, getViewTeacherAdmin } from "../services/order.js";

/**
 * Sends an aprropriate view for the user for certain day.
 */

export async function getView(req,res) {
    let info = res.locals.info
    let {day,month,year} = req.query;
    
    let userId = info.id; 
    let userType = info.user_type;


    let clientData = {};
    clientData.canOrderToday = timeCheck(day,month,year)
    clientData.toString = function(){
        return JSON.stringify(this);
    }

    if(userType == SQLUserType.pupil){
        await getViewPupil(req,res,clientData,day,month,year,userId)
 
    }else if(userType == SQLUserType.teacher){
        await getViewTeacherAdmin(req,res,day,month,year,info.class_tutor,clientData)

    }else if(userType==SQLUserType.admin){
        await getViewTeacherAdmin(req,res,day,month,year,req.query.class,clientData)
    }
}