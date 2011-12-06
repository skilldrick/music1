(function () {
  var BPM = 120;
  var SAMPLE_RATE = 44100;
  var BEAT_LENGTH = (60/BPM) * SAMPLE_RATE;

  $(function () {
    var $input = $('<input />');
    var $button = $('<button>Play</button>');
    $input.val('x ..o .x o..o ..');
    $('body').append($input);
    $('body').append($button);
    $button.click(function () {
      var track = $input.val().split('');
      playTrack(track);
    });

  });

  function playTrack(track) {
    data = [];
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

    playAudio();
  }

  var data;


  function silence() {
    for (var i = 0; i < BEAT_LENGTH / 4; i++) {
      data.push(0);
    }
  }

  function kick(level) {
    var sine = generateSine(100, level, BEAT_LENGTH / 4);
    var ramp = generateRamp(BEAT_LENGTH / 4);
    var convolved = convolve(sine, ramp);
    data = data.concat(convolved);
  }

  function snare(level) {
    var noise = generateNoise(level, BEAT_LENGTH / 4);
    var ramp = generateRamp(BEAT_LENGTH / 4);
    var convolved = convolve(noise, ramp);
    data = data.concat(convolved);
  }

  function hat(level) {
    var sine = generateSine(10000, level, BEAT_LENGTH / 4);
    var noise = generateNoise(level, BEAT_LENGTH / 4);
    var ramp = generateRamp(BEAT_LENGTH / 4);
    var convolved = convolve(sine, noise);
    convolved = convolve(convolved, ramp);
    data = data.concat(convolved);
  }

  function generateNoise(level, duration) {
    var noise = [];
    for (var i = 0; i < duration; i++) {
      noise.push(Math.random() * level);
    }
    return noise;
  }

  function generateSine(freq, level, duration) {
    var sine = [];
    for (var i = 0; i < duration; i++) {
      sine.push(level * Math.sin(freq * i * 2 * Math.PI / SAMPLE_RATE));
    }
    return sine;
  }

  function generateRamp(duration) {
    var arr = [];
    for (var i = 0; i < duration; i++) {
      arr.push(1 - (i / duration));
    }
    return arr;
  }

  function convolve(arr1, arr2) {
    var result = [];
    for (var i = 0, len = arr1.length; i < len; i++) {
      result.push(arr1[i] * arr2[i]);
    }
    return result;
  }



  function playAudio() {
    var normalised = data.map(function (datum) {
      return (datum * 127) + 127;
    });
    normalised = normalised.concat(normalised, normalised, normalised);
    var wave = new RIFFWAVE(normalised);
    var audio = new Audio(wave.dataURI);
    audio.play();
  }

})();
