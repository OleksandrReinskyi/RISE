import jwt from "jsonwebtoken"


/**
 * Adds zeros to the date for it to be shown in this format: xx.xx.xxxx
 * @returns {String}
 */

export function formatData(day,month,year){
    let formattedMoth = Number(month) + 1;
    return `${day<10 ? "0" + day : day}.${formattedMoth < 10 ? "0"+formattedMoth : formattedMoth}.${year}`
}


/**
 * Redirects to location if JWT token is not valid (throws an error).
 * return - undefined in all cases 
 */

export async function redirectJWT(req,res,location){
    try{
        return await verifyJWT(req.cookies.token)
    }catch{
        res.redirect(location);
        return null;
    }

}

/**
 * Makes jwt verification promise-like to use it with async 
 * @param {JsonWebKey} token 
 * @returns {Promise} 
 */

export function verifyJWT(token){ 
    return new Promise((res,rej)=>{
        jwt.verify(token,process.env.JWT_SECRET,{},(err,info)=>{
            if(err){
                rej(err);
            }else{
                res(info);
            }
        })
    })

} 

/**
 * Changes the given function this way:
 * try{
 * funct()
 * } catch(err){
 *  next(err)
 * }
 * For errors to be passed into error handler middleware.
 * @param {Function} func 
 * @returns {Function}
 */

export function errorHandler(func){
    return (req,res,next)=>{
        Promise.resolve(func(req,res,next)).catch(next)
    }
}
