var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'secret',
  database: 'my_db'
});

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

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

app.get('/chat', function (req, res) {
  if (!req.cookies.username)
    res.send('please login.');
  else {
    console.log(req.cookies.username);
    res.render('chat.html', {
      username: req.cookies.username
    });
  }
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
      if (results[0].password == password) {
        res.cookie('username', username);
        res.redirect('/chat');
      } else
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

// SOCKET IO
io.on('connection', function (socket) {
  socket.on('login', function (data) {
    console.log('client logged-in:' + data.username);

    socket.username = data.username;

    io.emit('login', data.username);
  });

  socket.on('chat', function (data) {
    console.log('Message form %s: %s', socket.username, data.msg);

    var msg = {
      username: socket.username,
      msg: data.msg
    };

    io.emit('chat', msg);
  });

  socket.on('forceDisconnect', function () {
    socket.disconnect();
  });

  socket.on('disconnect', function () {
    console.log('user disconnected: ' + socket.name);
  });
});

connection.connect(function (err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connection as id ' + connection.threadId);
});

server.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});