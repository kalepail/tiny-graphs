// Receive data and build line
$.fn.tinyGraph = function(data) {
  var entire = data.entire,
      chunk = data.chunk,
      max = data.max,
      min = data.min,
      margin = data.margin,
      tolerance = data.tolerance,
      interval = data.interval,
      dates = data.dates,
      timer;

  var width = $(this).innerWidth(),
      height = $(this).innerHeight();

  var svg = d3.select(this[0]);
      svg = $("svg", this).length ? svg.select("svg") : svg.append("svg")
      svg.attr({
        width: width,
        height: height
      });


  ////
  // Interval range
  $('.range-picker .interval').html('['+ interval +']');
  ////


  ////
  // The top to bottom y scale
  var yScale = d3.scale.linear()
    .domain([(min >= 0 && min - tolerance <= 0 ? 0 : min - tolerance), max + tolerance * 2.5])
    .range([height - margin * 3, 9]);

  // The left to right x scale
  var xScale = d3.time.scale()      
    .domain(d3.extent(dates))
    .range([0, width]);
  ////


  ////
  // The currency axis
  var yAxis = d3.svg.axis()
    .scale(yScale)
    .ticks(6)
    .tickSize(width - 1.5)
    .tickPadding(18)
    .orient("left");
    
  if ($(".axis--y", this).length === 0) {
    svg.append("g").attr("class", "axis axis--y");
  }

  svg.select(".axis--y").call(yAxis);

  var offset = getOffset($(".axis--y text", this)) + margin;
  xScale.range([offset, width - 1.5]);

  svg.select(".axis--y")
    .attr("transform", "translate("+ [width + offset - 1.5, 0] +")")
    .selectAll("line").attr("x1", -offset);
  ////


  ////
  // The date axis
  if (interval == "days") {
    dates = _.map(dates, function(d, i) {
      if (i % 2 == 0) return d;
    }).filter(function(n){ return n != undefined });
  } else if (interval == "months") {
    dates.shift();
  }

  var xAxis = d3.svg.axis()
    .scale(xScale)
    .tickValues(_.map(dates, function(d, i) { return d; }))
    .tickFormat(timeFormats[interval])
    .ticks(9)
    .tickSize(18)
    .tickPadding(-9)
    .orient("bottom");

  if ($(".axis--x", this).length === 0) {
    svg.append("g").attr("class", "axis axis--x");
  }

  svg.select(".axis--x")
    .attr("transform", "translate(" + [0, height - margin * 3] + ")")
    .call(xAxis);

  $('.axis--x .tick text').attr({
    y: -24,
    x: -12,
    transform: "rotate(-90)"
  });
  $('.domain').remove();
  ////


  var areas = svg.append("g").attr("class", "areas");
  var lines = svg.append("g").attr("class", "lines");
  var triggers = svg.append("g").attr("class", "triggers")


  ////
  // Draw all the graphs
  _.each(chunk, function(each, i) {
    drawGraph(each, entire[i], i);
  });
  ////


  ////
  // Individual graph function
  function drawGraph(data, whole, i) {
    var line_group = lines.append("g").attr("class", "group-"+i);
    var area_group = areas.append("g").attr("class", "group-"+i);

    ////
    // The fill area
    var zero_area = d3.svg.area()
      .x(function(d) { return xScale(d.date); })
      .y0(height - margin * 3)
      .y1(height - margin * 3)
      .tension(0.5)
      .interpolate("cardinal");

    var area = d3.svg.area()
      .x(function(d) { return xScale(d.date); })
      .y0(height - margin * 3)
      .y1(function(d) { return yScale(d.amount); })
      .tension(0.5)
      .interpolate("cardinal");
    
    area_group.append("path")
      .data([data])
      .attr({
        d: zero_area,
        "class": "area",
        opacity: function() {
          if (chunk.length > 1) {
            return 0.5;
          }
        }
      })
      .transition().duration(350)
      .attr("d", area);
    ////


    ////
    // The invisible line
    var line = d3.svg.line()
      .x(function(d) { return xScale(d.date); })
      .y(function(d) { return yScale(d.amount); })
      .tension(0.5)
      .interpolate("cardinal");
      
    var path = line_group.append("path")
      .data([data])
      .attr({
        d: line,
        "class": "invisible-line",
        "stroke-width": 0,
        fill: "none"
      });
    ////


    ////
    // The mask line
    if (chunk.length == 1) {
      var zero_line = d3.svg.line()
        .x(function(d) { return xScale(d.date); })
        .y(height - margin * 3)
        .tension(0.5)
        .interpolate("cardinal");

      var line = d3.svg.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.amount); })
        .tension(0.5)
        .interpolate("cardinal");
        
      line_group.append("path")
        .data([data])
        .attr({
          d: zero_line,
          "class": "mask-line",
          "stroke-width": 8,
          fill: "none",
          "stroke-linecap": "round",
          "stroke-linejoin": "round"
        })
        .transition().duration(350)
        .attr("d", line);
    }
    ////


    ////
    // The color line
    var zero_line = d3.svg.line()
      .x(function(d) { return xScale(d.date); })
      .y(height - margin * 3)
      .tension(0.5)
      .interpolate("cardinal");

    var line = d3.svg.line()
      .x(function(d) { return xScale(d.date); })
      .y(function(d) { return yScale(d.amount); })
      .tension(0.5)
      .interpolate("cardinal");
      
    line_group.append("path")
      .data([data])
      .attr({
        d: zero_line,
        "class": "color-line",
        "stroke-width": 3,
        fill: "none",
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
      })
      .transition().duration(350)
      .attr("d", line);
    ////

    
    ////
    // The small hover circles
    var hover_circles = line_group.append("g").attr("class", "hover-circles").selectAll("svg > circle").data(whole);
        hover_circles.enter().append("circle");

    hover_circles
      .attr({
        "class": "circle",
        "stroke-width": 0,
        cx: function(d) {return xScale(d.date)},
        cy: function(d) {return yScale(d.amount)},
        r: 0
      });
    ////


    ////
    // The large circles
    var main_circles = line_group.append("g").attr("class", "main-circles").selectAll("svg > circle").data(data);
        main_circles.enter().append("circle");

    main_circles
      .attr({
        r: 6,
        cx: function(d) { return xScale(d.date); },
        cy: height - margin * 3,
        "stroke-width": function() {
          if (chunk.length == 1) {
            return 3;
          } else {
            return 0;
          }
        }
      })
      .transition().duration(350)
      .attr({
        "class": "circle",
        cy: function(d) { return yScale(d.amount); }
      });

    main_circles[0][0].remove();
    main_circles[0][main_circles[0].length - 1].remove();
    ////


    ////
    // The scrubber line
    var scrubber = $("svg .scrubber").length ? svg.select('.scrubber') : svg.append('line')
      .attr({
        "class": "scrubber",
        x1: function() { return xScale(data[0].date); },
        y1: 0,
        x2: function() { return xScale(data[0].date); },
        y2: height,
        "stroke-width": 1,
        opacity: 0
      });


    ////
    // Preset tooltip values
    $(".hover-text").prepend('<span class="value value-'+i+'">'+ stringFormats.comma(+(whole[whole.length - 1].amount).toFixed(1)) +'</span>');
    $(".hover-text .date").html(moment(whole[whole.length - 1].date).format('MMMM Do YYYY'));
    ////


    ////
    // The tooltip bloody magic
    triggers.selectAll("rect")
      .data(whole)
      .enter()
      .append("rect")
      .attr({
        x: function(d, i) { return i * (width - offset) / whole.length + offset },
        y: 0,
        width: (width - offset) / whole.length,
        height: height,
        fill: "transparent"
      })
      .on("mouseover", function(d, e) {
        if (interval != "days") {
          $(".lines g .hover-circles").each(function() {
            var p1 = $("circle", this)[e - 1];
            var p2 = $("circle", this)[e - 2];

            var n1 = $("circle", this)[e + 1];
            var n2 = $("circle", this)[e + 2];

            var animate = [p1, n1, p2, n2];

            _.each(animate, function(d) {
              d3.select(d)
                .transition()
                .duration(50)
                .ease("linear")
                .attr("r", 4.5)
                .transition()
                .duration(750)
                .ease("linear")
                .attr("r", 0);
            });
          });
        }

        scrubber
          .transition()
          .duration(50)
          .ease("linear")
          .attr({
            x1: function() { return xScale(d.date); },
            y1: 0,
            x2: function() { return xScale(d.date); },
            y2: height,
            opacity: 1
          })
          .transition()
          .duration(750)
          .ease("linear")
          .attr("opacity", 0);

        timer = setTimeout(function() {
          $('.hover-text .value').each(function(s) {
            $('.hover-text .value-'+ s).html(stringFormats.comma(+(entire[s][e].amount.toFixed(1))));
          });

          $('.hover-text .date').html(moment(d.date).format('MMMM Do YYYY'));
        }, 50);
      })
      .on("mouseout", function(d) {
        window.clearTimeout(timer);
        $(this).attr("fill", "transparent");
      });
      ////


      ////
      // If mouse leaves window reset the tooltips to most recent data
      jQuery(document).mouseleave(function(){
        $('.hover-text .value').each(function(s) {
          var last = entire[s].length - 1;
          $('.hover-text .value-'+ s).html(stringFormats.comma(+(entire[s][last].amount.toFixed(1))));
        });

        $('.hover-text .date').html(moment(whole[whole.length - 1].date).format('MMMM Do YYYY'));
      });
      ////
    }
}