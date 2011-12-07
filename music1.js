(function () {
  var BPM = 120;
  var SAMPLE_RATE = 44100;
  var BEAT_LENGTH = (60/BPM) * SAMPLE_RATE;

  $(function () {
    var $input = $('<input />');
    var $button = $('<button>Play</button>');
    var defaultTracks = [
      'x      x        ',
      '    o    o  o   ',
      '. ... .. .... ..'
    ];
    var inputs = defaultTracks.map(createInput);
    $('body').append($button);
    $button.click(function () {
      var track = inputs[0].val().split('');

      var channels = inputs.map(function ($input) {
        var track = $input.val().split('');
        return new Channel(track);
      });

      channelData = channels.map(function (channel) {
        return channel.generateData();
      });

      var mixDown = mix(channelData);
      playAudio(mixDown);
    });

  });

  function createInput(value) {
    var $input = $('<input />');
    $input.val(value);
    $input.attr('size', 16);
    $('body').append($input);
    $('body').append('<br />');
    return $input;
  }

  function Channel(track) {
    this.track = track;
    this.data = [];
  }
  Channel.prototype.generateData = function () {
    this.track.forEach(function (beat) {
      switch (beat) {
      case 'x':
        this.kick(1);
        break;
      case 'o':
        this.snare(1);
        break;
      case '.':
        this.hat(0.5);
        break
      default:
        this.silence();
      }
    }, this);

    return this.data;
  }
  Channel.prototype.silence = function () {
    for (var i = 0; i < BEAT_LENGTH / 4; i++) {
      this.data.push(0);
    }
  }
  Channel.prototype.kick = function (level) {
    var sine = generateSine(100, level, BEAT_LENGTH / 4);
    var ramp = generateRamp(BEAT_LENGTH / 4);
    var convolved = convolve(sine, ramp);
    this.data = this.data.concat(convolved);
  }
  Channel.prototype.snare = function (level) {
    var noise = generateNoise(level, BEAT_LENGTH / 4);
    var ramp = generateRamp(BEAT_LENGTH / 4);
    var convolved = convolve(noise, ramp);
    this.data = this.data.concat(convolved);
  }
  Channel.prototype.hat = function (level) {
    var sine = generateSine(10000, level, BEAT_LENGTH / 4);
    var noise = generateNoise(level, BEAT_LENGTH / 4);
    var ramp = generateRamp(BEAT_LENGTH / 4);
    var convolved = convolve(sine, noise);
    convolved = convolve(convolved, ramp);
    this.data = this.data.concat(convolved);
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

  function mix() {
    var channels;
    if (arguments.length === 1) {
      channels = arguments[0];
    } else {
      channels = [].slice.call(arguments);
    }
    var channelCount = channels.length;
    var mixdown = [];
    for (var i = 0, len = channels[0].length; i < len; i++) {
      mixdown[i] = 0;
      for (var j = 0; j < channelCount; j++) {
        mixdown[i] += channels[j][i] / channelCount;
      }
    }
    return mixdown;
  }

  window.mix = mix;

  function playAudio(data) {
    var normalised = data.map(function (datum) {
      return (datum * 127) + 127;
    });
    normalised = normalised.concat(normalised, normalised, normalised);
    var wave = new RIFFWAVE(normalised);
    var audio = new Audio(wave.dataURI);
    audio.play();
  }
})();
