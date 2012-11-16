// SERVER
var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs');

app.listen(8080);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.writeHead(200);
    res.end(data);
  });
}

sockets = [];
color_matrix = new Array (100);

for(i = 0; i < 100; i++) {
  color_matrix[i] = new Array (160); 
  for(j = 0; j < 160; j++)
      color_matrix[i][j] = {color: "#000000", username: "pai natal"};
}

io.sockets.on('connection', function (socket) {
  sockets.push(socket);
  
  socket.emit('welcome', { matrix: color_matrix });
  
  socket.on('newPixelFromClient', function (data) {
    color_matrix[data.pixelFromClient.y][data.pixelFromClient.x] = {color: data.pixelFromClient.color, username: data.pixelFromClient.username};

    for(i = 0; i < sockets.length; i++)
      sockets[i].emit('newPixelFromServer', { pixel: data.pixelFromClient});
  });

});

io.sockets.on('disconnect', function (socket) {
  for(i = 0; i < sockets.length; i++)
    if(sockets[i] == socket)
      delete sockets[i]
});

