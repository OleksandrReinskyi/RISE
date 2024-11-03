import express from "express";
import layouts from "express-ejs-layouts"
import bodyParser from "body-parser";
import path from "path";
import cookieParser from "cookie-parser";

let __dirname = process.cwd();
const mimeTypes = {
    "css": "text/css",
    "js": "application/javascript",
    "json": "application/json",
    "csv": "text/csv",
};

async function connectServer(app){
    app.use(layouts);
    app.use(express.static("static"));
    app.set('view engine',"ejs");
    app.use(bodyParser.urlencoded({extended:false}));
    app.use(cookieParser());
    app.use(express.json())
    app.get("/static/:dir/:file",(req,res)=>{
        let MIMEType = mimeTypes[req.params.file.split(".")[1]];
        
        res.set({
            "Content-Type":MIMEType,
        })
        res.sendFile(path.join(__dirname,`static/${req.params.dir}/`,req.params.file));
    })

    app.listen(process.env.PORT,()=>{
        console.log("Listening on "+process.env.PORT);
    })
}

export default connectServer;