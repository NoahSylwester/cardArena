var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(80);
// WARNING: app.listen(80) will NOT work here!

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
    socket.on('connected', function() {
      console.log('connected ' + storedId);
    });
    socket.on('grab', function(data){
      socket.broadcast.to(storedId).emit('grab', {storedId});
      console.log(storedId);
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
    socket.on('draw', function(data){
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
    socket.on('connected', function() {
      console.log('connected ' + storedId);
    });
    socket.on('grab', function(data){
      socket.broadcast.to(storedId).emit('grab', {storedId});
      console.log(storedId);
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
    socket.on('draw', function(data){
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