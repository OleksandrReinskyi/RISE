import mysql from "mysql2"
import dotenv from 'dotenv'
dotenv.config()

async function connectDB(){
    let pool = await mysql.createPool(
        {
            host:process.env.DB_HOST,
            user:process.env.DB_USER,
            password:process.env.DB_PASSWORD,
            database:process.env.DB_DATABASE,
            port:process.env.DB_PORT
        }
    ).promise();
    return pool

} 

export default connectDB;