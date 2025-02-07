let data = window.serverData;

let svgWidth = 500;
let svgHeight = 500;

let maxOrders = 30 
let scaleKoef = svgHeight/maxOrders;


let barPadding = 5;




function renderRects(data){
    for(let i in data){
        let elem = Object.values(data[i]);
        let classes = Object.keys(data[i]);
        let barWidth = (svgWidth/elem.length);

        let yOffset = 50;
        let xOffset = 20;

        let svg = d3.select(`[data-name="${i}"]`)
        .attr("width",svgWidth+"rem")
        .attr("height",svgHeight+"rem");


        let barChart = svg.selectAll("rect")
        .data(elem)
        .enter()
        .append("rect")
        .attr("y",function(d){
            return svgHeight - d*scaleKoef - yOffset
        })
        .attr("height",function(d){
            return d*scaleKoef+"rem"; //adaptivity
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
            console.log(d)
            return svgHeight - d*scaleKoef - yOffset -5
        })
        .attr("x",function(d,i){
            return barWidth * i + barWidth/2 + xOffset;
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
    }
}

function renderText(data){

}


function renderSVG(){
    renderRects(data);
}

renderSVG();