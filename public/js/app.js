let stateFlag = "0001";
// if (!!myBarChart) {
//   let defaultChartData = myBarChart;
// }

// let el_cards = document.getElementsByClassName("mycard");
// let el_ChartTabs = document.getElementsByClassName("chart-tab");
// let el_arrows = document.getElementsByClassName("my-arrows");
let el_dateRange = document.getElementById("date-range");

let el_for_chartupdates = document.getElementsByClassName("chart-updates");

// console.log("createchart at card is clicked");
// get unique classname from the card, and post.
// in the route, create the chart.

// let getTabValue = function(self) {
//   // if (myBarChart.data.xAxis.length > 0) {
//   // console.log("this: ", this);
//   // console.log("e: ", e);
//   // console.log("value: ", this.getAttribute("value"));
//   return { period: self.getAttribute("value") };
//   // } else {
//   // return "";
//   // }
// };

// let getCardClassNm = function(self) {
//   return;
// };

// let updateChartByCards = function(e) {
//   console.log("clicked on card");
//   stateFlag = "0030";
//   updateChart("/updatechart", {
//     reqBy: "card",
//     value: this.getAttribute("value"),
//     card_id: this.getAttribute("id") // 1, 11, or 201 .. card id
//   });
// };
// let updateChartByTabs = function(e) {
//   console.log("clicked on tab");
//   stateFlag = "0020";
//   updateChart("/updatechart", {
//     reqBy: "tab",
//     value: this.getAttribute("value"), // W, M, or Y
//     card_id: this.getAttribute("id")
//   });
// };
// let updateChartByArrows = function(e) {
//   console.log("clicked on arrow");
//   stateFlag = "0030";
//   updateChart("/updatechart", {
//     reqBy: "arrow",
//     value: this.getAttribute("value"), //
//     card_id: this.getAttribute("id")
//   });
// };

let updateChartByElem = function(e) {
  console.log("clicked on something, this time arrow");
  stateFlag = "0030";
  // console.log(this.getAttribute("value"));
  let reqBodySetup = {
    // reqBy: this.dataset.reqBy,
    // clickedOn: this.dataset.clickedOn,
    // card_id: this.dataset.cardId
    reqBy: this.getAttribute("data-reqBy"),
    clickedOn: this.getAttribute("data-clickedOn"),
    card_id: this.getAttribute("data-cardId")
  };
  updateChart("/updatechart", reqBodySetup);
};

/**
 * @description Updates chart
 * @param {string} url
 * @param {object} reqBodyData from user's input value from tab or card
 */
let updateChart = function(url, reqBodyData) {
  stateFlag = "0050";
  h.postData(url, reqBodyData)
    .then(resMyJson => {
      stateFlag = "0060";
      console.log("resMyJson: ", resMyJson);
      let xAxisArr = resMyJson.xAxis;
      let yAxisArr1 = resMyJson.yAxis1;
      let yAxisMarkLeft = resMyJson.yAxisMarkLeft;
      h.writeData(myBarChart, xAxisArr, yAxisArr1, yAxisMarkLeft);
      el_dateRange.textContent = `${xAxisArr[0]} ~ ${
        xAxisArr[xAxisArr.length - 1]
      }`;
    }) // JSON-string from `response.json()` call
    .catch(error => console.error(error + " at " + stateFlag));
};

// TODO: the first eventlistener should make a bar chart, not a STACKED one
// Array.prototype.forEach.call(el_cards, function(card) {
//   stateFlag = "0005";
//   card.addEventListener("click", updateChartByCards);
// });
// Array.prototype.forEach.call(el_ChartTabs, function(tab) {
//   stateFlag = "0010";
//   tab.addEventListener("click", updateChartByTabs);
// });
Array.prototype.forEach.call(el_for_chartupdates, function(elem) {
  stateFlag = "0013";
  elem.addEventListener("click", updateChartByElem);
});

// chartTab.type = "button";

let h = {
  writeData: function(chart, labelArr, nestedDataArr, yAxisTickMark) {
    console.log("thischart: ", chart);
    //////
    chart.data.xAxis = labelArr;
    // chart.data.yAxis1 =
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
    chart.data.xAxis.push(label);
    chart.data.datasets.forEach(dataset => {
      dataset.data.push(data);
    });
    chart.update();
  },

  removeData: function(chart) {
    chart.data.xAxis = [];
    chart.data.datasets.forEach(dataset => {
      dataset.data = [];
    });
    chart.update();
  },

  postData: async function(url = "/updateChart", data = { period: "month" }) {
    console.log(typeof data);
    console.log("stringified data in postdata: ", JSON.stringify(data));
    try {
      stateFlag = "0800";
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
      stateFlag = "0810";
      // if (!response.ok) throw new Error(response.statusText);
      return response.json();
    } catch (ex) {
      // await client.query('ROLLBACK')
      console.log(`something went wrong ${ex} at ${stateFlag}`);
      // currentShow = null;
      // // TODO: modify redirect destination
      // setTimeout(function redirect() {
      //   res.redirect(`/dashboard/${req.params.uuid}`);
      // }, 5000);
    } finally {
      // await client.release();
      // console.log("Client disconnected");
    }
  }
};
