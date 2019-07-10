"use strict";

const vm = require("./viewmodel");
// const c = require("./control");
// const v = require("./view");

class UpdateChart {
  constructor(c, datasetIndex, resRowArrs, resType, period, firstDayOfWeek) {
    vm.stateFlag = "0560";
    this.datasetIndex = datasetIndex;
    this.resRowArrs = resRowArrs;
    this.resType = resType;
    this.period = period;
    this.firstDayOfWeek = firstDayOfWeek;
    this.resRowsInScale = [];
    this.time_col =
      this.resType === "timeCalculatable" ? "packet_generated" : "date";
    this.tempTimestamp = this.resRowArrs[0][this.time_col];
    // generate as many nested array as the period,
    // and organize the res data day by day.
    vm.stateFlag = "0535";
    this.prevDDM = c.getDateDayMonth(this.tempTimestamp, this.period);
    this.cMonth = new Date(this.tempTimestamp).getMonth();
    this.cYear = new Date(this.tempTimestamp).getFullYear();
    this.xAxisData = [];
    this.yAxisData1 = [];
    this.yAxisData2 = [];
    this.yAxisData3 = [];
    return this;
  }

  formatResRowsInScale(c) {
    vm.stateFlag = "0562";
    this.indexForResRowsInScale = this.prevDDM - 1;
    // make a placeholder
    this.resRowsInScale = c.genNestedPlaceholder(
      this.period,
      this.cMonth,
      this.cYear
    );
    // make a complete set of resRows with null data as well
    this.resRowArrs.forEach(row => {
      if (c.getDateDayMonth(row[this.time_col], this.period) != this.prevDDM) {
        this.prevDDM = c.getDateDayMonth(row[this.time_col], this.period);
        this.indexForResRowsInScale = this.prevDDM - 1;
      }
      this.resRowsInScale[this.indexForResRowsInScale].push(row);
    });
    return this;
  }

  fillResRowsInScale(c) {
    vm.stateFlag = "0572";
    this.resRowsInScale.forEach((dataForOneDDM, index) => {
      let date;
      if (!!dataForOneDDM && dataForOneDDM.length > 0) {
        vm.stateFlag = "0571";
        date = new Date(dataForOneDDM[0][this.time_col]);
        if (this.period === "year") {
          date = `${c.convertMonth(date.getMonth())} ${date.getFullYear()}`;
        } else if (this.period === "day") {
          // TODO: change the date to hourly
          date = date.toDateString();
        } else {
          date = date.toDateString();
        }
        this.date = date;
        this.calculatedMin =
          this.resType === "timeCalculatable"
            ? c.convToMin(c.getTimeCycledInMilSec(dataForOneDDM))
            : dataForOneDDM[0].count;
      } else {
        // Even with no data coming in for yAxis, display the chart by sendng 0s for yAxes and labels for xAxis
        vm.stateFlag = "0580";
        this.date = c.getXaxisDates(
          this.period,
          this.cYear,
          this.cMonth,
          index,
          this.firstDayOfWeek
        );
        this.calculatedMin = 0;
      }

      vm.stateFlag = "0545";
      // TODO: modulize
      if (this.datasetIndex == 0) {
        this.xAxisData.push(new Date(this.date).toDateString());
        this.yAxisData1.push(this.calculatedMin);
      } else if (this.datasetIndex == 1) {
        this.yAxisData2.push(this.calculatedMin);
      } else if (this.datasetIndex == 2) {
        this.yAxisData3.push(this.calculatedMin);
      }
    });
    return this;
  }
}

module.exports = { UpdateChart: UpdateChart };
