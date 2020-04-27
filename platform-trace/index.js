

const express = require('express');
const raw = require('raw-socket');
const app = express();
const Server = require('http').Server;
const server = new Server(app);

server.listen(2099);

// __dirname is used here along with package.json.pkg.assets
// see https://github.com/zeit/pkg#config and
// https://github.com/zeit/pkg#snapshot-filesystem
app.use('/', express.static(__dirname + '/views'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});
app.get('/trace', function (req, res) {
  const error = (o) => {
    console.error(o);
    res.json({
      error: JSON.stringify(o, null, 2)
    });
  };
  const success = (o) => {
    console.log('resolved', o);
  };
  ping(res).then(success).catch(error);
});

function ping(response) {
  return new Promise((resolve, reject) => {
    const target = '8.8.8.8';
    const count = 1;

    const outpu = (str) => {
      console.log(str);
      response.end(`raw socket was successful, ${Date.now()}: ${str}`);
    };

    const options = {
      protocol: raw.Protocol.ICMPv6,
      addressFamily: raw.AddressFamily.IPv6
    };

    const socket = raw.createSocket(options);

    socket.on('close', function () {
      resolve();
    });

    socket.on('error', function (error) {
      console.error('socket error', error);
      outpu(error);
      reject(error);
    });

    socket.on('message', function (buffer, source) {
      outpu('received ' + buffer.length + ' bytes from ' + source);
      outpu('data: ' + buffer.toString('hex'));
    });

    // ICMPv6 echo (ping) request
    const buffer = Buffer.from([
      0x80, 0x00, 0x00, 0x00, 0x00, 0x01, 0x0a, 0x09,
      0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68,
      0x69, 0x6a, 0x6b, 0x6c, 0x6d, 0x6e, 0x6f, 0x70,
      0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77, 0x61,
      0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69]);

    raw.writeChecksum(buffer, 2, raw.createChecksum(buffer));

    function ping6() {
      for (let i = 0; i < count; i++) {
        socket.send(buffer, 0, buffer.length, target, function (error, bytes) {
          if (error) {
            outpu(error.toString());
            reject(error);
          } else {
            outpu('sent ' + bytes + ' bytes to ' + target);
            socket.close();
          }
        });
      }
    }

    ping6();
  });
}
