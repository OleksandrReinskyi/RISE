import express from "express";
import dotenv from "dotenv"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

import connectServer from "./api/connectServer.js";
import connectDB from "./api/connectDB.js";


let salt = bcrypt.genSaltSync(10);
let jwt_secret = "niggaballs";
let stopOrdersHour = 9;

const SQLUserType = { // must have the same values as SQL table "user_type"
    pupil:1,
    teacher:2,
    admin:3
}

function timeCheck(dayAccessed,monthAccessed,yearAccessed){ 
    const dateNow = (new Date(new Date().toLocaleString('en-US', { timeZone: 'EET' }))).getTime();
    let dateAccessed = (new Date(yearAccessed, monthAccessed, dayAccessed)).getTime();

    if(dateNow>dateAccessed){
        throw new TypeError(`Нажаль замовляти обід після ${stopOrdersHour} години не можна!`)
    }
}   

async function findUser(name,password,type){ // returns user data if it is present in database

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


function verifyJWT(token){ // makes JWT verification async to control it more convenietly
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

function renderHomeJWT(req,res,type){ // renders the home page accroding to logined userType
    switch(type){
        case SQLUserType.teacher: 
            res.render("Home.ejs");
            break;
        case SQLUserType.pupil:
            res.render("Home.ejs");
            break;
        case SQLUserType.admin:
            res.render("Admin/Home.ejs");
            break;
        default:
            res.status(404).send("Wrong user type!");
    }
}

async function redirectJWT(req,res,location){ //redirects to some page if there's no JWT token of authorisation (eg it throws an error)
    try{
        return await verifyJWT(req.cookies.token)
    }catch{
        res.redirect(location);
        return null;
    }

}

async function requestFromUser(req,res,query){
    let info = await redirectJWT(req,res,"/login")
    let body = req.body;
    let message;
    

    if(info.user_type == SQLUserType.teacher){
        try{
            timeCheck(body.day,body.month,body.year)
            
            for await(let item of body.pupils){
                await pool.query(query,[item,SQLUserType.pupil,body.day,body.month,body.year]);
            } 
            message = "Ваш запит успішно опрацьовано!"
            res.statusCode = 200;
        } 
        catch(e){
            
            if(e instanceof TypeError){
                message = e.message
                res.statusCode = 400;
            }else{
                message = "Сталася помилка на сервері!";
                res.statusCode = 500;
            }
        }finally{
            res.send(message);
        }
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
            user_type: type
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

async function getMenu(day,month,year){
    let menuQuery = `
    SELECT id,_name,price FROM menu WHERE _day = ? AND _month = ? AND _year = ?;`; 
    let ingridientsQuery = `SELECT _name, photo, _description FROM ingridient WHERE id IN (SELECT ingridient_id FROM menu_ingridients WHERE menu_id = ?); `;
    
    let menu = {};

    let thisDayIngridients;
    let thisDayMenu = (await pool.query(menuQuery,[day,month,year]))[0][0]; // ingridients table_header 
    
    if(!thisDayMenu){
        menu = {
            info:{day:day,
                month:month,
                year:year,
            }}
    }else{
        thisDayIngridients = (await pool.query(ingridientsQuery,[thisDayMenu.id]))[0]
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

app.route("/order")
.get(async(req,res)=>{
    let info = await redirectJWT(req,res,"/login");
    if(!info) return;

    let {day,month,year} = req.query;
    
    let userId = info.id; 
    let userType = info.user_type;
    
    
    
    let clientData = {};


    try{
        timeCheck(day,month,year)
        clientData.canOrderToday = true;
    }
    catch(e){
        clientData.canOrderToday = false;
    }
    clientData.toString = function(){
        return JSON.stringify(this);
    }

    if(userType == SQLUserType.pupil){
        let pupilsOrderQuery = `
        SELECT * FROM \`order\` WHERE _day=? AND _month=? AND _year=? AND user_id = ? AND user_type = ?;
        `

        let pupilsOrder = (await pool.query(pupilsOrderQuery,[day,month,year,userId,SQLUserType.pupil]))[0][0];

        clientData.menu = await getMenu(day,month,year);
        clientData.order = pupilsOrder;

        res.render("Pupil/Order.ejs", {userId:userId,data:clientData})
 
    }else if(userType == SQLUserType.teacher){
        let class_tutor = info.class_tutor;
       
        clientData.menu = await getMenu(day,month,year);

        let pupilsThatOrderedQuery = ` 
            
            SELECT user_id, _name, privileged, "Y" as ordered FROM pupil as ppl 
            CROSS JOIN \`order\` as ord ON ord.user_id = ppl.id 
            WHERE ord._day = ? AND ord._month = ? AND ord._year = ?  AND ord.user_type = ? AND ppl.class = ?;
            
        `;// 4 read operations 
    
        let allPupilsQuery = `
        SELECT id as user_id, _name, privileged, "N" as ordered FROM pupil WHERE class = ?;
        `; // 3 read operations

        let pupilsThatOrdered = (await pool.query(pupilsThatOrderedQuery,[day,month,year,SQLUserType.pupil,class_tutor]))[0];
        let allPupils = (await pool.query(allPupilsQuery,[class_tutor]))[0]; 
        
        
        clientData.allPupils = allPupils;
        clientData.pupilsThatOrdered=pupilsThatOrdered;

        res.render("Teacher/Order.ejs",{data:clientData});
    }


})  
.delete(async(req,res)=>{
    let deleteQuery = `DELETE FROM \`order\` 
    WHERE user_id = ? AND user_type = ? 
    AND _day=? AND _month=? AND _year=?;`;

    requestFromUser(req,res,deleteQuery)
    
})
.post(async(req,res)=>{
    let postQuery = `INSERT INTO \`order\` (user_id,user_type,_day,_month,_year) VALUES(?,?,?,?,?);`
    
    requestFromUser(req,res,postQuery)


})






app.get("/profile",async (req,res)=>{ 
    let info = await redirectJWT(req,res,"/login");
    if(!info) return;

    res.render("Profile.ejs",info);
})


app.route("/logout").get((req,res)=>{
    res.cookie("token","").redirect("/login"); 
})


