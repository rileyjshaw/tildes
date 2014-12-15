!function (exports) {
  function loadAnimation () {
    input.value = loadStates[loadIndex++];
    loadIndex = loadIndex % 4;
  }

  function startLoading () {
    input.disabled = true;
    loadInterval = window.setInterval(loadAnimation, 120);
  }

  function stopLoading (disabled) {
    if (loadInterval) {
      window.clearInterval(loadInterval);
      loadInterval = null;

      input.value = '';
      if (!disabled) {
        input.disabled = false;
      }
    }
  }

  function redirect (url, xdomain) {
    var http;

    if (!xdomain) {
      http = new XMLHttpRequest();
      http.open('HEAD', url, false);

      try {
        http.send();
      } catch (err) {
        return url + ': No such file or directory.';
      }

      if (http.status === 404) {
        return url + ': No such file or directory.';
      }
    }

    // pushes current to cmdHistory, unlike location.replace()
    window.location.href = url;
    return 'redirecting...';
  }

  function flash (allowRepeat) {
    body.className = 'flash';

    window.setTimeout(function () {
      body.className = '';
    }, 84);

    if (!allowRepeat) {
      flashed = true;
    }
  }

  function realign () {
    body.scrollTop = body.scrollHeight;
    input.focus();
  }

  function print (str, tag) {
    if (typeof tag !== 'string') {
      tag = 'p';
    }

    if (str) {
      if (str.constructor === Array) {
        str.forEach(print);
      } else {
        form.insertAdjacentHTML('beforebegin', '<' + tag + '>' + str + '</' + tag + '>');
      }
    }
  }

  function type (str, speed, cb) {
    // safety measures
    stopLoading(true);
    input.disabled = true;

    if (typeof speed !== 'number') {
      speed = 200;
    }

    str = str.split('').reverse();

    !function inner () {
      var delay = (0.25 + Math.random()) * speed;
      input.value += str.pop();

      if (str.length) {
        setTimeout(inner, delay);
      } else {
        setTimeout(function () {
          run(null, function () {
            cmdHistory.pop();
            if (typeof cb === 'function') {
              cb();
            }
          });
        }, delay);
      }
    }();
  }

  // naive
  function narrow (target, vals) {
    return vals.filter(function (val) {
      return !val.indexOf(target);
    });
  }

  function autocomplete () {
    var target = input.value.toLowerCase();
    var result = [];
    var words, cmd, args;

    if (target === '') {
      flash(true);
    } else {
      words = target.split(' ');

      if (words.length === 1 && target.slice(-1) !== ' ') {
        // trying to complete a command
        result = narrow(target, Object.keys(commands));
      } else {
        cmd = words[0];

        if (cmd) {
          args = commands[cmd].args;

          if (args) {
            result = narrow(words.slice(-1), args);
          }
        }
      }

      switch (result.length) {
        case 0:
          flash(true);
          break;
        case 1:
          input.value = words.slice(0, -1).concat(result).join(' ') + ' ';
          flashed = false;
          break;
        case 2:
          if (flashed) {
            print('> ' + target);
            print(result.join(' '));
          } else {
            flash();
          }
      }
    }

    realign();
    return result;
  }

  function run (e, cb) {
    var cmd, args, out;

    e = e || window.event;
    if (e) e.preventDefault();

    cmd = form.input.value.toLowerCase();
    form.reset();
    startLoading();

    print('> ' + cmd);
    cmdHistory = [cmd].concat(cmdHistory).slice(0, 60);
    cmdHistoryIndex = -1;
    if (flashed) {
      flashed = false;
    }

    cmd = cmd.split(' ');
    args = cmd.splice(1).filter(function (arg) {
      return arg.charAt(0) !== '-'; // strip options
    });
    // array to string
    cmd = cmd[0];

    if (commands[cmd]) {
      out = commands[cmd].fn.apply(this, args);

      // checks for null and undefined
      if (out != null) {
        print(out ? out : help(cmd));
      }
    } else {
      print(cmd + ': command not found');
    }

    stopLoading();
    realign();

    if (typeof cb === 'function') {
      cb();
    }
  }

  function help (cmd) {
    cmd = commands[cmd];

    if (cmd) {
      return cmd.desc;
    } else {
      return Object.keys(commands).filter(function (key) {
        return !isAlias[key];
      }).map(function (key) {
        return key + ': ' + commands[key].desc;
      });
    }
  }

  var body = document.body;
  var form = body.querySelector('form');
  var input =  form.querySelector('input');
  var phpDataRJS = window.phpDataRJS;
  var loadStates = ['/', '-', '\\', '|'];
  var loadIndex = 0;
  var loadInterval;
  var cmdHistory = [];
  var cmdHistoryIndex = -1;
  var keysDown = {};
  var flashed = false;

  var commands = {
    cd: {
      fn: redirect,
      desc: 'Change the current directory to DIR.'
    },
    echo: {
      fn: function () {
        print(Array.prototype.join.call(arguments, ' '));
      },
      desc: 'Write arguments to the standard output.'
    },
    help: {
      fn: help,
      desc: 'Display helpful information about builtin commands.'
    },
    ls: {
      fn: function () {
        return 'There is nothing here for you.';
      },
      desc: 'List directory contents.'
    },
    giveup: {
      fn: function ()  {
        var lyrics = [
          'and hurt you',
          'liiiiie',
          'Never gonna tell a',
          'Never gonna say goodbye',
          'Never gonna make you cry',
          'desert you',
          'and',
          'Never gonna run around',
          'Never gonna let you down',
          'Never gonna give you up'
        ];

        !function next () {
          if (lyrics.length) {
            type('echo ' + lyrics.pop(), 100, next);
          } else {
            redirect('http://youtu.be/dQw4w9WgXcQ', true);
          }
        }();

        return null;
      },
      desc: 'Abandon all hope.'
    },
    ping: {
      fn: function () {
        return 'pong';
      },
      desc: 'Says pong.'
    },
    webring: {
      args: ['prev', 'next'],
      fn: function (direction) {
        if (direction === 'prev') {
          return redirect('../~crockeo');
        } else if (direction === 'next') {
          return redirect('../~florian');
        } else {
          return false;
        }
      },
      desc: 'Continue on your webring journy. Accepts \'next\' or \'prev\'.'
    },
    welcome: {
      fn: function () {
        return 'You are visitor #' + phpDataRJS.visNum + ' (or more).';
      },
      desc: 'Prints visitor number.'
    }
  };

  var aliases = {
    'help': ['man'],
    'webring': ['ring']
  };
  var isAlias = {};

  Object.keys(aliases).forEach(function (key) {
    aliases[key].forEach(function (alias) {
      commands[alias] = commands[key];
      isAlias[alias] = true;
    });
  });

  form.addEventListener('submit', run);

  input.addEventListener('keydown', function (e) {
    var key;

    e = e || window.event;
    key = e.keyCode;

    if (key === 9) { // tab
      e.preventDefault();
    }

    if (!keysDown[key]) {
      keysDown[key] = true;

      if (key === 9) { // tab
        autocomplete();
      } else {
        if (key === 38) { // up
          cmdHistoryIndex = Math.min(cmdHistoryIndex + 1, cmdHistory.length - 1);
          input.value = cmdHistory[cmdHistoryIndex] || '';
        } else if (key === 40) { // down
          cmdHistoryIndex = Math.max(cmdHistoryIndex - 1, -1);
          input.value = cmdHistory[cmdHistoryIndex] || '';
        }

        if (flashed) {
          flashed = false;
        }
      }

    }
  }, false);

  input.addEventListener('keyup', function (e) {
    var key;

    e = e || window.event;
    key = e.keyCode;

    keysDown[key] = false;
  }, false);

  window.addEventListener('click', function () {
    input.focus();
  }, false);

  startLoading();

  window.setTimeout(function () {
    type('welcome');
  }, 600);
}(this);
