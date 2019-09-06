$(document).ready(function() {
  $("#table_id").DataTable({
    ajax: {
      url: "/js/api/myData.json",
      dataSrc: "data"
    },
    columns: [
      { data: "name" },
      { data: "days" },
      { data: "dpTime" },
      { data: "average" }
    ]
    // , scrollY: 400
    // , ordering: true
  });
});
