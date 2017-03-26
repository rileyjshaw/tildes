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

    function type (mode, strs, options) {
      var cb, ignoreCommand, speed;

      if (typeof options === 'function') {
        cb = options;
      } else {
        options = options || {};
        cb = options.cb;
        ignoreCommand = options.ignoreCommand;
        speed = options.speed;
      }

      if (typeof strs === 'string') {
        strs = [strs];
      }

      if (typeof speed !== 'number') {
        speed = mode === 'term' ? 50 : 300;
      }

      strs = strs.reverse();

      // safety measures
      term.stopLoading(true);
      term.input.disabled = true;

      if (mode === 'term') {
        term.form.style.display = 'none';
      }

      !function typeLine () {
        var str, el, inner;

        str = strs.pop().split('').reverse();
        str.push('');

        // Update the scroll position once the first character's in there.
        setTimeout(function () { term.print(); }, 1.5 * speed);

        if (mode === 'term') {
          el = document.createElement('code');
          term.container.insertBefore(el, term.form);

          inner = function inner () {
            var delay = (0.25 + Math.random()) * speed;
            el.textContent += str.pop();

            if (str.length) {
              setTimeout(inner, delay);
            } else if (strs.length) {
              typeLine();
            } else {
              term.input.disabled = false;
              term.form.reset();
              term.form.style.display = 'block';
              term.print();

              if (typeof cb === 'function') {
                cb();
              }
            }
          };
        } else {
          inner = function inner () {
            var delay = (0.25 + Math.random()) * speed;
            term.input.value += str.pop();

            if (str.length) {
              setTimeout(inner, delay);
            } else if (strs.length) {
              typeLine();
            } else if (!ignoreCommand) {
              setTimeout(function () {
                term.run(function () {
                  term.cmdHistory.pop();
                  if (typeof cb === 'function') {
                    cb();
                  }
                });
              }, delay);
            } else {
              term.print('>&nbsp;' + term.input.value);
              term.form.reset();

              if (typeof cb === 'function') {
                cb();
              }
            }
          };
        }

        inner();
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
            type('user', 'echo ' + lyrics.pop(), {
              cb: next,
              speed: 100,
            });
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

    term.register('wargames', {
      fn: function () {
        var resetRun = (function () {
          oldRun = term.run;
          return function resetRun () { term.run = oldRun; };
        })();

        term.run = function () {
          var cmd = term.form.prompt.value;

          term.form.reset();
          term.print('>&nbsp;' + cmd);
          cmd = cmd.toLowerCase();

          if (cmd === 'joshua') {
            type('term', 'GREETINGS PROFESSOR FALKEN', function () {
              term.run = function () {
                term.print('>&nbsp;' + term.form.prompt.value);

                type('term', [
                  'A STRANGE GAME',
                  'THE ONLY WINNING MOVE IS',
                  'NOT TO PLAY.',
                ], function () {
                  term.print('&nbsp;');
                  type('term', 'HOW ABOUT A NICE GAME OF CHESS?', function () {
                    term.register('chess', {
                      fn: function () {
                        redirect('http://www.imdb.com/title/tt0086567/', true);
                      },
                      desc: 'The hottest new game from PROTOVISION',
                    });
                    resetRun();
                  });
                });
              };
              type('user', 'HELLO');
            });
          } else if (cmd === 'help' || cmd === 'help logon') {
            return type('term', 'HELP NOT AVAILABLE', function () {
              term.print('&nbsp;');
              type('term', 'LOGON:');
            });
          } else {
            type('term', [
              'IDENTIFICATION NOT RECOGNIZED BY SYSTEM',
              '--CONNECTION TERMINATED--',
            ], resetRun);
          }
        };

        return 'LOGON:';
      },
      desc: ' ===> (311) 437-8739',
    });

    term.register('webring', {
      args: ['prev', 'next'],
      fn: function (direction) {
        if (direction === 'prev') {
          return redirect('../~crockeo');
        } else if (direction === 'next') {
          return redirect('../~florian');
        } else {
          return null;
        }
      },
      desc: 'Continue on your webring journy. Accepts \'next\' or \'prev\'.',
      aliases: ['ring']
    });

    term.register('whoami', {
      fn: function () {
        return 'You are visitor #' + phpDataRJS.visNum + ' (or more).';
      },
      desc: 'Prints visitor number.'
    });

    type('term', 'Welcome', function () {
      type('user', 'whoami');
    });
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
