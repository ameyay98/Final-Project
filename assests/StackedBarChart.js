function drawStackedBarChart(dataColumn, dataCountry, data, config)
{
    var margin = {top: 20, right: 20, bottom: 30, left: 40};
    var width = 960;
    var svg = d3.select('#main').select("#stackedbargraph").select("#sb-canvas-svg").append("svg").attr("width",width +margin.left+margin.right)
        .attr("height",height + margin.top + margin.bottom).style("padding-top", "10px"),
        g = svg.append("g").attr("transform", "translate(" + margin.left + ","+ margin.top+")")
            ;
    var x = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.05)
        .align(0.1);

    var format = d3.format(",");
// set y scale
    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

// set the colors
    var z = d3.scaleOrdinal()
        .range(["#3399FF", "#FF8000"]);


    var option_select = d3.select('#main').select("#stackedbargraph").select('#sbselectors').append("select")
        .attr("class", "sb-option-select");

    var toShow = {"AIDS-Related Deaths" : {}, "New HIV Infections" : {}, "People Living with HIV" : {}};
    Object.keys(toShow).forEach(function (d) {
        console.log(d);
        var opt = option_select.append("option")
            .attr("value", d)
            .text(d);

        if (d === dataColumn) {
            opt.attr("selected", "true");
        }
    });


    var option_country = d3.select('#main').select("#stackedbargraph").select('#sbselectors').append("select")
        .attr("class", "sb-option-country");

    var Countries = d3.map(data, function (d) { return d["Country"]}).keys();

    Countries.forEach(function (d) {
        var opt = option_country.append("option")
            .attr("value", d)
            .text(d);
        if ( d == dataCountry) {
            opt.attr("selected", "true");
        }
    });
    option_select.on("change", function () {
        d3.select("#main").select("#stackedbargraph").select("#sb-canvas-svg").select("svg").selectAll("*").remove();
        drawStackedBar(d3.select('#main').select("#stackedbargraph").select('#sbselectors').select(".sb-option-select").node().value,  d3.select('#main').select("#stackedbargraph").select('#sbselectors').select(".sb-option-country").node().value,data);
    });
    option_country.on("change", function () {
        d3.select("#main").select("#stackedbargraph").select("#sb-canvas-svg").select("svg").selectAll("*").remove();
        drawStackedBar(d3.select('#main').select("#stackedbargraph").select('#sbselectors').select(".sb-option-select").node().value, d3.select('#main').select("#stackedbargraph").select('#sbselectors').select(".sb-option-country").node().value,data);
    });

    drawStackedBar(dataColumn,dataCountry,data);
    function drawStackedBar(dataColumn, dataCountry, data) {

        g = d3.select("#main").select("#stackedbargraph").select("#sb-canvas-svg").select("svg");
        var keys = data.columns.slice(1).filter(function (d) {
            if (d.includes(dataColumn) && (d.includes("Male") || d.includes("Female"))) {
                return d;
            }
        });

        data = data.filter(function (d) {
            return d["Country"] == dataCountry
        });
        data.forEach(function (d) {
            let sum = 0;
            keys.forEach(function (t) {
                sum += +d[t];
            });
            d["total"] = sum;
        });
        x.domain(data.map(function (d) {
            return d.Year;
        }));
        y.domain([0, d3.max(data, function (d) {
            return d.total;
        })]).nice();
        z.domain(keys);

        g.append("g")
            .selectAll("g")
            .data(d3.stack().keys(keys)(data))
            .enter().append("g")
            .attr("fill", function (d) {
                return z(d.key);
            })
            .selectAll("rect")
            .data(function (d) {
                return d;
            })
            .enter().append("rect")
            .attr("x", function (d) {
                return x(d.data.Year) + margin.left;
            })
            .attr("y", function (d) {
                return y(d[1]) + margin.top;
            })
            .attr("height", function (d) {
                return y(d[0]) - y(d[1]);
            })
            .attr("width", x.bandwidth())
            .on("mouseover", function () {
                tooltip.style("display", null);
            })
            .on("mouseout", function () {
                tooltip.style("display", "none");
            })
            .on("mousemove", function (d) {
                var xPosition = d3.mouse(this)[0] - 5;
                var yPosition = d3.mouse(this)[1] - 5;
                tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
                tooltip.select("text").text(d[1] - d[0]);
            });
        g.append("g")
            .attr("class", "xaxis")
            .attr("transform", "translate("+(margin.left)+"," + (height + margin.top) + ")")
            .call(d3.axisBottom(x));
        g.append("g")
            .attr("class", "yaxis")
            .attr("transform", "translate("+(margin.left)+"," + (margin.top) + ")")
            .call(d3.axisLeft(y).ticks(null, "s").tickFormat(d3.format(",.0f")))
            .append("text")
            .attr("x", 2)
            .attr("y", y(y.ticks().pop()) + 0.5)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start");
        var legend = g.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .attr("class", "legend")
            .selectAll("g")
            .data(keys.slice().reverse())
            .enter().append("g")
            .attr("transform", function (d, i) {
                return "translate(20," + i * 20 + ")";
            });
        legend.append("rect")
            .attr("x", width - 19)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", z);
        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(function (d) {
                if (d.includes("Male")) return "Male"; else return "Female";
            });

        // Prep the tooltip bits, initial display is hidden
        var tooltip = svg.append("g")
            .attr("class", "tooltip")
            .style("display", "none");

        tooltip.append("rect")
            .attr("width", 60)
            .attr("height", 20)
            .attr("fill", "white")
            .style("opacity", 0.5);

        tooltip.append("text")
            .attr("x", 30)
            .attr("dy", "1.2em")
            .style("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("font-weight", "bold");
    }
}