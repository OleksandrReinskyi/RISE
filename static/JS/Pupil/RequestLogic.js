let {ordered,menu} = window.serverData;

const form = document.getElementById("order");
const orderStatus =  document.getElementById("order__status");
const orderSubmit = document.getElementById("order__submit");

let orderedStatusMessage = "Замовлено!";
let orderedSubmitMessage = "Відмінити замовлення"
let notOrderedSubmitMessage = "Замовити"
let notOrderedMessage = "НЕ замовлено!";

function changeOrderInfo(ordered){
    if(ordered == "Y"){
        orderStatus.innerText = orderedStatusMessage;
        orderStatus.classList.add(".status__ordered");
        orderSubmit.innerText = orderedSubmitMessage;
        orderStatus.classList.add(".submit__ordered");
    }else if(ordered == "N"){
        orderStatus.innerText = notOrderedMessage;
        orderStatus.classList.remove(".status__ordered");
        orderSubmit.innerText = notOrderedSubmitMessage;
        orderStatus.classList.remove(".submit__ordered");
    }
}

async function sendRequest(type) {
    let obj ={};
    obj.day = menu.info.day;
    obj.month = menu.info.month;
    obj.year = menu.info.year;

    let response = await fetch("/order",{
        method:type,
        body:JSON.stringify(obj),
        headers:{
            "Content-Type":"application/json;charset=utf-8"
        }
    })
    if(response.status != 200){
        throw new Error(await response.text())
    }
}


changeOrderInfo(ordered);

form.addEventListener("submit", async (event)=>{
    event.preventDefault();
    try{
        if(ordered == "Y"){
            await sendRequest("DELETE");
            ordered = "N";
            changeOrderInfo(ordered)
        }else if(ordered == "N"){
            await sendRequest("POST");
            ordered = "Y";
            changeOrderInfo(ordered)
        }else{
            alert("Сталася помилка, це не Ви це сервер. Спробуйте перезавантажити сторінку!");
        }
    }catch(e){
        alert(e.message)
    }
    
})