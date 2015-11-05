// monkeypatch old webAudioAPI
'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _acMonkeypatch = require('./ac-monkeypatch');

var _acMonkeypatch2 = _interopRequireDefault(_acMonkeypatch);

// exposes a single instance
var audioContext;

if (window.AudioContext) audioContext = new window.AudioContext();

exports['default'] = audioContext;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi9jb3JlL2F1ZGlvLWNvbnRleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OzZCQUN3QixrQkFBa0I7Ozs7O0FBRzFDLElBQUksWUFBWSxDQUFDOztBQUVqQixJQUFJLE1BQU0sQ0FBQyxZQUFZLEVBQ3JCLFlBQVksR0FBRyxJQUFJLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQzs7cUJBRTVCLFlBQVkiLCJmaWxlIjoiZXM2L2NvcmUvYXVkaW8tY29udGV4dC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIG1vbmtleXBhdGNoIG9sZCB3ZWJBdWRpb0FQSVxuaW1wb3J0IG1vbmtleVBhdGNoIGZyb20gJy4vYWMtbW9ua2V5cGF0Y2gnO1xuXG4vLyBleHBvc2VzIGEgc2luZ2xlIGluc3RhbmNlXG52YXIgYXVkaW9Db250ZXh0O1xuXG5pZiAod2luZG93LkF1ZGlvQ29udGV4dClcbiAgYXVkaW9Db250ZXh0ID0gbmV3IHdpbmRvdy5BdWRpb0NvbnRleHQoKTtcblxuZXhwb3J0IGRlZmF1bHQgYXVkaW9Db250ZXh0O1xuIl19