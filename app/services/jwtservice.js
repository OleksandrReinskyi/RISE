import jwt from "jsonwebtoken";

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