// Graph out your lines based on color
$(function() {
  drawGraph();
  var window_width = $(window).width();

  $(window).resize(_.debounce(function(){
    if (window_width !== $(window).width()) {
      window_width = $(window).width()
      $(".main-graph svg").remove();
      drawGraph();
    }
  }, 500));
});


// Add currency symbols in appropriate places
var sanitizeCurrency = function(value, symbol) {
  var commasFormatter = d3.format(",.0f");
  var symbol = symbol || "$";

  if (value >= 0) {
    return symbol + commasFormatter(value.toString());
  } else {
    return "-" + symbol + commasFormatter(value.toString()).substr(1);
  }
}


// Turn rgba values to rgb values
var rgba2rgb = function(rgba) {
  var a = 1 - rgba.a;
  r = Math.round((rgba.a * (rgba.r / 255) + a) * 255);
  g = Math.round((rgba.a * (rgba.g / 255) + a) * 255);
  b = Math.round((rgba.a * (rgba.b / 255) + a) * 255);
  return "rgb(" + [r, g, b] + ")";
}


// Removed undefined elements from array
function isEmpty(element) {
  return element !== undefined;
}


// The function to create the main metric graph
var drawGraph = function() {
  var sendData;
  var offset = 18 * 5;

  // Access and send data
  d3.csv("../data/personal.csv", function(data) {
    return {
      date: data.Date,
      amount: Math.abs(data.Amount.replace(",", ""))
    };
  }, function(error, filter_data) {
    sendData(filter_data);
  });

  // Receive data and build line
  var sendData = function(data) {
    var currentMonth = 0;
    var currentYear = 0;
    var monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
    var months = [];

    var dates = data.map(function(d, i) {
      if (currentMonth !== new Date(d.date).getMonth()) {
        currentMonth = new Date(d.date).getMonth();

        if (currentYear !== new Date(d.date).getFullYear()) {
          currentYear = new Date(d.date).getFullYear();
          months.push(monthNames[currentMonth] +" "+ currentYear);
        } else {
          months.push(monthNames[currentMonth]);
        }

        return i;
      }
    });
    dates = dates.filter(isEmpty);

    var amounts = data.map(function(d, i) {
      return d.amount;
    });

    var min = d3.min(amounts),
        max = d3.max(amounts),
        tolerance = (max - min) * 0.01;

    var width = $(".main-graph").innerWidth(),
        height = amounts.length * 10;

    var svg = d3.select(".main-graph").append("svg")
      .attr("width", width)
      .attr("height", height);

    // The left to right date scale
    var xScale = d3.scale.linear()
      .domain([min - tolerance, max])
      .range([0, width - offset]);

    // The top to bottom amounts scale
    var yScale = d3.scale.linear()
      .domain([0, amounts.length])
      .range([0, height]);


    // The date axis
    var yAxis = d3.svg.axis()
      .scale(yScale)
      .tickValues(dates)
      .tickFormat(function(d, i) {
        return months[i];
      })
      .orient("left");

    svg.append("g")
      .attr({
        "class": "axis axis--y",
        transform: "translate(" + [offset, 0] + ")"
      }).call(yAxis);

    svg.selectAll("text")
      .attr({
        style: "text-anchor: end;",
        dy: ".5em",
        transform: "translate(" + [0, 6] + ")"
      });

    $("path.domain").remove();
    
    // Draw the bars
    var bars = svg.append("g").attr("class", "the-bars");
    bars.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr({
        "data": function(d) { return d.description; },
        x: offset,
        y: function(d, i) { return yScale(i); },
        width: function(d) { return xScale(d.amount)},
        height: height / amounts.length,
        "stroke-width": 1
      })   
  }
}