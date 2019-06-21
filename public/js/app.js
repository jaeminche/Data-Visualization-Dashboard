// import { today } from "./db/viewmodel.js";
// import v from "./view";

let chartTab = document.getElementsByClassName("chart-tab-month")[0];
// let parsedNo = parseInt(chartTab.textContent);
let defaultChartData;
chartTab.addEventListener("click", function() {
  defaultChartData = myBarChart;
  helper.removeData(myBarChart);
  // get resArea
  fetch("/barchart")
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      console.log(JSON.stringify(myJson));
      let labelArray = myJson.labels;
      let dataArray = myJson.data;
      helper.overwriteData(myBarChart, labelArray, dataArray);
    });
  // if (
  //   typeof resArea != "undefined" &&
  //   typeof resArea[0].packet_generated != "undefined"
  // ) {
  //   helper.createBarChart(resArea, calendarType);
  // }

  // let labelArray = result.labels;
  // let dataArray = result.data;
  // helper.overwriteData(myBarChart, labelArray, dataArray);
});

let helper = {
  overwriteData: function(chart, labelArr, dataArr) {
    //////
    chart.data.labels = labelArr;
    chart.data.datasets.forEach(dataset => {
      dataset.data = dataArr;
    });
    //////
    chart.update();
  },

  removeData: function(chart) {
    chart.data.labels = [];
    chart.data.datasets.forEach(dataset => {
      dataset.data = [];
    });
    chart.update();
  },

  createBarChart: function(
    res,
    calendarType
    // , firstDayOfWeek
  ) {
    // console.log(firstDayOfWeek);
    let cMonth, cYear;
    let timestamp = res[0].packet_generated;
    let prevNo = this.getDateDayMonth(timestamp, calendarType);
    cMonth = new Date(timestamp).getMonth();
    cYear = new Date(timestamp).getFullYear();
    let indexForResByDay = prevNo - 1;

    // generate as many nested array as the calendarType,
    // and organize the res data day by day.
    let resByDay = this.genNestedArr(calendarType, cMonth, cYear);
    res.forEach(row => {
      if (this.getDateDayMonth(row.packet_generated, calendarType) === prevNo) {
        resByDay[indexForResByDay].push(row);
      } else {
        prevNo = this.getDateDayMonth(row.packet_generated, calendarType);
        indexForResByDay = prevNo - 1;
        resByDay[indexForResByDay].push(row);
      }
    });

    // manipulate the res data into dataset
    const dataForBarChart = [];
    resByDay.forEach((dataForOneDay, index) => {
      let dataset, date;
      if (!!dataForOneDay && dataForOneDay.length > 0) {
        date = new Date(dataForOneDay[0].packet_generated).toDateString();
        dataset = {
          date: date,
          label: date,
          time: this.convToMin(this.getTimeCycledInMilSec(dataForOneDay))
        };
      } else {
        date = getXaxisDates(
          calendarType,
          cYear,
          cMonth,
          index
          // , firstDayOfWeek
        ).toDateString();
        dataset = {
          date: date,
          label: date,
          time: 0
        };
      }
      dataForBarChart.push(dataset);
    });
    vm.area.datasets = dataForBarChart;

    function getXaxisDates(type, cYear, cMonth, index, day) {
      let nextDay;
      // TODO: add yearly and daily, and delete 'ly's
      if (type === "monthly") {
        return new Date(cYear, cMonth, index + 1);
      } else if (type === "weekly") {
        nextDay = new Date(day);
        nextDay.setDate(nextDay.getDate() + index);
        return nextDay;
      }
    }
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
};
