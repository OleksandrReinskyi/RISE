import express from "express";
import layouts from "express-ejs-layouts"
import bodyParser from "body-parser";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors"
import { accessError } from "../helpers/ErrorMessages.js";


let __dirname = process.cwd();
const mimeTypes = {
    "css": "text/css",
    "js": "application/javascript",
    "json": "application/json",
    "csv": "text/csv",
};

async function connectServer(app){
    app.use(layouts);
    app.use(express.static("app/static"));
    app.set('view engine',"ejs");
    app.set("views",path.join(__dirname,"app/views"))
    app.use(bodyParser.urlencoded({extended:false}));
    app.use(bodyParser.json())
    app.use(cookieParser());
    app.use(express.json())
    app.use(cors({origin:["localhost:3000"],credentials:true}))

    app.get("static/:dir/:file",(req,res)=>{
        let MIMEType = mimeTypes[req.params.file.split(".")[1]];
        let base = path.join(__dirname,"static");
        let filePath = path.resolve(base,req.params.dir,req.params.file);
        console.log(filePath)
        if (!filePath.startsWith(base)) {
            return res.status(403).send(accessError.message);
        }
    
        res.set({
            "Content-Type":MIMEType,
        })
        res.sendFile(filePath);
    })
    

    

    app.listen(process.env.PORT,()=>{
        console.log("Listening on "+process.env.PORT);
    })
}

export default connectServer;