let stateFlag = "0001";
// if (!!myBarChart) {
//   let defaultChartData = myBarChart;
// }

let el_cards = document.getElementsByClassName("mycard");

let el_ChartTabs = document.getElementsByClassName("chart-tab");
let el_dateRange = document.getElementById("date-range");

// console.log("createchart at card is clicked");
// get unique classname from the card, and post.
// in the route, create the chart.

// let getTabValue = function(self) {
//   // if (myBarChart.data.labels.length > 0) {
//   // console.log("this: ", this);
//   // console.log("e: ", e);
//   // console.log("value: ", this.getAttribute("value"));
//   return { period: self.getAttribute("value") };
//   // } else {
//   // return "";
//   // }
// };

let getCardClassNm = function(self) {
  return;
};

let updateChartWithTabs = function(e) {
  stateFlag = "0020";
  updateChart("/updatechart", { period: this.getAttribute("value") });
};
let updateChartWithCards = function(e) {
  stateFlag = "0030";
  updateChart("/updatechartforcard", { card_id: this.getAttribute("value") });
};

/**
 * @description Updates chart
 * @param {string} url
 * @param {object} reqBodyData from user's input value from tab or card
 */
let updateChart = function(url, reqBodyData) {
  stateFlag = "0050";
  // TODO: THERE MUST BE CREATED A CHART BY USING CREATEBARCHART() THEREFORE, MAKE ANOTHER ROUTER FOR CREATING A CHART
  h.postData(url, reqBodyData)
    .then(resMyJson => {
      stateFlag = "0060";
      console.log("resMyJson: ", resMyJson);
      let labelArray = resMyJson.labels;
      let dataArray = resMyJson.data;
      let yAxisTickMark = resMyJson.yAxisTickMark;
      h.writeData(myBarChart, labelArray, dataArray, yAxisTickMark);
      el_dateRange.textContent = `${labelArray[0]} ~ ${
        labelArray[labelArray.length - 1]
      }`;
    }) // JSON-string from `response.json()` call
    .catch(error => console.error(error + " at " + stateFlag));
};

// TODO: the first eventlistener should make a bar chart, not a STACKED one
// Array.prototype.forEach.call(el_cards, function(card) {
//   stateFlag = "0005";
//   card.addEventListener("click", updateChartWithCards);
// });
// Array.prototype.forEach.call(el_ChartTabs, function(tab) {
//   stateFlag = "0010";
//   tab.addEventListener("click", updateChartWithTabs);
// });

// chartTab.type = "button";

let h = {
  writeData: function(chart, labelArr, nestedDataArr, yAxisTickMark) {
    console.log("thischart: ", chart);
    //////
    chart.data.labels = labelArr;
    chart.data.datasets.forEach((dataset, i) => {
      dataset.data = nestedDataArr[i];
    });
    yAxisTickMark = yAxisTickMark;
    // chart.myOptions.yAxisUnit = yAxisUnit;
    //////
    chart.update();
  },

  updateConfigByMutating: function(chart) {
    chart.options.title.text = "new title";
    chart.update();
  },

  addData: function(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach(dataset => {
      dataset.data.push(data);
    });
    chart.update();
  },

  removeData: function(chart) {
    chart.data.labels = [];
    chart.data.datasets.forEach(dataset => {
      dataset.data = [];
    });
    chart.update();
  },

  postData: async function(url = "/barchart", data = { period: "month" }) {
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
