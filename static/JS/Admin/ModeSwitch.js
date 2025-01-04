let prompt = document.querySelector("#prompt");

let dashboardButton = document.querySelector("#prompt__dashboard");
let classesButton = document.querySelector("#prompt__classes");
let menuButton = document.querySelector("#prompt__menu");

let closePromptButton =document.querySelector("#prompt__close");

closePromptButton.addEventListener("click",(event)=>{
    prompt.classList.add("hidden")
})

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