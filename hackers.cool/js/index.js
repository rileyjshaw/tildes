!function () {
  function init () {
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

    function type (str, speed, cb) {
      // safety measures
      term.stopLoading(true);
      term.input.disabled = true;

      if (typeof speed !== 'number') {
        speed = 200;
      }

      str = str.split('').reverse();

      !function inner () {
        var delay = (0.25 + Math.random()) * speed;
        term.input.value += str.pop();

        if (str.length) {
          setTimeout(inner, delay);
        } else {
          setTimeout(function () {
            term.run(function () {
              term.cmdHistory.pop();
              if (typeof cb === 'function') {
                cb();
              }
            });
          }, delay);
        }
      }();
    }

    var phpDataRJS = window.phpDataRJS;
    var term = new TinyTerm();

    term.register('cd', {
      fn: redirect,
      desc: 'Change the current directory to DIR.'
    });

    term.register('echo', {
      fn: function () {
        return Array.prototype.join.call(arguments, ' ');
      },
      desc: 'Write arguments to the standard output.'
    });

    term.register('ls', {
      fn: function () {
        return 'There is nothing here for you.';
      },
      desc: 'List directory contents.'
    });

    term.register('giveup', {
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
    });

    term.register('ping', {
      fn: function () {
        return 'pong';
      },
      desc: 'Says pong.'
    });

    term.register('webring', {
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
      desc: 'Continue on your webring journy. Accepts \'next\' or \'prev\'.',
      aliases: ['ring']
    });

    term.register('welcome', {
      fn: function () {
        return 'You are visitor #' + phpDataRJS.visNum + ' (or more).';
      },
      desc: 'Prints visitor number.'
    });

    window.setTimeout(function () {
      type('welcome');
    }, 0);
  }

  if (typeof WebFont === 'object') {
    WebFont.load({
      google: { families: ['VT323'] },
      active: init
    });
  } else {
    init();
  }
}();
