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


// Evenly suppress an array to a preset limit
var suppressor = function(array, limit) {
  if (array.length * 2 > limit) {
    var ratio = Math.round(array.length / limit);
    return $.grep(array, function(d, i) {
      return (i % ratio == 0);
    });
  } else {
    return array;
  }
}


// Find the axis offset off the actual axis label widths
var getOffset = function(el) {
  var arr = _.map(el, function(d) {
    return d.getBBox().width;
  });
  return d3.max(arr);
}


// Date formatter
var format = d3.time.format('%Y-%m-%d');