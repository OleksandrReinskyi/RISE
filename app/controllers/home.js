import pool from "../api/connectDB.js"
import { SQLUserType } from "../helpers/data.js";
import { classOrdersForDay, singleClassQuery } from "../models/sqlqueries.js";

/**
 * Checks for JWT token and renders an appropriate home page.
 * @returns {undefined}
 */
export async function getView(req,res,next){
    res.status(200).render("Home.ejs")
}

/**
 * Sends JSON object with orders data for requested month
 * @render {JSON}
 */
// Data schema {class:{pupil:{orders:[Yes,No,Yes....],info:{}}}}
// Warning: very resource demanding process. 

export async function exportHome(req,res,next) {
    let {month,year} = req.body;

    let classesQuery = `SELECT * FROM class`;
    let classes = (await pool.query(classesQuery))[0];

    let maxDate = new Date(year,month+1)
    maxDate.setDate(maxDate.getDate()-1)
    let maxDay = maxDate.getDate();

    let finalObj = {}
    
    for await(let item of classes){
        const className = item["_name"];
        const classId = item["id"];
        let classObj={};

        let pupils = (await pool.query(singleClassQuery,[classId]))[0]

        for(let i of pupils){ // Format data
            classObj[i._name] = {
                orders:[],
                info: {
                    id:i.id,
                    privileged:i.privileged
                }
            }
        }

        for (let day = 1;day<=maxDay;day++){
            let orders = (await pool.query(classOrdersForDay,[day,month,year,SQLUserType.pupil,classId]))[0];
            for(let order of orders){
                classObj[order._name].orders.push(order.ordered)
            }
            
        }
        finalObj[className] = classObj;
    }

    res.status(200).send(JSON.stringify(finalObj))
}