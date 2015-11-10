'use strict';
angular.module('FileSync')
  .factory('SocketIOService', ['io', '_', '$timeout', function(io, _, $timeout) {
    var socket = io();
    var _onFileChanged = _.noop;
    var _onVisibilityStatesChanged = _.noop;
    var nickname = '';

    socket.on('connect', function() {
      	console.log('connected');
      	nickname = prompt('Entrez votre pseudo:');
        while(nickname == ""){
            nickname = prompt('Entrez votre pseudo (Un vrai):');
        }
      	socket.emit('viewer:new', nickname);
      	//socket.emit('lgd:read', 'message.txt');
    	});
    socket.on('conversation',function(messages){
	socket.emit('viewers', messages);
    });

    socket.on('file:changed', function(filename, timestamp, content) {
      $timeout(function() {
        _onFileChanged(filename, timestamp, content);
      });
    });

    socket.on('users:visibility-states', function(states) {
      $timeout(function() {
        _onVisibilityStatesChanged(states);
      });
    });

    socket.on('error:auth', function(err) {
      // @todo yeurk
      alert(err);
    });

    return {
      sendMessage: function(msg){
	socket.emit('message:new', msg);
      },
      onMessagesUpdated: function(chat) {
        socket.on('message:updated', chat);
      },
      onViewersUpdated: function(f) {
        socket.on('viewers:updated', f);
      },
      onLGDdirUpdated: function(dir){
        socket.on('lgd:dir', dir);
      },
      changeLGDfile: function(path){
        socket.emit('lgd:changeFile', path);
      },
      lgdWrite: function(text) {
        socket.emit('lgd:write', text);
      },
      onLGDUpdated: function(text) {
        socket.on('lgd:updated', text);
      },
      sendCursorPosition: function(position){
        socket.emit('lgd:changeCursor', position);
      },
      onFileChanged: function(f) {
        _onFileChanged = f;
      },

      onVisibilityStatesChanged: function(f) {
        _onVisibilityStatesChanged = f;
      },

      userChangedState: function(state) {
        socket.emit('user-visibility:changed', state);
      }
    };
  }]);
