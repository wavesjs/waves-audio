// monkeypatch old webAudioAPI
'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _acMonkeypatch = require('./ac-monkeypatch');

// exposes a single instance

var _acMonkeypatch2 = _interopRequireDefault(_acMonkeypatch);

var audioContext;

if (window.AudioContext) audioContext = new window.AudioContext();

exports['default'] = audioContext;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi9jb3JlL2F1ZGlvLWNvbnRleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OzZCQUN3QixrQkFBa0I7Ozs7OztBQUcxQyxJQUFJLFlBQVksQ0FBQzs7QUFFakIsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUNyQixZQUFZLEdBQUcsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7O3FCQUU1QixZQUFZIiwiZmlsZSI6ImVzNi9jb3JlL2F1ZGlvLWNvbnRleHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBtb25rZXlwYXRjaCBvbGQgd2ViQXVkaW9BUElcbmltcG9ydCBtb25rZXlQYXRjaCBmcm9tICcuL2FjLW1vbmtleXBhdGNoJztcblxuLy8gZXhwb3NlcyBhIHNpbmdsZSBpbnN0YW5jZVxudmFyIGF1ZGlvQ29udGV4dDtcblxuaWYgKHdpbmRvdy5BdWRpb0NvbnRleHQpXG4gIGF1ZGlvQ29udGV4dCA9IG5ldyB3aW5kb3cuQXVkaW9Db250ZXh0KCk7XG5cbmV4cG9ydCBkZWZhdWx0IGF1ZGlvQ29udGV4dDtcbiJdfQ==