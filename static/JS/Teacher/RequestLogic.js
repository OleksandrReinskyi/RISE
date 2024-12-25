const {canOrderToday} = window.serverData;

function addPostRequestLogic(){

    const form = document.querySelector("#orders");
    const checkboxes = Array.from(document.querySelectorAll(".orders_checkbox"));

    function extractInfo(checkboxes){ // extracts all info from checkboxes
        let array = [];
        for(let i in checkboxes){
            let obj = {};
            let element = checkboxes[i]; 

            obj.user_id = element.getAttribute("name");
            obj.ordered = element.checked ? "Y" : "N";
            array.push(obj)
        }
        return array;
    }

    function checkIDValidity(currentInfo,allPupils){
        for(let i = 0; i<currentInfo.length;i++){
            if(allPupils[currentInfo[i].user_id]){
                continue
            }else{
                throw new Error("У Вас не має доступу до користувачів, дані яких Ви намагаєтес змінити!")
            }
        }
    }

    function organizeInitialInfo(pupilsThatOrdered){ // makes object more compact for further search
        let obj={};
        for(let i = 0; i < pupilsThatOrdered.length;i++){
            let element = pupilsThatOrdered[i];
            obj[element.user_id] = element.ordered;
        }
        return obj;
    }
    

    async function sendRequest(obj,type) {
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
        alert(await response.text()) 
    }
    
    form.addEventListener("submit",(e)=>{
        e.preventDefault()
        try{
            if(!canOrderToday) throw new Error("Нажаль замовляти після 9 години не можна!")

            let currentInfo = extractInfo(checkboxes);

            let organizedAllPupils = organizeInitialInfo(allPupils);
            checkIDValidity(currentInfo,organizedAllPupils);
    
            let organizedPupilsThatOrdered = organizeInitialInfo(pupilsThatOrdered); 
            let deleteObj = {pupils:[]};
            let insertObj = {pupils:[]};

    
            for(let i = 0; i<currentInfo.length;i++){ // Checks if we uncheked a checkbox(row must be deleted from database) or checked one (row must be inserted into database) according to initial data from server
                let currentOrder = currentInfo[i];
                let initialOrder = organizedPupilsThatOrdered[currentOrder.user_id];
                if(initialOrder){
                    if(currentOrder.ordered == "Y"){
                        continue;
                    }else if (currentOrder.ordered=="N"){
                        deleteObj.pupils.push(currentOrder.user_id);
                    }
                }else{
                    if(currentOrder.ordered == "N"){
                        continue;
                    }else if (currentOrder.ordered == "Y"){
                        insertObj.pupils.push(currentOrder.user_id);
                    }
                }
            }
    
            if(deleteObj.pupils.length!=0){
                sendRequest(deleteObj,"DELETE");
            }
            if(insertObj.pupils.length!=0){
                sendRequest(insertObj,"POST");
            }
        }catch(e){
            alert(e.message);
        }
    });
    
}

document.addEventListener("DOMContentLoaded",(addEventListener)=>{
    addPostRequestLogic();
})