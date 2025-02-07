import express from "express";
import dotenv from "dotenv"
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken"
import fs, { access } from "fs"
import path from "path"
import rateLimit from "express-rate-limit";
import multer from "multer";

import connectServer from "./api/connectServer.js";
import connectDB from "./api/connectDB.js";
import {accessError, loginError, successMessage, unforseenError, userTypeError} from "./static/JS/Utils/ErrorMessages.js"

const salt = bcrypt.genSaltSync(10);
const jwt_secret = process.env.JWT_SECRET;;
const stopOrdersHour = 9;



const SQLUserType = { // must have the same values as SQL table "user_type"
    pupil:1,
    teacher:2,
    admin:3
}

const ingridientStorage = multer.diskStorage({
        destination:function(req,file,cb){
            cb(null,"static/imgs/")
        },
        filename:function(req,file,cb){
            const extension = path.extname(file.originalname);
            cb(null, `ingridient-${Date.now()}${extension}`);
        }

    })

const multerIngridientsUpload = multer({storage:ingridientStorage})

const TextUserType = ["pupil","teacher","admin"]

function timeCheck(dayAccessed,monthAccessed,yearAccessed){ 
    const dateNow = (new Date(new Date().toLocaleString('en-US', { timeZone: 'EET' }))).getTime();
    let dateAccessed = (new Date(yearAccessed, monthAccessed, dayAccessed)).getTime();

    if(dateNow>dateAccessed){
        return false;
    }
    return true;
}   

