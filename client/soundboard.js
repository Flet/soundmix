// styles
require('./styles.css');

var io = require('socket.io-client');
var Howl = require('howler').Howl;
var socket = io();
var sounds = {};

function ready (fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(function () {
  Array.from(document.getElementsByClassName('soundbutton')).forEach(
    function (element, index, array) {
      element.onclick = function () {
        socket.emit('play', element.id);
      };
    }
  );
  document.getElementById('speak').onclick = sayIt;
});

function sayIt () {
  var input = document.getElementById('words');
  socket.emit('speak', input.value);
  input.value = '';
}
window.sayIt = sayIt;

document.getElementById('words')
  .addEventListener('keyup', function (event) {
    event.preventDefault();
    if (event.keyCode === 13) sayIt();
  });

socket.on('invokesound', function (name) {
  console.log('invokesound', name);
  if (!sounds[name]) sounds[name] = new Howl({src: [`sounds/${name}.mp3`]});
  if (sounds[name].playing()) return;
  sounds[name].play();
  document.getElementById(name).classList.add('playing');

  sounds[name].once('end', () => {
    document.getElementById(name).classList.remove('playing');
  });
});

socket.on('invokespeech', function (words) {
  window.responsiveVoice.speak(words);
});
