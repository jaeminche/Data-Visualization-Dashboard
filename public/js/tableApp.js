$(document).ready(function() {
  $("#table_id").DataTable({
    // ajax: "api/myData.js",
    ajax: {
      url: "/js/api/myData.json",
      dataSrc: "data"
    },
    columns: [
      //   { data: "id" },
      { data: "name" },
      { data: "days" },
      { data: "dpTime" },
      { data: "average" }
    ]
    // , scrollY: 400
    // , ordering: true
  });
  // {
  // ordering: true
  // , order: [[3, "desc"], [2, "desc"]]
  // , columnDefs: [
  //   {
  //     targets: [0],
  //     orderData: [0, 1]
  //   },
  //   {
  //     targets: [1],
  //     orderData: [1, 0]
  //   },
  //   {
  //     targets: [4],
  //     orderData: [4, 0]
  //   }
  // ]
  // }
  // ();
});
// $(document).ready(function() {
//   $("#example").DataTable({
//     order: [[3, "desc"], [0, "asc"]]
//   });
// });
