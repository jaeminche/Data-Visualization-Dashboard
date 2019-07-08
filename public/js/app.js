let stateFlag = "0001";
// if (!!myBarChart) {
//   let defaultChartData = myBarChart;
// }

let el_dateRange = document.getElementById("date-range");

let el_for_chartupdates = document.getElementsByClassName("chart-updates");

// get unique classname from the card, and post.
// in the route, create the chart.

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
  console.log("clicked on something");
  stateFlag = "0030";
  console.log("data-cardId: ", this.getAttribute("data-cardId"));
  let reqBodySetup = {
    reqBy: this.getAttribute("data-reqBy"),
    clickedOn: this.getAttribute("data-clickedOn"),
    period: JSON.parse(this.getAttribute("data-period")),
    card_id: JSON.parse(this.getAttribute("data-cardId"))
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
      let yAxis2, yAxis3, yAxisMarkRight;
      console.log("resMyJson: ", resMyJson);
      let xAxis = resMyJson.xAxis;
      let yAxis1 = resMyJson.yAxis1;
      stateFlag = "0062";
      if (!!resMyJson.yAxis2) yAxis2 = resMyJson.yAxis2;
      if (!!resMyJson.yAxis3) yAxis3 = resMyJson.yAxis3;
      let title = resMyJson.title;
      let yAxisMarkLeft = resMyJson.yAxisMarkLeft;
      if (!!resMyJson.yAxisMarkRight) yAxisMarkRight = resMyJson.yAxisMarkRight;
      stateFlag = "0064";
      console.log("myBarChart: ", myBarChart);
      h.removeData(myBarChart);
      stateFlag = "0080";
      h.addData(myBarChart, xAxis, yAxis1, yAxis2, yAxis3);
      stateFlag = "0090";
      h.updateConfig(myBarChart, title, yAxisMarkLeft, yAxisMarkRight);
      stateFlag = "0100";
      // myBarChart.update();
      stateFlag = "0110";
      el_dateRange.textContent = `${xAxis[0]} ~ ${xAxis[xAxis.length - 1]}`;
    }) // JSON-string from `response.json()` call
    .catch(error => console.error(error + " at " + stateFlag));
};

// TODO: the first eventlistener should make a bar chart, not a STACKED one

Array.prototype.forEach.call(el_for_chartupdates, function(elem) {
  stateFlag = "0013";
  elem.addEventListener("click", updateChartByElem);
});

// chartTab.type = "button";

let h = {
  postData: async function(
    url = "/updateChart",
    data = {
      reqBy: "not submitted",
      clickedOn: "not submitted",
      period: "not submitted",
      card_id: "not submitted"
    }
  ) {
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
  },

  addData: function(
    chart,
    xAxis = ["sample label 1", "sample label 2"],
    yAxisData1 = [1, 2],
    yAxisData2,
    yAxisData3
  ) {
    const yAxisData = [yAxisData1, yAxisData2, yAxisData3];
    chart.data.labels = xAxis;
    chart.data.datasets.forEach((dataset, i) => {
      if (!!yAxisData[i]) dataset.data = yAxisData[i];
    });
    // chart.data.yAxis1 = yAxisData1;
    // if (!!yAxisData2) chart.data.yAxis2 = yAxisData2;
    // if (!!yAxisData3) chart.data.yAxis3 = yAxisData3;

    chart.update();
  },

  updateConfig: function(
    chart,
    title = "unable to find title",
    yAxisMarkLeft = "sample mark left",
    yAxisMarkRight
  ) {
    stateFlag = "0091";
    console.log("title is ", title);
    document.getElementsByClassName("chart-title")[0].textContent = title;
    yAxisMarkLeft = yAxisMarkLeft;
    if (!!yAxisMarkRight) yAxisMarkRight = yAxisMarkRight;

    chart.update();
  },

  removeData: function(chart) {
    chart.data.xAxis = [];
    chart.data.datasets.forEach((dataset, i) => {
      dataset.data = [];
    });

    chart.update();
  }

  // writeData: function(chart, labelArr, nestedDataArr, yAxisTickMark) {
  //   console.log("thischart: ", chart);
  //   //////
  //   chart.data.xAxis = labelArr;
  //   chart.data.datasets.forEach((dataset, i) => {
  //     dataset.data = nestedDataArr[i];
  //   });
  //   yAxisTickMark = yAxisTickMark;
  //   //////
  //   chart.update();
  // },

  // updateConfigByMutating: function(chart) {
  //   chart.options.yAxisMarkLeft = "new title";
  //   chart.update();
  // }

  // addData: function(chart, label, data) {
  //   chart.data.xAxis.push(label);
  //   chart.data.datasets.forEach(dataset => {
  //     dataset.data.push(data);
  //   });
  //   chart.update();
  // },
};
