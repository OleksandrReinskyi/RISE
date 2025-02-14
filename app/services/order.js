import pool from "../api/connectDB.js"
import { pupilOrder,menuOrder,ingridientsOrder,classOrders } from "../models/sqlqueries.js";
import { SQLUserType } from "../helpers/data.js";
/**
 * Modifies cliend data object, so it contais menu and boolean if pupil ordered for today
 */

export async function getViewPupil(req,res,clientData,day,month,year,userId){

        let pupilsOrder = (await pool.query(pupilOrder,[day,month,year,userId,SQLUserType.pupil]))[0][0];

        clientData.menu = await getMenu(day,month,year);
        if(pupilsOrder){
            clientData.ordered = true;
        }else{
            clientData.ordered = false;
        }

        res.render("Pupil/Order.ejs", {userId:userId,data:clientData})
}


/**
 * Gets menu and its ingridients for the day requested
 */

async function getMenu(day,month,year){
    let menu = {};

    let thisDayIngridients;
    let thisDayMenu = (await pool.query(menuOrder,[day,month,year]))[0][0]; 
    
    if(!thisDayMenu){
        menu = {
            info:{day:day,
                month:month,
                year:year,
            }} 
    }else{
        thisDayIngridients = (await pool.query(ingridientsOrder,[thisDayMenu.id]))[0]
        menu = {
            info:{day:day,
                month:month,
                year:year,
                id:thisDayMenu.id,
                price:thisDayMenu.price,
                name:thisDayMenu._name,
            },
            ingridients: thisDayIngridients
        }
    } 

    return menu;
} 

/**
 * Gets orders for certain class (for users's class in case of teacher and for whatever class requested for admin )
 */

export async function getViewTeacherAdmin(req,res,day,month,year,className,clientData) {
    clientData.menu = await getMenu(day,month,year);

    let pupils = (await pool.query(classOrders,[day,month,year,SQLUserType.pupil,className]))[0]

    clientData.pupils = pupils

    res.render("Teacher/Order.ejs",{data:clientData});
}



/**
 * Executes either a delete or post query for order for multiple students
 * @param {Object} body  //object from user
 * @param {String} query // the query
 */

export async function handleTeacherAdminRequest(body,query) { 
    for await(let item of body.pupils){
        await pool.query(query,[item,SQLUserType.pupil,body.day,body.month,body.year]);
    } 
}


/**
 * Executes either a delete or post query for order for one user
 * @param {Number} id // student's id
 * @param {Object} body // object from user
 * @param {String} query // the query
 */
export async function handleStudentRequest(id,body,query) { 
    await pool.query(query,[id,SQLUserType.pupil,body.day,body.month,body.year]);
}