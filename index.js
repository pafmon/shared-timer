const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port  = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
    
http.listen(port, () => {
  console.log("Server ready on port " +  port);
});

var t=60;

var ticker = false; 

io.on('connection', (socket) => {
    console.log("New User Connected. Current Number: "+socket.client.conn.server.clientsCount);

    if(ticker == false)
        ticker = setInterval(function () {
            t--;
            console.log(t);
            
        },1000);
        
    socket.on('disconnect', () => {
        console.log("User desconnected. Current Number: "+socket.client.conn.server.clientsCount);
        if(socket.client.conn.server.clientsCount == 0){
            t=60;
            console.log("Ticker stop!")
            clearInterval(ticker); 
            ticker = false;
        }
    });

    socket.on('reset', (msg) => {
        
        io.sockets.emit("reset", msg);
        console.log("Reset: "+t+ "-> "+msg.data);
        t = msg.data;
    });
    
    socket.on('sync', () => {
        io.sockets.emit("reset", {
            data: t,
        });
    });
});


