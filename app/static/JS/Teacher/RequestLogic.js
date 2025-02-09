import {idValidityError,timeError,scriptError} from "../Utils/ErrorMessages.js"
const {canOrderToday,menu,pupils} = window.serverData;


/**
 * This file handles requsts logic that change something in database
 * Algorithm:
 * 1) It selects all of the data in checkboxes 
 * 2) It checks if the data was changed and which way (deleted a check or added a check)
 * 3) Puts users` ids into appropriate objects and makes a request with them
 */

function addPostRequestLogic(){

    const form = document.querySelector("#orders");
    const checkboxes = Array.from(document.querySelectorAll(".orders_checkbox"));

    function extractInfo(checkboxes){ // extracts all info from checkboxes
        let array = [];
        for(let i in checkboxes){
            let obj = {};
            let element = checkboxes[i]; 

            obj.user_id = element.getAttribute("name");
            obj.ordered = element.checked ? true : false;
            array.push(obj)
        }
        return array;
    }

    function checkIDValidity(currentInfo,allPupils){
        for(let i = 0; i<currentInfo.length;i++){
            if(typeof allPupils[currentInfo[i].user_id] === undefined){
                throw idValidityError
            }else{
                continue
            }
        }
    }

    function organizeInitialInfo(pupilsThatOrdered){ // makes object more compact for further search {id:ordered}
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
        if(response.status != 200){
            throw new Error(await response.text())
        }else{
            alert(await response.text())
        }
    }
    
    form.addEventListener("submit",(e)=>{
        e.preventDefault()
        try{
            if(!canOrderToday) throw timeError

            let currentInfo = extractInfo(checkboxes);

            let organizedAllPupils = organizeInitialInfo(pupils);
            checkIDValidity(currentInfo,organizedAllPupils);
            
            let deleteObj = {pupils:[]};
            let insertObj = {pupils:[]};

    
            for(let i = 0; i<currentInfo.length;i++){ // Checks if we uncheked a checkbox(row must be deleted from database) or checked one (row must be inserted into database) according to initial data from server
                let currentOrder = currentInfo[i];
                let initialOrder = organizedAllPupils[currentOrder.user_id];
                if(initialOrder){
                    if(currentOrder.ordered){
                        continue;
                    }else if (!currentOrder.ordered){
                        deleteObj.pupils.push(currentOrder.user_id);
                    }
                }else{
                    if(!currentOrder.ordered){
                        continue;
                    }else if (currentOrder.ordered){
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
            alert(scriptError(e));
        }
    });
    
}

document.addEventListener("DOMContentLoaded",(addEventListener)=>{
    addPostRequestLogic();
})