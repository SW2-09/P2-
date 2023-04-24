/* ** NOTES **
1. Use the "npm init" command to create a package.json file 
2. "npm install --save-dev nodemon" command to install nodemon (see package.json)
3. Use the "npm run devStart" command to start the server (see package.json) 
nodemon can be acti
*/
export{server};
import {startWebsocketserver, handlers} from "./web_socket/handlers.js";

const host = "localhost";
const port = 3000;
const webSocketPort = 3443;



import express from "express";
import expressLayouts from "express-ejs-layouts";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import flash from "connect-flash";


//const express = require("express");
const app = express();

app.use(express.static("public")); // Middleware function that serves static files (e.g. css files) https://expressjs.com/en/starter/static-files.html
app.use(express.urlencoded({ extended: true })); // Middleware function that parses the body of a request (e.g. form data)
app.use(express.json({limit: '50mb'})); // This allows us to parse json data


//Buyer model
import { Buyer } from "./models/Buyer.js";

//Passport config
import { checkPassport } from "./config/passport.js";
checkPassport(passport);

//MongoDB atlas config
import { MongoURI as db } from "./config/keys.js";

//Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

//EJS setup
app.use(expressLayouts);
app.set("view engine", "ejs"); // Makes .ejs files possible to use
app.use(flash());

//Express session -  passport session (webpage)
app.use(session({ secret: "secret", resave: true, saveUninitialized: true }));

//Bodyparser
//app.use(express.urlencoded({ extended: false }));

//Passport middleware
app.use(passport.initialize()); //This is needed to initialize passport
app.use(passport.session()); //This is needed to keep the user logged in

//Buyer page
import { buyerRouter } from "./routes/buyer.js";
app.use("/buyer", buyerRouter);

//Index page
import { router } from "./routes/index.js";
app.use("/", router);

//Admin page
import { adminRouter } from "./routes/admin.js";
app.use("/admin", adminRouter);

/* ** ROUTES **
This is great practice to get into. This way we can have different nested routes in different files.
1. Keeps the code clean and easy to read and to maintain.
2. Each route can be in its own file.
3. e.g. server.js -> routes/users.js -> routes/users/new.js
*/

const server = app.listen(port, () =>
  console.log(`Server has been started on http://localhost:${port}`)
);
startWebsocketserver(host, webSocketPort);
