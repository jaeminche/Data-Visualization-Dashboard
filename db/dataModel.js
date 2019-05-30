const dataModel = {
  loginType: "user", // superadmin || org || user
  cards: [
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
      query: "select orgid, count(orgid) from public.log_login GROUP BY orgid",
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
      auth: ["superadmin", "org"]
    },
    {
      name: "NO. OF ACTIVE USERS THIS MONTH",
      number: 0,
      color: "info",
      fa: "bicycle",
      query: "SELECT userid FROM public.log_startcycling GROUP BY userid",
      auth: ["superadmin", "org"]
    },
    {
      name: "AVERAGE CYCLING TIME THIS WEEK",
      number: 0,
      color: "success",
      fa: "stopwatch",
      //   todo:
      query: "SELECT * FROM public.users",
      auth: ["superadmin", "org"]
    },
    {
      name: "AVERAGE CYCLING TIME THIS MONTH",
      number: 0,
      color: "success",
      fa: "stopwatch",
      //   todo:
      query: "SELECT * FROM public.users",
      auth: ["superadmin", "org"]
    }
  ],
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
  }

  // getOrg: "SELECT "
};

module.exports = dataModel;
