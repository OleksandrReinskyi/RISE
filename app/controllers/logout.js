/**
 * Logs the user out by setting token to an empty string and redirecting them to login page
 */

export async function logout(req,res,next) {
    res.cookie("token","").redirect("/login"); 
}
