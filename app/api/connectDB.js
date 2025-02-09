import mysql from "mysql2/promise"
import dotenv from 'dotenv'
dotenv.config()

/**
 * Singleton approach to creating one database connection across different files 
 */

class Database {
    constructor() {
        if (!Database.instance) {
            this.pool = mysql.createPool({
                host:process.env.DB_HOST,
                user:process.env.DB_USER,
                password:process.env.DB_PASSWORD,
                database:process.env.DB_DATABASE,
                port:process.env.DB_PORT,
                waitForConnections: true,
                connectionLimit: 10,
            });
            Database.instance = this;
        }
        return Database.instance;
    }

    getPool() {
        return this.pool;
    }
}

export default new Database().getPool();