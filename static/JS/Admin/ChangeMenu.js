import { formatData } from "../Utils/Helpers.js";
/**
 * Rendering data about the menu that is already in DB 
 */
let {ingridients,menu,date,allIngridients} = window.serverData;
let menuCurrent = document.querySelector("#menu__current");
let menuBody = document.querySelector("#menu__body");

let normalizedStartIngridients = normalizeData(ingridients);
let normalizedAllIngridients = normalizeData(allIngridients);

let currentIngridients = [...(Object.keys(normalizedStartIngridients))]; // global object, is not passed to functions
console.log(currentIngridients)

function normalizeData(data){
    let obj = {};
    for(let i of data){
        obj[i.id] = i;
    }
    return obj
}

function renderMenu(){
    if(menu){
        renderMenuInfo(menu,date)
        renderBody()
    }else{
        renderMenuInfo({},date)
    }
}


function renderMenuInfo({_name = "",price = ""},date){

    let menuInfo = `<section id="menu__info">
                        <h1 id="info__date">Дата: ${formatData(date.day,date.month,date.year)}</h2>
                        <label for="">
                            Назва:<input type="text" required name="name" id="info__name" value="${_name}"> 
                        </label>
                        <label for="">
                            Ціна:<input type="number" required name="price" id="info__price" value="${price}"> 
                        </label>
                    </section>`
    menuCurrent.insertAdjacentHTML("afterbegin",menuInfo);
}

function createItem(item){
    let menuItem = document.createElement("div");
    menuItem.setAttribute("class","menu__item");

    let itemContainer = document.createElement("div");
    itemContainer.setAttribute("class","item__container");

    let img = document.createElement("img")
    img.setAttribute("src","../../"+item.photo)
    img.setAttribute("class","item__img");

    let itemInfo = document.createElement("div");
    itemInfo.setAttribute("class","item__info");

    let description = document.createElement("p");
    description.setAttribute("class","menu__body");
    description.innerText = item._description;

    let deleteButton = document.createElement("button");
    deleteButton.setAttribute("class","item__delete");
    deleteButton.setAttribute("data-itemId",item.id);
    deleteButton.addEventListener("click",deleteItem);
    deleteButton.innerText = "Видалити елемент з меню"

    itemInfo.appendChild(description);
    itemContainer.appendChild(img);
    itemContainer.appendChild(itemInfo);

    menuItem.appendChild(itemContainer);
    menuItem.appendChild(deleteButton)

    return menuItem;
}

function renderBody(){   
    menuBody.innerHTML = "";
    for(let item of currentIngridients){
        menuBody.insertAdjacentElement("beforeend",createItem(normalizedAllIngridients[item]))
    }
}

function deleteItem(event){
    event.preventDefault();
    let target = event.target;
    let id = target.getAttribute("data-itemid");
    let parent = target.closest(".menu__item");

    let index = currentIngridients.findIndex((item)=>item==id);

    if(index!=-1){
        currentIngridients.splice(index,1)
        parent.remove();
    }
}

function updateBody(event){
    event.preventDefault();
    let selectedIngridient = (document.querySelector("#form__ingridients")).value;
    if((currentIngridients.findIndex(item=>{
        return Number(item)==Number(selectedIngridient)
     })) != -1){
        return;
    }
    currentIngridients.push(selectedIngridient);
    renderBody()
}



/**
 * Sending request logic  
 */

async function prepareAndSendRequest(event){
    event.preventDefault()
    let nameInputValue = (document.querySelector("#info__name")).value;
    let priceInputValue = (document.querySelector("#info__price")).value;

    
    let updateInfo;

    if(nameInputValue !== menu._name || priceInputValue!= menu.price){
        updateInfo = {};
        updateInfo.name=nameInputValue;
        updateInfo.price=priceInputValue;
    }


    let deleteObj = {deleteIngridients:[]}
    let insertObj = {insertIngridients:[]}

    let startIngridients = Object.keys(normalizedStartIngridients);

    for(let i = 0;i<currentIngridients.length;i++){ // checks for new elements (not present in startIngr and present in currIngr)
        if(normalizedStartIngridients[currentIngridients[i]]){
            continue;
        }else{
            insertObj.insertIngridients.push(currentIngridients[i]);
        }
    }

    for(let i = 0;i<startIngridients.length;i++){ // cheks for deleted elements (presetn in startIng and not present in currIngr)
        if(currentIngridients.findIndex((item)=>{return item==startIngridients[i]}) == -1){
            deleteObj.deleteIngridients.push(startIngridients[i]);
        }else{
            continue;
        }
    }

    if(updateInfo) await sendRequest(updateInfo,"PUT");
    if(insertObj.insertIngridients.length!=0) await sendRequest(insertObj,"POST");
    if(deleteObj.deleteIngridients.length!=0){
        await sendRequest(deleteObj,"DELETE");
    }
}

async function sendRequest(obj,type) {
    let info = {date:date,menuId: menu.id ? menu.id : null};
    obj.info = info;

    let response = await fetch("/menu",{
        method:type,
        body:JSON.stringify(obj),
        headers:{
            "Content-Type":"application/json;charset=utf-8"
        }
    })
    if(response.status != 200){
        throw new Error(await response.text())
    }else{
        if(type == "PUT" && !menu.id){
            menu.id = await response.text();
            console.log(menu.id)
        }else{
            alert(await response.text())
        }
    }
}


/*
 * Adding listeners after DOM is loaded
 */


let mainForm = document.querySelector("#menu");
let buttonAddIngridient = document.querySelector("#form__add-ingridient");

document.addEventListener("DOMContentLoaded",renderMenu)

mainForm.addEventListener("submit",prepareAndSendRequest)
buttonAddIngridient.addEventListener("click",updateBody)