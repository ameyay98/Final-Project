

function drawLineGraph(dataColumn, dataCountry, aids, config) {
    // sources : https://codepen.io/zakariachowdhury/pen/JEmjwq
    var margin = {top: 65, bottom: 50, left: 50, right: 30}, axisPadding = 10;
    var duration = 250;
    var height = 600;
    var width = 800;
    var lineOpacity = "0.25";
    var lineOpacityHover = "0.85";
    var otherLinesOpacityHover = "0.1";
    var lineStroke = "1.5px";
    var lineStrokeHover = "2.5px";

    var circleOpacity = '0.85';
    var circleOpacityOnLineHover = "0.25"
    var circleRadius = 3;
    var circleRadiusHover = 6;


    let toShow = {"AIDS-Related Deaths" : {}, "New HIV Infections" : {}, "People Living with HIV" : {}};

    var fields = Object.keys(aids[0]);
    var parseDate = d3.timeParse("%Y");
    aids.forEach(function(d){
        if(toShow["AIDS-Related Deaths"][d["Country"]]== undefined) {
            toShow["AIDS-Related Deaths"][d["Country"]] = [];
        }
        if(toShow["New HIV Infections"][d["Country"]] == undefined)
        {
            toShow["New HIV Infections"][d["Country"]] = [];
        }
        if(toShow["People Living with HIV"][d["Country"]] == undefined) {
            toShow["People Living with HIV"][d["Country"]] = [];
        }

        fields.forEach(f => {
            if(f.includes("AIDS-Related Deaths")) {
                let flag = 0;
                toShow["AIDS-Related Deaths"][d["Country"]].forEach(function (temp) {
                    if(temp.name == f)
                    {
                        temp.values.push({date:parseDate(d["Year"]), value : +d[f]});
                        flag = 1;
                    }
                });
                if(flag == 0)
                {
                    toShow["AIDS-Related Deaths"][d["Country"]].push({name : f, values : [{date:parseDate(+d["Year"]), value : +d[f]}]});
                }
            }

        });
        fields.forEach(f => {
            if(f.includes("New HIV Infections")) {
                let flag = 0;
                toShow["New HIV Infections"][d["Country"]].forEach(function (temp) {
                    if(temp.name == f)
                    {
                        temp.values.push({date:parseDate(+d["Year"]), value : +d[f]});
                        flag = 1;

                    }
                });
                if(flag == 0)
                {
                    toShow["New HIV Infections"][d["Country"]].push({name : f, values : [{date:parseDate(+d["Year"]), value : +d[f]}]});
                }

            }

        });
        fields.forEach(f => {
            if(f.includes("People Living with HIV")) {
                let flag = 0;
                toShow["People Living with HIV"][d["Country"]].forEach(function (temp) {
                    if(temp.name == f)
                    {
                        temp.values.push({date:parseDate(+d["Year"]), value : +d[f]});
                        flag = 1;
                    }
                });
                if(flag == 0)
                {
                    toShow["People Living with HIV"][d["Country"]].push({name : f, values : [{date:parseDate(+d["Year"]), value : +d[f]}]});
                }
            }

        });


    });
    console.log(toShow);





    /* Add SVG */
    var svg = d3.select("#linegraph").select("#l-canvas-svg").append("svg")
        .attr("width", (width + margin.left + margin.right) + "px")
        .attr("height", (height + margin.top + margin.bottom) + "px")
        .append('g')
        .attr("transform", `translate(${margin.left}, ${margin.top})`);



    var option_select = d3.select("#linegraph").select('#lselectors').append("select")
        .attr("class", "l-option-select");


   Object.keys(toShow).forEach(function (d) {
       console.log(d);
            var opt = option_select.append("option")
                .attr("value", d)
                .text(d);

            if (d === config.default_column) {
                opt.attr("selected", "true");
            }
    });


    var option_country = d3.select("#linegraph").select('#lselectors').append("select")
        .attr("class", "l-option-country");

    var Countries = d3.map(aids, function (d) { return d["Country"]}).keys();

    Countries.forEach(function (d) {
        var opt = option_country.append("option")
            .attr("value", d)
            .text(d);
        if ( d == config.default_country) {
            opt.attr("selected", "true");
        }
    });
    option_select.on("change", function () {
        svg.selectAll(".lines").remove();
        svg.selectAll(".circle").remove();
        svg.select(".legendLinear").remove();
        svg.select(".xaxis").remove();
        svg.select(".yaxis").remove();
        drawLineChart(d3.select("#linegraph").select("#lselectors").select(".l-option-select").node().value,  d3.select("#linegraph").select("#lselectors").select(".l-option-country").node().value);
    });
    option_country.on("change", function () {
        svg.selectAll(".lines").remove();
        svg.selectAll(".circle").remove();
        svg.select(".legendLinear").remove();
        svg.select(".xaxis").remove();
        svg.select(".yaxis").remove();
        drawLineChart(d3.select("#linegraph").select("#lselectors").select(".l-option-select").node().value, d3.select("#linegraph").select("#lselectors").select(".l-option-country").node().value,);
    });
    drawLineChart(dataColumn,dataCountry);
    /* Scale */

    function drawLineChart(dataColumn, dataCountry) {


        console.log(d3.extent(toShow[dataColumn][dataCountry][0].values, d => d.date));
        var xScale = d3.scaleTime()
            .domain(d3.extent(toShow[dataColumn][dataCountry][0].values, d => d.date))
            .range([0, width - margin.right]);

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(toShow[dataColumn][dataCountry][0].values, d => d.value)])
            .range([height - margin.top - margin.bottom, 0]);


        var color = d3.scaleOrdinal(d3.schemeCategory10);

        svg.append("g")
            .attr("class", "legendOrdinal")
            .attr("transform", "translate(20,20)");


        d3.select(".legendOrdinal")
        /* Add line into SVG */
        var line = d3.line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.value));

        let lines = svg.append('g')
            .attr('class', 'lines');

        var div = d3.select("#linegraph").append('div')
            .attr('class', 'tooltipline')
            .style('display', 'none');
        lines.selectAll('.line-group')
            .data(toShow[dataColumn][dataCountry]).enter()
            .append('g')
            .attr('class', 'line-group')
            .attr('transform', `translate(${margin.left - 27},${margin.top + margin.bottom - 10})`)
            .on("mouseover", function (d, i) {
                div.style('display', 'inline');

            })
            .on("mousemove", function (d) {
                div.html(d.name)
                    .style('left', (d3.event.pageX - 34) + 'px')
                    .style('top', (d3.event.pageY - 12) + 'px');
            })
            .on("mouseout", function (d) {
                div.style('display', 'none');
            })
            .append('path')
            .attr('class', 'line')
            .attr('d', d => line(d.values))
            .style('stroke', (d, i) => color(i))
            .style('opacity', lineOpacity)
            .on("mouseover", function (d) {
                d3.selectAll('.line')
                    .style('opacity', otherLinesOpacityHover);
                d3.selectAll('.circle')
                    .style('opacity', circleOpacityOnLineHover);
                d3.select(this)
                    .style('opacity', lineOpacityHover)
                    .style("stroke-width", lineStrokeHover)
                    .style("cursor", "pointer");
            })
            .on("mouseout", function (d) {
                d3.selectAll(".line")
                    .style('opacity', lineOpacity);
                d3.selectAll('.circle')
                    .style('opacity', circleOpacity);
                d3.select(this)
                    .style("stroke-width", lineStroke)
                    .style("cursor", "none");
            });


        /* Add circles in the line */
        lines.selectAll("circle-group")
            .data(toShow[dataColumn][dataCountry]).enter()
            .append("g")
            .attr('transform', `translate(${margin.left - 27},${margin.top + margin.bottom - 10})`)
            .style("fill", (d, i) => color(i))
            .selectAll("circle")
            .data(d => d.values).enter()
            .append("g")
            .attr("class", "circle")
            .on("mouseover", function (d) {
                d3.select(this)
                    .style("cursor", "pointer")
                    .append("text")
                    .attr("class", "text")
                    .text(`${d.value}`)
                    .attr("x", d => xScale(d.date) + 5)
                    .attr("y", d => yScale(d.value) - 10);
            })
            .on("mouseout", function (d) {
                d3.select(this)
                    .style("cursor", "none")
                    .transition()
                    .duration(duration)
                    .selectAll(".text").remove();
            })
            .append("circle")
            .attr("cx", d => xScale(d.date))
            .attr("cy", d => yScale(d.value))
            .attr("r", circleRadius)
            .style('opacity', circleOpacity)
            .on("mouseover", function (d) {
                d3.select(this)
                    .transition()
                    .duration(duration)
                    .attr("r", circleRadiusHover);
            })
            .on("mouseout", function (d) {
                d3.select(this)
                    .transition()
                    .duration(duration)
                    .attr("r", circleRadius);
            });



        svg.append("g")
            .attr("class", "legendLinear")
            .attr("transform", "translate(30,-20)");

        var legendLinear = d3.legendColor()
            .shapeWidth(30)
            .labelFormat(d3.format(".0f"))
            .cells(toShow[dataColumn][dataCountry].length)
            .orient('vertical')
            .scale(color.domain(d3.map(toShow[dataColumn][dataCountry], d=>d.name).keys()));

        console.log(d3.map(toShow[dataColumn][dataCountry], d=>d.name).keys());
        svg.select(".legendLinear")
            .call(legendLinear);
        /* Add Axis into SVG */
        var xAxis = d3.axisBottom(xScale).ticks(5);
        var yAxis = d3.axisLeft(yScale).ticks(5);
        svg.append("g")
            .attr("class", "xaxis")
            .attr("transform", `translate(20, ${height})`)
            .call(xAxis);

        svg.append("g")
            .attr("class", "yaxis")
            .attr("transform", `translate(10, ${margin.top + margin.bottom})`)
            .call(yAxis)
            .append('text')
            .attr("y", 15)
            .attr("transform", "rotate(-90)")
            .attr("fill", "#000")
            .text("Total values");


    }
}