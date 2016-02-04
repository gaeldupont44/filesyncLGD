'use strict';

var io = require('socket.io');
var express = require('express');
var path = require('path');
var app = express();
var _ = require('lodash');
var logger = require('winston');
var config = require('./config')(logger);
var fs = require('fs');

var pathLGD = path.resolve(__dirname, process.argv[2]);
if (!pathLGD) {
  logger.error("Usage: node server.js /path/to/directory");
  process.exit(1);
}

logger.info('Like Google Docs listening on %s', pathLGD);

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
var dirLGD = getAllLGDFiles(pathLGD);

function getAllLGDFiles(folder) {
    var fileContents = fs.readdirSync(folder),
        fileTree = [],
        stats;

    fileContents.forEach(function (fileName) {
        stats = fs.lstatSync(folder + '/' + fileName);

        if (stats.isDirectory()) {
            fileTree.push({
                name: fileName,
                path: folder + "/" + fileName,
                children: getAllLGDFiles(folder + '/' + fileName)
            });
        } else {
            fileTree.push({
                name: fileName,
                path: folder + '/' + fileName
            });
        }
    });

    return fileTree;
};

function fileExists(filePath){
    try{
        return fs.statSync(filePath).isFile();
    }catch (err){
        return false;
    }
};

function dirExists(filePath){
    try{
        return fs.statSync(filePath).isDirectory();
    }catch (err){
        return false;
    }
};

function deleteFolderRecursive(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else {
                // delete file
                fs.unlinkSync(curPath);
                sio.emit('lgd:fileRemoved', curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

function Message(nickname, msg) {
  this.nickname = nickname;
  this.content = msg;
};

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
    updateCFP: function updateCFP(viewer, path) {
      var idx = data.indexOf(viewer);
      data[idx].currentFilePath = path;
      notifyChanges();
    },
    updatePos: function updatePos(viewer, position) {
      var idx = data.indexOf(viewer);
      data[idx].cursorPosition = position;
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
    socket.viewer = { nickname: name, currentFilePath: '', cursorPosition: -1, };
    viewers.add(socket.viewer);
    console.log('new viewer with nickname %s', socket.viewer.nickname, viewers);
    socket.emit('lgd:dir', dirLGD);
  });

  socket.on('message:new', function(message) {
    var message = new Message(socket.viewer.nickname, message);
    sio.emit('message:updated', message);
  });

  //Write in the file
  socket.on('lgd:write', function(text) {
    if(socket.viewer.currentFilePath !== null){
      if(fileExists(socket.viewer.currentFilePath)){
        fs.writeFileSync(socket.viewer.currentFilePath, text, "utf8");
        console.log(socket.viewer.nickname + " wrote on " + socket.viewer.currentFilePath);
        socket.broadcast.to(socket.viewer.currentFilePath).emit('lgd:updated', text);
      }
    }
  });
  //Create new root directory
  socket.on('lgd:createRootDir', function(name) {
     if(name !== null && !dirExists(pathLGD + '/' + name) && name.indexOf('/') === -1){
       console.log("Root directory created by " + socket.viewer.nickname + ": " + pathLGD + '/' + name);
       fs.mkdirSync(pathLGD + '/' + name);
       dirLGD = getAllLGDFiles(pathLGD);
       sio.emit('lgd:dir', dirLGD);
     }
  });
  //Create new directory
  socket.on('lgd:createDir', function(dir) {
     if(path !== null && !dirExists(dir.path + '/' + dir.name) && dir.name.indexOf('/') === -1){
       console.log("Directory created by " + socket.viewer.nickname + ": " + dir.path + '/' + dir.name);
       fs.mkdirSync(dir.path + '/' + dir.name);
       dirLGD = getAllLGDFiles(pathLGD);
       sio.emit('lgd:dir', dirLGD);
     }
  });
  //Remove a directory
  socket.on('lgd:removeDir', function(path) {
     if(path !== null){
       console.log("Directory removed by " + socket.viewer.nickname + ": " + path);
       deleteFolderRecursive(path);
       dirLGD = getAllLGDFiles(pathLGD);
       sio.emit('lgd:dir', dirLGD);
     }
  });
  //Create new root directory
  socket.on('lgd:createRootFile', function(name) {
     if(name !== null && !fileExists(pathLGD + '/' + name) && name.indexOf('/') === -1){
       console.log("Root file created by " + socket.viewer.nickname + ": " + name);
       fs.writeFileSync(pathLGD + '/' + name, '', "utf8");
       dirLGD = getAllLGDFiles(pathLGD);
       sio.emit('lgd:dir', dirLGD);
     }
  });
  //Create new file
  socket.on('lgd:createFile', function(file) {
     if(path !== null && !fileExists(file.path + '/' + file.name) && file.name.indexOf('/') === -1){
       console.log("File created by " + socket.viewer.nickname + ": " + file.path + '/' + file.name);
       fs.writeFileSync(file.path + '/' + file.name, '', "utf8");
       dirLGD = getAllLGDFiles(pathLGD);
       sio.emit('lgd:dir', dirLGD);
     }
  });
  //Remove a file
  socket.on('lgd:removeFile', function(path) {
     if(path !== null){
       console.log("File removed by " + socket.viewer.nickname + ": " + path);
       fs.unlinkSync(path);
       sio.emit('lgd:fileRemoved', path);
       dirLGD = getAllLGDFiles(pathLGD);
       sio.emit('lgd:dir', dirLGD);
     }
  });
  //Change the file to write
  socket.on('lgd:changeFile', function(path) {
     if(path !== null){
      socket.leave(socket.viewer.currentFilePath);
      socket.join(path);
      console.log(socket.viewer.nickname + ' change his current file to: ' + path);
      viewers.updateCFP(socket.viewer, path);
      socket.viewer.currentFilePath = path;
      var text = fs.readFileSync(path, "utf8");
      socket.emit('lgd:updated', text);
     }
  });
  //Change the value of the caret position of the viewer
  socket.on('lgd:changeCursor', function(position) {
    if(socket.viewer != null){
      viewers.updatePos(socket.viewer, position);
      socket.viewer.cursorPosition = position;
    }
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
