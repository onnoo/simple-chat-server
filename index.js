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

// Express 서버 시작
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

// 라우팅 처리
app.get('/', function (req, res) {
    res.render('index.html');
});
app.post('/', function(req, res) {
  var name = req.body.name;
  var pwd = req.body.pwd;

  // DB에 query 전송
  var sql = `SELECT * FROM user_info WHERE username = ?`;
  connection.query(sql, [name], function(error, results, fields) {
    if (results.length == 0)
    {
      res.redirect('/');
    } else {
      var db_pwd = results[0].password;

      if (pwd == db_pwd)
      {
        res.render('welcome.html');
      } else {
        res.redirect('/');
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
  connection.query(sql, [name, pwd], function(error, results, fields) {
    console.log(results);
  });

  // 응답으로는 '/' 페이지로 이동시킨다.
  res.redirect('/');
});
app.get('/welcome', function (req, res) {
  res.render('welcome.html');
});
