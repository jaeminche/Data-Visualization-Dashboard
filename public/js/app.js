if (!!myBarChart) {
  let defaultChartData = myBarChart;
}

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
//   return { periodTab: self.getAttribute("value") };
//   // } else {
//   // return "";
//   // }
// };

let getCardClassNm = function(self) {
  return;
};

let updateChartWithTabs = function(e) {
  updateChart("/barchart", { periodTab: this.getAttribute("value") });
};
let updateChartWithCards = function(e) {
  updateChart("/barchartforcard", { card_id: this.getAttribute("value") });
};
let updateChart = function(url, reqBodyData) {
  h.postData(url, reqBodyData)
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

Array.prototype.forEach.call(el_cards, function(card) {
  card.addEventListener("click", updateChartWithCards);
});
Array.prototype.forEach.call(el_ChartTabs, function(tab) {
  tab.addEventListener("click", updateChartWithTabs);
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