async function findUser(login,password,type){ // returns user data if it is present in database

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
            res.render("Home.ejs");
            break;
        default:
            res.status(404).send(userTypeError.message);
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

async function handleTeacherAdminRequest(body,query) { // executes either a delete or post query for multiple students
    for await(let item of body.pupils){
        await pool.query(query,[item,SQLUserType.pupil,body.day,body.month,body.year]);
    } 
}

async function handleStudentRequest(id,body,query) { // executes either a delete or post query for one user
    await pool.query(query,[id,SQLUserType.pupil,body.day,body.month,body.year]);
}

async function requestFromUser(req,res){ //handles delete/post request on /order from users;
    let info = await redirectJWT(req,res,"/login")
    let body = req.body;
    let message;
    let query

    if(req.method == "DELETE"){
        query = `DELETE FROM \`order\` 
        WHERE user_id = ? AND user_type = ? 
        AND _day=? AND _month=? AND _year=?;`;
    }else if(req.method == "POST"){
        query = `INSERT INTO \`order\` (user_id,user_type,_day,_month,_year) 
        VALUES(?,?,?,?,?);`
    }
    try{
        timeCheck(body.day,body.month,body.year)
        if(info.user_type == SQLUserType.teacher || info.user_type==SQLUserType.admin){
            handleTeacherAdminRequest(body,query);
        }else if(info.user_type == SQLUserType.pupil){
            handleStudentRequest(info.id,body,query)
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


function errorHandler(func){
    return (req,res,next)=>{
        Promise.resolve(func(req,res,next)).catch(next)
    }
}



dotenv.config();

const app = express();
connectServer(app);
let pool = await connectDB();

app.use((req,res,next)=>{ // Admin check middleware for header 
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

})

app.get("/",errorHandler(async (req,res)=>{
    let info = await redirectJWT(req,res,"/login");
    if(info){
        res.redirect("/home"); 
    }
}))




app.route("/login")
.get(errorHandler(async (req,res)=>{
    try{
        let info = await verifyJWT(req.cookies.token);
        res.redirect("/home"); 
    }catch{
        res.render("Login.ejs")
    }
 
}))
.post(errorHandler(async (req,res)=>{ 
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

        jwt.sign(jwtObject,jwt_secret,{expiresIn:"1h"},(err,token)=>{
                if(err) throw err;
                res.cookie("token",token);
                res.status(200).send("Успішно!")
        });
    }else{
        res.statusCode = 404;
        res.send(loginError.message);
    } 
}))

app.get('/home',errorHandler(async (req,res)=>{
    let info = await redirectJWT(req,res,"/login");
    if(!info) return;
 
    renderHomeJWT(req,res,info.user_type);
    
}))


// Data schema {class:{pupil:{orders:[],info:{}}}}
app.post("/home/export",errorHandler(async (req,res)=>{ 
    let info = await redirectJWT(req,res,"/login");

    if(info.user_type != SQLUserType.admin){
        res.redirect("/home")
        return;
    }

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

        let classQuery = `SELECT id,_name,class,privileged FROM pupil WHERE class=?;`
        let pupils = (await pool.query(classQuery,[classId]))[0]

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
            let query = `SELECT ppl._name,
            CASE 
                WHEN ord.user_id IS NOT NULL THEN "Так"
                ELSE "Ні"
            END AS ordered
            FROM pupil AS ppl
            Left JOIN \`order\` AS ord
                ON ppl.id = ord.user_id
                AND ord._day = ? 
                AND ord._month = ? 
                AND ord._year = ?
                AND ord.user_type = ?
            WHERE ppl.class = ?;
            `
            let orders = (await pool.query(query,[day,month,year,SQLUserType.pupil,classId]))[0];
            for(let order of orders){
                classObj[order._name].orders.push(order.ordered)
            }
            
        }
        finalObj[className] = classObj;
    }
    res.send(JSON.stringify(finalObj))
}))


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

async function getOrderTeacherAdmin(req,res,day,month,year,className,clientData) {
    clientData.menu = await getMenu(day,month,year);

    let query = `SELECT ppl.id as user_id, _name, privileged,
        CASE 
            WHEN ord.user_id IS NOT NULL THEN true
            ELSE false
        END AS ordered
        FROM pupil AS ppl
        Left JOIN \`order\` AS ord
            ON ppl.id = ord.user_id
            AND ord._day = ? 
            AND ord._month = ? 
            AND ord._year = ?
            AND ord.user_type = ?
        WHERE ppl.class = ?;
        `

    
    let pupils = (await pool.query(query,[day,month,year,SQLUserType.pupil,className]))[0]

    clientData.pupils = pupils

    res.render("Teacher/Order.ejs",{data:clientData});
}

app.route("/order")
.get(errorHandler(async(req,res)=>{
    let info = await redirectJWT(req,res,"/login");
    if(!info) return;
    let {day,month,year} = req.query;
    
    let userId = info.id; 
    let userType = info.user_type;


    let clientData = {};
    clientData.canOrderToday = timeCheck(day,month,year)
    clientData.toString = function(){
        return JSON.stringify(this);
    }

    if(userType == SQLUserType.pupil){
        let pupilsOrderQuery = `
        SELECT * FROM \`order\` WHERE _day=? AND _month=? AND _year=? AND user_id = ? AND user_type = ?;
        `

        let pupilsOrder = (await pool.query(pupilsOrderQuery,[day,month,year,userId,SQLUserType.pupil]))[0][0];

        clientData.menu = await getMenu(day,month,year);
        if(pupilsOrder){
            clientData.ordered = true;
        }else{
            clientData.ordered = false;
        }

        

        res.render("Pupil/Order.ejs", {userId:userId,data:clientData})
 
    }else if(userType == SQLUserType.teacher){
        getOrderTeacherAdmin(req,res,day,month,year,info.class_tutor,clientData)

    }else if(userType==SQLUserType.admin){
        getOrderTeacherAdmin(req,res,day,month,year,req.query.class,clientData)
    }


}))  
.delete(errorHandler(requestFromUser))
.post(errorHandler(requestFromUser))



app.route("/classes")
.get(errorHandler(async (req,res)=>{
    let info = await redirectJWT(req,res,"/login");
    if(info.user_type != SQLUserType.admin){
        res.status(403).send(accessError.message);
        return;
    }

    let classesQuery = `SELECT * FROM class;`

    let classes = (await pool.query(classesQuery))[0];
    let date = {day:req.query.day,month:req.query.month,year:req.query.year};

    res.render("Admin/OrderClasses.ejs",{classes:classes,date:date})

}))



app.route("/menu")
.get(errorHandler(async (req,res)=>{
    let info = await redirectJWT(req,res,"/login");
    if(info.user_type != SQLUserType.admin){
        res.status(403).send(accessError.message);
        return;
    }
    
    let date = req.query;

    let ingridientsQuery = `SELECT ing.id, ing._name, ing.photo, ing._description
    FROM ingridient as ing 
    LEFT JOIN menu_ingridients as ming ON ing.id = ming.ingridient_id 
    WHERE ming.menu_id IN (SELECT id FROM menu as mn WHERE _day=? AND _month=? AND _year=?)`

    let menuQuery = `SELECT * FROM menu WHERE _day=? AND _month=? AND _year=?;`

    let allIngridientsQuery = `SELECT * FROM ingridient;`

    let ingridients = (await pool.query(ingridientsQuery,[date.day,date.month,date.year]))[0];
    let menu = (await pool.query(menuQuery,[date.day,date.month,date.year]))[0][0];
    let allIngridients = (await pool.query(allIngridientsQuery,[date.day,date.month,date.year]))[0]; 

    res.render("Admin/ChangeMenu.ejs",{data:{
        ingridients:ingridients,
        allIngridients,
        menu:menu ? menu : {},
        date:date,
        toString: function(){
            return JSON.stringify(this);
        }
    }
    })
}))
.post(errorHandler(updateMenu))
.put(async (req,res)=>{
    const {name,price} = req.body;
    const date = req.body.info.date;
    const menuId = req.body.info.menuId;
    let message;

    if(menuId==null){ // create a menu and send its id as response
        let query = `INSERT INTO menu (_name,_day,_month,_year,price) VALUES (?,?,?,?,?)`
        let result = (await pool.query(query,[name,date.day,date.month,date.year,price]));
        message = result[0].insertId
    }else{
        let query = `UPDATE menu SET _name = ?, price = ? WHERE id = ?;`
        await pool.query(query,[name,price,menuId])
        message = successMessage;
    }

    res.status(200).send(JSON.stringify(message))
})
.delete(errorHandler(updateMenu))


async function updateMenu(req,res){
    let info = await redirectJWT(req,res,"/login");
    if(info.user_type != SQLUserType.admin){
        res.status(403).send(accessError.message);
        return;
    }
    const menuId = req.body.info.menuId;
    let ingridients;
    let query;

    if(req.method=="POST"){
        ingridients = req.body.insertIngridients;
        query = `INSERT INTO menu_ingridients (menu_id,ingridient_id) VALUES (?,?)`
    }else if(req.method=="DELETE"){
        ingridients = req.body.deleteIngridients;
        query = `DELETE FROM menu_ingridients WHERE menu_id=? AND ingridient_id = ?;`
    }

    for await(let i of ingridients){
        await pool.query(query,[menuId,i])
    }
    res.status(200).send(successMessage)
}

app.route("/control/ingridients")
.get(errorHandler(async (req,res)=>{
    let info = await redirectJWT(req,res,"/");
    if(info.user_type != SQLUserType.admin){
        res.status(403).send(accessError.message);
        return;
    }
    let ingridientsQuery = `SELECT * FROM ingridient`;
    let ingridients = (await pool.query(ingridientsQuery))[0]

    res.render("Admin/IngridientsControl.ejs",{data:ingridients})
}))
.put(multerIngridientsUpload.single("img"),errorHandler(async (req,res)=>{
    let info = await redirectJWT(req,res,"/");
    if(info.user_type != SQLUserType.admin){
        res.status(403).send(accessError.message);
        return;
    }

    let imagePath = "imgs/" + req.file.filename;
    let {name,desc} = req.body;
    let query = "INSERT INTO ingridient (_name,photo,_description) VALUES (?,?,?);"
    let createdIngr = (await pool.query(query,[name,imagePath,desc]))[0].insertId;
    res.status(200).send(JSON.stringify({id:createdIngr, photo:imagePath,name:name,desc:desc}))

}))
.delete(errorHandler(async(req,res)=>{
    let info = await redirectJWT(req,res,"/");
    if(info.user_type != SQLUserType.admin){
        res.status(403).send(accessError.message);
        return;
    }
    let {img,id} = req.body;

    let ingridientDeleteQuery = "DELETE FROM ingridient WHERE id = ?";
    
    await pool.query(ingridientDeleteQuery,[id]); // RELATIVE PATHS MAY CHANGE WHEN REFACTORING
    fs.unlink(path.join("static",img),(err)=>{
        if(err) throw err;
    });
    res.status(200).send(successMessage)
}))
.post(multerIngridientsUpload.single("img"), errorHandler(async (req,res)=>{
    let info = await redirectJWT(req,res,"/");
    if(info.user_type != SQLUserType.admin){
        res.status(403).send(accessError.message);
        return;
    }

    let {name,desc,prevImg,id} = req.body;
    
    let query = "UPDATE ingridient SET _name = ?, _description = ?, photo = ? WHERE id = ?"
    let imagePath = "imgs/" + req.file.filename;

    await pool.query(query,[name,desc,imagePath,id])

    fs.unlink(path.join("static",prevImg),(err)=>{
        if(err) throw err;
    });

    res.status(200).send(JSON.stringify({photo:imagePath,name:name,desc:desc}))

}))


function dataSort(data){
    let sortedObj = {}
    for(let i of data){
        let name = i.class.replace(/-.*/g,"");
        if(!sortedObj[name]){
            sortedObj[name] = {}
        }
        sortedObj[name][i.class] = i.orders;
    }
    return sortedObj;
}

app.route("/dashboard")
.get(errorHandler(async (req,res)=>{
    let info = await redirectJWT(req,res,"/");
    if(info.user_type != SQLUserType.admin){
        res.status(403).send(accessError.message);
        return;
    }

    let {day,month,year} = req.query;
    let query = `SELECT COUNT(ord.id) as "orders", cls._name as "class" FROM \`order\` as ord 
                RIGHT JOIN pupil as ppl 
                ON ppl.id = ord.user_id 
                LEFT JOIN class as cls ON ppl.class = cls.id
                WHERE ord._day = ?
                AND ord._month = ?
                AND ord._year = ?
                GROUP BY ppl.class;`

    let data = dataSort((await pool.query(query,[day,month,year]))[0]);

    res.render("Admin/Dashboard.ejs",{data:JSON.stringify(data)})
}))
 

app.route("/profile")
.get(errorHandler(async (req,res)=>{ 
    let info = await redirectJWT(req,res,"/login");
    if(!info) return;

    res.render("Profile.ejs",info);
}))
.post(errorHandler(async (req,res)=>{
    let info = await redirectJWT(req,res,"/login");
    if(!info) return;

    let message;
    let userType = TextUserType[info.user_type-1];

    const chagePasswordQuery = `
    UPDATE ${userType} SET _password = ? WHERE id = ?;`

    let {oldPassword,newPassword} = req.body;

    let user = await findUser(info.login,oldPassword,info.user_type);

    if(user){
        let hashedPassword = await generateHashedPassword(newPassword);
        await pool.query(chagePasswordQuery,[hashedPassword,info.id])
        res.statusCode = 200;
        message = "Пароль успішно змінено!"
    }else{
        res.statusCode = 404;
        message = "Введено неправильний пароль!"
    }
    res.send(message)
}))


app.route("/logout").get(errorHandler((req,res)=>{
    res.cookie("token","").redirect("/login"); 
}))




async function generateHashedPassword(password){
    let salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password,salt);
} 



//Error handling 

app.use((err, req, res, next) => {
    let date = new Date();
    let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    let requestData = `IP: ${req.IP}, METHOD: ${req.method}, URL: ${fullUrl} `
    let errorData = `\n\n\n ${date.toDateString()} ${date.getHours()}:${date.getMinutes()} \n ${requestData} \n ${err.stack}`
    
    console.error(err.stack)
    
    fs.appendFileSync(path.join(process.cwd(),"ErrorLog.txt"),errorData)

    res.status(500).send(unforseenError.message);
});


//Login limiter (not working)

// let loginLimiter = rateLimit({
//     windowMs:15*60*1000,
//     max: 5,
//     message:"Надійшло дуже багато спроб ввійти з Вашої адреси. Спробуйте ше раз пізніше"
// })

// app.use("/login",loginLimiter)


