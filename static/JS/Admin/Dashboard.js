import { formatData } from "../Utils/Helpers.js";
/**
 * Rendering data about the menu that is already in DB 
 */
let {ingridients,menu,date} = window.serverData;
let menuCurrent = document.querySelector("#menu__current");

let currentIngridients = [];

function renderMenu(){
    if(menu){
        renderMenuInfo(menu,date)
        renderBody(ingridients)
    }else{


    }

}


function renderMenuInfo(menu,date){

    let menuInfo = `<form id="menu__info">
                        <h1 id="info__date">Дата: ${formatData(date.day,date.month,date.year)}</h2>
                        <label for="">
                            Назва:<input type="text" id="info__name" value="${menu._name}"> 
                        </label>
                        <label for="">
                            Ціна:<input type="number" id="info__price" value="${menu.price}"> 
                        </label>
                    </form>`
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

    currentIngridients.push(item.id);

    return menuItem;
}

function renderBody(ingridients){
    let menuBody = document.createElement("section");
    menuBody.setAttribute("id","menu__body");

    for(let item of ingridients){
        menuBody.insertAdjacentElement("beforeend",createItem(item))
    }
    menuCurrent.appendChild(menuBody)
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


let buttonSubmit = document.querySelector("#form__submit");


document.addEventListener("DOMContentLoaded",(event)=>{
    renderMenu();
    buttonSubmit.addEventListener("click",(event)=>{
        event.preventDefault();

    })
})