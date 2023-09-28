var express = require('express');
var app = express();
const bodyParser = require("body-parser");
const passwordhash = require("password-hash");
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

var serviceAccount = require("./key.json");

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://telegrambot-97a42-default-rtdb.firebaseio.com"
});

const db = getFirestore();

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/signup', function (req, res) {
  res.sendFile(__dirname + "/public/signup.html");
});

app.get('/login', function (req, res) {
  res.sendFile(__dirname + "/public/login.html");
});

app.get("/dashboard", function (req, res) {
  res.sendFile(__dirname + "/public/dashboard.html");
});

app.post('/signupSubmit', function (req, res) {
  const { username, email, password } = req.body;

  db.collection("login")
    .where("email", "==", email)
    .get()
    .then((docs) => {
      if (docs.size > 0) {
        res.send("Hey user, this account already exists");
      } else {
        db.collection("login").add({
          username: username,
          email: email,
          password: passwordhash.generate(password),
          password1:password
        })
          .then(() => {
            const successMessage = "Account Created. Click  to <a href='/login'>Log in</a>.";
            res.send(successMessage);
          })
      }
    })
});

app.post('/loginpage', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  db.collection('login')
    .where('email', '==', email)
    .get()
    .then((docs) => {

        var verified = false;
        docs.forEach((doc) => {
          verified = passwordhash.verify(password, doc.data().password);
          if (verified) {
            res.sendFile(__dirname + "/public/dashboard.html");
          }
        });
        if (!verified) {
                 res.send("Login failed");
                 }
      }
    )
    .catch((error) => {
      res.status(500).send("Login failed. Please try again later.");
    });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});



