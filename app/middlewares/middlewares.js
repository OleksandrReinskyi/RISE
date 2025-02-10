import fs from "fs"
import { verifyJWT, redirectJWT } from "../services/jwtservice.js";
import path from 'path'
import { unforseenError } from "../helpers/ErrorMessages.js";
import { SQLUserType } from "../helpers/data.js";


/**
 * Checks if the user is admin. Is used in home.ejs to set the local variable admin and render the appropriate scripts
 */

export async function adminCheck(req,res,next){ 

    if(req.cookies.token){
        await verifyJWT(req.cookies.token).then((data)=>{
            if(data.user_type == SQLUserType.admin){
                res.locals.admin = true; 
            }else{
                res.locals.admin = false;
            }
            next()
        }).catch((err)=>{
            next(err)
        })
    }else{
        res.locals.admin = false;
        next()
    }
    
}

/**
 * Logs async errors in errorlog.txt file in the root directory
 */

let errorId = 0;

export function errorLogger(err, req, res, next){
    let date = new Date();
    let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    let requestData = `METHOD: ${req.method}, URL: ${fullUrl} `
    let errorData = `\n\n\n ${errorId++}: ${date.toDateString()} ${date.getHours()}:${date.getMinutes()} \n ${requestData} \n ${err.stack}`
    
    console.error(err.stack)
    
    fs.appendFileSync(path.join(process.cwd(),"ErrorLog.txt"),errorData)

    res.status(500).send(unforseenError.message + "\nКод помилки: " + errorId);
};


/**
 * Middleware to use when only admins are allowed to certain route. It doesn't send an error - it redirects to homepage;
 */

export async function adminOnly(req,res,next) {
    verifyJWT(req.cookies.token).then((data) => {
        if (data.user_type !== SQLUserType.admin) {
            return res.redirect("/home"); 
        }
        next(); 
    }).catch(() => res.redirect("/login")); 
}

/**
 * Redirects user to login page if the isn't logged in. (req.cookies)
 */

export async function redirectMiddleware(req,res,next){
    if(req.originalUrl != "/login"){
        await redirectJWT(req,res,"/login");
    }
    next()
}