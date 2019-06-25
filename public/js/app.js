if (!!myBarChart) {
  let defaultChartData = myBarChart;
}

let el_ChartTabs = document.getElementsByClassName("chart-tab");
let el_dateRange = document.getElementById("date-range");
// updateChart();
let updateChart = function(e) {
  let tabValue, data;
  if (myBarChart.data.labels.length > 0) {
    console.log("this: ", this);
    console.log("e: ", e);
    console.log("value: ", this.getAttribute("value"));
    tabValue = this.getAttribute("value");
    h.removeData(myBarChart);
    data = { periodTab: tabValue };
  } else {
    data = "";
  }

  h.postData("/barchart", data)
    .then(resMyJson => {
      console.log("resMyJson: ", resMyJson);
      let labelArray = resMyJson.labels;
      let dataArray = resMyJson.data;
      h.writeData(myBarChart, labelArray, dataArray);
      el_dateRange.textContent = `${labelArray[0]} ~ ${
        labelArray[labelArray.length - 1]
      }`;
    }) // JSON-string from `response.json()` call
    .catch(error => console.error(error));
};

Array.prototype.forEach.call(el_ChartTabs, function(tab) {
  tab.addEventListener("click", updateChart);
});

// chartTab.type = "button";

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

  postData: async function(url = "/barchart", data = { periodTab: "month" }) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: "POST",
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
    });
    return response.json();
  }
};
