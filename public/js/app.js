if (!!myBarChart) {
  let defaultChartData = myBarChart;
}

let chartTabs = document.getElementsByClassName("chart-tab");
Array.prototype.forEach.call(chartTabs, function(tab) {
  tab.addEventListener("click", function(e) {
    console.log("this: ", this);
    console.log("e: ", e);
    console.log("value: ", this.getAttribute("value"));
    let tabValue = this.getAttribute("value");
    h.removeData(myBarChart);
    postData("/barchart", { periodTab: tabValue })
      // TODO: the following then not getting data
      .then(resMyJson => {
        console.log("resMyJson: ", resMyJson);
        let labelArray = resMyJson.labels;
        let dataArray = resMyJson.data;
        h.writeData(myBarChart, labelArray, dataArray);
      }) // JSON-string from `response.json()` call
      .catch(error => console.error(error));
  });
});

// chartTab.type = "button";

function postData(url = "", data = {}) {
  // Default options are marked with *
  return fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    headers: {
      "Content-Type": "application/json"
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify(data) // body data type must match "Content-Type" header
    // , mode: "cors", // no-cors, cors, *same-origin
    // cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    // credentials: "same-origin", // include, *same-origin, omit
    // redirect: "follow", // manual, *follow, error
    // referrer: "no-referrer", // no-referrer, *client
  }).then(function(response) {
    return response.json();
  });
}

let h = {
  writeData: function(chart, labelArr, dataArr) {
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
      if (type === "month") {
        return new Date(cYear, cMonth, index + 1);
      } else if (type === "week") {
        nextDay = new Date(day);
        nextDay.setDate(nextDay.getDate() + index);
        return nextDay;
      }
    }
  },

  genNestedArr: function(type, m, y) {
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
  }
};
