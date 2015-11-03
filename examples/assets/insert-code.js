function insertCode() {
  var scripts = document.querySelectorAll('script');
  scripts = Array.prototype.slice.call(scripts, 0);

  scripts.forEach(function(script) {
    if (!script.hasAttribute('rel')) { return; }

    var relId = script.getAttribute('rel');
    var rel = document.querySelector('#' + relId);

    var content = script.textContent
      .replace(/(\/\/ ---------\/\\---------[\S\s]*?\/\/ ---------\\\/---------)/g, '')
      .replace(/(\n\n+)/mg, '\n\n')
      .replace(/^(\n\n)/, '')
      .replace(/(\n\n\s*)$/, '');

    var pre = document.createElement('pre');
    var code = document.createElement('code');

    code.innerHTML = content;
    code.classList.add('language-javascript');

    pre.appendChild(code);
    rel.parentNode.insertBefore(pre, rel.nextSibling);
  });

  Prism.highlightAll();
}

window.addEventListener('DOMContentLoaded', insertCode);