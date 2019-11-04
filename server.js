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
  let player1Deck;
  let player1Hand;
  let player1Field;
  let player2Deck;
  let player2Hand;
  let player2Field;
  
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
      socket.broadcast.to(storedId).emit('grab', {storedId});
    });
    socket.on('select', function(data){
      socket.broadcast.to(storedId).emit('select');      
    });
    socket.on('use', function(data){
      socket.broadcast.to(storedId).emit('use');      
    });
    socket.on('play', function(data){
      socket.broadcast.to(storedId).emit('play');      
    });
    socket.on('drawCard', function(data){
      socket.broadcast.to(storedId).emit('draw');      
    });
    socket.on('end', function(data){
      socket.broadcast.to(storedId).emit('end');  
    });
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
    })
    socket.on('grab', function(data){
      socket.broadcast.to(storedId).emit('grab', {storedId});
    });
    socket.on('select', function(data){
      socket.broadcast.to(storedId).emit('select');      
    });
    socket.on('use', function(data){
      socket.broadcast.to(storedId).emit('use');      
    });
    socket.on('play', function(data){
      socket.broadcast.to(storedId).emit('play');      
    });
    socket.on('drawCard', function(data){
      socket.broadcast.to(storedId).emit('draw');      
    });
    socket.on('end', function(data){
      socket.broadcast.to(storedId).emit('end');  
    });
    socket.on('disconnect', function() {
      io.to(storedId).emit('disconnected');
      console.log('disconnected ' + storedId);
      roomId = undefined;
      count = 0;
    });
  }
});