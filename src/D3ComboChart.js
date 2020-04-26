import React, {useEffect} from 'react'
import * as d3 from 'd3';

import './D3ComboChart.css' 

const data = [
    {
        "id": 23,
        "actual": 1000,
        "predicted": 1250,
        "monthYear": "Apr 2018",
        "impact": 0.12
    },
    {
        "id": 24,
        "actual": 1100,
        "predicted": 1000,
        "monthYear": "May 2018",
        "impact": -0.11
    },
    {
        "id": 25,
        "actual": 1050,
        "predicted": 1000,
        "monthYear": "Jun 2018",
        "impact": 0.14
    },
    {
        "id": 26,
        "actual": 990,
        "predicted": 1100,
        "monthYear": "Jul 2018",
        "impact": 0.19
    },{
        "id": 27,
        "actual": 950,
        "predicted": 1150,
        "monthYear": "Aug 2018",
        "impact": -0.07
    },{
        "id": 28,
        "actual": 1090,
        "predicted": 1055,
        "monthYear": "Sep 2018",
        "impact": 0.23
    },{
        "id": 29,
        "actual": 985,
        "predicted": 1025,
        "monthYear": "Oct 2018",
        "impact": 0.20
    },{
        "id": 30,
        "actual": 870,
        "predicted": 800,
        "monthYear": "Nov 2018",
        "impact": -0.12
    },{
        "id": 31,
        "actual": 1000,
        "predicted": 1120,
        "monthYear": "Dec 2018",
        "impact": 0.11
      },{
        "id": 32,
        "actual": 970,
        "predicted": 1200,
        "monthYear": "Jan 2019",
        "impact": -0.17
    },{
        "id": 33,
        "actual": 1000,
        "predicted": 1000,
        "monthYear": "Feb 2019",
        "impact": 0.18
    },{
        "id": 34,
        "actual": 900,
        "predicted": 1125,
        "monthYear": "Mar 2019",
        "impact": 0.12
    },
      
    ]
