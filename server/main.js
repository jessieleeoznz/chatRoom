let bodyParser = require('body-parser');
let mysql = require('mysql');

let express = require('express');
let app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
let port = 3025;

var users = {};

io.on('connection', function (socket) {
  socket.join('subroom');

  socket.on('add', (user) => {
    users[user] = socket.id;
    socket.me = user;
    socket.to('subroom').emit('sub', `${user} has subscribed`);
  });
  socket.on('chat', (to, id, msg, action)=>{
    // for (const me in users) {
    //   if (users.hasOwnProperty(me)) {
    //     const socketId = users[me];
    //     if (socketId === socket.id) {
    //       socket.to(users[to]).emit('chat', me, msg);
    //       return;
    //     }
    //   }
    // 
    const me = socket.me;
    if (to === "all") {
      socket.to('subroom').emit('chat', me, id, msg, action);
    } else {
      socket.to(users[to]).emit('chat', me, id, msg, action);
    }
  })

})


let db = mysql.createConnection({
  host: 'localhost',
  user: 'jessie',
  password: 'jsjsjs',
  database: 'jsdb'
});

db.connect(function (err) {
  if (err) {
    return console.error('error: ' + err.message);
  }

  console.log('Connected to the MySQL server.');
});

function getAllMessages(req, res) {
  db.query("select * from messages des", function (err, messages) {
    if (err) {
      console.log("error:", err);
      res.send(err);
      return;
    }
    res.send(messages);
    res.sendFile('/Users/jessie/workspace/jquery-demo/client/index.html');

  });
}

function getMessage(req, res) {
  let msgId = req.params.msgId;
  db.query("select * from messages where id = ?", msgId, function (err, messages) {
    if (err) {
      console.log("error:", err);
      res.send(err);
      return;
    }
    console.log("messages: ", messages);
    res.send(messages.length > 0 ? messages[0] : {});
  });
}

function createMessage(req, res) {
  let bodyMsg = req.body.message;
  let message = {
    user: bodyMsg.user,
    msg: bodyMsg.msg,
    time: new Date(),
  };
  db.query("insert into messages set ?", message, function (err, result) {
    if (err) {
      console.log("error:", err);
      res.send({ status: 'fail', result: err });
      return;
    }
    let idNum = result.insertId;
    message["id"] = idNum;

    if (idNum) {
      res.send({ status: 'ok', result: message });
      return;
    }
    res.send({ status: 'fail' });
  });
}

function updateMessage(req, res) {
  let msgId = req.params.msgId;
  let bodyMsg = req.body.message;
  let message = {
    user: bodyMsg.user,
    msg: bodyMsg.msg,
    time: new Date(),
  };
  db.query("update messages set ? where id = ?", [message, msgId], function (err, result) {
    if (err) {
      console.log("error:", err);
      res.send(err);
      return;
    }
    console.log('Rows affected:', result);
    if (result.affectedRows === 1) {
      db.query("select * from messages where id = ?", msgId, function (err, messages) {
        if (err) {
          console.log("error:", err);
          res.send(err);
          return;
        }
        res.send(messages.length > 0 ? { status: 'ok', result: messages[0] } : { status: 'fail' });
        //console.log("message[0] is: " + JSON.stringify(messages[0]));
        return;
      });
      return;
    }
    res.json({ status: 'fail' });
  });
}

function deleteMessage(req, res) {
  let msgId = req.params.msgId;
  db.query("delete from messages where id = ?", msgId, function (err, result) {
    if (err) {
      console.log("error:", err);
      res.send(err);
      return;
    }
    if (result.affectedRows === 1) {
      db.query("select * from messages where id = ?", msgId, function (err, messages) {
        if (err) {
          console.log("error:", err);
          res.send(err);
          return;
        }
        res.send(messages.length == 0 ? { status: 'ok', result: messages[0] } : { status: 'fail' });
        return;
      });
      return;
    }
    res.json({ status: 'fail' });
  });
}


app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "*");
  // res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, HEAD');
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.route('/messages')
  .post(createMessage)
  .get(getAllMessages);

app.route('/message/:msgId')
  .get(getMessage)
  .put(updateMessage)
  .delete(deleteMessage);
app.route("/healthz")
  .get(function (req, res) { res.send("I am jessie, I love gavin"); });

http.listen(port, () => {
  console.log(`api server has started on port: ${port}`);
});


