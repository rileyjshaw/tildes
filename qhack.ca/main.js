function init () {
  function getTop (element) {
    var top = 0;
    do {
      top += element.offsetTop  || 0;
      element = element.offsetParent;
    } while(element);

    return top;
  }

  function smoothScroll (top) {
    var windowTop = window.pageYOffset;
    if (top !== windowTop) {
      var direction = top - windowTop > 0 ? 1 : -1;
      function scroll () {
        var diff = (top - windowTop) * direction;
        if (diff > 0) {
          windowTop += Math.min(diff, 30) * direction;
          window.scrollTo(0, windowTop);
          window.requestAnimationFrame(scroll);
        }
      }
      window.requestAnimationFrame(scroll);
    }
  }

  function initSections (section, i) {
    if (section.el) {
      section.top = getTop(section.el);
      section.height = section.el.offsetHeight;
      section.header.onclick = function () { smoothScroll(section.top - topLatch); };
      section.fixed = false;
      section.el.style.cssText = section.header.style.cssText = '';
      return section;
    }

    var h1 = section.querySelector('h1');
    var progress;
    var height = section.offsetHeight;
    var topLatch = i * 42;
    var top = getTop(section);

    h1.innerHTML = '<span class="progress"></span><span class="text">' + h1.textContent + '</span>';
    progress = h1.querySelector('.progress');
    // todo: messy, but easy to override
    h1.onclick = function () { smoothScroll(top - topLatch); };

    return {
      el: section,
      header: h1,
      progress: progress,
      top: top,
      height: height,
      topLatch: topLatch,
      bottomLatch: (sections.length - 1 - i) * 42,
      fixed: false
    };
  }

  function scrollHandlerInner (section, top) {
    var diff = top - section.top;
    var progressStyle = section.progress.style;
    var progressStyleWidth = progressStyle.width;
    if (diff >= -section.topLatch) {
      if (diff < section.height) {
        progressStyle.width = Math.min((diff + section.topLatch) / (section.height - 42), 1) * 100 + '%';
      } else if (progressStyleWidth !== '100%') progressStyle.width = '100%';
      if (section.fixed !== 'top') {
        section.fixed = 'top';
        section.header.style.cssText = 'position:fixed;top:' + section.topLatch + 'px';
        section.el.style.cssText = 'padding-top: 42px';
      }
    } else {
      if (progressStyleWidth !== '0px') progressStyle.width = 0;
      if (diff + windowHeight - section.bottomLatch - 42 < 0) {
        if (section.fixed !== 'bottom') {
          section.fixed = 'bottom';
          section.header.style.cssText = 'position: fixed;bottom:' + section.bottomLatch + 'px';
          section.el.style.cssText = 'padding-bottom: 42px';
        }
      } else if (section.fixed) {
        section.fixed = false;
        section.el.style.cssText = section.header.style.cssText = '';
      }
    }
  }

  function stickToBottom (section) {
    section.fixed = false;
    section.header.style.cssText = 'position: absolute;bottom:' + section.bottomLatch + 'px';
    section.progress.style.width = '100%';
  }

  function scrollHandler () {
    var top = window.pageYOffset;
    // todo handle scrolling past top
    if (articleBottom - top < compressedHeight) {
      if (!stickyLatch) {
        stickyLatch = 'bottom';
        sections.forEach(stickToBottom);
      }
    } else {
      if (stickyLatch) stickyLatch = false;
      sections.forEach(function (section) {
        scrollHandlerInner(section, top);
      });
    }
  }

  function initGlobal () {
    windowHeight = window.innerHeight;
    articleTop = getTop(article);
    sections = sections.map(initSections);
    stickyLatch = false;
    scrollHandler();
    articleBottom = articleTop + article.offsetHeight;
  }

  var article = document.querySelector('article');
  var sections = Array.prototype.slice.call(article.querySelectorAll('section'), 0);
  var compressedHeight = sections.length * 42;
  var windowHeight, articleTop, articleBottom, sections, stickyLatch, resizeDone;

  initGlobal();

  window.addEventListener('scroll', scrollHandler, false);
  window.addEventListener('resize', function () {
    clearTimeout(resizeDone);
    resizeDone = setTimeout(initGlobal, 500);
  }, false);
}

WebFont.load({
  google: { families: ['Inconsolata'] },
  active: init
});
