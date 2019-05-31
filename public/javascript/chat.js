$(function() {
  // socket.io 서버에 접속
  var socket = io();

  // 최초로 한번 서버에게 login 메세지 전달
  socket.emit("login", { username: username });

  // login 에 대한 listening
  socket.on("login", function (data) {
    $("#chatLog").append("<li><strong>"+data+"</strong> has entered</li>");
  });
  // logout 에 대한 listening
  socket.on("logout", function (data) {
    $("#chatLog").append("<li><strong>"+data+"</strong> has exited</li>");
  });
  // chat 에 대한 listening
  socket.on("chat", function (data) {
    $("#chatLog").append("<li><string>"+data.username+"</strong> : "+data.msg+"</li>");
  });

  // form submit
  $("#myForm").submit(function(e) {
    e.preventDefault();
    var $msgForm = $("#msgForm");
    // 서버로 메시지를 전송한다.
    socket.emit("chat", { msg: $msgForm.val() });
    $msgForm.val("");
  });
});
