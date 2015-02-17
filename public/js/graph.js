// Receive data and build line
var drawGraphs = function(panel, data) {
  var whole = data.whole,
      max = data.max,
      min = data.min,
      length = data.length,
      margin = data.margin,
      tolerance = data.tolerance,
      suppress = data.suppress,
      dates_all = _.map(data.dates, function(d) {
        return moment(d)._d;
      }),
      dates_slim = suppressor(dates_all, 18);

  var width = $(panel).innerWidth(),
      height = $(panel).innerHeight();

  var svg = d3.select(panel);
      svg = $("svg", panel).length ? svg.select("svg") : svg.append("svg")
      svg.attr({
        width: width,
        height: height
      });


  ////
  // The top to bottom y scale
  var yScale = d3.scale.linear()
    .domain([min, max + tolerance])
    .range([height - margin * 1.5, 9]);

  // The left to right x scale
  var xScale = d3.time.scale()      
    .domain(d3.extent(dates_all))
    .range([0, width]);
  ////


  ////
  // The currency axis
  var yAxis = d3.svg.axis()
    .scale(yScale)
    .ticks(9)
    .tickSize(width)
    .tickPadding(18)
    .orient("left");
    
  if ($(".axis--y", panel).length === 0) {
    svg.append("g").attr("class", "axis axis--y");
  }

  svg.select(".axis--y").call(yAxis);

  var offset = getOffset($(".axis--y text", panel)) + margin;
  xScale.range([offset, width]);

  svg.select(".axis--y")
    .attr("transform", "translate("+ [width + offset, 0] +")")
    .selectAll("line").attr("x1", -offset);
  ////


  ////
  // The date axis
  var xAxis = d3.svg.axis()
    .scale(xScale)
    .ticks(d3.time.months)
    .tickFormat(d3.time.format("%B"))
    .tickSize(18)
    .tickPadding(-9)
    .orient("bottom");

  if ($(".axis--x", panel).length === 0) {
    svg.append("g").attr("class", "axis axis--x");
  }

  svg.select(".axis--x")
    .attr("transform", "translate(" + [0, height - margin * 1.5] + ")")
    .call(xAxis);

  $('.axis--x .tick text').attr("x", 9);
  $('.domain').remove();
  ////


  var areas = svg.append("g").attr("class", "areas");
  var lines = svg.append("g").attr("class", "lines");


  ////
  // Draw all the graphs
  _.each(whole, function(each, i) {
    drawGraph(each, i);
  });
  ////


  ////
  // Individual graph function
  function drawGraph(data, i) {
    var line_group = lines.append("g").attr("class", "group-"+i);
    var area_group = areas.append("g").attr("class", "group-"+i);
    // return false;

    ////
    // The fill area
    // var zero_area = d3.svg.area()
    //   .x(function(d, i) { return xScale(d.date); })
    //   .y0(height - margin * 1.5)
    //   .y1(height - margin * 1.5)
    //   .tension(0.5)
    //   .interpolate("cardinal");

    // var area = d3.svg.area()
    //   .x(function(d, i) { return xScale(d.date); })
    //   .y0(height - margin * 1.5)
    //   .y1(function(d) { return yScale(d.amount); })
    //   .tension(0.5)
    //   .interpolate("cardinal");
    
    // area_group.append("path")
    //   .data([data])
    //   .attr({
    //     d: zero_area,
    //     "class": "area",
    //     opacity: function() {
    //       if (Object.keys(whole).length > 1) {
    //         return 0.5;
    //       }
    //     }
    //   })
    //   .transition().duration(350)
    //   .attr("d", area);
    ////


    ////
    // The mask line
    // var zero_line = d3.svg.line()
    //   .x(function(d, i) { return xScale(d.date); })
    //   .y(height - margin * 1.5)
    //   .tension(0.5)
    //   .interpolate("cardinal");

    // var line = d3.svg.line()
    //   .x(function(d, i) { return xScale(d.date); })
    //   .y(function(d) { return yScale(d.amount); })
    //   .tension(0.5)
    //   .interpolate("cardinal");
      
    // line_group.append("path")
    //   .data([data])
    //   .attr({
    //     d: zero_line,
    //     "class": "mask-line",
    //     "stroke-width": 8,
    //     fill: "none",
    //     "stroke-linecap": "round",
    //     "stroke-linejoin": "round"
    //   })
    //   .transition().duration(350)
    //   .attr("d", line);
    ////


    ////
    // The color line
    var zero_line = d3.svg.line()
      .x(function(d, i) { return xScale(d.date); })
      .y(height - margin * 1.5)
      .interpolate("basis");
      

    var line = d3.svg.line()
      .x(function(d, i) { return xScale(d.date); })
      .y(function(d) { return yScale(d.amount); })
      .interpolate("basis");
      
    line_group.append("path")
      .data([data])
      .attr({
        d: zero_line,
        "class": "color-line",
        "stroke-width": 1,
        fill: "none",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        opacity: 0.2
      })
      .transition().duration(350)
      .attr("d", line);
    ////


    ////
    // The circles
    var circles = line_group.selectAll("svg > circle").data(data);
        circles.enter().append("circle");

    circles
      .attr({
        "class": "circle",
        r: function(d) {
          var e = d.amount / tolerance * 5;
          return e < 1 ? 1 : e;
        },
        cx: function(d, i) { return xScale(d.date); },
        cy: height - margin * 1.5,
        "stroke-width": 0,
        opacity: 0.9
      })
      .transition().duration(350)
      .attr({
        cy: function(d) { return yScale(d.amount); }
      });

    // circles[0][0].remove();
    // circles[0][circles[0].length - 1].remove();
    ///
  }
}