import express from "express";
import dotenv from "dotenv"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

import connectServer from "./api/connectServer.js";
import connectDB from "./api/connectDB.js";


let salt = bcrypt.genSaltSync(10);
let jwt_secret = "niggaballs";

const SQLUserType = {
    pupil:1,
    teacher:2,
    admin:3
}

async function findUser(name,password,type){

    let rows = [];
    switch(type){
        case SQLUserType.teacher:
            [rows] = await pool.query(`
                SELECT * FROM teacher WHERE _login = ? AND _password = ?;`
                ,[name,password]);
            break;
        case SQLUserType.pupil:
            [rows] = await pool.query(`
                SELECT * FROM pupil WHERE _login = ? AND _password = ?;`
                ,[name,password]);
            break;
        case SQLUserType.admin:
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
        case SQLUserType.teacher: 
            res.render("Teacher/Home.ejs");
            break;
        case SQLUserType.pupil:
            res.render("Pupil/Home.ejs");
            break;
        case SQLUserType.admin:
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
    type = Number(type);
    let user = (await findUser(userName,userPassword,type))[0];// bcrypt.hash 
 
    if(user){
        let jwtObject = {
            id:user.id,
            name:userName,
            login:user._login,
            user_type: user.user_type
        };

        if(type==SQLUserType.teacher){
            jwtObject.class_tutor = user.class_tutor;
        }else if(type==SQLUserType.pupil){
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
    if(!info) return;

    renderHomeJWT(req,res,info.user_type);
    
}) 



app.route("/order")
.get(async(req,res)=>{
    let info = await redirectJWT(req,res,"/login");
    if(!info) return;

    let {day,month,year} = req.query;
    
    let userId = info.id; 
    let userType = info.user_type;
    let thisDayOfWeek = ((new Date(year,month-1,day)).getDay()) 


    if(userType == SQLUserType.pupil){
        let pupilsOrderQuery = `
        SELECT * FROM \`order\` WHERE _day=? AND _month=? AND _year=? AND user_id = ? AND user_type = ?;
        `

        let pupilsOrder = await pool.query(pupilsOrderQuery,[day,month,year,userId,userType])[0];

    }else if(userType == SQLUserType.teacher){
        let class_tutor = info.class_tutor;
    
        let pupilsThatOrderedQuery = ` 
            
            SELECT user_id, _name, privileged FROM pupil as ppl 
            CROSS JOIN \`order\` as ord ON ord.user_id = ppl.id 
            WHERE ord._day = ? AND ord._month = ? AND ord._year = ? AND ord.user_type = ?  AND ppl.class = ?;
            
        `;// 4 read operations 
    
    
    
        let pupilsThatDidntOrderQuery = `
        SELECT id as user_id, _name, privileged FROM pupil WHERE class = ?
         AND id NOT IN (SELECT user_id FROM \`order\` WHERE _day = ? AND _month = ? AND _year = ? AND user_type =?);
        `; // 3 read operations
    
        let menuQuery = `
        SELECT id,_name,price FROM menu WHERE _day = ? AND _month = ? AND _year = ?; 
        `; // 1 read operation

        let ingridientsQuery = `SELECT _name, photo FROM ingridient WHERE id IN (SELECT ingridient_id FROM menu_ingridients WHERE menu_id = ?); `;
        
        let pupilsThatOrdered = (await pool.query(pupilsThatOrderedQuery,[day,month,year,SQLUserType.pupil,class_tutor]))[0];
        let pupilsThatDidntOrder = (await pool.query(pupilsThatDidntOrderQuery,[class_tutor,day,month,year,SQLUserType.pupil]))[0]; 
    
        let thisDayMenu = (await pool.query(menuQuery,[day,month,year]))[0][0]; // ingridients table_header 
        let thisDayIngridients = (await pool.query(ingridientsQuery,[thisDayMenu.id]))[0]


        let allPupils = [...pupilsThatDidntOrder,...pupilsThatOrdered]
    
        console.log(pupilsThatOrdered,pupilsThatDidntOrder,thisDayMenu,thisDayIngridients)
        
        let data = {pupils: allPupils,day:day,month:month,year:year, toString(){
            return JSON.stringify(this);
        }};
    
    
        res.render("Teacher/Order.ejs",{data:data});
    }


})  

app.get("/profile",async (req,res)=>{ 
    let info = await redirectJWT(req,res,"/login");
    if(!info) return;

    res.render("Profile.ejs",info);
})


app.route("/logout").get((req,res)=>{
    res.cookie("token","").redirect("/login"); 
})


 