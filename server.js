'use strict';

var io = require('socket.io');
var express = require('express');
var path = require('path');
var app = express();
var _ = require('lodash');
var logger = require('winston');
var config = require('./config')(logger);
var fs = require('fs');

app.use(express.static(path.resolve(__dirname, './public')));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

var server = app.listen(config.server.port, function() {
  logger.info('Server listening on %s', config.server.port);
});


var sio = io(server);

sio.set('authorization', function(handshakeData, accept) {
  // @todo use something else than a private `query`
  handshakeData.isAdmin = handshakeData._query.access_token === config.auth.token;
  accept(null, true);
});


function Message(nickname, msg) {
  this.nickname = nickname;
  this.msg = msg;
  console.log('Nouvel objet Message créé');
}

function Viewers(sio) {
  var data = [];

  function notifyChanges() {
    sio.emit('viewers:updated', data);
  }

  return {
    add: function add(viewer) {
      data.push(viewer);
      notifyChanges();
    },
    remove: function remove(viewer) {
      var idx = data.indexOf(viewer);
      if (idx > -1) {
        data.splice(idx, 1);
      }
      notifyChanges();
      console.log('-->', data);
    }
  };
}

var viewers = Viewers(sio);


// @todo extract in its own
sio.on('connection', function(socket) {

  // console.log('nouvelle connexion', socket.id);
  socket.on('viewer:new', function(name) {
    socket.viewer = { nickname: name, cursorPosition: -1 };
    viewers.add(socket.viewer);
    console.log('new viewer with nickname %s', socket.viewer.nickname, viewers);
  });

  socket.on('message:new', function(message) {
    var message = new Message(socket.viewer.nickname, message);
    sio.emit('message:updated', message);
    console.log('Nouveau message: '+ message);
  });

  socket.on('lgd:write', function(file) {
    fs.writeFileSync(file.name, file.text, "utf8");
    console.log("Modification de " + file.name);
    socket.broadcast.emit('lgd:updated', file);
  });

  socket.on('lgd:read', function(fileName) {
     var text = fs.readFileSync(fileName, "utf8");
     console.log(text);
     socket.emit('lgd:updated', { name: fileName, text: text });
   });

  socket.on('disconnect', function() {
    viewers.remove(socket.viewer);
  });

  socket.on('file:changed', function() {
    if (!socket.conn.request.isAdmin) {
      // if the user is not admin
      // skip this
      return socket.emit('error:auth', 'Unauthorized :)');
    }

    // forward the event to everyone
    sio.emit.apply(sio, ['file:changed'].concat(_.toArray(arguments)));
  });

  socket.visibility = 'visible';

  socket.on('user-visibility:changed', function(state) {
    socket.visibility = state;
    sio.emit('users:visibility-states', getVisibilityCounts());
  });
});

function getVisibilityCounts() {
  return _.chain(sio.sockets.sockets).values().countBy('visibility').value();
}
