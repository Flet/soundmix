var io = require('socket.io-client')
var howler = require('howler')
var Howl = howler.Howl
var Howler = howler.Howler
var socket = io('/SOUNDMIX')
socket.emit('room', window.room)

// rejoin if there's a disconnect
socket.on('reconnect', function () {
  socket.emit('room', window.room)
})

var sounds = {}

var mute = false

function ready (fn) {
  if (document.readyState !== 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

ready(function () {
  window.allSounds = Array.from(document.getElementsByClassName('soundbutton'))

  window.allSounds.forEach(
    function (element, index, array) {
      element.onclick = function () {
        socket.emit('play', element.id)
      }
    }
  )
  document.getElementById('speak').onclick = sayIt
  document.getElementById('mute').onclick = toggleMute
  document.getElementById('clear').onclick = clearFilter
})

function toggleMute () {
  mute = !mute
  Howler.mute(mute)
  var btn = document.getElementById('mute')
  if (mute) {
    btn.classList.add('muted')
  } else {
    btn.classList.remove('muted')
  }
}

document.getElementById('filter')
  .addEventListener('keyup', function (event) {
    filterSounds(this.value)
  })

function filterSounds (txt) {
  txt = txt.toUpperCase()
  window.allSounds.forEach(
    function (element, index, array) {
      if (element.innerText.toUpperCase().indexOf(txt) > -1) {
        element.style.display = 'inline-block'
      } else {
        element.style.display = 'none'
      }
    })
}

function clearFilter () {
  document.getElementById('filter').value = ''
  filterSounds('')
}

function sayIt () {
  var input = document.getElementById('words')
  socket.emit('speak', input.value)
  input.value = ''
}
window.sayIt = sayIt

document.getElementById('words')
  .addEventListener('keyup', function (event) {
    event.preventDefault()
    if (event.keyCode === 13) sayIt()
  })

socket.on('invokesound', function (name) {
  console.log('invokesound', name)
  if (!sounds[name]) sounds[name] = new Howl({src: ['/sounds/' + name + '.mp3']})
  if (sounds[name].playing()) return
  sounds[name].play()
  document.getElementById(name).classList.add('playing')

  sounds[name].once('end', function () {
    document.getElementById(name).classList.remove('playing')
  })
})

socket.on('invokespeech', function (words) {
  if (!mute) window.responsiveVoice.speak(words)
})
