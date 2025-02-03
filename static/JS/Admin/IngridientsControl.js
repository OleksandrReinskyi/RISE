

async function request(data,type) {
    let options = {
        method:type,
        body:data,
        credentials:"include",
        
    }

    if(type=="DELETE"){
        options.headers = {
            "Content-Type":"application/json;charset=utf-8"
        }
    }

    let response = await fetch("/control/ingridients",options);

    return response;

}


/**
 * Adding new ingridients
 */

/**
 * 1) Take all the data
 * 2) Send rightaway as post request 
 * If there are any changes - warn user before reload
 */



const newIngridient = document.querySelector("#new-ingridient__form");
const nameInput = document.querySelector("#form__name")
const desc = document.querySelector("#form__desc")
const file = document.querySelector("#form__img")
const ingridients = document.querySelector("#ingridients__body")


newIngridient.addEventListener("submit",async (event)=>{
    event.preventDefault();
    let formData = new FormData();
    formData.append("img",file.files[0]);
    formData.append("name",nameInput.value);
    formData.append("desc",desc.value);

    let resp = await request(formData,"PUT")
    
    if(resp.status == 200){
        ingridients.insertAdjacentHTML("beforeend",createIngr(await resp.json()))
    }else{
        alert("Сталася непередбачувана помилка!")
        console.log(response.statusText)
    }
})


function createIngr(data){
    return `
        <div class="ingridient" data-id="${data.id}">
            <div class="ingridient__container">
                <img class="ingridient__img" src="../${data.photo}" alt="">
                <p class="ingridient__name">${data.name}</p>
                <p class="ingridient__description">${data.desc}</p>
            </div>
            <div class="ingridient__control">
                <button onclick="deleteButton(event)" class="ingridient__delete">Видалити</button>
                <button onclick="changeButton(event)" class="ingridient__change">Змінити</button>
            </div>
        </div>
    `
}

/**
 * Deleting ingridients
 */


async function deleteButton(event) {
    if(!confirm("Ви дійсно бажаєте видалити даний інгдієнт? Його видалення призведе до зміни всіх меню, де він задіяний.")){
        return;
    }

    let parent = event.target.closest(".ingridient");
    let id = parent.getAttribute("data-id");
    let imgPath = parent.querySelector(".ingridient__img").getAttribute("src").replace("../","")
    await request(JSON.stringify({id:id,img:imgPath}),"DELETE");
    parent.remove()
}



/**
 * Changing ingridients
 */


async function changeButton(event){
    let target = event.target;
    target.classList.toggle("active");
    
    let parent = target.closest(".ingridient");
    let id = parent.getAttribute("data-id");

    let ingrContainer = parent.querySelector(".ingridient__container");

    let img = parent.querySelector(".ingridient__img");
    let name = parent.querySelector(".ingridient__name");
    let desc = parent.querySelector(".ingridient__description");



    if(target.classList.contains("active")){
        ingrContainer.style.display = "none";
        ingrContainer.insertAdjacentHTML("afterend",renderInputs(name.innerText,desc.innerText))
        target.innerText = "Завершити зміни"
    }else{
        let ingrInputs = parent.querySelector(".ingridient__inputs");

        let formData = new FormData(ingrInputs);
        formData.append("id",id);
        formData.append("prevImg",img.getAttribute("src").replace("../",""));
        if(formData.get("name") != name.innerText ||
            formData.get("desc") != desc.innerText || 
            formData.get("img").size != 0){
                let response = await request(formData,"POST");
                
                if(response.status == 200){
                    let data = await response.json()
                
                    img.setAttribute("src","../"+data.photo);
                    name.innerText = data.name;
                    desc.innerText = data.desc
                }else{
                    alert("Сталася непередбачувана помилка!")
                    console.log(response.statusText)
                
                }

            }

        ingrContainer.style.display = "block";
        ingrInputs.remove()
        target.innerText = "Змінити"
    }
}


function renderInputs(name,desc){
    return `
        <form class="ingridient__inputs">
            <input type="file" name="img" id="form__img">
            <input type="text" name="name" value="${name}">
            <textarea name="desc">${desc}</textarea>
        </form>
    `
}