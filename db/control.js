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
    vm.stateFlag = "0575";
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

  getDateDayMonth: function(timestamp, periodTab) {
    vm.stateFlag = "0540";
    if (periodTab === "month") {
      return new Date(timestamp).getDate();
    } else if (periodTab === "year") {
      let month = new Date(timestamp).getMonth();
      month = month + 1;
      return month;
    } else if (periodTab === "week") {
      let day = new Date(timestamp).getDay();
      if (day === 0) {
        day = 7;
      }
      return day;
    } else if (periodTab === "day") {
      vm.stateFlag = "0550";
      return new Date(timestamp).getHours();
    }
  },

  createBarChart: function(resRows, periodTab, firstDayOfWeek) {
    vm.stateFlag = "0521";
    let cMonth, cYear;
    let tempTimestamp = resRows[0].packet_generated;
    // generate as many nested array as the periodTab,
    // and organize the res data day by day.
    vm.stateFlag = "0535";
    let prevDDM = this.getDateDayMonth(tempTimestamp, periodTab);
    cMonth = new Date(tempTimestamp).getMonth();
    cYear = new Date(tempTimestamp).getFullYear();
    let indexForSortedArr = prevDDM - 1;
    let sortedArrByDDM = this.genNestedArr(periodTab, cMonth, cYear);
    resRows.forEach(row => {
      if (this.getDateDayMonth(row.packet_generated, periodTab) != prevDDM) {
        prevDDM = this.getDateDayMonth(row.packet_generated, periodTab);
        indexForSortedArr = prevDDM - 1;
      }
      sortedArrByDDM[indexForSortedArr].push(row);
    });
    // console.log("TCL: sortedArrByDDM: ", sortedArrByDDM);
    // sortedArrByMonth, dataForOneMonth
    // manipulate the res data into dataset
    vm.stateFlag = "0570";
    const dataForBarChart = [];
    sortedArrByDDM.forEach((dataForOneDDM, index) => {
      let dataset, date;
      if (!!dataForOneDDM && dataForOneDDM.length > 0) {
        vm.stateFlag = "0571";
        date = new Date(dataForOneDDM[0].packet_generated);
        if (periodTab === "year") {
          date = `${this.convertMonth(date.getMonth())} ${date.getFullYear()}`;
        } else if (periodTab === "day") {
          // TODO: change the date to hourly
          date = date.toDateString();
        } else {
          date = date.toDateString();
        }
        dataset = {
          date: date,
          label: date,
          time: this.convToMin(this.getTimeCycledInMilSec(dataForOneDDM))
        };
      } else {
        vm.stateFlag = "0580";
        date = getXaxisDates(periodTab, cYear, cMonth, index, firstDayOfWeek);
        if (periodTab === "year") {
          date = `${this.convertMonth(date.getMonth())} ${date.getFullYear()}`;
        } else if (periodTab === "day") {
          // TODO: change the date to hourly
          date = date.toDateString();
        } else {
          date = date.toDateString();
        }
        dataset = {
          date: date,
          label: date,
          time: 0
        };
      }
      vm.stateFlag = "0545";
      dataForBarChart.push(dataset);
    });
    vm.area.datasets = dataForBarChart;

    function getXaxisDates(periodTab, cYear, cMonth, index, firstDay) {
      vm.stateFlag = "0543";
      // TODO: add year and day, and delete 'ly's
      if (periodTab === "month") {
        return new Date(cYear, cMonth, index + 1);
      } else if (periodTab === "week") {
        let nextDay = new Date(firstDay);
        nextDay.setDate(nextDay.getDate() + index);
        return nextDay;
      } else if (periodTab === "year") {
        return new Date(cYear, index, 1);
      }
    }
  },

  genNestedArr: function(type, m, y) {
    vm.stateFlag = "0561";
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

  convertMonth: function(number) {
    switch (number) {
      case 0:
        return "Jan";
        break;
      case 1:
        return "Feb";
        break;
      case 2:
        return "Mar";
        break;
      case 3:
        return "Apr";
        break;
      case 4:
        return "May";
        break;
      case 5:
        return "Jun";
        break;
      case 6:
        return "Jul";
        break;
      case 7:
        return "Aug";
        break;
      case 8:
        return "Sep";
        break;
      case 9:
        return "Oct";
        break;
      case 10:
        return "Nov";
        break;
      case 11:
        return "Dec";
        break;
    }
  }

  // sortDateArr: function(arr) {
  //   arr.
  // }
};

module.exports = c;
