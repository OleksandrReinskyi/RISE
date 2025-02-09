import { verifyJWT } from "../helpers/Helpers.js";
import fs from "fs"

export function adminCheck(req,res,next){ // Admin check middleware for header 
    if(req.cookies.token){
        verifyJWT(req.cookies.token).then((data)=>{
            if(data.user_type == SQLUserType.admin){
                res.locals.admin = true; 
            }else{
                res.locals.admin = false;
            }
            next()
        }).catch((err)=>{
            next()
        })
    }else{
        next()
    }
}

export function errorLogger(err, req, res, next){
    let date = new Date();
    let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    let requestData = `IP: ${req.IP}, METHOD: ${req.method}, URL: ${fullUrl} `
    let errorData = `\n\n\n ${date.toDateString()} ${date.getHours()}:${date.getMinutes()} \n ${requestData} \n ${err.stack}`
    
    console.error(err.stack)
    
    fs.appendFileSync(path.join(process.cwd(),"ErrorLog.txt"),errorData)

    res.status(500).send(unforseenError.message);
};

