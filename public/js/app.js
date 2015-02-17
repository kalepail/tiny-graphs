$(function() {
  var window_width = $(window).width();
  sendData(["business", "personal"]);

  $(window).resize(_.debounce(function(){
    if (window_width !== $(window).width()) {
      window_width = $(window).width();
      $("svg").remove();
      sendData(["business", "personal"]);
    }
  }, 500));
});


// Get the data and then ship it to the graphs
var sendData = function(files) {
  var data = {};
  var whole = [];
  var dates = [];
  var amounts = [];
  data.margin = 36;
  data.suppress = 24;
  
  $.each(files, function(i, d) {
    d3.csv("data/"+ d +".csv", function(raw) {
      return {
        date: moment(raw.Date)._d,
        amount: typeof raw.Amount == "number" ? raw.Amount : Number(raw.Amount.replace(/[^0-9\.]+/g, ""))
      };
    }, function(error, clean) {
      if (error) return console.log(error);
        
        _.map(clean, function(d) {
          amounts.push(d.amount);
        });

        _.map(clean, function(d) {
          dates.push(d.date);
        });

        whole.push(clean);      
    });
  });

  var interval = setInterval(function() {
    if (whole.length == files.length) {
      window.clearInterval(interval);

      data.whole = whole;
      data.min = d3.min(amounts);
      data.max = d3.max(amounts);
      data.tolerance = +((data.max - data.min) * 0.1).toFixed(2);
      data.dates = _.map($.unique(_.map(dates, function(d) {
        return format(d);
      })));

      drawGraphs(".graph", data);
    }
  }, 100);
}