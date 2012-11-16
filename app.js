var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

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
color_matrix = [100][160];

io.sockets.on('connection', function (socket) {
  sockets.push(socket);
  
  socket.emit('welcome', { matrix: color_matrix });
  
  socket.on('newPixelFromClient', function (pixelFromClient) {
    color_matrix[pixelFromClient.y][pixelFromClient.x] = pixelFromClient.color;
    for(i = 0; i < sockets.length; i++)
      sockets[i].emit('newPixelFromServer', { pixel: pixelFromClient});
  });
});

io.sockets.on('disconnect', function (socket) {
  for(i = 0; i < sockets.length; i++)
    if(sockets[i] == socket)
      delete sockets[i]
});

