const {pupils} = window.serverData;

const table = document.querySelector("#orders_table");

function renderTable(pupils){
    let tbody = document.createElement("tbody");

    for(let i of pupils){
        tbody.insertAdjacentHTML("beforeend",createTableRow(i))
    }

    table.insertAdjacentElement("beforeend",tbody)

}

function createTableRow(pupil){

    return `
        <tr>
            <td>${pupil._name}</td>
            <td><input type="checkbox" class="orders_checkbox" name="${pupil.user_id}" value="true" ${pupil.ordered ? "checked" : ""}></td>
        </tr>
    `
}

document.addEventListener("DOMContentLoaded",(addEventListener)=>{
    renderTable(pupils);
})