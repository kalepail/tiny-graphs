$(function() {
  var window_width = $(window).width();
  sendData(["4"]);

  $(window).resize(_.debounce(function(){
    if (window_width !== $(window).width()) {
      window_width = $(window).width();
      $("svg, .hover-text .value").remove();
      sendData(["4"]);
    }
  }, 500));

  $('.range-picker span').click(function() {
    var $root = $(this);
    var value = Number($root.html());

    $('.range-picker span').removeClass('selected');
    $root.addClass('selected');
    $("svg, .hover-text .value").remove();
    sendData([value]);
  });
});


// Get the data and then ship it to the graphs
var sendData = function(files) {
  var data = {};
  var entire = [];
  var chunk = [];
  var dates = [];
  var amounts = [];
  
  $.each(files, function(i, d) {
    d3.csv("data/"+ d +".csv", function(raw) {
      return {
        date: moment(raw.Date)._d,
        amount: typeof raw.Amount == "number" ? raw.Amount : Number(raw.Amount.replace(/[^0-9\.]+/g, ""))
      };
    }, function(error, clean) {
      if (error) return console.log(error);
        var suppressed = suppressor(clean);

        _.map(suppressed.data, function(d) {
          amounts.push(d.amount);
        });

        _.map(suppressed.data, function(d) {
          dates.push(d.date);
        });

        data.interval = suppressed.interval;
        entire.push(clean);
        chunk.push(suppressed.data);
    });
  });

  var blast = setInterval(function() {
    if (chunk.length == files.length) {
      data.entire = entire;
      data.chunk = chunk;
      data.min = d3.min(amounts);
      data.max = d3.max(amounts);
      data.margin = 36;
      data.tolerance = +((data.max - data.min) * 0.1).toFixed(2);
      data.dates = uniqueDates(dates);

      window.clearInterval(blast);
      $(".graph").tinyGraph(data);
    }
  }, 100);
}