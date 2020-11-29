function drawBarGraph(dataCountry, dataYear, aids, config)
{
    // source : http://bl.ocks.org/1Cr18Ni9/bfadecc96183c48d13b7b90bcf358a61
    // https://bl.ocks.org/alandunning/274bf248fd0f362d64674920e85c1eb7
    var margin = {top: 65, bottom: 50, left: 50, right: 30}, axisPadding = 10;
    var svgWidth = width + margin.left + margin.right,
        svgHeight = height + margin.top + margin.bottom;

    // Pre-processing
    var toShow = {"AIDS-Related Deaths" : {}, "New HIV Infections" : {}, "People Living with HIV" : {}};

    var svg = d3.select('#main').select('#bargraph')
        .select("#b-canvas-svg")
        .append('svg')
        .attr("width",svgWidth)
        .attr( "height" ,svgHeight);
    aids.forEach(function(d){


        if(toShow["AIDS-Related Deaths"][d["Country"]]== undefined) {
            toShow["AIDS-Related Deaths"][d["Country"]] = {};
        }
        if(toShow["New HIV Infections"][d["Country"]] == undefined)
        {
            toShow["New HIV Infections"][d["Country"]] = {};
        }
        if(toShow["People Living with HIV"][d["Country"]] == undefined) {
            toShow["People Living with HIV"][d["Country"]]= {};
        }

        toShow["AIDS-Related Deaths"][d["Country"]][d["Year"]] = Number(d["Data.AIDS-Related Deaths.AIDS Orphans"])+Number(d["Data.AIDS-Related Deaths.Adults"])+ Number(d["Data.AIDS-Related Deaths.Children"]) ;
        toShow["New HIV Infections"][d["Country"]][d["Year"]] = Number(d["Data.New HIV Infections.Adults"])+ Number(d["Data.New HIV Infections.Children"] );
        toShow["People Living with HIV"][d["Country"]][d["Year"]] = Number(d["Data.People Living with HIV.Total"]);

    });

    var option_select = d3.select("#bargraph").select('#bselectors').append("select")
        .attr("class", "b-option-select");

    var Countries = d3.map(aids, function (d) { return d["Country"]}).keys();

    Countries.forEach(function (d) {
        var opt = option_select.append("option")
            .attr("value", d)
            .text(d);
        if ( d == dataCountry) {
            opt.attr("selected", "true");
        }
    });
    var years = d3.map(aids, function (d) {
        return d["Year"]
    }).keys();
    var option_year = d3.select("#bargraph").select('#bselectors').append("select")
        .attr("class", "b-option-year");

    years.forEach(d => {
        var opt = option_year.append("option")
            .attr("value", d)
            .text(d);

        if (d == dataYear)
            opt.attr("selected", "true");
    });
    drawBars(dataCountry,dataYear);


    // Option selection changes
    option_select.on("change", function () {
        d3.select("#main").select("#bargraph").select("#b-canvas-svg").select("svg").selectAll("*").remove();
        drawBars(d3.select("#bargraph").select("#bselectors").select(".b-option-select").node().value, d3.select("#bargraph").select("#bselectors").select(".b-option-year").node().value, aids);
    });
    option_year.on("change", function () {
        d3.select("#main").select("#bargraph").select("#b-canvas-svg").select("svg").selectAll("*").remove();
        drawBars(d3.select("#bargraph").select("#bselectors").select(".b-option-select").node().value, d3.select("#bargraph").select("#bselectors").select(".b-option-year").node().value, aids);
    });

    function drawBars(dataCountry, dataYear){


        var max = 0;
        var colours = d3.scaleOrdinal()
            .range(d3.schemePaired);

        console.log(toShow +" "+ dataCountry +" "+ dataYear);
        Object.values(toShow).forEach(function (d) {
                    max = Math.max(max,d[dataCountry][dataYear]);
        });
        console.log(max);
        var xScale = d3.scaleBand().domain(Object.keys(toShow)).rangeRound([0, width]).padding(0.1),
            yScale = d3.scaleLinear().domain([0 , max]).rangeRound([height, 0]);
        svg.append("g")
            .attr("class", "axisx")
            .attr("transform", "translate("+margin.left+"," + height + ")")
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .attr("class", "axisy")
            .attr("transform", "translate("+margin.left + ", 0)")
            .call(d3.axisLeft(yScale))
            .append("text")
            .attr("transform", "rotate(-90)" )
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .attr("fill", "#5D6971")
            .text("Count");


        var div = d3.select("#bargraph").append('div')
            .attr('class', 'tooltipbar')
            .style('display', 'none');

        console.log(Object.values(toShow));
        svg.selectAll(".bar")
            .data(Object.values(toShow))
            .enter().append("rect")
            .attr("transform","translate("+(margin.left+ 60)+ ", 0)")
            .attr("x", function(d,i) { return xScale(Object.keys(toShow)[i]); })
            .attr("y", function(d) { return yScale(d[dataCountry][dataYear]); })
            .attr("width", xScale.bandwidth()/2)
            .attr("height", function(d) { return height - yScale(d[dataCountry][dataYear]); })
            .attr("fill", function(d,i) { return colours(Object.keys(toShow)[i]); })
            .attr("class", "brect")
            .on("mouseover", function (d) {div.style('display', 'inline');})
            .on("mousemove", function(d){
                    div.html(dataCountry + '<hr/>' + d[dataCountry][dataYear])
                        .style('left', (d3.event.pageX - 34) + 'px')
                        .style('top', (d3.event.pageY - 12) + 'px');
            })
            .on("mouseout", function(d){ div.style('display', 'none');});

    }
}