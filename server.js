require("dotenv").config(); // Load ENV Variables
const express = require("express"); // import express
const morgan = require("morgan"); //import morgan
const methodOverride = require("method-override");
const path = require("path")
const moment = require('moment');
const flash = require('express-flash');
const session = require('cookie-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const bodyParser = require('body-parser');
const UserApiRouter = require("./api/user");
const StripeApiRouter = require("./api/stripe");
const InvoiceApiRouter = require("./api/invoice")


const DATABASE_URL = process.env.DATABASE_URL || 4000;
const CONFIG = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000", "*"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

// Establish Connection
mongoose.connect(DATABASE_URL, CONFIG);

// Events for when connection opens/disconnects/errors
mongoose.connection
  .on("open", () => console.log("Connected to Mongoose"))
  .on("close", () => console.log("Disconnected from Mongoose"))
  .on("error", (error) => console.log(error));


app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(cookieParser(process.env.SECRET));

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.locals.moment = moment;

app.get("/", (req, res) => {
  res.render("home")
});

app.use("/api/user", UserApiRouter);
app.use("/api/stripe", StripeApiRouter);
app.use("/api/invoice", InvoiceApiRouter);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Now Listening on port ${PORT}`));
