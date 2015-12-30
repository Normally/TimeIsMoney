// Time is money

// TODO: do a proper export so we're not using globals
var settings = {};
settings.hoursPerDay = 8;
settings.yearlyWage = 22044;

settings.setHoursPerDay = function(hoursPerDay) {
  settings.hoursPerDay = hoursPerDay;
}

settings.setYearlyWage = function(yearlyWage) {
  settings.yearlyWage = yearlyWage;
  // https://en.wikipedia.org/wiki/Income_in_the_United_Kingdom
}

// Set the day threshold to the number of hours per day worked
moment.relativeTimeThreshold('h', settings.hoursPerDay);

var oneSecondWage = function() {
  var weeklyWage = settings.yearlyWage/52;
  var dailyWage = weeklyWage/5;
  var oneHourWage = dailyWage/settings.hoursPerDay;
  var wagePerSecond = oneHourWage/60/60;
  return wagePerSecond;
};

function convertMoneyToSeconds(money) {
  var doubleMoney = parseInt(money);
  seconds = doubleMoney/oneSecondWage();
  return Math.ceil(seconds);
}

function convertMoneyToHumanizedTime(money) {
  var doubleMoney = parseInt(money);
  var numberOfSeconds = convertMoneyToSeconds(doubleMoney);
  var string = moment.duration(numberOfSeconds, "seconds").humanize();
  return string;
}

function replaceMoneyWithTime(text) {
  var re = /\£\d{0,3}(,?\d+)?(.?\d+)(K|k|M|m)?/; // http://regexr.com/3cduh
  var re_strip = /[^0-9.kKmM]/g;
  var result;
  var matches  = re.exec(text);
  if (matches) {
    var match = matches[0];
    var cleaned = match.replace(re_strip, '');
    if (/(k|K)$/.test(cleaned)) {
      cleaned = cleaned.replace(/(k|K)$/, '');
      cleaned = parseInt(cleaned) * Math.pow(10,3);
    } else if (/(m|M)$/.test(cleaned)) {
      cleaned = cleaned.replace(/(m|M)$/, '');
      cleaned = parseInt(cleaned) * Math.pow(10,6);
    }
    var time = convertMoneyToHumanizedTime(cleaned);
    result = matches.input.replace(match, time);
  }
  else { result = text; }
  return result;
}

function addStyles() {
  var css = 'span.timeIsMoney { all: inherit!important; border-bottom-style: dotted!important; border-bottom-width: 2px!important; padding: 0!important; margin: 0!important; list-style-type: none!important; list-style-image: none!important; position: relative!important; cursor: pointer!important; } span.timeIsMoney-tooltip { display: none; position: absolute; top: 10px; left: 10px; padding: 10px; background-color: #50E3C2; opacity: 0.9; color: black; z-index: 100000; border-radius: 4px; } span.timeIsMoney:hover > span.timeIsMoney-tooltip { display: block!important; }',
      head = document.head || document.getElementsByTagName('head')[0],
      style = document.createElement('style');

  style.type = 'text/css';
  if (style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }

  head.appendChild(style);
}

function run() {
  var elements = document.querySelectorAll('*');

  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];

    for (var j = 0; j < element.childNodes.length; j++) {
      var node = element.childNodes[j];

      if (node.nodeType === 3) {
        var text = node.nodeValue;
        var color = window.getComputedStyle(element).color;
        updatedText = replaceMoneyWithTime(text);
        if (updatedText != text) {
          var span = document.createElement("span");
          var tooltip = document.createElement("span");
          // class names
          span.className = "timeIsMoney";
          tooltip.className = "timeIsMoney-tooltip";
          // border
          span.style.borderColor = color;
          // content
          var content = document.createTextNode(updatedText);
          var tooltipContent = document.createTextNode(text);
          var tooltipWithContent = tooltip.appendChild(tooltipContent);
          span.appendChild(content);
          span.appendChild(tooltip);
          element.replaceChild(span, node);
        }
      }
    }
  }
}

function getSettings(callback) {
  if (typeof chrome == "undefined" || typeof chrome.storage == "undefined") {
    callback();
  }
  else {
    chrome.storage.sync.get({
      yearlySalary: '22000'
    }, function(items) {
      settings.setYearlyWage(items.yearlySalary);
      callback(); // run the code after we've got the settings
    });
  }
}

addStyles();
getSettings(run);
