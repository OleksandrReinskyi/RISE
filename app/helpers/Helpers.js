

/**
 * Adds zeros to the date for it to be shown in this format: xx.xx.xxxx
 * @returns {String}
 */

export function formatData(day,month,year){
    let formattedMoth = Number(month) + 1;
    return `${day<10 ? "0" + day : day}.${formattedMoth < 10 ? "0"+formattedMoth : formattedMoth}.${year}`
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
        try{
            let result = func(req,res,next);
            if(result instanceof Promise){
                result.catch(next)
            }
        }catch(err){
            next(err)
        }
    }
}
