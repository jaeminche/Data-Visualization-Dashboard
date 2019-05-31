const dataModel = {
  loginType: "user", // superadmin || org || user
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
    fororg: [
      {
        // TODO: add query condition for today
        name: "NO. OF ACTIVE USERS TODAY",
        number: 0,
        color: "primary",
        fa: "bicycle",
        query:
          "SELECT userid FROM public.log_startcycling WHERE date(client_timestamp) = '2017-01-28' and orgid = $1 GROUP BY userid",
        auth: ["superadmin", "org"]
      },
      {
        // TODO: add query condition for this month
        name: "NO. OF ACTIVE USERS THIS MONTH",
        number: 0,
        color: "info",
        fa: "bicycle",
        query:
          "SELECT userid FROM public.log_startcycling WHERE orgid = $1 GROUP BY userid",
        auth: ["superadmin", "org"]
      },
      {
        // TODO: add query condition for this month
        name: "NO. OF ACTIVE USERS THIS MONTH",
        number: 0,
        color: "info",
        fa: "bicycle",
        query:
          "SELECT userid FROM public.log_startcycling where orgid = $1 GROUP BY userid",
        auth: ["org"]
      },
      {
        // TODO: add query condition for this week
        name: "AVERAGE CYCLING TIME THIS WEEK",
        number: 0,
        color: "success",
        fa: "stopwatch",
        //   todo:
        query: "SELECT * FROM public.users WHERE organisation = $1",
        auth: ["superadmin", "org"]
      },
      {
        // TODO: add query condition for this month
        name: "AVERAGE CYCLING TIME THIS MONTH",
        number: 0,
        color: "success",
        fa: "stopwatch",
        //   todo:
        query: "SELECT * FROM public.users WHERE organisation = $1",
        auth: ["superadmin", "org"]
      },
      {
        name: "TOTAL NO. OF USERS",
        number: 0,
        color: "warning",
        fa: "users",
        query: "SELECT * FROM public.users WHERE organisation = $1",
        auth: ["superadmin"]
      }
    ]
  },
  pie: [
    {
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
    }
  ],
  orgList: {
    findAll: {
      query: "SELECT name, id, uuid FROM public.organisations",
      auth: ["superadmin"]
    },
    findOne: {
      query: "SELECT name, id, uuid FROM public.organisations WHERE uuid = $1",
      auth: ["superadmin", "org"]
    }
  },
  userList: {
    // findAll is not likely to be used often
    findAll: {
      query:
        "SELECT u.name as user_name, u.id as user_id, u.uuid as user_uuid, organisation as org_id, u.admin as user_admin, o.uuid as org_uuid FROM public.users u LEFT JOIN public.organisations o ON organisation = o.id ",
      auth: ["superadmin"]
    },
    findAllForOrg: {
      query:
        "SELECT u.name as user_name, u.id as user_id, u.uuid as user_uuid, organisation as org_id, u.admin as user_admin, o.uuid as org_uuid FROM public.users u LEFT JOIN public.organisations o ON organisation = o.id WHERE o.uuid = $1",
      auth: ["superadmin", "org"]
    },
    findOne: {
      query:
        "SELECT name, id, uuid, organisation, admin FROM public.users WHERE uuid = $1",
      auth: ["org", "user"]
    }
  },

  names: [
    "Ben Folds",
    "Damien Rice",
    "David Bowie",
    "Family of the Year",
    "The Smiths",
    "Sigur Ros",
    "Elliot Smith",
    "Freddie Mercury",
    "Arco",
    "Coldplay",
    "First Aid Kit",
    "The Bad Plus",
    "Belle & Sebastian",
    "The Black Skirts",
    "Radiohead",
    "Bombay Bicycle Club",
    "Crosby, Nash & Young",
    "Emi Meyer",
    "Imaginary Cities",
    "Kotaro Oshio",
    "Kristoffer Fogelmark",
    "Lisa Hannigan",
    "Masayoshi Yamazaki",
    "Michael Schulte",
    "Nick Drake",
    "Odesza",
    "Oohyo",
    "Lee Juck",
    "Passenger",
    "Queen",
    "Rachel Yamagata",
    "Ray Bryant",
    "Sheena Ringo",
    "Sophie Milman",
    "Murakami Haruki",
    "Ben Folds",
    "Damien Rice",
    "David Bowie",
    "Family of the Year",
    "The Smiths",
    "Sigur Ros",
    "Elliot Smith",
    "Freddie Mercury",
    "Arco",
    "Coldplay",
    "First Aid Kit",
    "The Bad Plus",
    "Belle & Sebastian",
    "The Black Skirts",
    "Radiohead",
    "Bombay Bicycle Club",
    "Crosby, Nash & Young",
    "Emi Meyer",
    "Imaginary Cities",
    "Kotaro Oshio",
    "Kristoffer Fogelmark",
    "Lisa Hannigan",
    "Masayoshi Yamazaki",
    "Michael Schulte",
    "Nick Drake",
    "Odesza",
    "Oohyo",
    "Lee Juck",
    "Passenger",
    "Queen",
    "Rachel Yamagata",
    "Ray Bryant",
    "Sheena Ringo",
    "Sophie Milman",
    "Murakami Haruki",
    "Ben Folds",
    "Damien Rice",
    "David Bowie",
    "Family of the Year",
    "The Smiths",
    "Sigur Ros",
    "Elliot Smith",
    "Freddie Mercury",
    "Arco",
    "Coldplay",
    "First Aid Kit",
    "The Bad Plus",
    "Belle & Sebastian",
    "The Black Skirts",
    "Radiohead",
    "Bombay Bicycle Club",
    "Crosby, Nash & Young",
    "Emi Meyer",
    "Imaginary Cities",
    "Kotaro Oshio",
    "Kristoffer Fogelmark",
    "Lisa Hannigan",
    "Masayoshi Yamazaki",
    "Michael Schulte",
    "Nick Drake",
    "Odesza",
    "Oohyo",
    "Lee Juck",
    "Passenger",
    "Queen",
    "Rachel Yamagata",
    "Ray Bryant",
    "Sheena Ringo",
    "Sophie Milman",
    "Murakami Haruki",
    "Ben Folds",
    "Damien Rice",
    "David Bowie",
    "Family of the Year",
    "The Smiths",
    "Sigur Ros",
    "Elliot Smith",
    "Freddie Mercury",
    "Arco",
    "Coldplay",
    "First Aid Kit",
    "The Bad Plus",
    "Belle & Sebastian",
    "The Black Skirts",
    "Radiohead",
    "Bombay Bicycle Club",
    "Crosby, Nash & Young",
    "Emi Meyer",
    "Imaginary Cities",
    "Kotaro Oshio",
    "Kristoffer Fogelmark",
    "Lisa Hannigan",
    "Masayoshi Yamazaki",
    "Michael Schulte",
    "Nick Drake",
    "Odesza",
    "Oohyo",
    "Lee Juck",
    "Passenger",
    "Queen",
    "Rachel Yamagata",
    "Ray Bryant",
    "Sheena Ringo",
    "Sophie Milman",
    "Murakami Haruki",
    "Ben Folds",
    "Damien Rice",
    "David Bowie",
    "Family of the Year",
    "The Smiths",
    "Sigur Ros",
    "Elliot Smith",
    "Freddie Mercury",
    "Arco",
    "Coldplay",
    "First Aid Kit",
    "The Bad Plus",
    "Belle & Sebastian",
    "The Black Skirts",
    "Radiohead",
    "Bombay Bicycle Club",
    "Crosby, Nash & Young",
    "Emi Meyer",
    "Imaginary Cities",
    "Kotaro Oshio",
    "Kristoffer Fogelmark",
    "Lisa Hannigan",
    "Masayoshi Yamazaki",
    "Michael Schulte",
    "Nick Drake",
    "Odesza",
    "Oohyo",
    "Lee Juck",
    "Passenger",
    "Queen",
    "Rachel Yamagata",
    "Ray Bryant",
    "Sheena Ringo",
    "Sophie Milman",
    "Murakami Haruki",
    "Ben Folds",
    "Damien Rice",
    "David Bowie",
    "Family of the Year",
    "The Smiths",
    "Sigur Ros",
    "Elliot Smith",
    "Freddie Mercury",
    "Arco",
    "Coldplay",
    "First Aid Kit",
    "The Bad Plus",
    "Belle & Sebastian",
    "The Black Skirts",
    "Radiohead",
    "Bombay Bicycle Club",
    "Crosby, Nash & Young",
    "Emi Meyer",
    "Imaginary Cities",
    "Kotaro Oshio",
    "Kristoffer Fogelmark",
    "Lisa Hannigan",
    "Masayoshi Yamazaki",
    "Michael Schulte",
    "Nick Drake",
    "Odesza",
    "Oohyo",
    "Lee Juck",
    "Passenger",
    "Queen",
    "Rachel Yamagata",
    "Ray Bryant",
    "Sheena Ringo",
    "Sophie Milman",
    "Murakami Haruki"
  ]

  // getOrg: "SELECT "
};

module.exports = dataModel;
