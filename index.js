const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port  = process.env.PORT || 5000;
const masterKey  = process.env.MASTERKEY || "supersecret";
var sessionKey  = "";

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

console.log("MasterKey: <"+masterKey+">");
console.log("SessionKey: <"+sessionKey+">");

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
            sessionKey = "";
        }
    });



    socket.on('setKey', (msg) => {
        

        if(msg.newKey == masterKey){
            io.sockets.emit("keyCleared");
            sessionKey = "";
            return;
        }
        
        console.log("SessioKey Change Request: <"+ sessionKey+ "> -> <"+msg.newKey + "> with key <"+msg.key+">");

        if(msg.newKey == sessionKey || msg.key == sessionKey || sessionKey == "") {
            sessionKey = msg.newKey;
            if (sessionKey != "")
                io.sockets.emit("keyChanged", {
                    successToken : msg.successToken
                });
            else
                io.sockets.emit("keyCleared",);

        } else {
            
            io.sockets.emit("keyUnchanged", {
                successToken : msg.successToken
            });
            
            console.log("Dennied!");
        }
    });

    socket.on('reset', (msg) => {

        console.log("Reset Request: "+t+ "-> "+msg.data + " with key <"+msg.key+">");

        if(msg.key == masterKey || msg.key == sessionKey) {
            t = msg.data;
            io.sockets.emit("reset", msg);
        } else {
            console.log("Dennied!");
        }
            

    });
    
    socket.on('sync', () => {
        io.sockets.emit("reset", {
            data: t,
        });
    });
});


