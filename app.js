// DATABASE
var pg = require('pg'); 
var conString = "pg://postgres:12345@localhost/codebits";

//error handling omitted
var client = new pg.Client(conString);
client.connect();

// SERVER
var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs');

app.listen(8080);

function handler (req, res) {

fs.readFile(__dirname + '/login.html',
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

for(i = 0; i < 200; i++) {
  color_matrix[i] = new Array (160); 
  for(j = 0; j < 320; j++)
      color_matrix[i][j] = {color: "#000000", username: "no_avatar"};
}

io.sockets.on('connection', function (socket) {
  sockets.push(socket);
  
  socket.emit('welcome', { matrix: color_matrix });
  
  socket.on('newPixelFromClient', function (data) {

    color_matrix[data.pixelFromClient.y][data.pixelFromClient.x] = {color: data.pixelFromClient.color, username: data.pixelFromClient.username};
    
    client.query({
      name: 'insert pixel',
      text: "INSERT INTO pixel(x, y, color, username) values($1, $2, $3, $4)",
      values: [data.pixelFromClient.x, data.pixelFromClient.y, data.pixelFromClient.color, data.pixelFromClient.username]
    });

    for(i = 0; i < sockets.length; i++)
      sockets[i].emit('newPixelFromServer', { pixelFromServer: data.pixelFromClient});
  });

});

io.sockets.on('disconnect', function (socket) {
  for(i = 0; i < sockets.length; i++)
    if(sockets[i] == socket)
      delete sockets[i]
});

count = 1;
setTimeout(function() {
  var query = client.query('SELECT * FROM pixel');
  query.on('row', function(row) {

    setTimeout(function() {
      for(i = 0; i < sockets.length; i++) {
        sockets[i].emit('newPixelFromServer', { pixelFromServer : { x : row.x, y : row.y, color : row.color, username : row.username}});

      }
      console.log("FOI");
    }, 1*(count+1));
    count++;
    });
}, 20000);

