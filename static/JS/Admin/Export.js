import XLSX from "./../Utils/xlsx.bundle.js" // very unsafe import (copy-pasted file from node_module into this directory)

const exportButton = document.getElementById("export_button");
let url = "/home/export"
let rbgForPrivileged = "f5ce42";

exportButton.addEventListener("click",async (event)=>{
    try{
        let response = await fetch(url,{
            method:"POST",
            body:JSON.stringify({
                month: currentMonth,
                year: currentYear
            }),
            headers:{"Content-Type":"application/json"}
        }) 
    
        if(response.status == 200){
            const data = await response.json();
            const wb = XLSX.utils.book_new();

            for(let index in data){
                const ws = XLSX.utils.aoa_to_sheet([[]]);
                let item = data[index];

                let days = []; // Create days arr for columns in excel sheet
                for(let i of (((Object.values(item)[0])["orders"]).keys())){
                    let index = i+1;
                    days.push(`${index<10 ? ("0"+index) : index}.${currentMonth+1}`)
                    
                }

                XLSX.utils.sheet_add_aoa(ws,[
                    ["Учні",...days]
                ],{origin:-1})
                
                let number = 3;

                for(let pupil in item){
                    XLSX.utils.sheet_add_aoa(ws,[
                        [pupil,...item[pupil].orders]
                    ],{origin:-1})
                    if(item[pupil].info.privileged){ //Different color if privileged
                        ws[`A${number}`].s = {
                            fill : {fgColor:{rgb:rbgForPrivileged}},

                        }
                    }
                    number++
                }
                XLSX.utils.book_append_sheet(wb,ws,index);
            }

            XLSX.writeFile(wb,`Звіт ${currentMonth+1}.${currentYear}.xlsx`);
            
        }else{
            throw new Error(response.statusText)
        }
    }catch(e){
        alert("Сталася непередбачувана помилка!")
        console.error(e)
    }
    

})