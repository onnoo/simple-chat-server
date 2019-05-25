var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');

var app = express();
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'secret',
  database: 'my_db'
});

app.use(bodyParser.urlencoded({ extended: false }));

app.set('views', __dirname + '/views');

app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.render('index.html');
});

app.get('/register', function (req, res) {
  res.render('register.html');
});

app.post('/login', function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var sql = `SELECT * FROM user_info WHERE username = ?`;
  connection.query(sql, [username], function (error, results, fields) {
    if (error) throw error;
    if (results.length == 0) {
      res.send('Non exist username');
    } else {
      if (results[0].password == password)
        res.send('Hello, ' + username + ' !');
      else
        res.send('Wrong password');
    }
  });
});

app.post('/register', function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var sql = `INSERT INTO user_info (username, password) VALUES (?, ?)`;
  connection.query(sql, [username, password], function (error, results, fields) {
    if (error) throw error;
    res.redirect('/');
  });
});

connection.connect(function (err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connection as id ' + connection.threadId);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});