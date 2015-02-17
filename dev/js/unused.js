// Receive data and build line
var drawGraph = function(raw, name) {
  var currentMonth = new Date(raw[0].date).getMonth(),
      currentYear = new Date(raw[0].date).getFullYear(),
      monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"],
      date = monthNames[currentMonth] +" "+ currentYear,
      data = [],
      description = [],
      positive = [],
      negative = [];

  // Functions
  function build(amount, desc) {
    if (amount > 0) {
      positive.push(amount);
    } else {
      negative.push(amount);
    }

    description.push(desc);
  }

  function insert() {
    data.push({
      date: date,
      description: description,
      positive: positive,
      negative: negative
    });
  }

  function update(type, da) {
    if (type == "month") { 
      currentMonth = new Date(da).getMonth();
      date = monthNames[currentMonth];
    } else if (type == "year") {
      currentMonth = new Date(da).getMonth();
      currentYear = new Date(da).getFullYear();
      date = monthNames[currentMonth] +" "+ currentYear;
    }
  }

  function flush() {
    description = [];
    positive = [];
    negative = [];
  }

  $.each(raw, function(i, d) {
    if (i === raw.length - 1) {
      if (currentYear !== new Date(d.date).getFullYear()) {
        insert();
        update("year", d.date);
        flush();
      } else if (currentMonth !== new Date(d.date).getMonth()) {
        insert();
        update("month", d.date);
        flush();
      }
      
      build(d.amount, d.description);
      insert();
      return undefined;

    } else if (currentYear !== new Date(d.date).getFullYear()) {
      insert();
      update("year", d.date);
      flush();

    } else if (currentMonth !== new Date(d.date).getMonth()) {
      insert();
      update("month", d.date);
      flush();
    }

    build(d.amount, d.description);
  });

  var pos = [];
  var neg = [];
  var count = [];

  $.each(data, function(i, d) { // Needs to be looking at individual months not the whole thing
    pos.push(d3.sum(d.positive));
    neg.push(d3.sum(d.negative));
    count.push(i);
  });

  var width = data.length * offset(10) < $(name).width() ? $(name).width() : data.length * offset(10),
      height = $(name).height();

  var svg = d3.select(name).append("svg")
    .attr("width", width)
    .attr("height", height);

  var net = sanitizeCurrency( d3.sum(neg) + d3.sum(pos) );

  $("h1", name).text(name.replace(".", "") +" "+ net);

  // The left to right date scale
  var xScale = d3.scale.linear()
    .domain([0, data.length])
    .range([offset(3), width]);

  // The top to bottom amounts scale
  var yScale = d3.scale.linear()
    .domain([d3.max(pos), d3.min(neg)])
    .range([offset(6.5), height - offset(0.5)]);


  // The date axis
  var xAxis = d3.svg.axis()
    .scale(xScale)
    .tickValues(count)
    .tickFormat(function(i) {
      return data[i].date;
    })
    .tickSize(height - offset(5))
    .orient("bottom");

  var axis = svg.append("g")
    .attr({
      "class": "axis axis--x"
    }).call(xAxis);

  axis.selectAll("text")
    .attr({
      style: "text-anchor: end;",
      dy: "1em",
      transform: function() {
        return "rotate(-90) translate("+ [offset(5.5) - height, offset(5) - height] +")";
      }
    });

  axis.append("line")
    .attr({
      x1: offset(2),
      y1: height - offset(6),
      x2: width,
      y2: height - offset(6)
    });
  

  // The currency axis
  var yAxis = d3.svg.axis()
    .scale(yScale)
    .tickSize(width)
    .tickPadding(9)
    .tickFormat(function(d) {
      return sanitizeCurrency(d);
    })
    .orient("left");

  var axis = svg.append("g")
    .attr({
      "class": "axis axis--y",
      transform: "translate("+ [width + offset(3), -offset(6)] +")"
    }).call(yAxis);


  $("path.domain").remove();


  var posBars = svg.append("g").attr({
    "class": "bar-group",
    "data-polarity": 1
  });
  var negBars = svg.append("g").attr({
    "class": "bar-group",
    "data-polarity": 0
  });


  $.each(data, function(i, d) {
    drawPos(d.positive, i);
    drawNeg(d.negative, i);
    prepHovers();
  });


  // Draw the positive bars
  // ---------------------------------------------------------
  function drawPos(data, i) {
    var p = 0;

    posBars.append("g").attr("class", "b-"+ i)
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr({
        x: function(d) { return xScale(i); },
        y: function(d, f) {
          var base_line = yScale(0) - offset(6);
          var bar_height = Math.abs(yScale(d) - yScale(0));

          p = p + bar_height;

          return base_line - p;
        },
        width: (width - offset(3)) / count.length,
        height: function(d, i) {
          return Math.abs(yScale(d) - yScale(0));;
        },
        opacity: function(d, f) {
          var op = 1 - ((d3.sum(data) - d) / d3.sum(data));
          var pl = data.length / (data.length * (f + 1));

          return op;
        }
      });
  }


  // Draw the negative bars
  // ---------------------------------------------------------
  function drawNeg(data, i) {
    var p = 0;

    negBars.append("g").attr("class", "b-"+ i)
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr({
        x: function(d) { return xScale(i); },
        y: function(d, f) {
          var base_line = yScale(0) - offset(6);
          var bar_height = Math.abs(yScale(d) - yScale(0));

          p = p + bar_height;

          return base_line + p - bar_height;
        },
        width: (width - offset(3)) / count.length,
        height: function(d, i) {
          return Math.abs(yScale(d) - yScale(0));
        },
        opacity: function(d, f) {
          var op = 1 - ((d3.sum(data) - d) / d3.sum(data));
          var pl = data.length / (data.length * (f + 1));

          return op;
        }
      });
  }


  // All the hover triggers
  // ---------------------------------------------------------
  function prepHovers() {
    svg.selectAll(".bar-group").selectAll("rect")
      .on("mouseover", function(d) {
        name = name.replace(".", "");
        polarity = $(this).parents(".bar-group").data("polarity");

        d3.select(this).attr({
          transform: "translate(-5, 0)",
          width: parseFloat($(this).attr("width")) + 10
        });

        $(".hover-value").show()
          .attr({
            "data-name": name,
            "data-polarity": polarity
          })
          .animateNumber(Math.abs(d), {
            duration: 100,
            easing: "linear",
            animateOpacity: false,
            floatStepDecimals: 0,
            floatEndDecimals: 0,
            format: "currency",
            currencyIndicator: d < 0 ? "-$" : "+$"
          });
      })
      .on("mousemove", function() {
        $(".hover-value")
          .css("left", Math.max(0, d3.event.pageX) +"px")
          .css("top", (d3.event.pageY) +"px");
      })
      .on("mouseout", function() {
        $(".hover-value").hide();

        d3.select(this).attr({
          transform: "translate(0, 0)",
          width: parseFloat($(this).attr("width")) - 10
        });
      });
  }
}