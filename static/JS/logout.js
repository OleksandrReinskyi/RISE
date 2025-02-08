let currentHref = window.location;
document.querySelector("#logout").addEventListener("click",async(event)=>{
    event.preventDefault();
    await fetch("/logout",{
        method:"POST",
        credentials:"include"
    })
})