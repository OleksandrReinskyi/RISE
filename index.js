import express from "express";
import dotenv from "dotenv"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

import connectServer from "./api/connectServer.js";
import connectDB from "./api/connectDB.js";

let salt = bcrypt.genSaltSync(10);
let jwt_secret = "niggaballs";

async function findUser(name,password,type){
    let rows = [];
    switch(type){
        case "teacher":
            [rows] = await pool.query(`
                SELECT * FROM teacher WHERE _login = ? AND _password = ?;`
                ,[name,password]);
            break;
        case "pupil":
            [rows] = await pool.query(`
                SELECT * FROM pupil WHERE _login = ? AND _password = ?;`
                ,[name,password]);
            break;
        case "admin":
            [rows] = await pool.query(`
                SELECT * FROM admin WHERE _login = ? AND _password = ?;`
                ,[name,password]);
            break;
    }
 
    return rows;
}


function verifyJWT(token){
    return new Promise((res,rej)=>{
        jwt.verify(token,jwt_secret,{},(err,info)=>{
            if(err){
                rej(err);
            }else{
                res(info);
            }
        })
    })

}

function renderHomeJWT(req,res,type){
    switch(type){
        case "teacher": 
            res.render("Teacher/Home.ejs");
            break;
        case "pupil":
            res.render("Pupil/Home.ejs");
            break;
        case "admin":
            res.render("Admin/Home.ejs");
            break;
        default:
            res.status(404).send("Wrong user type!");
    }
}

async function redirectJWT(req,res,location){
    try{
        return await verifyJWT(req.cookies.token)
    }catch{
        res.redirect(location);
        return null;
    }

}

dotenv.config();

const app = express();
connectServer(app);
let pool = await connectDB();
 
app.get("/",async (req,res)=>{
    let info = await redirectJWT(req,res,"/login");
    if(info){
        res.redirect("/home"); 
    }
})

app.route("/login")
.get(async (req,res)=>{
    try{
        let info = await verifyJWT(req.cookies.token);
        res.redirect("/home"); 
    }catch{
        res.render("Login.ejs")
    }

})
.post(async (req,res)=>{
    let {userName,userPassword,type} = req.body;
    let user = (await findUser(userName,userPassword,type))[0];// bcrypt.hash 
 
    if(user){
        let jwtObject = {
            type:type,
            id:user.id,
            name:userName,
            login:user._login
        };

        if(type=="teacher"){
            jwtObject.class_tutor = user.class_tutor;
        }else if(type=="pupil"){
            jwtObject.isPrivileged = user.isPrivileged;
            jwtObject._class = user._class;
        }

        jwt.sign(jwtObject,jwt_secret,{expiresIn:"1h"},(err,token)=>{
                if(err) throw err;
                res.cookie("token",token);
                res.status(200).send("Logged in!")
        });
    }else{
        res.status(404).send("User Not Found!");
    } 
})

app.get('/home',async (req,res)=>{
    let info = await redirectJWT(req,res,"/login");
    renderHomeJWT(req,res,info.type);
    
})

app.route("/order")
.get(async(req,res)=>{
    let info = await redirectJWT(req,res,"/login");
    let {day,month,year} = req.query;
    let teacherId = info.id; 

    let thisDayOfWeek = ((new Date(year,month-1,day)).getDay()) 

    let pupilsThatOrderedQuery = ` 
        
        SELECT user_id, ingridients, _name, privileged FROM 
            (SELECT * FROM \`order\` WHERE _day = ? AND _month = ? AND _year = ? AND user_id IN 
                    (SELECT id FROM pupil WHERE class = (SELECT class_tutor FROM teacher WHERE id = ? LIMIT 1))
                    AND user_type="pupil")
                AS pupils_ordered
            CROSS JOIN pupil ON 
        pupils_ordered.user_id=pupil.id
        
    `;// 4 read operations 



    let allPupilsQuery = `
    SELECT id as user_id, _name, privileged FROM pupil WHERE class = 
    ( SELECT class_tutor FROM TEACHER WHERE id = ? LIMIT 1)
     AND id NOT IN (SELECT user_id FROM \`order\` WHERE _day = ? AND _month = ? AND _year = ?);
    `; // 3 read operations

    let menuQuery = `
    SELECT ingridients FROM menu WHERE repeatDay = ?;
    `; // 1 read operation


    let ingridientsQuery = `SELECT _name,_price,photo FROM ingridient WHERE id = ?`;// max 6 read operations

    let pupilsThatOrdered = (await pool.query(pupilsThatOrderedQuery,[day,month,year,teacherId]))[0];
    let pupilsThatDidntOrder = (await pool.query(allPupilsQuery,[teacherId,day,month,year]))[0]; 

    let thisDayMenu = (await pool.query(menuQuery,[thisDayOfWeek]))[0][0]["ingridients"]; // ingridients table_header 
    let ingridients = [];

    for await(let i of thisDayMenu){
        ingridients.push((await pool.query(ingridientsQuery,[i]))[0]);
    }


})  

app.get("/profile",async (req,res)=>{ 
    let info = await redirectJWT(req,res,"/login");
    res.render("Profile.ejs",info);
})


app.route("/logout").get((req,res)=>{
    res.cookie("token","").redirect("/login"); 
})


 