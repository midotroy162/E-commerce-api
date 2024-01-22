const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });
const dbConnection = () => {
  mongoose
    .connect(process.env.DB_URL, { useNewUrlParser: true })
    .then((conn) => {
      console.log(conn.connection.host);
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
};

module.exports = dbConnection;
