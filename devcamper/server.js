const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const errHandler = require("./middleware/error");

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Connect to Database
connectDB();

// Route Files
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const users = require("./routes/users");
const reviews = require("./routes/reviews");

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// File upload
app.use(fileupload());

// SANITIZE MONGODB
app.use(mongoSanitize());

// Set security headers
app.use(helmet());
// Prevent xss attacks
app.use(xss());

// Rate limit
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});

app.use(limiter);
// HPP prevent http param polution
app.use(hpp());

// Enable cors
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));
// mount routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);

app.use(errHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} on ${PORT}`.yellow.bold
  );
});
// Handle unhandled promise
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);

  // Close server and exit
  server.close(() => process.exit(1));
});
