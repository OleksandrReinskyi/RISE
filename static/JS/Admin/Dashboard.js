import {formatData} from "../Utils/Helpers.js"

let data = window.serverData;

let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;

let svgWidth = windowWidth-50;
let svgHeight = windowHeight/3;

let maxOrders = 35 
let scaleKoef = svgHeight/maxOrders;


let barPadding = 5;


function renderRects(data){
    let allSum = 0;
    for(let i in data){
        let elem = Object.values(data[i]);
        let classes = Object.keys(data[i]);
        let barWidth = ((svgWidth)/elem.length);

        let yOffset = 20;
        let xOffset = 20;

        let itemSum = elem.reduce((prev,cur)=>{
            return prev+cur;
        },0)

        let svg = d3.select(`[data-name="${i}"]`)
        .attr("width",svgWidth)
        .attr("height",svgHeight);


        let barChart = svg.selectAll("rect")
        .data(elem)
        .enter()
        .append("rect")
        .attr("fill","rgb(94, 211, 243)")
        .attr("y",function(d){
            return svgHeight - d*scaleKoef - yOffset
        })
        .attr("height",function(d){
            return d*scaleKoef; 
        })
        .attr("width", function(d){
            return barWidth-barPadding
        })
        .attr("transform",function(d,i){
            return `translate(${barWidth*i + xOffset},0)`
        })

        let text = svg.selectAll("text")
        .data(elem)
        .enter()
        .append("text")
        .text(function(d){
            return d;
        })
        .attr("y",function(d){
            return svgHeight - d*scaleKoef - yOffset - 5
        })
        .attr("x",function(d,i){
            return barWidth * i + barWidth/2 + xOffset -5;
        })
        .attr("fill","#000")

        let yScale = d3.scaleLinear()
        .domain([0,maxOrders])
        .range([svgHeight,0]);

        let xScale = d3.scaleBand(classes,[0,svgWidth])

        let yAxis = d3.axisLeft().scale(yScale);
        let xAxis = d3.axisBottom().scale(xScale);

        svg.append("g")
        .attr("transform",`translate(${xOffset},-${yOffset})`).call(yAxis);

        svg.append("g")
        .attr("transform",`translate(${xOffset},${svgHeight-yOffset})`).call(xAxis);

        svg._groups[0][0].insertAdjacentHTML("afterend",`<p class="class__sum">Всього: ${itemSum}</p>`)
        allSum+=itemSum
        data[i]["Всього"] = itemSum;
    }
    return allSum;
}


function renderSVG(){
    let allSum = renderRects(data);
    document.querySelector("#info__allsum").innerHTML = "Замовлень на сьогодні: "+allSum;
    data.allSum = allSum;

}


function getDate(){
    let url = new URL(location.href);
    let params = url.searchParams
    return formatData(params.get("day"),params.get("month"),params.get("year"))
}

function extractText(data){
    let string = "";
    for(let par in data){
        if(par == "allSum"){
            string+= `Всього замовень на день: ${data[par]}\n`
            continue;
        }
        string+= `---------- ${par} паралель ----------\n`
        for(let cls in data[par]){
            string += `${cls}: ${data[par][cls]}\n`
        }
        string+="\n"
    }
    return string;
}

function exportData(data){
    const file = new Blob([extractText(data)], { type: 'text/plain' });
    const link = document.querySelector("#info__link");
    link.href = URL.createObjectURL(file);
    link.download = `${getDate()}.txt`;
    link.click();
}

document.querySelector("#info__export").addEventListener("click",(event)=>{exportData(data)})
renderSVG();