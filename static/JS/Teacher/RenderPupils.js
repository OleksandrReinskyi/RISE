
const {allPupils,pupilsThatOrdered} = window.serverData;

const table = document.querySelector("#orders_table");

function normalizeData(allPupils,pupilsThatOrdered){
    let orderedIds = [];

    for(let i of pupilsThatOrdered){
        orderedIds.push(i.user_id);
    }

    let finalArr = allPupils.slice();

    for(let pupil of finalArr){
        if(orderedIds.includes(pupil.user_id)){
            pupil.ordered = "Y";
        }
    }
    return finalArr;
}

function renderTable(allPupils,pupilsThatOrdered){
    let normalizedPupils = normalizeData(allPupils,pupilsThatOrdered);

    let tbody = document.createElement("tbody");

    for(let i of normalizedPupils){
        tbody.insertAdjacentHTML("beforeend",createTableRow(i))
    }

    table.insertAdjacentElement("beforeend",tbody)

}

function createTableRow(pupil){
    return `
        <tr>
            <td>${pupil._name}</td>
            <td><input type="checkbox" class="orders_checkbox" name="${pupil.user_id}" value="Y" ${pupil.ordered == "Y" ? "checked" : ""}></td>
        </tr>
    `
}

document.addEventListener("DOMContentLoaded",(addEventListener)=>{
    renderTable(allPupils,pupilsThatOrdered);
})