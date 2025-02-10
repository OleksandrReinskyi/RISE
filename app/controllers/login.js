import { SQLUserType } from "../helpers/data.js";
import { loginError, successMessage } from "../helpers/ErrorMessages.js";
import { findUser } from "../models/sqlmodels.js";
import jwt from "jsonwebtoken"
import { verifyJWT } from "../services/jwtservice.js";

/**
 * Cheks for JWT token. If it is present => redirects to /home route
 * If not (verifyJWT thorws an error) - renders Login page.
 * 
 * P.s: in this way redirectJWT("/login") can't be used, because it create an infinite loop
 */

export async function getView(req,res,next) {
    try{
        await verifyJWT(req.cookies.token);
        res.redirect("/home"); 
    }catch{
        res.render("Login.ejs")
    }
}


/**
 * Checks if there's a user with that crendentials 
 * If yes: creates a JWT token. 
 * (The user is automatically redirected to home by logic in funcion getView)
 * If not: sends 404 error to user
 * 
 */

export async function login(req,res) {
    let {userName,userPassword,type} = req.body;
    type = Number(type);
    let user = (await findUser(userName,userPassword,type));

    if(user){
        let jwtObject = {
            id:user.id,
            name:userName,
            login:user._login,
            user_type: type
        };

        if(type==SQLUserType.teacher){
            jwtObject.class_tutor = user.class_tutor;
        }else if(type==SQLUserType.pupil){
            jwtObject.isPrivileged = user.isPrivileged;
            jwtObject._class = user._class;
        }

        jwt.sign(jwtObject,process.env.JWT_SECRET,{expiresIn:"1h"},(err,token)=>{
                if(err) throw err;
                res.cookie("token",token);
                res.status(200).send(successMessage)
        });
    }else{
        res.status(404).send(loginError.message);
    } 
}