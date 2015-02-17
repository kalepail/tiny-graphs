// Parse, sanitize and add symbols in appropriate places
var parseValue = function(raw, symbol, symbol_first) {
  var raw = +(raw).toFixed(1);
  var formatter = d3.format(",");
  var symbol = symbol || "";
  var symbol_first = symbol_first == undefined ? true : symbol_first;
  var clean;

  if (raw >= 0) { // Positive value
    if (symbol_first) {
      clean = symbol + formatter(raw);
    } else {
      clean = formatter(raw) + symbol;
    }
  } else { // Negative value
    if (symbol_first) {
      clean = "-" + symbol + formatter(raw).substr(1);
    } else {
      clean = "-" + formatter(raw).substr(1) + symbol;
    }
  }

  return clean;
}


// Turn rgba values to rgb values
var rgba2rgb = function(rgba) {
  var a = 1 - rgba.a;
  r = Math.round((rgba.a * (rgba.r / 255) + a) * 255);
  g = Math.round((rgba.a * (rgba.g / 255) + a) * 255);
  b = Math.round((rgba.a * (rgba.b / 255) + a) * 255);
  return "rgb(" + [r, g, b] + ")";
}


// SmartSuppress™ a date range dynamically
var suppressor = function(collection, interval) {
  var entire = [];
  var chunk = [];
  var currentInterval;

  if (!interval) {
    var interval = "days";

    if (collection.length > 730) {
      interval = "years";
    } else if (collection.length > 124) {
      interval = "months";
    } else if (collection.length > 31) {
      interval = "weeks";
    }
  }

  if (interval == "weeks") {
    currentInterval = moment(collection[0].date).week();
  } else if (interval == "months") {
    currentInterval = moment(collection[0].date).month();
  } else if (interval == "years") {
    currentInterval = moment(collection[0].date).year();
  } else {
    return {
      data: collection,
      interval: interval
    }
  }

  _.each(collection, function(d, i) {
    if (interval == "weeks") {
      thisInterval = moment(collection[i].date).week();
    } else if (interval == "months") {
      thisInterval = moment(collection[i].date).month();
    } else if (interval == "years") {
      thisInterval = moment(collection[i].date).year();
    }

    // Push the value straight off
    if (i == 0) {
      entire.push([{
        amount: d.amount,
        date: d.date
      }]);
    }

    // Now start looking for changes in weeks, months or years
    if (i != 0 && thisInterval != currentInterval) { // If not first iteration and limit equals iteration
      if (entire[0][0].amount != chunk[0].amount || i != 1) entire.push(chunk); // If the first chunk hasn't already been pushed  
      currentInterval = thisInterval;
      chunk = [];
    } else if (i == collection.length -1) { // If last iteration
      entire.push(chunk);
    }

    chunk.push(d);
  });

  var polished = _.map(entire, function(d, i) {
    var amounts = _.map(d, function(e) {
      return e.amount;
    });
    var dates = _.map(d, function(e) {
      return e.date;
    });

    return {
      amount: +d3.mean(amounts).toFixed(2),
      date: dates[dates.length - 1]
    }
  });

  return {
    data: polished,
    interval: interval
  };
}


// Find the axis offset off the actual axis label widths
var getOffset = function(el) {
  var arr = _.map(el, function(d) {
    return d.getBBox().width;
  });
  return d3.max(arr);
}


// Date formatter
var timeFormats = {
  days: d3.time.format('%b %d'),
  weeks: d3.time.format('%b %d'),
  months: d3.time.format('%B'),
  years: d3.time.format('%b %Y'),
  default: d3.time.format('%Y-%m-%d')
};

var stringFormats = {
  comma: d3.format("0,000")
}


// Unique date finder, sorter, returner
var uniqueDates = function(dates) {
  return _.map(_.map($.unique(_.map(dates, function(d) {
    return timeFormats.default(d);
  })), function(d) {
    return moment(d)._d;
  }));
}