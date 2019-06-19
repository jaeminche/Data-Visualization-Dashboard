const vm = require("./viewmodel");
const v = require("./view");

const c = {
  init_login_show: function() {
    vm.currentLogin = null;
    vm.currentShow = null;
  },

  init: function() {
    vm.area.datasets = [];
    vm.resPie = null;
  },

  // setCurrentLoginType: function() {
  //   this.setCurrentType(m.currentLogin, "currentLoginType");
  // },

  setCurrentType: function(data, key) {
    if (data.superadmin === true && data.admin === true) {
      // TODO: prompt and get input by asking which one of superadmin and user the user wants
      vm[key] = "superadmin";
    } else if (data.superadmin === false && data.admin === true) {
      vm[key] = "admin";
    } else {
      vm[key] = "user";
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

  convToMin: function(millisec) {
    var minute, seconds;
    seconds = Math.floor(millisec / 1000);
    minute = Math.floor(seconds / 60);
    seconds = seconds % 60;
    if (seconds >= 30) {
      minute += 1;
    }
    return minute;
  },

  convMilSecToFin: function(milliseconds) {
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
  },

  createBarChart: function(res, calendarType) {
    let cMonth, cYear;
    let prevDate = new Date(res[0].packet_generated).getDate();
    cMonth = new Date(res[0].packet_generated).getMonth();
    cYear = new Date(res[0].packet_generated).getFullYear();
    let indexForResByDay = prevDate - 1;

    // generate as many nested array as the calendarType,
    // and organize the res data day by day.
    let resByDay = this.genNestedArr(calendarType, cMonth, cYear);
    res.forEach(row => {
      if (new Date(row.packet_generated).getDate() === prevDate) {
        resByDay[indexForResByDay].push(row);
      } else {
        prevDate = new Date(row.packet_generated).getDate();
        indexForResByDay = prevDate - 1;
        resByDay[indexForResByDay].push(row);
      }
    });

    // manipulate the res data into dataset
    const dataForArea = [];
    resByDay.forEach((dataForOneDay, index) => {
      let dataset;
      if (!!dataForOneDay && dataForOneDay.length > 0) {
        let date = new Date(dataForOneDay[0].packet_generated).toDateString();
        dataset = {
          date: date,
          label: date,
          time: this.convToMin(this.getTimeCycledInMilSec(dataForOneDay))
        };
      } else {
        let date = new Date(cYear, cMonth, index + 1).toDateString();
        dataset = {
          date: date,
          label: date,
          time: 0
        };
      }
      dataForArea.push(dataset);
    });
    vm.area.datasets = dataForArea;
  },

  genNestedArr: function(type, m, y) {
    const nestedArray = [];
    let no_x_axis;
    if (type === "monthly") {
      no_x_axis = this.daysInMonth(m, y);
    } else if (type === "yearly") {
      no_x_axis = 12;
    } else if (type === "weekly") {
      no_x_axis = 7;
    } else if (type === "daily") {
      no_x_axis = 24;
    }
    for (let i = 0; i < no_x_axis; i++) {
      nestedArray.push([]);
    }
    return nestedArray;
  },

  daysInMonth: function(month, year) {
    return new Date(year, month, 0).getDate();
  }

  // sortDateArr: function(arr) {
  //   arr.
  // }
};

module.exports = c;
