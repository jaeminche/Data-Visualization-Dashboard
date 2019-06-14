const m = require("./dataModel");
const v = require("./view");

const c = {
  init_login_show: function() {
    m.currentLogin = null;
    m.currentShow = null;
  },

  init: function() {
    m.area.datasets.week = [];
  },

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

  getTimeCycledInMilSec: function(resRow) {
    let total = 0;
    for (let i = 0; i < resRow.length; i++) {
      if (resRow[i].start_cycling != null) {
        let timeCycled = this.getTimeDiff(
          resRow[i].packet_generated,
          resRow[i].start_cycling
        );
        total = total + timeCycled;
      }
    }
    return total;
  },

  convertIntoMin: function(millisec) {
    var minute, seconds;
    seconds = Math.floor(millisec / 1000);
    minute = Math.floor(seconds / 60);
    seconds = seconds % 60;
    if (seconds >= 30) {
      minute += 1;
    }
    return minute;
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

    var dDisplay = day > 0 ? day + (day == 1 ? " day" : " days") : "";
    var hDisplay = hour > 0 ? hour + " hr" : "";
    var mDisplay = minute > 0 ? minute + " m" : "";

    return `${dDisplay} ${hDisplay} ${mDisplay} ${seconds} sec`;
  },

  // takes params and returns as millisec.
  getTimeDiff: function(date1, date2) {
    let big = new Date(date1);
    let small = new Date(date2);
    return big - small;
  },

  convertDay: function(number) {
    switch (number) {
      case 0:
        return "Sun";
        break;
      case 1:
        return "Mon";
        break;
      case 2:
        return "Tues";
        break;
      case 3:
        return "Wed";
        break;
      case 4:
        return "Thur";
        break;
      case 5:
        return "Fri";
        break;
      case 6:
        return "Sat";
        break;
    }
  }

  // sortDateArr: function(arr) {
  //   arr.
  // }
};

module.exports = c;
