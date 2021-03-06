var app = require('express')();
const express = require("express");
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(80);
// WARNING: app.listen(80) will NOT work here!

app.use(express.static(__dirname));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

//uuid
const uuidv1 = require('uuid/v1');

// initialize variables
var roomId;
var count = 0;

io.on('connection', function(socket){
  
  if (roomId === undefined || count === 0) {
    roomId = uuidv1();
    count = 1;
    let storedId = roomId;
    socket.join(storedId);
    socket.emit('connected');
    socket.on('connected', function(data) {
      console.log('connected ' + storedId);
    });
    socket.on('initialize deck', function(data) {
      socket.broadcast.to(storedId).emit('opponent deck', { deck: data.deck });
    });
    socket.on('grab', function(data){
      socket.broadcast.to(storedId).emit('grab', data);
    });
    socket.on('release', function(data){
      socket.broadcast.to(storedId).emit('release');
    });
    socket.on('select', function(data){
      socket.broadcast.to(storedId).emit('select', data);      
    });
    socket.on('unselect', function(data){
      socket.broadcast.to(storedId).emit('unselect');      
    });
    socket.on('use', function(data){
      socket.broadcast.to(storedId).emit('use', data);      
    });
    socket.on('play', function(data){
      socket.broadcast.to(storedId).emit('play', data);      
    });
    socket.on('drawCard', function(data){
      socket.broadcast.to(storedId).emit('drawCard', data);      
    });
    socket.on('upkeep', function(data){
      socket.broadcast.to(storedId).emit('upkeep', data); 
    });
    socket.on('end', function(data){
      socket.broadcast.to(storedId).emit('end'); 
      console.log('end turn');
    });
    socket.on('win', function() {
      socket.broadcast.to(storedId).emit('lose');
      socket.emit('win');
    })
    socket.on('lose', function() {
      socket.broadcast.to(storedId).emit('win');
      socket.emit('lose');
    })
    socket.on('disconnect', function() {
      io.to(storedId).emit('disconnected');
      console.log('disconnected ' + storedId);
      roomId = undefined;
      count = 0;
    });
  }
  else if (count === 1 && roomId !== undefined) {
    count = 0;
    let storedId = roomId;
    socket.join(storedId);
    socket.emit('connected');
    socket.on('connected', function(data) {
      console.log('connected ' + storedId);
      // emit deck queries to both rooms
      io.to(storedId).emit('initialize deck');
    });
    socket.on('initialize deck', function(data) {
      socket.broadcast.to(storedId).emit('opponent deck', { deck: data.deck });
      // switch player 1's turn boolean to true
      socket.broadcast.to(storedId).emit('end');
    })
    socket.on('grab', function(data){
      socket.broadcast.to(storedId).emit('grab', data);
    });
    socket.on('release', function(data){
      socket.broadcast.to(storedId).emit('release');
    });
    socket.on('select', function(data){
      socket.broadcast.to(storedId).emit('select', data);      
    });
    socket.on('unselect', function(data){
      socket.broadcast.to(storedId).emit('unselect');      
    });
    socket.on('use', function(data){
      socket.broadcast.to(storedId).emit('use', data);      
    });
    socket.on('play', function(data){
      socket.broadcast.to(storedId).emit('play', data);      
    });
    socket.on('drawCard', function(data){
      socket.broadcast.to(storedId).emit('drawCard', data);      
    });
    socket.on('upkeep', function(data){
      socket.broadcast.to(storedId).emit('upkeep', data); 
    });
    socket.on('end', function(data){
      socket.broadcast.to(storedId).emit('end');
      console.log('end turn');
    });
    socket.on('win', function() {
      socket.broadcast.to(storedId).emit('lose');
      socket.emit('win');
    })
    socket.on('lose', function() {
      socket.broadcast.to(storedId).emit('win');
      socket.emit('lose');
    })
    socket.on('disconnect', function() {
      io.to(storedId).emit('disconnected');
      console.log('disconnected ' + storedId);
      roomId = undefined;
      count = 0;
    });
  }
});