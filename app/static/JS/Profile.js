const formReset = document.getElementById("main__formReset");
const oldInput = document.getElementById("oldPassword");
const newInput = document.getElementById("newPassword");

let url = "/profile"

formReset.addEventListener("submit",async (event)=>{
    event.preventDefault();
    let formData = new FormData(formReset);
    let response = await fetch(url,{
        method:"POST",
        body:JSON.stringify({
            oldPassword:oldInput.value,
            newPassword: newInput.value
        }),
        credentials:"include",
        headers:{"Content-Type":"application/json"}
    })

    alert(await response.text())

})