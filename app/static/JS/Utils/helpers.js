export function formatData(day,month,year){
    let formattedMoth = Number(month) + 1;
    return `${day<10 ? "0" + day : day}.${formattedMoth < 10 ? "0"+formattedMoth : formattedMoth}.${year}`
}
