let prompt = document.querySelector("#prompt");

let dashboardButton = document.querySelector("#prompt__dashboard");
let classesButton = document.querySelector("#prompt__classes");
let menuButton = document.querySelector("#prompt__menu");

let closePromptButton =document.querySelector("#prompt__close");

closePromptButton.addEventListener("click",(event)=>{
    prompt.classList.add("hidden")
})

/**
 * If an admin is logged in the special window will be displayed each time the link is clicked with buttons to go to either 
 * - to menu redaction mode
 * - to ordering food for every class
 * - to dashboard for the selected day
 */

window.displayPrompt = function(event){
    event.preventDefault()
    let linkInfo = event.target.getAttribute("href");

    let menuAdress = "menu";
    let dashboardAdress = "dashboard";
    let classesAdress = "classes";

    menuButton.setAttribute("href",linkInfo.replace("order",menuAdress))
    dashboardButton.setAttribute("href",linkInfo.replace("order",dashboardAdress))
    classesButton.setAttribute("href",linkInfo.replace("order",classesAdress))

    prompt.classList.remove("hidden");
}