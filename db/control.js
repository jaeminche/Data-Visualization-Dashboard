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
    stateFlag = "0575";
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

  getDateDayMonth: function(timestamp, periodTab) {
    if (periodTab === "month") {
      stateFlag = "0540";
      return new Date(timestamp).getDate();
    } else if (periodTab === "year") {
      stateFlag = "0543";
      return new Date(timestamp).getMonth();
    } else if (periodTab === "week") {
      stateFlag = "0546";
      let day = new Date(timestamp).getDay();
      if (day === 0) {
        day = 7;
      }
      return day;
    } else if (periodTab === "day") {
      stateFlag = "0550";
      return new Date(timestamp).getHours();
    }
  },

  createBarChart: function(res, periodTab, firstDayOfWeek) {
    stateFlag = "0521";
    // console.log(firstDayOfWeek);
    let cMonth, cYear;
    let timestamp = res[0].packet_generated;
    stateFlag = "0535";
    let prevNo = this.getDateDayMonth(timestamp, periodTab);
    cMonth = new Date(timestamp).getMonth();
    cYear = new Date(timestamp).getFullYear();
    let indexForResByDay = prevNo - 1;

    // generate as many nested array as the periodTab,
    // and organize the res data day by day.
    stateFlag = "0560";
    let resByDay = this.genNestedArr(periodTab, cMonth, cYear);
    res.forEach(row => {
      if (this.getDateDayMonth(row.packet_generated, periodTab) === prevNo) {
        resByDay[indexForResByDay].push(row);
      } else {
        prevNo = this.getDateDayMonth(row.packet_generated, periodTab);
        indexForResByDay = prevNo - 1;
        resByDay[indexForResByDay].push(row);
      }
    });

    // manipulate the res data into dataset
    stateFlag = "0570";
    const dataForBarChart = [];
    resByDay.forEach((dataForOneDay, index) => {
      let dataset, date;
      if (!!dataForOneDay && dataForOneDay.length > 0) {
        stateFlag = "0571";
        date = new Date(dataForOneDay[0].packet_generated).toDateString();
        dataset = {
          date: date,
          label: date,
          time: this.convToMin(this.getTimeCycledInMilSec(dataForOneDay))
        };
      } else {
        stateFlag = "0580";
        date = getXaxisDates(
          periodTab,
          cYear,
          cMonth,
          index,
          firstDayOfWeek
        ).toDateString();
        dataset = {
          date: date,
          label: date,
          time: 0
        };
      }
      stateFlag = "0545";
      dataForBarChart.push(dataset);
    });
    vm.area.datasets = dataForBarChart;

    function getXaxisDates(periodTab, cYear, cMonth, index, firstDay) {
      let nextDay;
      // TODO: add year and day, and delete 'ly's
      if (periodTab === "month") {
        stateFlag = "0543";
        return new Date(cYear, cMonth, index + 1);
      } else if (periodTab === "week") {
        stateFlag = "0544";
        nextDay = new Date(firstDay);
        nextDay.setDate(nextDay.getDate() + index);
        return nextDay;
      }
    }
  },

  genNestedArr: function(type, m, y) {
    stateFlag = "0561";
    const nestedArray = [];
    let no_x_axis;
    if (type === "month") {
      no_x_axis = this.daysInMonth(m, y);
    } else if (type === "year") {
      no_x_axis = 12;
    } else if (type === "week") {
      no_x_axis = 7;
    } else if (type === "day") {
      no_x_axis = 24;
    }
    for (let i = 0; i < no_x_axis; i++) {
      nestedArray.push([]);
    }
    return nestedArray;
  },

  daysInMonth: function(month, year) {
    return new Date(year, month, 0).getDate();
  },

  addData: function(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach(dataset => {
      dataset.data.push(data);
    });
    chart.update();
  },

  removeData: function(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach(dataset => {
      dataset.data.pop();
    });
    chart.update();
  }

  // sortDateArr: function(arr) {
  //   arr.
  // }
};

module.exports = c;
