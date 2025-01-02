let prompt = document.querySelector("#prompt");
let dashboardButton = document.querySelector("#prompt_dashboard");
let classesButton = document.querySelector("#prompt_classes");
let closePromptButton =document.querySelector("#prompt_close");
closePromptButton.addEventListener("click",(event)=>{
    prompt.classList.add("hidden")
})

window.displayPrompt = function(event){
    event.preventDefault()
    let linkInfo = event.target.getAttribute("href");

    let dashboardAdress = "dashboard";
    let classesAdress = "classes";

    dashboardButton.setAttribute("href",linkInfo.replace("order",dashboardAdress))
    classesButton.setAttribute("href",linkInfo.replace("order",classesAdress))

    prompt.classList.remove("hidden");
}