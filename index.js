// Express 기본 모듈 불러오기
var express = require('express');
// Express 객체 생성
var app = express();

// ejs view와 렌더링 설정
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// body-parser 기본 모듈 불러오기 및 설정 (POST req 해석)
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

// 정적 파일 제공을 위한 경로 설정
app.use(express.static(__dirname + '/public'));

// mysql 기본 모듈 불러오기
var mysql = require('mysql');
// connection 객체 생성
var connection = mysql.createConnection({
  // DB 연결 설정
  host: 'localhost',
  user: 'root',
  post: 3306,
  password: '1234',
  database: 'my_db'
});
connection.connect(function (err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  // Connection 이 성공하면 로그 출력
  console.log('Success DB connection');
});

// http Server 객체 얻어오기
var server = require('http').createServer(app);
// http Server를 socket.io server로 업그레이드한다
var io = require('socket.io')(server);

// 클라이언트와 socket.io 통신
// 클라이언트와 connection에 대한 listening
// 리턴값으로 socket 객체가 넘어온다. (연결된 소켓 정보)
io.on('connection', function (socket) {
  // 소켓으로부터 login 에 대한 listening
  socket.on('login', function (data) {
    console.log('client logged-in:' + data.username);
    socket.username = data.username;
    io.emit('login', data.username);
  });
  // 소켓으로부터 chat 에 대한 listening
  socket.on('chat', function (data) {
    console.log('Message form %s: %s', socket.username, data.msg);
    var msg = {
      username: socket.username,
      msg: data.msg
    };
    io.emit('chat', msg);
  });
  // 소켓으로부터 disconnect 에 대한 listening
  socket.on('disconnect', function () {
    socket.broadcast.emit('logout', socket.username);
    console.log('user disconnected: ' + socket.username);
  });
});

// http Server 시작
server.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

// 라우팅 처리
app.get('/', function (req, res) {
  res.render('index.html', { alert: false });
});
app.post('/', function (req, res) {
  var name = req.body.name;
  var pwd = req.body.pwd;

  // DB에 query 전송
  var sql = `SELECT * FROM user_info WHERE username = ?`;
  connection.query(sql, [name], function (error, results, fields) {
    if (results.length == 0) {
      res.render('index.html', { alert: true });
    } else {
      var db_pwd = results[0].password;

      if (pwd == db_pwd) {
        res.render('welcome.html', { username: name });
      } else {
        res.render('index.html', { alert: true });
      }
    }
  });
});
app.get('/register', function (req, res) {
  res.render('register.html');
});
app.post('/register', function (req, res) {
  var name = req.body.name;
  var pwd = req.body.pwd;
  var pwdconf = req.body.pwdconf;

  // DB에 Query 날리기
  var sql = `INSERT INTO user_info VALUES (?, ?)`;
  connection.query(sql, [name, pwd], function (error, results, fields) {
    console.log(results);
  });

  // 응답으로는 '/' 페이지로 이동시킨다.
  res.redirect('/');
});
app.get('/welcome', function (req, res) {
  res.render('welcome.html');
});