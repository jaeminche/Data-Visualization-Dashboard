const vm = require("./viewmodel");
const v = require("./view");

const c = {
  init_login_show: function() {
    vm.currentLogin = null;
    vm.currentShow = null;
  },

  init: function() {
    vm.chart = {
      myOptions: {
        yAxisMarkLeft: "left unit1",
        yAxisMarkRight: "right unit2"
      },
      data: {
        xAxis: ["sample label1", "sample label2"],
        yAxis1: [10, 20], //cycling
        yAxis2: [], //taximode
        yAxis3: [] //average
      }
    };
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

  // takes params and returns as millisec
  getTimeDiff: function(date1, date2) {
    let big = new Date(date1);
    let small = new Date(date2);
    return big - small;
  },

  getDateDayMonth: function(timestamp, period) {
    vm.stateFlag = "0540";
    if (period === "month") {
      return new Date(timestamp).getDate();
    } else if (period === "year") {
      let month = new Date(timestamp).getMonth();
      month = month + 1;
      return month;
    } else if (period === "week") {
      let day = new Date(timestamp).getDay();
      if (day === 0) {
        day = 7;
      }
      return day;
    } else if (period === "day") {
      vm.stateFlag = "0550";
      return new Date(timestamp).getHours();
    }
  },

  getFirstDayOfWeek: async function(period) {
    if (period === "week") {
      firstDay = await client.query(
        `select * from date_trunc('week', date(${vm.today}))`
      );
      return firstDay.rows[0].date_trunc;
    } else {
      return "";
    }
  },

  getQueryAndValueFromRedirectedCard: function(id) {
    for (let card of vm.cards[`for${vm.currentShowType}`]) {
      if (card.id === id) {
        return {
          query: card.query,
          period: card.period,
          yAxisTickMark: card.yAxisTickMark
        };
      }
    }
  },

  // checkCardForDefaultChartAndStoreData: function(card, resCard) {
  //   let exists = false;
  //   let reqFrom = "card";
  //   let resChart, period, yAxisTickMark;
  //   // TODO: IMPLEMENT LINES FOR EXCEPTION: THERE COULD BE RESCARD WITH NO ROWS
  //   if (card.isForLeftXaxis && card.isDefaultForChart) {
  //     vm.stateFlag = "0240";
  //     resChart = resCard.rows;
  //     period = card.period;
  //     yAxisTickMark = card.yAxisTickMark;
  //     exists = true;
  //   }
  //   return {
  //     reqFrom: reqFrom,
  //     resChart: resChart,
  //     period: period,
  //     yAxisTickMark: yAxisTickMark,
  //     exists: exists
  //   };
  // },

  /**
   * @description finds cards and get res if areForChart === true,
   * Or updates cards' numbers if areForChart === false
   * @param {boolean} areForChart
   * @return {object} foundCardsAndRes
   */
  findCardsAndGetResOrUpdateCardsNo: async function(client, areForChart) {
    let key, res;
    const foundCardObjs = [];
    const resRows = [];
    const resRowArrs = [];

    vm.cards.areForChart = areForChart;

    for await (let card of vm.cards[`for${vm.currentShowType}`]) {
      if (
        card[areForChart ? "isDefaultForChart" : "isCardShown"] &&
        !!card.query
      ) {
        switch (vm.currentShowType) {
          case "superadmin":
            vm.stateFlag = "0210";
            res = await client.query(card.query);
            break;
          case "admin":
            vm.stateFlag = "0220";
            res = await client.query(card.query, [vm.currentShow.o_id]);
            break;
          case "user":
            console.log("user card ----");
            vm.stateFlag = "0230";
            res = await client.query(card.query, [vm.currentShow.id]);
            break;
        }

        if (!areForChart) {
          // ! updates directly cards' numbers when 'areForChart' is set to false
          await this.updateVM_cards(card, res);
        } else {
          await foundCardObjs.push(card); // to get myoption data
          await resRowArrs.push(res.rows); // for stacked-bar, 2 sets pushed
        }
      }
      // resRowSets.push(resRows);
    }
    vm.stateFlag = "0213";
    return { cardObjs: foundCardObjs, resRowArrs: resRowArrs }; // { cardObjs: [{}, {}], resRowArrs: [[], []]}
  },

  /**
   * updates cards' numbers in viewmodel
   * @param {object}
   */
  updateVM_cards: async function(card, res) {
    // In order for card.number to take resCard.rowCount, card.isForTimeCalc is set to false
    console.log("carcardcard: ", card);
    if (card.resType === "timeCalculatable") {
      vm.stateFlag = "0250";
      timeCycledInMilSec = this.getTimeCycledInMilSec(res.rows);
      card.number = this.convMilSecToFin(timeCycledInMilSec);
    } else if (card.resType === "rowCountable") {
      vm.stateFlag = "0260";
      card.number = await res.rowCount;
    } else {
      card.number = "something went wrong";
    }
  },

  // TODO: move this to browser-side
  //  TODO: make default params of sample data
  updateVM_chart: async function(
    reqBy,
    cardObjs, // [{}, {}]
    resRowArrs, //[[], []]
    period = "month",
    // yAxisTickMark,
    firstDayOfWeek = this.getFirstDayOfWeek("month")
  ) {
    vm.stateFlag = "0540";
    let yAxisTickMark;
    let yAxisData1 = []; // resRowArrs[0]
    let yAxisData2 = []; // resRowArrs[1]
    let yAxisData3 = []; // resRowArrs[1]
    let xAxisData = []; // ["date1", "date2"]
    let yAxisMarkLeft = "";
    let yAxisMarkRight = ""; //
    const dataForChart = [];
    // let [resrows1, resrows2, resrows3] = resRowArrs;
    vm.stateFlag = "0543";
    cardObjs.forEach((card, i) => {
      if (card.resType === "retrievable_date_count") {
        resRowArrs[i].forEach(row => {
          if (i == 0) {
            xAxisData.push(new Date(row.date).toDateString());
            yAxisData1.push(row.count);
          } else if (i == 1) {
            yAxisData2.push(row.count);
          } else if (i == 2) {
            yAixsData3.push(row.count);
          }
        });
      } else if (card.resType === "timeCalculatable") {
      } else {
      }
    });
    // console.log("dataForBarChart: ", dataForChart);
    // dataForChart.map(set => {
    //   xAxisData.push(set.label);
    //   yAxisData.push(set.data);
    // });
    vm.stateFlag = "0545";
    vm.chart.data.xAxis = xAxisData;
    vm.chart.data.yAxis1 = yAxisData1;
    vm.chart.myOptions.yAxisMarkLeft = yAxisMarkLeft;
    if (yAxisData2.length > 0) vm.chart.data.yAxis2 = yAxisData2;
    if (yAxisData3.length > 0) vm.chart.data.yAxis3 = yAxisData3;
    if (yAxisMarkRight.length > 0)
      vm.chart.myOptions.yAxisMarkRight = yAxisMarkRight;
    // console.log("vm.chart: ", vm.chart);

    /*
    if (reqBy === "card" || reqBy === "default") {
      vm.stateFlag = "0543";
      resRowArrs.forEach((resrow, i) => {
        resrow.forEach(row => {
          dates.push(row.date);
          xAxisData.push(row.date);
          oneChartDataForYAxis.push(row.count);
        });
        console.log(
          "chartDataXAxis: ",
          xAxisData,
          "chartDataYAxis: ",
          yAxisData
        );
      });
      yAxisData.push(row.count);
      cardObjs.forEach((card, i) => {
        yMarksData.push(resrow.card.yAxisTickMark);
      });
    } else if (reqBy === "period") {
      vm.stateFlag = "0521";
      let cMonth, cYear;
      let tempTimestamp = resRows[0].packet_generated;
      // generate as many nested array as the period,
      // and organize the res data day by day.
      vm.stateFlag = "0535";
      let prevDDM = this.getDateDayMonth(tempTimestamp, period);
      cMonth = new Date(tempTimestamp).getMonth();
      cYear = new Date(tempTimestamp).getFullYear();
      let indexForNestedArr = prevDDM - 1;
      // make a placeholder
      let nestedArrByDDM = this.genNestedArr(period, cMonth, cYear);
      resRows.forEach(row => {
        if (this.getDateDayMonth(row.packet_generated, period) != prevDDM) {
          prevDDM = this.getDateDayMonth(row.packet_generated, period);
          indexForNestedArr = prevDDM - 1;
        }
        nestedArrByDDM[indexForNestedArr].push(row);
      });
      // console.log("TCL: nestedArrByDDM: ", nestedArrByDDM);
      // manipulate the res data into dataset
      vm.stateFlag = "0570";
      nestedArrByDDM.forEach((dataForOneDDM, index) => {
        let dataset, date;
        if (!!dataForOneDDM && dataForOneDDM.length > 0) {
          vm.stateFlag = "0571";
          date = new Date(dataForOneDDM[0].packet_generated);
          if (period === "year") {
            date = `${this.convertMonth(
              date.getMonth()
            )} ${date.getFullYear()}`;
          } else if (period === "day") {
            // TODO: change the date to hourly
            date = date.toDateString();
          } else {
            date = date.toDateString();
          }

          dataset = this.genDataset(
            date,
            this.convToMin(
              this.getTimeCycledInMilSec(dataForOneDDM),
              yAxisTickMark
            )
          );
        } else {
          // in case of no data in the period, generate dataset only with x-axis labels
          vm.stateFlag = "0580";
          date = getXaxisDates(period, cYear, cMonth, index, firstDayOfWeek);
          if (period === "year") {
            date = `${this.convertMonth(
              date.getMonth()
            )} ${date.getFullYear()}`;
          } else if (period === "day") {
            // TODO: change the date to hourly
            date = date.toDateString();
          } else {
            date = date.toDateString();
          }
          dataset = this.genDataset(date, 0, yAxisTickMark);
        }
        vm.stateFlag = "0545";
        dataForChart.push(dataset);
      });
      console.log("dataForBarChart: ", dataForChart);
      dataForChart.map(set => {
        xAxisData.push(set.label);
        yAxisData.push(set.data);
      });
    }
    // dataset = this.genDataset(set.date, set.count, "cust.");
    // dataForBarChart.push(dataset);
    vm.stateFlag = "0545";
    vm.chart.data.labels = xAxisData;
    vm.chart.data.dataset = yAxisData;
    vm.chart.myOptions.yAxisTickMark = yAxisTickMark;
    console.log("vm.chart: ", vm.chart);
    */

    function getXaxisDates(period, cYear, cMonth, index, firstDay) {
      vm.stateFlag = "0544";
      // TODO: add year and day, and delete 'ly's
      if (period === "month") {
        return new Date(cYear, cMonth, index + 1);
      } else if (period === "week") {
        let nextDay = new Date(firstDay);
        nextDay.setDate(nextDay.getDate() + index);
        return nextDay;
      } else if (period === "year") {
        return new Date(cYear, index, 1);
      }
    }
  },

  genDataset: function(
    xAxisData = "unable to retrieve data",
    yAxisData = 0,
    yAxisTickMark = "unable to retrieve data"
  ) {
    return {
      date: xAxisData,
      label: xAxisData,
      data: yAxisData,
      yAxisTickMark: yAxisTickMark
    };
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

  addData: function(chart, label, yAxisData1, yAxisData2, yAxisData3) {
    chart.data.xAxis.push(label);
    // TODO: add yAxis data
    // chart.data.yAxis1.forEach(dataset => {
    //   dataset.data.push(yAxisData1);
    // });
    chart.update();
  },

  removeData: function(chart) {
    chart.data.xAxis.pop();
    chart.data.yAxis1.pop();
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
