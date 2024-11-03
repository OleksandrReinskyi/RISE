const table = document.querySelector("table");
let currentMonthTag = document.querySelector("#current__month");
let buttonPrev = document.querySelector("#button__prev");
let buttonNext = document.querySelector("#button__next");

const userId = 123;
const daysArray = ["Пн","Вт","Ср","Чт","Пт","Сб","Нд"]
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
let numberOfDays = numberOfRows * 7;


const date = new Date();

let currentMonth = date.getMonth();
console.log(currentMonth)
function loadTable(){

}

function createRow(){

}

function FormData(){

}
