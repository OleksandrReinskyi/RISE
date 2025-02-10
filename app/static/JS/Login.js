const form = document.querySelector("form");
const inputName = document.querySelector("#inputName");
const inputPassword = document.querySelector("#inputPassword");

let currentHref = window.location;

async function login(event){
    try{
        event.preventDefault();
        const selectedRadio = document.querySelector("input[name=type]:checked");
    
        const response = await fetch("/login",{
            method:"POST",
            body:JSON.stringify({
                userName:inputName.value,
                userPassword: inputPassword.value,
                type:selectedRadio.value
            }),
            headers:{"Content-Type":"application/json"},
            credentials:"include"
        });
    
    
        if(!response.ok){
            alert(await response.text());
        }else{
            window.location.replace("login","home");
        }
    }catch(err){
        console.log(err)
    }
   
}

form.addEventListener("submit",login)