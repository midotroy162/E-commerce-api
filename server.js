const path = require("path");

const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");

dotenv.config({ path: "config.env" });
const ApiError = require("./utils/apiError");
const globalError = require("./middleware/errorMiddleware");
const dbConnection = require("./config/database");
// Routes
const mountRoutes = require("./routes/index");
//connect to db
dbConnection();

// express app
const app = express();
//middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode :  ${process.env.NODE_ENV}`);
}
// Mount Routes
mountRoutes(app);

app.all("*", (req, res, next) => {
  // create error and send it to error handling middleware
  // const err = new Error("cant find this route:"+ req.originalUrl);
  // next(err.message);
  next(new ApiError(`cant find this route:${req.originalUrl}`, 400));
});
//globle error inside express
app.use(globalError);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`App runnig on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log(`unhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`shutting Down....`);
    process.exit(1);
  });
});
