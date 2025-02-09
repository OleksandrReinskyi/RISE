import pool from "../api/connectDB.js"; 
import bcrypt from "bcrypt"
import { SQLUserType } from "../helpers/data.js";

/**
 * Returns user data if it is present in database
 * 
 * @param {String} login 
 * @param {String} password 
 * @param {Integer} type 
 * @returns {Array||Null}
 
*/

export async function findUser(login,password,type){ 

    let rows;
    switch(type){
        case SQLUserType.teacher:
            [rows] = await pool.query(`
                SELECT * FROM teacher WHERE _login = ?;`
                ,[login]);
            break;
        case SQLUserType.pupil:
            [rows] = await pool.query(`
                SELECT * FROM pupil WHERE _login = ?;`
                ,[login]);
            break;
        case SQLUserType.admin:
            [rows] = await pool.query(`
                SELECT * FROM admin WHERE _login = ?;`
                ,[login]);
            break;
    }
    if (rows.length > 0 && bcrypt.compareSync(password, rows[0]._password)) {
        return rows[0];
    }else{
        return null;
    }

}