var express = require('express')
var exphbs = require('express-handlebars')
var path = require('path')
var fs = require('fs')

var app = express()
var http = require('http').Server(app)
var NAMESPACE = 'SOUNDMIX'
var io = require('socket.io')(http).of(NAMESPACE)

var soundDir = path.join(__dirname, 'static', 'sounds')

app.engine('handlebars', exphbs({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

app.get('/', function (req, res, next) {
  var ioRooms = Object.keys(io.adapter.rooms)
    .filter(f => !f.startsWith('/' + NAMESPACE))
    .filter(f => f !== 'null')
    .sort()

  var rooms = ioRooms.map(r => {
    return {
      room: r,
      users: io.adapter.rooms[r].length
    }
  })
  res.render('index', {rooms: rooms})
})

app.get('/room/:room', function (req, res, next) {
  // sanitize the room name
  var room = req.params.room.replace(/[^\w]/gi, '')
  if (req.params.room !== room) return res.redirect(`/room/${room}`)

  gimmieSounds((err, sounds) => {
    if (err) return next(err)
    res.render('room', {sounds: sounds, room: room})
  })
})

function gimmieSounds (cb) {
  fs.readdir(soundDir, (err, files) => {
    if (err) return cb(err)
    console.log('files', files)
    var filez = files.map(f => path.parse(f))
    filez = filez.map(f => {
      f.friendlyName = f.name.replace(/_/g, ' ')
      return f
    })
    cb(null, filez)
  })
}

app.get('/api/play/:room/:sound', function (req, res, next) {
  var room = req.params.room.replace(/[^\w]/gi, '')
  io.to(room).emit('invokesound', req.params.sound)
  res.json({winner: 'you'})
})

app.get('/api/sounds', function (req, res, next) {
  gimmieSounds((err, sounds) => {
    if (err) return next(err)
    res.json(sounds.map(s => s.name))
  })
})

io.on('connection', function (socket) {
  console.log('a user connected')

  socket.on('room', function (room) {
    console.log('user joining room' + room)
    socket.join(room)
    socket.room = room
  })

  socket.on('disconnect', function () {
    console.log('user disconnected')
  })

  socket.on('play', function (data) {
    console.log('play', data)
    io.to(socket.room).emit('invokesound', data)
  })

  socket.on('speak', function (data) {
    console.log('speak', data)
    io.to(socket.room).emit('invokespeech', data.slice(0, 100)) // limit to 100 characters
  })
})

app.use(express.static('static'))

http.listen(process.env.PORT || 4000, function (err) {
  if (err) {
    console.error(err)
  }

  console.log('App is up and listening.')
})
