(function () {
  var BPM = 120;
  var SAMPLE_RATE = 44100;
  var BEAT_LENGTH = (60/BPM) * SAMPLE_RATE;

  var track = 'x ..o .x o..o ..'.split('');
  var data = [];

  track.forEach(function (beat) {
    switch (beat) {
    case 'x':
      kick(1);
      break;
    case 'o':
      snare(1);
      break;
    case '.':
      hat(0.5);
      break
    default:
      silence();
    }
  });

  function silence() {
    for (var i = 0; i < BEAT_LENGTH / 4; i++) {
      data.push(0);
    }
  }

  function kick(level) {
    data.push(1);
    data = data.concat(generateSine(200, level, BEAT_LENGTH / 4));
  }

  function snare(level) {
    data.push(1);
    data = data.concat(generateSine(440, level, BEAT_LENGTH / 4));
  }

  function hat(level) {
    data.push(1);
    data = data.concat(generateSine(1000, level, BEAT_LENGTH / 4));
  }

  function generateSine(freq, level, duration) {
    var sine = [];
    for (var i = 0; i < duration; i++) {
      sine.push(level * Math.sin(freq * i * 2 * Math.PI / SAMPLE_RATE));
    }
    return sine;
  }

  playAudio();


  function playAudio() {
    var normalised = data.map(function (datum) {
      return (datum * 127) + 127;
    });
    normalised = normalised.concat(normalised, normalised, normalised);
    console.log(normalised.slice(0, 100).join(','));
    var wave = new RIFFWAVE(normalised);
    var audio = new Audio(wave.dataURI);
    audio.play();
  }

})();
