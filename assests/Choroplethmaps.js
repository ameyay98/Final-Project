function drawChoropleth(dataColumn, year, aids, topo, config) {

    // sources : http://bl.ocks.org/palewire/d2906de347a160f38bc0b7ca57721328
    // https://bl.ocks.org/dnprock/b48388ee8bc5582947b6
    // For Choropleth map
    var csvg = d3.select('#main').select("#choroplethmap")
        .select("#canvas-svg")
        .append("svg")
        .attr("width",width)
        .attr("height",height);
    var projection = d3.geoNaturalEarth()
        .scale(width / 2 / Math.PI)
        .translate([width / 2, height / 2]);
    var path = d3.geoPath()
        .projection(projection);
    var fields = Object.keys(aids[0]);
    var toShow = ["AIDS-Related Deaths","New HIV Infections","People Living with HIV" ];
    fields = fields.filter(function(d){
        var temp = d.split(".");
        if(toShow.includes(temp[1]))
        {
            if(temp[2].includes("All") || temp[2].includes("Total"))
                return d;
        }
    });

    var option_select = d3.select('#main').select("#choroplethmap").select('#selectors').append("select")
        .attr("class", "option-select");

    for (var i = 0; i < fields.length; i++) {
        if (fields[i] !== "Country" && fields[i] != "Year") {
            var opt = option_select.append("option")
                .attr("value", fields[i])
                .text(fields[i].split(".")[1]);

            if (fields[i] === config.default) {
                opt.attr("selected", "true");
            }
        }
    }
    var years = d3.map(aids, function (d) {
        return d["Year"]
    }).keys();
    var option_year = d3.select('#main').select("#choroplethmap").select('#selectors').append("select")
        .attr("class", "option-year");

    years.forEach(d => {
        var opt = option_year.append("option")
            .attr("value", d)
            .text(d);

        if (d == config.default_year)
            opt.attr("selected", "true");
    });


   function onChange(config, aids){
       var x = document.getElementById("country").value;
       console.log(x);
       d3.select("#main").select("#bargraph").select("#bselectors").selectAll("*").remove();
       d3.select("#main").select("#bargraph").select("#b-canvas-svg").selectAll("*").remove();
       drawBarGraph(x,config.default_year, aids, config);
       d3.select("#main").select("#linegraph").select("#mf-line").select("#l-canvas-svg").selectAll("*").remove();
       d3.select("#main").select("#linegraph").select("#mf-line").select("#lselectors").selectAll("*").remove();
       d3.select("#main").select("#linegraph").select("#ms-line").select("#slselectors").selectAll("*").remove();
       d3.select("#main").select("#linegraph").select("#ms-line").select("#sl-canvas-svg").selectAll("*").remove();
       drawLineGraph(config.default_column,x,aids, config);
       d3.select("#main").select("#stackedbargraph").select("#sbselectors").selectAll("*").remove();
       d3.select("#main").select("#stackedbargraph").select("#sb-canvas-svg").selectAll("*").remove();
       drawStackedBarChart(config.default_column,x, aids, config);
   }
        //This input has changed


    drawMap(dataColumn, year, aids, topo);
    option_select.on("change", function () {
        d3.select("#main").select("#choroplethmap").select("#canvas-svg").select("svg").selectAll("*").remove();
        drawMap(d3.select('#main').select("#choroplethmap").select("#selectors").select(".option-select").node().value, d3.select('#main').select("#choroplethmap").select("#selectors").select(".option-year").node().value, aids, topo);
    });
    option_year.on("change", function () {
        d3.select("#main").select("#choroplethmap").select("#canvas-svg").select("svg").selectAll("*").remove();
        drawMap(d3.select('#main').select("#choroplethmap").select("#selectors").select(".option-select").node().value, d3.select('#main').select("#choroplethmap").select("#selectors").select(".option-year").node().value, aids, topo);
    });

    function drawMap(dataColumn, year, aids, topo) {
        console.log(dataColumn + " " + year +" "+ year);
        // var csvg = d3.select('#main').select("#choroplethmap");
        var data = d3.map();
        aids.forEach(function (d) {
            if (d["Year"] == year) {
                data.set(d["Country"], +d[dataColumn]);
            }
        });

        console.log(data);

        var g = csvg
            .append("g")
            .attr("class", "legendThreshold")
            .attr("transform", "translate(20,20)");
        g.append("text")
            .attr("class", "caption")
            .attr("x", 0)
            .attr("y", -6)
            .text(dataColumn.split(".")[1]);

        var min = 1000000000000;
        data.values().forEach(function (d) {
            if(d!=0)
            {
                min = Math.min(d,min);
            }
        });

        var colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
            .domain([min, d3.max(data.values())]);
            // .range(["rgba(85,223,255,0.6)", "#0A1975"]);

        csvg.append("g")
            .attr("class", "legendLinear")
            .attr("transform", "translate(20,20)");

        var legendLinear = d3.legendColor()
            .shapeWidth(30)
            .labelFormat(d3.format(".0f"))
            .cells(7)
            .orient('vertical')
            .scale(colorScale);


        csvg.select(".legendLinear")
            .call(legendLinear);

        var div = d3.select("#bargraph").append('div')
            .attr('class', 'tooltipbar')
            .style('display', 'none');
        csvg.append("g")
            .attr("class", "countries")
            .selectAll("path")
            .data(topo.features)
            .enter().append("path")
            .attr("fill", function (d) {
                var t = data.get(d.properties.name) || 0;
                if(t == 0)
                    return "rgb(237,237,237)";
                else
                    return colorScale(t);
            })
            .attr("stroke","black")
            .attr("stroke-width","0.5")
            .attr("d", path)
        .on("mouseover", function (d) {div.style('display', 'inline');})
        .on("mousemove", function(d){
            div.html( d.properties.name+ '<hr/>' + (data.get(d.properties.name) == undefined? 0 :data.get(d.properties.name)))
                .style('left', (d3.event.pageX - 34) + 'px')
                .style('top', (d3.event.pageY - 12) + 'px');
        })
        .on("mouseout", function(d){ div.style('display', 'none');})
         .on("click", function (d) {
             document.getElementById("country").value = d.properties.name;
             onChange(config, aids);
         });


    }




}