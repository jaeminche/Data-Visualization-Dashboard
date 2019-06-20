const vm = {
  // TODO: when deployment, change the date to current_date
  today: "'2017-01-29'",
  pgload: 1,
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
    forsuperadmin: [
      {
        id: 1,
        name: "NO. OF ORGANIZATIONS LOGGED IN TODAY",
        classname: "sa",
        number: 0,
        cyclingTimeCal: false,
        color: "primary",
        fa: "sign-in-alt",
        get query() {
          return `select orgid, count(orgid) from public.log_login where date(client_timestamp) = ${
            vm.today
          } GROUP BY orgid`;
        },
        auth: ["superadmin"]
      },
      {
        id: 2,
        name: "NO. OF ORGANIZATIONS LOGGED IN THIS MONTH",
        number: 0,
        cyclingTimeCal: false,
        color: "info",
        fa: "sign-in-alt",
        query:
          "select orgid, count(orgid) from public.log_login GROUP BY orgid",
        auth: ["superadmin"]
      },
      {
        id: 3,
        name: "TOTAL NO. OF ORGANIZATIONS",
        number: 0,
        cyclingTimeCal: false,
        color: "warning",
        fa: "user",
        query: "SELECT * FROM public.organisations",
        auth: ["superadmin"]
      },
      {
        id: 4,
        name: "TOTAL NO. OF USERS",
        number: 0,
        cyclingTimeCal: false,
        color: "warning",
        fa: "users",
        query: "SELECT * FROM public.users",
        auth: ["superadmin"]
      },
      {
        id: 5,
        name: "NO. OF ACTIVE USERS TODAY",
        number: 0,
        cyclingTimeCal: false,
        color: "primary",
        fa: "bicycle",
        get query() {
          return `SELECT userid FROM public.log_startcycling WHERE date(client_timestamp) = ${
            vm.today
          } GROUP BY userid`;
        },
        auth: ["superadmin"]
      },
      {
        id: 6,
        name: "NO. OF ACTIVE USERS THIS WEEK",
        number: 0,
        cyclingTimeCal: false,
        color: "info",
        fa: "bicycle",
        get query() {
          return `SELECT userid FROM log_startcycling WHERE date(client_timestamp) > date(${
            vm.today
          }) - interval '7 days' AND date(client_timestamp) < date(${
            vm.today
          }) + interval '1 day' GROUP BY userid  `;
        },
        auth: ["superadmin"]
      },
      {
        id: 7,
        name: "AVERAGE CYCLING TIME THIS WEEK",
        number: 0,
        cyclingTimeCal: false,
        color: "success",
        fa: "stopwatch",
        //   todo:
        query: "SELECT * FROM public.users",
        auth: ["superadmin"]
      },
      {
        id: 8,
        name: "AVERAGE CYCLING TIME THIS MONTH",
        number: 0,
        cyclingTimeCal: false,
        color: "success",
        fa: "stopwatch",
        //   todo:
        query: "SELECT * FROM public.users",
        auth: ["superadmin"]
      }
    ],
    foradmin: [
      {
        id: 11,
        name: "NO. OF ACTIVE USERS TODAY",
        number: 0,
        cyclingTimeCal: false,
        color: "primary",
        fa: "bicycle",
        get query() {
          return `SELECT userid FROM public.log_startcycling WHERE date(client_timestamp) = ${
            vm.today
          } and orgid = $1 GROUP BY userid`;
        },
        auth: ["superadmin", "admin"]
      },
      {
        id: 12,
        name: "NO. OF ACTIVE USERS THIS MONTH",
        number: 0,
        cyclingTimeCal: false,
        color: "info",
        fa: "bicycle",
        get query() {
          return `SELECT userid FROM log_startcycling WHERE orgid = $1 AND date(client_timestamp) > date(${
            vm.today
          }) - interval '7 days' AND date(client_timestamp) < date(${
            vm.today
          }) + interval '1 day' GROUP BY userid  `;
        },
        auth: ["superadmin", "admin"]
      },
      {
        id: 13,
        name: "USERS' DAILY AVERAGE CYCLING TIME THIS MONTH",
        get number() {
          return vm.average.admin_monthly.usersDailyAvgThisMonth;
        },
        cyclingTimeCal: false,
        color: "success",
        fa: "stopwatch",
        //   todo:
        query: null,
        // query: "SELECT * FROM public.users WHERE organisation = $1",
        auth: ["superadmin", "admin"]
      },
      {
        id: 14,
        name: "TOTAL NO. OF USERS",
        number: 0,
        cyclingTimeCal: false,
        color: "warning",
        fa: "users",
        query: "SELECT * FROM public.users WHERE organisation = $1",
        auth: ["superadmin"]
      }
    ],
    foruser: [
      {
        id: 21,
        name: "ACTIVE DAYS THIS MONTH",
        type: "monthly",
        number: 0,
        cyclingTimeCal: false,
        color: "warning",
        fa: "stopwatch",
        get query() {
          return `SELECT DISTINCT ON (created_on) date_trunc('day', client_timestamp) AS created_on FROM log_startcycling WHERE userid = $1 AND client_timestamp >= date_trunc('month', date(${
            vm.today
          }))`;
        },
        auth: ["superadmin", "admin", "user"]
      },
      {
        id: 22,
        name: "ACTIVE TIME THIS MONTH",
        type: "monthly",
        number: 0,
        cyclingTimeCal: true,
        color: "warning",
        fa: "stopwatch",
        get query() {
          return `${
            vm.qr.cyclingTime
          } WHERE event_userid = $1 AND packet_generated >= date_trunc('month', date(${
            vm.today
          }))`;
        },
        auth: ["superadmin", "admin", "user"]
      },
      {
        id: 23,
        name: "ACTIVE TIME THIS WEEK",
        type: "weekly",
        number: 0,
        cyclingTimeCal: true,
        color: "warning",
        fa: "stopwatch",
        get query() {
          return `${
            vm.qr.cyclingTime
          } WHERE event_userid = $1 AND packet_generated >= date_trunc('week', date(${
            vm.today
          }))`;
        },
        auth: ["superadmin", "admin", "user"]
      },
      {
        id: 23,
        name: "ACTIVE TIME FOR THE LAST 7 DAYS",
        type: "weekly",
        number: 0,
        cyclingTimeCal: true,
        color: "warning",
        fa: "stopwatch",
        get query() {
          return `${
            vm.qr.cyclingTime
          } WHERE u.id = $1 AND date(packet_generated) > date ${
            vm.today
          } - interval '7 days' AND date(packet_generated) < date ${
            vm.today
          } + interval '1 day'`;
        },
        auth: ["superadmin", "admin", "user"]
      },
      {
        id: 24,
        name: "ACTIVE TIME TODAY",
        type: "daily",
        number: 0,
        cyclingTimeCal: true,
        color: "success",
        fa: "stopwatch",
        get query() {
          return `${
            vm.qr.cyclingTime
          } WHERE u.id = $1 AND date(packet_generated) = date ${vm.today}`;
        },
        auth: ["superadmin", "admin", "user"]
      }
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
    // data for the last 30 days
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
      // query:
      // "SELECT e.start_id, e.event_id, e.packet_id, e.packet_len, e.start_userid, e.event_userid, u.uuid as uuid, e.event_orgid, e.event_type, e.event_data, e.start_cycling, e.event_time, e.packet_generated, e.locationid, e.routeid, e.location, u.name from (select d.id as start_id, c.event_id, c.packet_id, c.packet_len, d.userid as start_userid, c.userid as event_userid, c.orgid as event_orgid, c.event_type, c.event_data, d.client_timestamp as start_cycling, c.event_time, c.packet_generated, d.locationid, d.routeid, d.location from (select a.id as event_id, b.id as packet_id, length as packet_len, userid, orgid, event_type, event_data, event_time, b.client_timestamp as packet_generated from log_cycling a full outer join log_cycling_packets b on a.packet_id = b.id order by packet_generated, event_time) c full outer join log_startcycling d on d.client_timestamp = c.event_time and d.userid = c.userid order by COALESCE(packet_generated, d.client_timestamp), event_time) e left join users u ON e.event_userid = u.id WHERE event_userid = $1"
    }
  },
  orgList: {
    findAll: {
      // query: "SELECT name, id, uuid FROM public.organisations ORDER BY name",
      query:
        "SELECT DISTINCT o.name, o.id, o.uuid FROM public.organisations o JOIN users u ON o.id = u.organisation ORDER BY o.name",
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
        "SELECT u.name, u.id, u.uuid as uuid, u.admin, o.name as o_name, u.organisation as o_id, o.uuid as o_uuid, o.superadmin FROM public.users u LEFT JOIN organisations o ON organisation = o.id",

      auth: ["superadmin"]
    },
    findAllForAdmin: {
      query:
        "SELECT u.name, u.id, u.uuid as uuid, u.admin, o.name as o_name, u.organisation as o_id, o.uuid as o_uuid, o.superadmin FROM public.users u LEFT JOIN organisations o ON organisation = o.id WHERE o.id = $1",
      auth: ["admin", "superadmin"]
    },
    findOne: {
      query:
        "SELECT name, id, uuid, organisation, admin FROM public.users WHERE uuid = $1",
      auth: ["user", "admin", "superadmin"]
    }
  },
  qr: {
    cyclingTime:
      "SELECT e.start_id, e.event_id, e.packet_id, e.packet_len, e.start_userid, e.event_userid, u.uuid AS uuid, e.event_orgid, e.event_type, e.event_data, e.start_cycling, e.event_time, e.packet_generated, e.locationid, e.routeid, e.location FROM (SELECT d.id AS start_id, c.event_id, c.packet_id, c.packet_len, d.userid AS start_userid, c.userid AS event_userid, c.orgid AS event_orgid, c.event_type, c.event_data, d.client_timestamp AS start_cycling, c.event_time, c.packet_generated, d.locationid, d.routeid, d.location FROM (SELECT a.id AS event_id, b.id AS packet_id, length AS packet_len, userid, orgid, event_type, event_data, event_time, b.client_timestamp AS packet_generated FROM log_cycling a FULL OUTER JOIN log_cycling_packets b ON a.packet_id = b.id ORDER BY packet_generated, event_time) c FULL OUTER JOIN log_startcycling d ON d.client_timestamp = c.event_time AND d.userid = c.userid ORDER BY COALESCE(packet_generated, d.client_timestamp), event_time) e LEFT JOIN users u ON e.event_userid = u.id"
  },
  area: {
    labels: {
      week: ["Mon", "Tues", "Wed", "Thur", "Fri", "Sat", "Sun"],
      months: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ]
    },
    datasets: {
      week: [
        // { date: "2017-01-26", label: "Mon", time: 50 },
        // { date: "2017-01-27", label: "Tues", time: 40 },
        // { date: "2017-01-28", label: "Wed", time: 60 },
        // { date: "2017-01-26", label: "Thur", time: 100 },
        // { date: "2017-01-27", label: "Fri", time: 10 },
        // { date: "2017-01-28", label: "Sat", time: 10 },
        // { date: "2017-01-29", label: "Sun", time: 30 }
      ]
    }
  },
  average: {
    admin_monthly: { o_id: null, usersDailyAvgThisMonth: 0 }
  }

  // ,names: [
  //   "Ben Folds",
  //   "Damien Rice",
  //   "David Bowie",
  //   "Family of the Year",
  //   "The Smiths",
  //   "Sigur Ros",
  //   "Elliot Smith",
  //   "Freddie Mercury",
  //   "Arco",
  //   "Coldplay",
  //   "First Aid Kit",
  //   "The Bad Plus",
  //   "Belle & Sebastian",
  //   "The Black Skirts",
  //   "Radiohead",
  //   "Bombay Bicycle Club",
  //   "Crosby, Nash & Young",
  //   "Emi Meyer",
  //   "Imaginary Cities",
  //   "Kotaro Oshio",
  //   "Kristoffer Fogelmark",
  //   "Lisa Hannigan",
  //   "Masayoshi Yamazaki",
  //   "Michael Schulte",
  //   "Nick Drake",
  //   "Odesza",
  //   "Oohyo",
  //   "Lee Juck",
  //   "Passenger",
  //   "Queen",
  //   "Rachel Yamagata",
  //   "Ray Bryant",
  //   "Sheena Ringo",
  //   "Sophie Milman",
  //   "Murakami Haruki",
  //   "Ben Folds",
  //   "Damien Rice",
  //   "David Bowie",
  //   "Family of the Year",
  //   "The Smiths",
  //   "Sigur Ros",
  //   "Elliot Smith",
  //   "Freddie Mercury",
  //   "Arco",
  //   "Coldplay",
  //   "First Aid Kit",
  //   "The Bad Plus",
  //   "Belle & Sebastian",
  //   "The Black Skirts",
  //   "Radiohead",
  //   "Bombay Bicycle Club",
  //   "Crosby, Nash & Young",
  //   "Emi Meyer",
  //   "Imaginary Cities",
  //   "Kotaro Oshio",
  //   "Kristoffer Fogelmark",
  //   "Lisa Hannigan",
  //   "Masayoshi Yamazaki",
  //   "Michael Schulte",
  //   "Nick Drake",
  //   "Odesza",
  //   "Oohyo",
  //   "Lee Juck",
  //   "Passenger",
  //   "Queen",
  //   "Rachel Yamagata",
  //   "Ray Bryant",
  //   "Sheena Ringo",
  //   "Sophie Milman",
  //   "Murakami Haruki",
  //   "Ben Folds",
  //   "Damien Rice",
  //   "David Bowie",
  //   "Family of the Year",
  //   "The Smiths",
  //   "Sigur Ros",
  //   "Elliot Smith",
  //   "Freddie Mercury",
  //   "Arco",
  //   "Coldplay",
  //   "First Aid Kit",
  //   "The Bad Plus",
  //   "Belle & Sebastian",
  //   "The Black Skirts",
  //   "Radiohead",
  //   "Bombay Bicycle Club",
  //   "Crosby, Nash & Young",
  //   "Emi Meyer",
  //   "Imaginary Cities",
  //   "Kotaro Oshio",
  //   "Kristoffer Fogelmark",
  //   "Lisa Hannigan",
  //   "Masayoshi Yamazaki",
  //   "Michael Schulte",
  //   "Nick Drake",
  //   "Odesza",
  //   "Oohyo",
  //   "Lee Juck",
  //   "Passenger",
  //   "Queen",
  //   "Rachel Yamagata",
  //   "Ray Bryant",
  //   "Sheena Ringo",
  //   "Sophie Milman",
  //   "Murakami Haruki",
  //   "Ben Folds",
  //   "Damien Rice",
  //   "David Bowie",
  //   "Family of the Year",
  //   "The Smiths",
  //   "Sigur Ros",
  //   "Elliot Smith",
  //   "Freddie Mercury",
  //   "Arco",
  //   "Coldplay",
  //   "First Aid Kit",
  //   "The Bad Plus",
  //   "Belle & Sebastian",
  //   "The Black Skirts",
  //   "Radiohead",
  //   "Bombay Bicycle Club",
  //   "Crosby, Nash & Young",
  //   "Emi Meyer",
  //   "Imaginary Cities",
  //   "Kotaro Oshio",
  //   "Kristoffer Fogelmark",
  //   "Lisa Hannigan",
  //   "Masayoshi Yamazaki",
  //   "Michael Schulte",
  //   "Nick Drake",
  //   "Odesza",
  //   "Oohyo",
  //   "Lee Juck",
  //   "Passenger",
  //   "Queen",
  //   "Rachel Yamagata",
  //   "Ray Bryant",
  //   "Sheena Ringo",
  //   "Sophie Milman",
  //   "Murakami Haruki",
  //   "Ben Folds",
  //   "Damien Rice",
  //   "David Bowie",
  //   "Family of the Year",
  //   "The Smiths",
  //   "Sigur Ros",
  //   "Elliot Smith",
  //   "Freddie Mercury",
  //   "Arco",
  //   "Coldplay",
  //   "First Aid Kit",
  //   "The Bad Plus",
  //   "Belle & Sebastian",
  //   "The Black Skirts",
  //   "Radiohead",
  //   "Bombay Bicycle Club",
  //   "Crosby, Nash & Young",
  //   "Emi Meyer",
  //   "Imaginary Cities",
  //   "Kotaro Oshio",
  //   "Kristoffer Fogelmark",
  //   "Lisa Hannigan",
  //   "Masayoshi Yamazaki",
  //   "Michael Schulte",
  //   "Nick Drake",
  //   "Odesza",
  //   "Oohyo",
  //   "Lee Juck",
  //   "Passenger",
  //   "Queen",
  //   "Rachel Yamagata",
  //   "Ray Bryant",
  //   "Sheena Ringo",
  //   "Sophie Milman",
  //   "Murakami Haruki",
  //   "Ben Folds",
  //   "Damien Rice",
  //   "David Bowie",
  //   "Family of the Year",
  //   "The Smiths",
  //   "Sigur Ros",
  //   "Elliot Smith",
  //   "Freddie Mercury",
  //   "Arco",
  //   "Coldplay",
  //   "First Aid Kit",
  //   "The Bad Plus",
  //   "Belle & Sebastian",
  //   "The Black Skirts",
  //   "Radiohead",
  //   "Bombay Bicycle Club",
  //   "Crosby, Nash & Young",
  //   "Emi Meyer",
  //   "Imaginary Cities",
  //   "Kotaro Oshio",
  //   "Kristoffer Fogelmark",
  //   "Lisa Hannigan",
  //   "Masayoshi Yamazaki",
  //   "Michael Schulte",
  //   "Nick Drake",
  //   "Odesza",
  //   "Oohyo",
  //   "Lee Juck",
  //   "Passenger",
  //   "Queen",
  //   "Rachel Yamagata",
  //   "Ray Bryant",
  //   "Sheena Ringo",
  //   "Sophie Milman",
  //   "Murakami Haruki"
  // ]

  // getOrg: "SELECT "
};

module.exports = vm;