const getComboChart = (data) => {
    //To avoid multiple charts getting rendered on componentDiiUpdate
    //Remove the svg after every update and paint the svg again
    d3.select('#impact-chart').remove();

    //Define margin, height, width
    const margin = {top: 20, right: 70, bottom: 20, left: 75}
    const width = 1200 - margin.left - margin.right
    const height = 350 - margin.top - margin.bottom

    //Define range for the axes
    const xScale = d3.scaleBand().rangeRound([80, width]).paddingInner(0.5)
    const xScaleEmpty = d3.scaleBand().rangeRound([0,80])
    const y1Scale = d3.scaleLinear().range([height, 0])
    const y2Scale = d3.scaleLinear().range([height, 0])

    //Define domain for the axes
    xScale.domain(data.map((d) => {
        return d.monthYear
    }))

    xScaleEmpty.domain([])

    y1Scale.domain([
        d3.min(data, function(d){
            let minValue = Math.min(Math.min(d.predicted), Math.min(d.actual))*0.8 
            console.log({minValue})
            return minValue
        }) ,
        d3.max(data, function(d) {
            let maxValue = Math.max(Math.max(d.predicted), Math.max(d.actual))*1.2 
            return maxValue
        })
    ])

    y2Scale.domain([
        d3.min(data, function(d) {
            let min = Math.min(d.impact) 
            return (min < 0) ? (min*1.3) : (min*0.7)
        }),
        d3.max(data, function(d) {
            return Math.max(d.impact)*1.3
        })
    ])

    //Define the axis orientation for each of the axes
    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0)
    const xAxisEmpty = d3.axisBottom(xScaleEmpty).tickSizeOuter(0)
    const y1Axis = d3.axisLeft(y1Scale).tickFormat(function(d) {
                        return (d/1000)
                    }).tickSizeOuter(0)
    const y2Axis = d3.axisRight(y2Scale).tickFormat(function(d) {
                        return d+"%"
                    }).tickSizeOuter(0)

    //Define the SVG
    const svg = d3.select('#combo-chart')
                    .append('svg')
                    .attr('id','impact-chart')
                    .attr('width',width + margin.left + margin.right)
                    .attr('height',height + margin.top + margin.bottom)
                    .append('g')
                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    //Define the actual 
    const actualLine = d3.line()
                            .x(function(d) { return xScale(d.monthYear) })
                            .y(function(d) { return y1Scale(d.actual) })

    //Define the predicted 
    const predictedLine = d3.line()
                            .x(function(d) { return xScale(d.monthYear) })
                            .y(function(d) { return y1Scale(d.predicted) })

    //Define the rectangle 
    const rect = svg.selectAll('rect')
                    .data(data)

    const tooltip = d3.select('#tooltip');
    tooltip.style('display', 'none')
    const tooltipLine = svg.append('line');

    //Append individual elements to the SVG
    //Adding axes
    svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .attr('id', 'axis')
        .attr('class',"chart-text")
        .call(xAxis)

    svg.append('g')
        .attr('class', "chart-text")
        .call(d3.axisLeft()
            .scale(y1Scale)
            .tickSize(-width, 0, 0)
            .tickFormat(''))

    svg.append('g')
        .attr('transform', `translate(0, ${350})`)
        .attr('id', 'axis')
        .attr('class',"chart-text")
        .call(xAxisEmpty)

    svg.append('g')
        .attr('id', 'axis')
        .attr('class',"chart-text")
        .call(y1Axis)

    svg.append('g')
        .attr('transform', `translate(${width-10}, 0)`)
        .attr('id', 'axis')
        .attr('class',"chart-text")
        .call(y2Axis)

    //Adding rect
    rect.enter()
        .append('rect')
        .merge(rect)
        .attr('class', function(d) {
            if(d.impact >= 0) {
                return 'rect-impact positive'
            } else {
                return 'rect-impact negative'
            }
        })
        .attr('x', function(d){ return xScale(d.monthYear) })
        .attr('y', function(d){ return y2Scale(Math.max(0, d.impact)) })
        .attr('height', function(d){ return Math.abs(y2Scale(d.impact) - y2Scale(0)) })

    //Adding impact value above bars     
    rect.enter()
        .append('text')
        .merge(rect)
        .attr('class',"impact-value")
        .attr("x", function(d){return xScale(d.monthYear)+20})
        .attr("y", function(d) {
            if(d.impact > 0) {
                return y2Scale((d.impact))-5
            }  else {
                return y2Scale((d.impact))+10
            }
        })
        .text((d, i)=>{
            if(d.impact > 0) {
                return '+'+d.impact+'%';
            }
            else{
                return d.impact+'%';
            }
        })

    //Adding tooltip
    const tipBox = svg.append('rect')
                    .attr('width', width)
                    .attr('height', height)
                    .attr('opacity', 0)
                    .on('mousemove', drawTooltip)
                    .on('mouseout', removeTooltip);

    //Adding lines
    svg.append('path')
        .data([data])
        .attr('class', 'actual-line')
        .attr('d', actualLine)

    svg.append('path')
        .data([data])
        .attr('class', 'predicted-line')
        .attr('d', predictedLine);

    //Adding y1-label 
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left + 10)
        .attr('x',0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('KPI (in Units)')
        .attr('class',"chart-text");    

    //Adding y2-label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', width + 55)
        .attr('x',0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('IMPACT')
        .attr('class',"chart-text");    

    //Custom invert function
    xScale.invert = (function(){
        var domain = xScale.domain();
        var paddingOuter = xScale(domain[0]);
        var eachBand = xScale.step();
        return function (value) {
            var index = Math.floor(((value - paddingOuter) / eachBand));
            return domain[Math.max(0,Math.min(index, domain.length-1))];
        }
    })()

    function drawTooltip() {
        const xy = d3.mouse(tipBox.node())
        const monthYear = xScale.invert(xy[0]) 

        tooltipLine.attr('stroke', '#C5DAEA')
            .attr('x1', xScale(monthYear)+20)
            .attr('x2', xScale(monthYear)+20)
            .attr('y1', 0)
            .attr('y2', height);
        
        let filteredData = data.find(item => item.monthYear === monthYear)
        let filteredactual = filteredData.actual;
        let filteredpredicted = filteredData.predicted;
        let thresholdWidth = width

        tooltip.attr('class', function() {
            if((d3.event.pageX) < thresholdWidth) {
                return 'left-align'
            } else {
                return 'right-align'
            }
        })
        
        //Add tooltip on hover  
        tooltip.html(`<span class = 'd3-kpi-title'>Kpi</span> <span class = 'd3-kpi-sub-title'>(in Units)</span>`)
            .style('display', 'block')
            .style('left', (d3.event.pageX < thresholdWidth ? (d3.event.pageX + 20) : (d3.event.pageX - 195)) +'px')
            .style('top', (d3.event.pageY)+'px')
            .attr('height', height)
            .selectAll()
            .data([data]).enter()
            .append('div')
            .html(`<span class = 'd3-actual'>${((filteredactual)/1000)} </span><span class = 'd3-span-month'>${filteredData.monthYear} Actual </span>`)
            .append('div')
            .html(`<span class = 'd3-actual'>${((filteredpredicted)/1000)} </span><span class = 'd3-span-month'>${filteredData.monthYear} Forecasted </span>`)
    }

    function removeTooltip() {
        if (tooltip) { tooltip.style('display', 'none')}
        if (tooltipLine) { tooltipLine.attr('stroke', 'none')}
    }

}

const D3ComboChart = () => {

    useEffect(() => {
        getComboChart(data)
    }, [])

    return (
        <React.Fragment>
            <div className="legend-container">
                <div className="impact-legend-container">
                    <div className="legend-impact-box">
                        <div className="legend-impact-box-inner" />
                    </div>
                    Impact
                    </div>
                <div className="actual-legend-container">
                    <div className="legend-actual-line" />
                    Actual
                    </div>
                <div className="forecasted-legend-container">
                    <div className="legend-forecasted-line" />
                    Forecasted
                    </div>
            </div>
            <div id = 'combo-chart'>
                <div id='tooltip'>
                </div>
            </div>
        </React.Fragment>
    )
}

export default D3ComboChart;
