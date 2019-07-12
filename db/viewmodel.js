/**
 * todo 1. Get clickable period tabs working
 * todo 2. Get clickable arrows working
 * todo 3. Get clickable cards working
 * todo 4. implement middleware for security
 */

const vm = {
  state: {
    card: { _id: [], period: [] },
    chart: { _id: [], period: [] },
    // TODO: updates the DATE RANGE directly, instead of getting it from the xAxis labels
    date_range: { from: "", to: "" }
  },
  // TODO: move following current & show-related data into vm.state
  // TODO: when deployment, change the date to current_date
  today: "'2017-06-08'", // !there's another line as this one in dashboard router
  pgload: 1,
  stateFlag: "",
  jwt: {
    o: null,
    u: null,
    a: false,
    d: null
  },
  // jwt: {
  //   o: 1,
  //   u: 4,
  //   a: true,
  //   d: null
  // },
  currentLogin: {
    name: null,
    display: null,
    id: null,
    uuid: null,
    o_name: null,
    o_id: null,
    o_uuid: null,
    superadmin: false,
    admin: false
  },
  currentLoginType: null, // superadmin || admin || user
  currentShow: null, // take input as object with same format as currentLogin
  currentShowType: null, // superadmin || admin || user

  cards: {
    areForChart: false,
    forsuperadmin: [
      // !must not include a $1 in each query
      {
        id: 1,
        name: "NO. OF ORGANIZATIONS LOGGED IN TODAY",
        isCardShown: false,
        isDefaultForChart: false, // !must be only one true for each showtype(two for stacked-bar), also (this card.isCardShown && !!card.query)
        isForLeftXaxis: false, // !true only if time
        yAxisMark: "cust.",
        period: "day",
        classname: "sa",
        number: 0,
        isForTimeCalc: false, // !true only if isForLeftXaxis is true
        color: "primary",
        fa: "sign-in-alt",
        resType: "rowCountable",
        get query() {
          return `select orgid, count(orgid) from public.log_login where date(client_timestamp) = date(${
            vm.today
          }) GROUP BY orgid`;
        },
        auth: ["superadmin"]
      },
      {
        id: 2,
        name: "NO. OF ORGANIZATIONS LOGGED IN THIS MONTH",
        isCardShown: false,
        isDefaultForChart: false,
        isForLeftXaxis: false,
        yAxisMark: "cust.",
        period: "month",
        number: 0,
        isForTimeCalc: false,
        color: "info",
        fa: "sign-in-alt",
        resType: "rowCountable",
        get query() {
          return `SELECT orgid, COUNT(orgid) FROM public.log_login WHERE DATE(client_timestamp) >= DATE_TRUNC('month', DATE(${
            vm.today
          })) AND DATE(client_timestamp) < DATE_TRUNC('month', DATE(${
            vm.today
          }) + INTERVAL '1 month') GROUP BY orgid`;
        },
        auth: ["superadmin"]
      },
      {
        id: 3,
        name: "TOTAL NO. OF ORGANIZATIONS",
        isCardShown: true,
        isDefaultForChart: false,
        isForLeftXaxis: false,
        yAxisMark: "cust.",
        period: null,
        number: 0,
        isForTimeCalc: false,
        color: "warning",
        fa: "user",
        resType: "rowCountable",
        query: "SELECT * FROM public.organisations",
        auth: ["superadmin"]
      },
      {
        id: 4,
        name: "TOTAL NO. OF USERS",
        isCardShown: false,
        isDefaultForChart: false,
        isForLeftXaxis: false,
        yAxisMark: "users",
        period: null,
        number: 0,
        isForTimeCalc: false,
        color: "warning",
        fa: "users",
        resType: "rowCountable",
        query: "SELECT * FROM public.users",
        auth: ["superadmin"]
      },
      {
        id: 5, //! card on pg 4 in ppt
        name: "NO. OF ACTIVE ORGANIZATIONS TODAY",
        isCardShown: true,
        isDefaultForChart: false,
        isForLeftXaxis: true,
        yAxisMark: "cust.",
        get period() {
          if (!vm.cards.areForChart) {
            return "day";
          } else {
            return vm.cards.forsuperadmin[5].period;
          }
        },
        number: 0,
        isForTimeCalc: false,
        color: "primary",
        fa: "chart-bar",
        get resType() {
          if (!vm.cards.areForChart) {
            return "rowCountable";
          } else {
            return vm.cards.forsuperadmin[5].resType;
          }
        },
        get query() {
          if (!vm.cards.areForChart) {
            // !to get users, simply change orgid to 'userid'
            return `SELECT DISTINCT orgid FROM public.log_startcycling WHERE date(client_timestamp) = ${
              vm.today
            }`;
          } else {
            //! to use this, vm.cards.areForChart must be set to true
            console.log("redirection for neighboring query called");
            return vm.cards.forsuperadmin[5].query;
          }
        },
        auth: ["superadmin"]
      },
      {
        id: 6, // !chart on pg 4 in ppt
        name: "NO. OF ACTIVE ORGANIZATIONS PER DAY THIS MONTH",
        isCardShown: false,
        // isDefaultForChart: false,
        isDefaultForChart: true, // !must be only one true for each showtype(two for stacked-bar), also (this card.isCardShown && !!card.query)
        isForLeftXaxis: true,
        yAxisMark: "cust.",
        period: "month",
        number: null,
        isForTimeCalc: false,
        color: "info",
        fa: "chart-bar",
        resType: "retrievable_date_count",
        get query() {
          return `SELECT DATE(client_timestamp), COUNT(DISTINCT orgid) FROM log_startcycling WHERE DATE(client_timestamp) >= DATE_TRUNC('month', DATE(${
            vm.today
          })) AND DATE(client_timestamp) < DATE_TRUNC('month', DATE(${
            vm.today
          }) + INTERVAL '1 month') GROUP BY DATE(client_timestamp)`;
        },
        auth: ["superadmin"]
      },
      {
        id: 7, // !card on pg 5 in ppt
        name: "NO. OF ACTIVE ORGANIZATIONS THIS MONTH",
        isCardShown: true,
        isDefaultForChart: false,
        isForLeftXaxis: false,
        yAxisMark: "cust.",
        period: "month",
        number: 0,
        isForTimeCalc: false,
        color: "info",
        fa: "chart-line",
        // idRedirectedForChartQuery: 8,
        resType: "rowCountable",
        get query() {
          return `SELECT orgid FROM log_startcycling WHERE DATE(client_timestamp) >= DATE_TRUNC('month', DATE(${
            vm.today
          })) AND DATE(client_timestamp) < DATE_TRUNC('month', DATE(${
            vm.today
          }) + INTERVAL '1 month') GROUP BY orgid`;
        },
        auth: ["superadmin"]
      },
      {
        id: 8, // !chart on pg 5 in ppt
        name: "NO. OF ACTIVE ORGANIZATIONS PER MONTH THIS YEAR",
        isCardShown: false,
        isDefaultForChart: false,
        isForLeftXaxis: true,
        yAxisMark: "cust.",
        period: "year",
        number: null,
        isForTimeCalc: false,
        color: "info",
        fa: "chart-line",
        resType: "retrievable_date_count",
        get query() {
          return `SELECT DATE(DATE_TRUNC('month', DATE(client_timestamp)) ), COUNT(DISTINCT orgid) FROM log_startcycling WHERE DATE(client_timestamp) >= DATE_TRUNC('year', DATE(${
            vm.today
          })) AND DATE(client_timestamp) < DATE_TRUNC('year', DATE(${
            vm.today
          }) + INTERVAL '1 year') GROUP BY DATE(DATE_TRUNC('month', DATE(client_timestamp)) )`;
        },
        auth: ["superadmin"]
      },
      {
        id: 9,
        name: "AVERAGE TIME THIS WEEK",
        isCardShown: false,
        isDefaultForChart: false,
        isForLeftXaxis: true,
        yAxisMark: "min.",
        period: "week",
        number: 0,
        isForTimeCalc: true,
        color: "success",
        fa: "stopwatch",
        resType: "timeCalculatable",
        get query() {
          return `${
            vm.qr.cyclingTime
          } WHERE packet_generated >= date_trunc('week', date(${
            vm.today
          })) AND packet_generated < date_trunc('week', date(${
            vm.today
          }) + interval '1 week')`;
        },
        auth: ["superadmin"]
      },
      {
        id: 10,
        name: "AVERAGE TIME THIS MONTH",
        isCardShown: false,
        isDefaultForChart: false,
        // isDefaultForChart: true,
        isForLeftXaxis: true,
        yAxisMark: "min.",
        period: "month",
        number: 0,
        isForTimeCalc: true,
        color: "success",
        fa: "stopwatch",
        resType: "timeCalculatable",
        get query() {
          return `${
            vm.qr.cyclingTime
          } WHERE packet_generated >= date_trunc('month', date(${
            vm.today
          })) AND packet_generated < date_trunc('month', date(${
            vm.today
          }) + interval '1 month')`;
        },
        auth: ["superadmin"]
      }
    ],
    foradmin: [
      // !must include at least $1 for o_id
      {
        id: 101,
        name: "ACTIVE DAYS THIS MONTH",
        isCardShown: true,
        isDefaultForChart: false,
        isForLeftXaxis: true,
        yAxisMark: "month",
        get period() {
          if (!vm.cards.areForChart) {
            return "month";
          } else {
            return vm.cards.foradmin[1].period;
          }
        },
        number: 0,
        isForTimeCalc: false,
        color: "warning",
        fa: "stopwatch",
        get resType() {
          if (!vm.cards.areForChart) {
            return "rowCountable";
          } else {
            return vm.cards.foradmin[1].resType;
          }
        },
        get query() {
          if (!vm.cards.areForChart) {
            return `SELECT DISTINCT ON (client_timestamp) date_trunc('day', client_timestamp) AS client_timestamp FROM log_startcycling WHERE orgid = $1 AND client_timestamp >= date_trunc('month', date(${
              vm.today
            })) AND client_timestamp < date_trunc('month', date(${
              vm.today
            }) + interval '1 month')`;
          } else {
            return vm.cards.foradmin[1].query;
          }
        },
        auth: ["superadmin", "admin", "user"]
      },
      {
        id: 102,
        name: "ACTIVE DAYS PER MONTH THIS YEAR",
        isCardShown: false,
        // isDefaultForChart: true,
        isDefaultForChart: false,
        isForLeftXaxis: true,
        yAxisMark: "days",
        period: "year",
        number: 0,
        isForTimeCalc: false,
        color: "warning",
        fa: "stopwatch",
        resType: "retrievable_date_count",
        get query() {
          return `SELECT DATE(DATE_TRUNC('month', DATE(client_timestamp)) ), COUNT(*) 
          FROM (
            SELECT DISTINCT ON (client_timestamp) date_trunc('day', client_timestamp) AS client_timestamp FROM log_startcycling WHERE orgid = $1 AND client_timestamp >= date_trunc('year', DATE(${
              vm.today
            })) AND client_timestamp < date_trunc('year', DATE(${
            vm.today
          }) + INTERVAL '1 year')
            ) AS active_days_this_year GROUP BY DATE(date_trunc('month', DATE(client_timestamp)) ) ORDER BY date`;
        },
        auth: ["superadmin", "admin", "user"]
      },
      {
        id: 103,
        name: "ACTIVE TIME THIS MONTH",
        isCardShown: true,
        isDefaultForChart: false, // !must be only one true for each showtype(two for stacked-bar), also (this card.isCardShown && !!card.query)
        isForLeftXaxis: false,
        yAxisMark: "min.",
        get period() {
          if (!vm.cards.areForChart) {
            return "month";
          } else {
            return vm.cards.foradmin[3].period;
          }
        },
        number: 0,
        isForTimeCalc: true,
        color: "warning",
        fa: "stopwatch",
        get resType() {
          if (!vm.cards.areForChart) {
            return "timeCalculatable";
          } else {
            return vm.cards.foradmin[3].resType;
          }
        },
        get query() {
          if (!vm.cards.areForChart) {
            return `${
              vm.qr.cyclingTime
            } WHERE event_orgid = $1 AND packet_generated >= date_trunc('month', date(${
              vm.today
            })) AND packet_generated < date_trunc('month', date(${
              vm.today
            }) + interval '1 month')`;
          } else {
            return vm.cards.foradmin[3].query;
          }
        },
        auth: ["superadmin", "admin", "user"]
      },
      {
        id: 104,
        name: "ACTIVE TIME PER MONTH THIS YEAR",
        isCardShown: false,
        isDefaultForChart: true,
        isForLeftXaxis: false,
        yAxisMark: "min.",
        period: "year",
        number: null,
        isForTimeCalc: true,
        color: "warning",
        fa: "stopwatch",
        resType: "timeCalculatable",
        get query() {
          return `${
            vm.qr.cyclingTime
          } WHERE event_orgid = $1 AND packet_generated >= date_trunc('year', date(${
            vm.today
          })) AND packet_generated < date_trunc('year', date(${
            vm.today
          }) + interval '1 year')`;
        },
        auth: ["superadmin", "admin", "user"]
      },
      {
        id: 105,
        name: "NO. OF ACTIVE USERS TODAY",
        isCardShown: false,
        isDefaultForChart: false,
        isForLeftXaxis: false,
        yAxisMark: "users",
        get period() {
          if (!vm.cards.areForChart) {
            return "day";
          } else {
            return vm.cards.foradmin[5].period;
          }
        },
        number: 0,
        isForTimeCalc: false,
        color: "primary",
        fa: "bicycle",
        get resType() {
          if (!vm.cards.areForChart) {
            return "rowCountable";
          } else {
            return vm.cards.foradmin[5].resType;
          }
        },
        get query() {
          if (!vm.cards.areForChart) {
            return `SELECT userid FROM public.log_startcycling WHERE date(client_timestamp) = ${
              vm.today
            } AND orgid = $1 GROUP BY userid`;
          } else {
            return vm.cards.foradmin[5].query;
          }
        },
        auth: ["superadmin", "admin"]
      },
      {
        id: 106,
        name: "NO. OF ACTIVE USERS THIS MONTH",
        isCardShown: false,
        isDefaultForChart: false,
        isForLeftXaxis: true,
        yAxisMark: "users",
        period: "month",
        number: 0,
        isForTimeCalc: false,
        color: "info",
        fa: "bicycle",
        resType: "retrievable_date_count",
        get query() {
          // daily
          return `SELECT DATE(DATE_TRUNC('day', DATE(client_timestamp)) ), COUNT(DISTINCT userid) FROM log_startcycling WHERE orgid = $1 AND DATE(client_timestamp) >= DATE_TRUNC('month', DATE(${
            vm.today
          })) AND DATE(client_timestamp) < DATE_TRUNC('month', DATE(${
            vm.today
          }) + INTERVAL '1 month') GROUP BY DATE(DATE_TRUNC('day', DATE(client_timestamp)) )`;
          // !below is simply a number for a month, not daily
          // return `SELECT userid FROM log_startcycling WHERE orgid = $1 AND DATE(client_timestamp) >= DATE_TRUNC('month', DATE(${
          //   vm.today
          // })) AND DATE(client_timestamp) < DATE_TRUNC('month', DATE(${
          //   vm.today
          // }) + INTERVAL '1 month')`;
        },
        auth: ["superadmin", "admin"]
      },
      {
        id: 107,
        name: "ACTIVE TIME THIS MONTH",
        isCardShown: false,
        isDefaultForChart: false, // !must be only one true for each showtype(two for stacked-bar), also (this card.isCardShown && !!card.query)
        isForLeftXaxis: true,
        yAxisMark: "min.",
        period: "month",
        isForTimeCalc: true,
        color: "success",
        fa: "stopwatch",
        resType: "timeCalculatable",
        get query() {
          return `${
            vm.qr.cyclingTime
          } WHERE event_orgid = $1 AND packet_generated >= date_trunc('month', date(${
            vm.today
          })) AND packet_generated < date_trunc('month', date(${
            vm.today
          }) + interval '1 month')`;
        },
        auth: ["superadmin", "admin"]
      },
      // TODO: revise averaging query
      {
        id: 108,
        name: "USERS' DAILY AVERAGE CYCLING TIME THIS MONTH",
        isCardShown: false,
        isDefaultForChart: false,
        isForLeftXaxis: false,
        yAxisMark: "min.",
        period: "month",
        get number() {
          return vm.average.admin_monthly.usersDailyAvgThisMonth;
        },
        isForTimeCalc: false,
        color: "success",
        fa: "stopwatch",
        resType: "average",
        //   TODO:
        query: null,
        // query: "SELECT * FROM public.users WHERE organisation = $1",
        auth: ["superadmin", "admin"]
      },
      {
        id: 109,
        name: "TOTAL NO. OF USERS",
        isCardShown: false,
        isDefaultForChart: false,
        isForLeftXaxis: false,
        yAxisMark: "users",
        period: null,
        number: 0,
        isForTimeCalc: false,
        color: "warning",
        fa: "users",
        resType: "rowCountable",
        query: "SELECT * FROM public.users WHERE organisation = $1",
        auth: ["superadmin", "admin"]
      }
    ],
    foruser: [
      // !must include at leat $1 for id (user's id)
      {
        id: 201,
        name: "ACTIVE DAYS THIS MONTH",
        isCardShown: true,
        isDefaultForChart: false,
        isForLeftXaxis: true,
        yAxisMark: "days",
        get period() {
          if (!vm.cards.areForChart) {
            return "month";
          } else {
            return vm.cards.foruser[1].period;
          }
        },
        number: 0,
        isForTimeCalc: false,
        color: "warning",
        fa: "stopwatch",
        get resType() {
          if (!vm.cards.areForChart) {
            return "rowCountable";
          } else {
            return vm.cards.foruser[1].resType;
          }
        },
        get query() {
          if (!vm.cards.areForChart) {
            return `SELECT DISTINCT ON (client_timestamp) date_trunc('day', client_timestamp) AS client_timestamp FROM log_startcycling WHERE userid = $1 AND client_timestamp >= date_trunc('month', date(${
              vm.today
            })) AND client_timestamp < date_trunc('month', date(${
              vm.today
            }) + interval '1 month')`;
          } else {
            return vm.cards.foruser[1].query;
          }
        },
        auth: ["superadmin", "admin", "user"]
      },
      {
        id: 202,
        name: "ACTIVE DAYS PER MONTH THIS YEAR",
        isCardShown: false,
        isDefaultForChart: true,
        isForLeftXaxis: true,
        yAxisMark: "days",
        period: "year",
        number: 0,
        isForTimeCalc: false,
        color: "warning",
        fa: "stopwatch",
        resType: "retrievable_date_count",
        get query() {
          return `SELECT DATE(DATE_TRUNC('month', DATE(client_timestamp)) ), COUNT(*) 
          FROM (
            SELECT DISTINCT ON (client_timestamp) date_trunc('day', client_timestamp) AS client_timestamp FROM log_startcycling WHERE userid = $1 AND client_timestamp >= date_trunc('year', DATE(${
              vm.today
            })) AND client_timestamp < date_trunc('year', DATE(${
            vm.today
          }) + INTERVAL '1 year')
            ) AS active_days_this_year GROUP BY DATE(date_trunc('month', DATE(client_timestamp)) ) ORDER BY date`;
        },
        auth: ["superadmin", "admin", "user"]
      },
      {
        id: 203,
        name: "ACTIVE TIME THIS MONTH",
        isCardShown: true,
        isDefaultForChart: false, // !must be only one true for each showtype(two for stacked-bar), also (this card.isCardShown && !!card.query)
        isForLeftXaxis: false,
        yAxisMark: "min.",
        get period() {
          if (!vm.cards.areForChart) {
            return "month";
          } else {
            return vm.cards.foruser[3].period;
          }
        },
        number: 0,
        isForTimeCalc: true,
        color: "warning",
        fa: "stopwatch",
        get resType() {
          if (!vm.cards.areForChart) {
            return "timeCalculatable";
          } else {
            return vm.cards.foruser[3].resType;
          }
        },
        get query() {
          if (!vm.cards.areForChart) {
            return `${
              vm.qr.cyclingTime
            } WHERE event_userid = $1 AND packet_generated >= date_trunc('month', date(${
              vm.today
            })) AND packet_generated < date_trunc('month', date(${
              vm.today
            }) + interval '1 month')`;
          } else {
            return vm.cards.foruser[3].query;
          }
        },
        auth: ["superadmin", "admin", "user"]
      },
      {
        id: 204,
        name: "ACTIVE TIME PER MONTH THIS YEAR",
        isCardShown: false,
        isDefaultForChart: true,
        isForLeftXaxis: false,
        yAxisMark: "min.",
        period: "year",
        number: null,
        isForTimeCalc: true,
        color: "warning",
        fa: "stopwatch",
        resType: "timeCalculatable",
        get query() {
          return `${
            vm.qr.cyclingTime
          } WHERE event_userid = $1 AND packet_generated >= date_trunc('year', date(${
            vm.today
          })) AND packet_generated < date_trunc('year', date(${
            vm.today
          }) + interval '1 year')`;
        },
        auth: ["superadmin", "admin", "user"]
      },
      {
        id: 205,
        name: "ACTIVE TIME THIS WEEK",
        isCardShown: false,
        isDefaultForChart: false,
        isForLeftXaxis: true,
        yAxisMark: "min.",
        period: "week",
        number: 0,
        isForTimeCalc: true,
        color: "warning",
        fa: "stopwatch",
        resType: "timeCalculatable",
        get query() {
          return `${
            vm.qr.cyclingTime
          } WHERE event_userid = $1 AND packet_generated >= date_trunc('week', date(${
            vm.today
          })) AND packet_generated < date_trunc('week', date(${
            vm.today
          }) + interval '1 week')`;
        },
        auth: ["superadmin", "admin", "user"]
      },
      {
        id: 206,
        name: "ACTIVE TIME TODAY",
        isCardShown: true,
        isDefaultForChart: false,
        isForLeftXaxis: true,
        yAxisMark: "min.",
        period: "day",
        number: 0,
        isForTimeCalc: true,
        color: "success",
        fa: "stopwatch",
        resType: "timeCalculatable",
        get query() {
          return `${
            vm.qr.cyclingTime
          } WHERE u.id = $1 AND date(packet_generated) = date ${vm.today}`;
        },
        auth: ["superadmin", "admin", "user"]
      }
      // {
      //   id: 207,
      //   name: "ACTIVE TIME FOR THE LAST 7 DAYS",
      //   isDefaultForChart: false,//
      //   isForLeftXaxis: true,
      //   yAxisMark: "min.",
      //   period: "7days",
      //   number: 0,
      //   isForTimeCalc: true,
      //   color: "warning",
      //   fa: "stopwatch",
      //   get query() {
      //     return `${
      //       vm.qr.cyclingTime
      //     } WHERE u.id = $1 AND date(packet_generated) > date ${
      //       vm.today
      //     } - interval '7 days' AND date(packet_generated) < date ${
      //       vm.today
      //     } + interval '1 day'`;
      //   },
      //   auth: ["superadmin", "admin", "user"]
      // }
    ]
  },
  pie: {
    query:
      "SELECT name, distance, duration, thema_city, thema_countryside, thema_coast, thema_mountains, thema_trip, thema_tdf, count, points, score, votes FROM sharedroutes ORDER BY votes DESC LIMIT 10",
    colors: [
      "primary",
      "success",
      "info",
      "warning",
      "dark",
      "danger",
      "secondary",
      "light",
      "white",
      "muted"
    ],
    auth: ["superadmin"]
  },
  bar: {
    // !data for the last 30 days
    findOne: {
      get query() {
        return `${
          vm.qr.cyclingTime
        } WHERE event_userid = $1 AND date(packet_generated) > date ${
          vm.today
        } - interval '30 days' AND date(packet_generated) < date ${
          vm.today
        } + interval '1 day'`;
      }
    }
  },
  orgList: {
    findAll: {
      // query: "SELECT name, id, uuid FROM public.organisations ORDER BY name",
      query:
        "SELECT DISTINCT o.name, o.id, o.uuid FROM public.organisations o JOIN users u ON o.id = u.organisation ORDER BY o.id",
      auth: ["superadmin"]
    },
    findOne: {
      query: "SELECT name, id, uuid FROM public.organisations WHERE id = $1",
      auth: ["admin", "superadmin"]
    }
  },
  userList: {
    findAll: {
      query:
        "SELECT u.name, u.display, u.id, u.uuid as uuid, u.admin, o.name as o_name, u.organisation as o_id, o.uuid as o_uuid, o.superadmin FROM public.users u LEFT JOIN organisations o ON organisation = o.id",

      auth: ["superadmin"]
    },
    findAllForAdmin: {
      query:
        "SELECT u.name, u.display, u.id, u.uuid as uuid, u.admin, o.name as o_name, u.organisation as o_id, o.uuid as o_uuid, o.superadmin FROM public.users u LEFT JOIN organisations o ON organisation = o.id WHERE o.id = $1 ORDER BY u.id",
      auth: ["admin", "superadmin"]
    },
    findOne: {
      query:
        "SELECT name, display, id, uuid, organisation, admin FROM public.users WHERE uuid = $1",
      auth: ["user", "admin", "superadmin"]
    }
  },
  qr: {
    cyclingTime:
      "SELECT e.start_id, e.event_id, e.packet_id, e.packet_len, e.start_userid, e.event_userid, u.uuid AS uuid, e.event_orgid, e.event_type, e.event_data, e.start_cycling, e.event_time, e.packet_generated, e.locationid, e.routeid, e.location FROM (SELECT d.id AS start_id, c.event_id, c.packet_id, c.packet_len, d.userid AS start_userid, c.userid AS event_userid, c.orgid AS event_orgid, c.event_type, c.event_data, d.client_timestamp AS start_cycling, c.event_time, c.packet_generated, d.locationid, d.routeid, d.location FROM (SELECT a.id AS event_id, b.id AS packet_id, length AS packet_len, userid, orgid, event_type, event_data, event_time, b.client_timestamp AS packet_generated FROM log_cycling a FULL OUTER JOIN log_cycling_packets b ON a.packet_id = b.id ORDER BY packet_generated, event_time) c FULL OUTER JOIN log_startcycling d ON d.client_timestamp = c.event_time AND d.userid = c.userid ORDER BY COALESCE(packet_generated, d.client_timestamp), event_time) e LEFT JOIN users u ON e.event_userid = u.id"
  },

  chart: {
    myOptions: {
      title: "unable to retrieve title",
      yAxisMarkLeft: "left unit1",
      yAxisMarkRight: "right unit2"
    },
    data: {
      xAxis: ["sample label1", "sample label2"],
      yAxis1: [10, 20], //cycling
      yAxis2: [15, 25], //taximode
      yAxis3: [20, 25] //average
    }
  },
  average: {
    admin_monthly: { o_id: null, usersDailyAvgThisMonth: 0 }
  }
};

module.exports = vm;
