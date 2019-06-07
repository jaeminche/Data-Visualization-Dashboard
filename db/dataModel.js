const dataModel = {
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
        name: "NO. OF ORGANIZATIONS LOGGED IN TODAY",
        number: 0,
        color: "primary",
        fa: "sign-in-alt",
        query:
          "select orgid, count(orgid) from public.log_login where date(client_timestamp) = '2017-01-29' GROUP BY orgid",
        auth: ["superadmin"]
      },
      {
        name: "NO. OF ORGANIZATIONS LOGGED IN THIS MONTH",
        number: 0,
        color: "info",
        fa: "sign-in-alt",
        query:
          "select orgid, count(orgid) from public.log_login GROUP BY orgid",
        auth: ["superadmin"]
      },
      {
        name: "TOTAL NO. OF ORGANIZATIONS",
        number: 0,
        color: "warning",
        fa: "user",
        query: "SELECT * FROM public.organisations",
        auth: ["superadmin"]
      },
      {
        name: "TOTAL NO. OF USERS",
        number: 0,
        color: "warning",
        fa: "users",
        query: "SELECT * FROM public.users",
        auth: ["superadmin"]
      },
      {
        name: "NO. OF ACTIVE USERS TODAY",
        number: 0,
        color: "primary",
        fa: "bicycle",
        query:
          "SELECT userid FROM public.log_startcycling WHERE date(client_timestamp) = '2017-01-30' GROUP BY userid",
        auth: ["superadmin"]
      },
      {
        // TODO: add query condition for this month
        name: "NO. OF ACTIVE USERS THIS MONTH",
        number: 0,
        color: "info",
        fa: "bicycle",
        query: "SELECT userid FROM public.log_startcycling GROUP BY userid",
        auth: ["superadmin"]
      },
      {
        // TODO: add query condition for this week
        name: "AVERAGE CYCLING TIME THIS WEEK",
        number: 0,
        color: "success",
        fa: "stopwatch",
        //   todo:
        query: "SELECT * FROM public.users",
        auth: ["superadmin"]
      },
      {
        // TODO: add query condition for this month
        name: "AVERAGE CYCLING TIME THIS MONTH",
        number: 0,
        color: "success",
        fa: "stopwatch",
        //   todo:
        query: "SELECT * FROM public.users",
        auth: ["superadmin"]
      }
    ],
    foradmin: [
      {
        // TODO: add query condition for today
        name: "NO. OF ACTIVE USERS TODAY",
        number: 0,
        color: "primary",
        fa: "bicycle",
        query:
          "SELECT userid FROM public.log_startcycling WHERE date(client_timestamp) = '2017-01-28' and orgid = $1 GROUP BY userid",
        auth: ["superadmin", "admin"]
      },
      {
        // TODO: add query condition for this month
        name: "NO. OF ACTIVE USERS THIS MONTH",
        number: 0,
        color: "info",
        fa: "bicycle",
        query:
          "SELECT userid FROM public.log_startcycling WHERE orgid = $1 GROUP BY userid",
        auth: ["superadmin", "admin"]
      },
      {
        // TODO: add query condition for this month
        name: "NO. OF ACTIVE USERS THIS MONTH",
        number: 0,
        color: "info",
        fa: "bicycle",
        query:
          "SELECT userid FROM public.log_startcycling where orgid = $1 GROUP BY userid",
        auth: ["admin"]
      },
      {
        // TODO: add query condition for this week
        name: "AVERAGE CYCLING TIME THIS WEEK",
        number: 0,
        color: "success",
        fa: "stopwatch",
        //   todo:
        query: "SELECT * FROM public.users WHERE organisation = $1",
        auth: ["superadmin", "admin"]
      },
      {
        // TODO: add query condition for this month
        name: "AVERAGE CYCLING TIME THIS MONTH",
        number: 0,
        color: "success",
        fa: "stopwatch",
        //   todo:
        query: "SELECT * FROM public.users WHERE organisation = $1",
        auth: ["superadmin", "admin"]
      },
      {
        name: "TOTAL NO. OF USERS",
        number: 0,
        color: "warning",
        fa: "users",
        query: "SELECT * FROM public.users WHERE organisation = $1",
        auth: ["superadmin"]
      }
    ],
    foruser: [
      {
        // TODO: add query condition for this week
        name: "CYCLING TIME TODAY",
        number: 0,
        color: "success",
        fa: "stopwatch",
        //   todo:
        query:
          "SELECT e.start_id, e.event_id, e.packet_id, e.packet_len, e.start_userid, e.event_userid, u.uuid AS uuid, e.event_orgid, e.event_type, e.event_data, e.start_cycling, e.event_time, e.packet_generated, e.locationid, e.routeid, e.location FROM (SELECT d.id AS start_id, c.event_id, c.packet_id, c.packet_len, d.userid AS start_userid, c.userid AS event_userid, c.orgid AS event_orgid, c.event_type, c.event_data, d.client_timestamp AS start_cycling, c.event_time, c.packet_generated, d.locationid, d.routeid, d.location FROM (SELECT a.id AS event_id, b.id AS packet_id, length AS packet_len, userid, orgid, event_type, event_data, event_time, b.client_timestamp AS packet_generated FROM log_cycling a FULL OUTER JOIN log_cycling_packets b ON a.packet_id = b.id ORDER BY packet_generated, event_time) c FULL OUTER JOIN log_startcycling d ON d.client_timestamp = c.event_time AND d.userid = c.userid ORDER BY COALESCE(packet_generated, d.client_timestamp), event_time) e LEFT JOIN users u ON e.event_userid = u.id WHERE u.uuid = $1",
        auth: ["superadmin", "org", "user"]
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
    findOne: {
      query:
        "SELECT e.start_id, e.event_id, e.packet_id, e.packet_len, e.start_userid, e.event_userid, u.uuid as uuid, e.event_orgid, e.event_type, e.event_data, e.start_cycling, e.event_time, e.packet_generated, e.locationid, e.routeid, e.location, u.name from (select d.id as start_id, c.event_id, c.packet_id, c.packet_len, d.userid as start_userid, c.userid as event_userid, c.orgid as event_orgid, c.event_type, c.event_data, d.client_timestamp as start_cycling, c.event_time, c.packet_generated, d.locationid, d.routeid, d.location from (select a.id as event_id, b.id as packet_id, length as packet_len, userid, orgid, event_type, event_data, event_time, b.client_timestamp as packet_generated from log_cycling a full outer join log_cycling_packets b on a.packet_id = b.id order by packet_generated, event_time) c full outer join log_startcycling d on d.client_timestamp = c.event_time and d.userid = c.userid order by COALESCE(packet_generated, d.client_timestamp), event_time) e left join users u ON e.event_userid = u.id WHERE event_userid = $1"
    }
  },
  orgList: {
    findAll: {
      query: "SELECT name, id, uuid FROM public.organisations ORDER BY name",
      auth: ["superadmin"]
    },
    findOne: {
      query: "SELECT name, id, uuid FROM public.organisations WHERE id = $1",
      auth: ["admin", "superadmin"]
    }
  },
  userList: {
    // findAll is not likely to be used often
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

module.exports = dataModel;
