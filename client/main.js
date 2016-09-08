function ready (fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(function () {
  document.getElementById('createroom').onclick = function () {
    var room = document.getElementById('room').value;
    window.location.href = 'room/' + room;
  };

  document.getElementById('room')
  .addEventListener('keyup', function (event) {
    event.preventDefault();

    if (event.keyCode === 13){
      var room = document.getElementById('room').value;
      window.location.href = 'room/' + room;
    }
  });

  Array.from(document.getElementsByClassName('roombutton')).forEach(
    function (element, index, array) {
      element.onclick = function () {
        window.location.href = 'room/' + element.id;
      };
    }
  );
});
