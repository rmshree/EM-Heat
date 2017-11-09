  //UI configuration
  var itemSize = 18,
    cellSize = itemSize-1,
    width = 800,
    height = 800,
    margin = {top:20,right:20,bottom:20,left:40};

  //formats
  var hourFormat = d3.time.format('%H'),
    hourMinFormat = d3.time.format("%H:%M"),
    dayFormat = d3.time.format('%j'),
    timeFormat = d3.time.format('%Y-%m-%dT%X'),
    monthDayFormat = d3.time.format('%m/%d');

  //data vars for rendering
  var dateExtent = null,
    data = null,
    dayOffset = 0,
    colorCalibration = ['#f6faaa','#FEE08B','#FDAE61','#F46D43','#D53E4F','#9E0142'],
    dailyValueExtent = {};

  var rect = null;
   

 function renderdata(data){
 
  //axises and scales
  var axisWidth = 0 ,
    axisHeight = itemSize*24,
    yAxisScale = d3.time.scale(),
    yAxis = d3.svg.axis()
      .orient('left')
      .ticks(d3.time.days,5)
      .tickFormat(monthDayFormat),
    xAxisScale = d3.scale.linear()
      .range([0,axisHeight])
      .domain([0,24]),
    xAxis = d3.svg.axis()
      .orient('top')
      .ticks(5)
      .tickFormat(d3.format('02d'))
      .scale(xAxisScale);

  initCalibration();

  var svg = d3.select('[role="heatmap"]');
  var heatmap = svg
    .attr('width',width)
    .attr('height',height)
  .append('g')
    .attr('width',width-margin.left-margin.right)
    .attr('height',height-margin.top-margin.bottom)
    .attr('transform','translate('+margin.left+','+margin.top+')');
  
    data.forEach(function(valueObj){
      valueObj['date'] = timeFormat.parse(valueObj['timestamp']);
      var day = valueObj['day'] = monthDayFormat(valueObj['date']);

      var dayData = dailyValueExtent[day] = (dailyValueExtent[day] || [1000,-1]);
      var pmValue = valueObj['value']['PM2.5'];
      dayData[0] = d3.min([dayData[0],pmValue]);
      dayData[1] = d3.max([dayData[1],pmValue]);
    });

    dateExtent = d3.extent(data,function(d){
      return d.date;
    });

    axisWidth = itemSize*(dayFormat(dateExtent[1])-dayFormat(dateExtent[0])+1);

    //render axises
    yAxis.scale(yAxisScale.range([0,axisWidth]).domain([dateExtent[0],dateExtent[1]]));  
    svg.append('g')
      .attr('transform','translate('+margin.left+','+margin.top+')')
      .attr('class','y axis')
      .call(yAxis)
    .append('text')
      .text('Date')
      .attr('transform','translate(-10,'+axisHeight+') rotate(-90)');

    svg.append('g')
      .attr('transform','translate('+margin.left+','+margin.top+')')
      .attr('class','x axis')
      .call(xAxis)
    .append('text')
      .text('Time')
      .attr('transform','translate('+axisWidth+',-10)');


    //render heatmap rects
    dayOffset = dayFormat(dateExtent[0]);
    rect = heatmap.selectAll('rect')
      .data(data)
    .enter().append('rect')
      .attr('width',cellSize)
      .attr('height',cellSize)
      .attr('y',function(d){
        return itemSize*(dayFormat(d.date)-dayOffset);
      })
      .attr('x',function(d){            
        return hourFormat(d.date)*itemSize;
      })
      .attr('fill','#ffffff');

    rect.filter(function(d){ return d.value['PM2.5']>0;})
      .append('title')
      .text(function(d){
        return hourMinFormat(d.date)+' '+d.value['PM2.5'];
      });

    renderColor();
}

  function initCalibration(){
    d3.select('[role="calibration"] [role="example"]').select('svg')
      .selectAll('rect').data(colorCalibration).enter()
    .append('rect')
      .attr('width',cellSize)
      .attr('height',cellSize)
      .attr('x',function(d,i){
        return i*itemSize;
      })
      .attr('fill',function(d){
        return d;
      });

    //bind click event
    d3.selectAll('[role="calibration"] [name="displayType"]').on('click',function(){
      renderColor();
    });
  }

  function renderColor(){
    var renderByCount = document.getElementsByName('displayType')[0].checked;

    rect
      .filter(function(d){
        return (d.value['PM2.5']>=0);
      })
      .transition()
      .delay(function(d){      
        return (dayFormat(d.date)-dayOffset)*15;
      })
      .duration(500)
      .attrTween('fill',function(d,i,a){
        //choose color dynamicly      
        var colorIndex = d3.scale.quantize()
          .range([0,1,2,3,4,5])
          .domain((renderByCount?[0,500]:dailyValueExtent[d.day]));

        return d3.interpolate(a,colorCalibration[colorIndex(d.value['PM2.5'])]);
      });
  }
  
  d3.select(self.frameElement).style("height", "600px");  
