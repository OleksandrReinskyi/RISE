import {formatData} from "./Utils/helpers.js"
//Adding menu info on page 


const menuElement = document.querySelector("#menu_wrapper");

function renderMenu(menu){
    if(!menu.info.id){
        menuElement.insertAdjacentHTML("beforeend",renderWarning(menu.info))
    }
    else{
        menuElement.insertAdjacentHTML("beforeend",renderMenuInfo(menu.info));
        menuElement.insertAdjacentElement("beforeend",renderMenuBody(menu.ingridients));
    }

}

function renderWarning(info){
    return `
    <div id="menu_warning">
        <h1 id="menu_warning">Вибачте, на цей день меню ще не призначене! </h1>
        <h3 id="menu_date">Дата: ${formatData(info.day,info.month,info.year)}</h3>
    </div>
    
    `
}

function renderMenuInfo(info){
    return `
    <div id="menu_info">
        <h1 id="menu_name">Назва: ${info.name}</h1>
        <h3 id="menu_price">Ціна: ${info.price}</h3>
        <h3 id="menu_date">Дата: ${info.day}-${Number(info.month)+1 }-${info.year}</h3>
    </div>
    
    `

}
function renderMenuBody(ingridients){
    let menuBody = document.createElement("div");
    menuBody.classList.add("menu__body");

    for(let item of ingridients){
        menuBody.insertAdjacentHTML("beforeend",createMenuItem(item))
    }
    return menuBody;

}
function createMenuItem(item){
    return `
        <div class="menu_item">
            <img src="${item.photo}" alt="" class="item_image">
            <div class="item_info">
                <h1 class="item_name">${item._name}</h1>
                <p class="item_description">${item._description}</p>
            </div>
        </div>
    `
}

if(window.serverData == undefined){
    alert("Щось пішло не так. Це не Ви, це сервер. Спробуйте перезавантажити сторінку.")
    throw new Error("ServerData is undefined")
}else{
    const {menu} = window.serverData;
    document.addEventListener("DOMContentLoaded",(addEventListener)=>{
        renderMenu(menu)
     }) 
}
