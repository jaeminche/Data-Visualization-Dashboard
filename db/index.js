const { Pool } = require("pg");

const pool = new Pool();

module.exports = {
  // add callback func in the third param
  query: (text, params) => {
    const start = Date.now();
    return pool.query(text, params, (err, res) => {
      const duration = Date.now() - start;
      console.log("executed query", { text, duration, rows: res.rowCount });
      //   callback(err, res);
    });
  }
};
