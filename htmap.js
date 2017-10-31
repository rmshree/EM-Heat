function drawD3FaultMap(passData, stateDict, title, divName, hmWidth, hmHeight, mode, margin) {

    // $(divName).empty();
    //this should be updated to reflect the different discrete error states for a given heat map
    
    //to ensure the widths are redrawn
    var firstDay = moment(passData[0], "MM/DD/YYYY");
    var lastDay = moment(passData[passData.length - 2], "MM/DD/YYYY");
    var days = lastDay.diff(firstDay, "day");//order matters

    console.log("First Day", firstDay);
    console.log("Last Day", lastDay);

    var width = hmWidth - margin.left - margin.right; //div width - margins, in the future this should be adjustable
    var height = hmHeight - margin.top - margin.bottom; //div height - margins, in the future this should be adjustable
    var boxHeight = Math.floor((height - margin.top - margin.bottom) / 24);
    var boxWidth = (width - margin.left - margin.right) / (days); //there could be a limit to the width

    var colors = ['#FFFFFF', '#FF1919', '#e5e5ff', '#e5e5ff']; //no error (0), //day error (1), //future data yet to be ingested (2), //no past data history (3), fault (4)
    var maxDomain = d3.max(passData, function (d) { return d.Fault; })
    var domain0 = [firstDay.toDate(), lastDay.toDate()]
    var x = d3.time.scale()
        .domain(domain0)
        .range([0, (width - margin.left - margin.right)]);
    var xAxis = d3.svg.axis()
        .scale(x);
    var y = d3.scale.linear()
        .domain([0, 24])
        .range([0, boxHeight*24]);
    var yAxis = d3.svg.axis()
              .scale(y)
              .orient("left")
              .ticks(24);

    console.log("Domain max:", maxDomain);

    var colorScale = d3.scale.ordinal()
        .domain([0, 1, 2, 3]) //this needs to match the colors and dictionary
        .range(colors);
    d3.range(0, 4).forEach(function (d) { console.log(colorScale(d)); }) //this needs to match the colors and dictionary (6 is ignored)

    var div = d3.select("body").append("div")
        .attr("class", divName)
        .style("opacity", 1e-6);

    //match the #div with the div id above
    var svg = d3.select("#one").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + 0 + "," + 0 + ")");  //zeros eventually replaced with top and left margins
    var heatMap = svg.selectAll("rect")
        .data(passData) //the structure of this data should be consistent and well-defined prior to passing.  This function will break if the data format is not appropriate
        .enter().append("rect")
        .attr("x", function (d, i) {
            if (mode !== 0) {
                return Math.random() * (Math.random() * 25);
            }
            else {
                return Math.random() * (Math.random() * 1300);
            }
        })

        .attr("y", function (d) {
            return d.Hour * boxHeight + margin.top;
        })
        .attr("rx", 2)
        .attr("ry", 2)
        //.attr("class","hour bordered")
        .attr("width", boxWidth)
        .attr("height", boxHeight)
        .style("fill", function (d) {
            return "#80E4F8"; //initial color, which is eventually changed to the actual box color
        })
        .style("opacity", 0.4)
        .style("stroke", "black") //borders start
        .style("stroke-width", 1)
        .style("stroke-opacity", 0.5) //borders end
        .on("mouseover", function (d) {
            //console.log("Mouseover:",this)
            d3.select(this).style("opacity", 1); //play with opacities of the rectangles for different effects
            div.transition()
                .duration(200)
                .style("opacity", 1);
            //console.log(this);

        })

        .on("mouseout", function (d) {
            //console.log("Mouseout: ", this)
            d3.select(this).style("opacity", 0.4);
            div.transition()
                .duration(500)
                .style("opacity", 0);
        })

        
        .on("mousemove", function (d) {
            var html = d.Date + "<br/>";
            html += returnTimeSpan(d.Hour) + "<br/>"; //if the passData structure is wrong, all of this will break, because d.property would not be found
            html += "Fault Status:" + stateDict[d.Fault] + "<br/>";
            div.html(html)
                .style("left", (d3.event.pageX + 25) + "px")
                .style("top", (d3.event.pageY - 20) + "px");
            //console.log(div);
        })

        var gAxis = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + (margin.left - boxWidth/2) + "," + (height - margin.bottom) + ")")
        
        var vAxis = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + (margin.left - boxWidth/2) + "," + (margin.top) + ")")
        .call(yAxis)
        .call(xAxis)

        svg.append("text")
           .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
           .attr("transform", "translate(" + (10) + "," + (height - margin.top - margin.bottom)/2 + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
           .text("Hour of Day");

        svg.append("text")
               .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
               .attr("transform", "translate(" + (width/2) + "," + (margin.top*0.75) + ")")  // text is drawn off the screen top left, move down and out and rotate
               .text(title)

        heatMap.transition().duration(1000)
            .ease("cubic")
            .style("fill", function (d) { return colorScale(d.Fault); }) //this launches the transition from the initial color (likely black" to the final color
            .style("stroke", "#80E4F8")
            .attr("x", function (d, i) {
                return Math.floor(i / 24) * boxWidth + margin.left - boxWidth/2;
            })

        console.log("Finale");

}       

    
    

    

    function returnTimeSpan(hour) {
        if (hour < 12) {
            var hr1 = 0;
            var hr2 = 0;
            if (hour === 0) {
                hr1 = 12 //12AM
                hr2 = hour + 1;
            }
            else {
                hr1 = hour; //1AM onwards
                hr2 = hour + 1;
            }
            var st = hr1.toString() + ":" + "00" + "-" + hr2.toString() + ":00 AM";
            if (hour === 11) { st = hr1.toString() + ":" + "00 AM" + "-" + hr2.toString() + ":00 PM"; }
            return st;
        }
        else if (hour >= 12) {
            var hr1 = 0;
            var hr2 = 0;
            if (hour === 12) {
                hr1 = hour; //12PM
                hr2 = hour + 1 - 12;
            }
            else {
                hr1 = hour - 12; //1PM onwards
                hr2 = hour + 1 - 12;
            }
            var st = hr1.toString() + ":" + "00" + "-" + hr2.toString() + ":00 PM";
            if (hour === 23) { st = hr1.toString() + ":" + "00" + "-" + hr2.toString() + ":00 AM"; }
            return st;
        }
    }