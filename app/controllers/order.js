import { SQLUserType } from "../helpers/data.js";
import { successMessage, unforseenError } from "../helpers/ErrorMessages.js";
import { timeCheck } from "../helpers/Helpers.js";
import { deleteOrder, insertOrder } from "../models/sqlqueries.js";
import { getViewPupil, getViewTeacherAdmin, handleStudentRequest, handleTeacherAdminRequest } from "../services/order.js";


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


/**
* Handles delete/post request on /order from users;
 * @param {*} req 
 * @param {*} res 
 */

export async function requestFromUser(req,res){ 
    let info = res.locals.info;
    let body = req.body;
    let message;
    let query

    if(req.method == "DELETE"){
        query = deleteOrder;
    }else if(req.method == "POST"){
        query = insertOrder;
    }
    try{
        timeCheck(body.day,body.month,body.year)
        if(info.user_type == SQLUserType.teacher || info.user_type==SQLUserType.admin){
            handleTeacherAdminRequest(body,query);
        }else if(info.user_type == SQLUserType.pupil){
            handleStudentRequest(info.id,body,query)
        }

        message = successMessage.message
        res.statusCode = 200;
    } 
    catch(e){
        
        if(e instanceof TypeError){
            message = e.message
            res.statusCode = 400;
        }else{
            message = unforseenError.message
            res.statusCode = 500;
        }
    }finally{
        res.send(message);
    }
    

}
