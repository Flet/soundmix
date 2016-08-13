var express = require('express');
var exphbs = require('express-handlebars');
var path = require('path');
var fs = require('fs');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var soundDir = path.join(__dirname, 'static', 'sounds');

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/', function (req, res, next) {
  gimmieSounds((err, sounds) => {
    if (err) return next(err);
    res.render('index', {sounds: sounds});
  });
});

function gimmieSounds (cb) {
  fs.readdir(soundDir, (err, files) => {
    if (err) return cb(err);
    console.log('files', files);
    var filez = files.map(f => path.parse(f));
    cb(null, filez);
  });
}

app.get('/speaker', function (req, res, next) {
  gimmieSounds((err, sounds) => {
    if (err) return next(err);
    console.log('sounds', sounds);
    res.render('speaker', {sounds: sounds});
  });
});

io.on('connection', function (socket) {
  console.log('a user connected');
  socket.on('disconnect', function () {
    console.log('user disconnected');
  });

  socket.on('play', function (data) {
    console.log('play', data);
    io.emit('invokesound', data);
  });

  socket.on('speak', function (data) {
    console.log('speak', data);
    io.emit('invokespeech', data);
  });
});

app.use(express.static('static'));

http.listen(process.env.PORT || 4000, function (err) {
  if (err) {
    console.error(err);
  }

  console.log('App is up and listening.');
});
