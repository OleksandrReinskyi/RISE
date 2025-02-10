import {formatData} from "./Utils/helpers.js"

const table = document.querySelector("#table__body");
let currentMonthTag = document.querySelector("#current__month");
let buttonPrev = document.querySelector("#button__prev");
let buttonNext = document.querySelector("#button__next");

/**
 * Loads a visual calendar with each cell being a link to order/date... page. Handles admin differences 
 */

const months = [
    "Січень",   // January
    "Лютий",    // February
    "Березень", // March
    "Квітень",  // April
    "Травень",  // May
    "Червень",  // June
    "Липень",   // July
    "Серпень",  // August
    "Вересень", // September
    "Жовтень",  // October
    "Листопад", // November
    "Грудень"   // December
];

let numberOfRows = 6;

const date = new Date();

export let currentMonth = date.getMonth();
export let currentYear = date.getFullYear();


function loadTable(currMonth,currYear){
    table.innerHTML = "";

    let firstDayOfMonth = ((new Date(currYear,currMonth,1)).getDay())-1
    let lastDateOfMonth = ((new Date(currYear,currMonth+1,0)).getDate());

    if(firstDayOfMonth == -1) firstDayOfMonth = 6;

    let date = 1;
    for(let rowNumber = 0; rowNumber<numberOfRows;rowNumber++){
        let row = document.createElement("tr");
        
        for(let dayNumber = 0; dayNumber<7;dayNumber++){
            let cell;
            if((rowNumber==0 && dayNumber<firstDayOfMonth) || date>lastDateOfMonth){
                cell = createCell()
            }else{
                cell = createCell(date, currMonth,currYear)
                date = date+1;
            }

            row.insertAdjacentElement("beforeend",cell);
        }
        
        table.appendChild(row);
    }
    currentMonthTag.innerHTML = `${months[currentMonth]} ${currYear} року`;
}



function createCell(day,month,year){
    let cell = document.createElement("th");
    if(day){
        let href = `/order?day=${day}&month=${month}&year=${year}`;
        let text = formatData(day,month,year);

        let link = document.createElement("a")
        link.setAttribute("href",href);
        link.innerText = text;

        if(window.displayPrompt){ // a function that is created in modeSwitch.js
            link.addEventListener("click",window.displayPrompt) // e.g if we are in admin mode (security is questionable)
        }
        cell.insertAdjacentElement("beforeend",link)
    }
    return cell;
}
loadTable(currentMonth,currentYear)

buttonNext.addEventListener("click",(event)=>{
    if(currentMonth==11){
        currentMonth=0;
        currentYear++;
    }else{
        currentMonth++;
    }

    loadTable(currentMonth,currentYear)
})
buttonPrev.addEventListener("click",(event)=>{
    if(currentMonth==0){
        currentMonth=11;
        currentYear--;
    }else{
        currentMonth--;
    }

    loadTable(currentMonth,currentYear)
})