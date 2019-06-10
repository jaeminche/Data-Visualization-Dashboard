const m = require("./dataModel");
const v = require("./view");

const c = {
  setCurrentLoginType: function() {
    this.setCurrentType(m.currentLogin, "currentLoginType");
  },

  setCurrentType: function(data, key) {
    if (data.superadmin === true && data.admin === true) {
      // TODO: prompt and get input by asking which one of superadmin and user the user wants
      m[key] = "superadmin";
    } else if (data.superadmin === false && data.admin === true) {
      m[key] = "admin";
    } else {
      m[key] = "user";
    }
  },

  convertMillisec: function(milliseconds) {
    var day, hour, minute, seconds;
    seconds = Math.floor(milliseconds / 1000);
    minute = Math.floor(seconds / 60);
    seconds = seconds % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;
    return `${day} day ${hour}hr ${minute}m ${seconds}sec`;
  },

  getTimeDiff: function(date1, date2) {
    let big = new Date(date1);
    let small = new Date(date2);
    return big - small;
  }
};

module.exports = c;
