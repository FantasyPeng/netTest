var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: 8181 });
wss.on('connection', function(ws) {
    console.log('client connected');
    ws.on('message', function(message) {
        console.log(message);
        var fileContent = [];
        var fileName = "";
        var dataSum = "";
        if (message !== 'getlist') {
            var name = message.split(" ");
            fileName = name[0];
            count = parseInt(name[1]);
        }
        var net = require('net');
        var HOST = '127.0.0.1';
        var PORT = 8124;
        var client = new net.Socket();
        client.connect(PORT, HOST, function() {
            console.log('CONNECTEDLOCAL: ' +
                client.localAddress + ':' + client.localPort);
            console.log('CONNECTED TO: ' + HOST + ':' + PORT);
            client.write(message);
        });

        // 为客户端添加“data”事件处理函数
        // data是服务器发回的数据
        var lengthSum = 0;
        client.on('data', function(data) {
            console.log('DATA: ' + data);
            var dataJson;
            var listData = [];
            dataSum += data.toString();
            var data1 = dataSum.split("$");
            if (data1[1] == "end") {

                var dataA = data1[0].split("\f");
                if (dataA[0] == "list") {
                    dataJson = JSON.parse(dataA[1]);
                    var nameJson = JSON.stringify(dataJson.filename);
                    // console.log('nameJson' + nameJson);
                    ws.send(nameJson);
                    client.destroy();
                } else {
                    for (var i = 0; i < dataA.length - 1; i++) {

                        if (dataA[i][0] == "{") {
                            // console.log('dataA[%s] :%s',i,dataA[i]);
                            var obj = JSON.parse(dataA[i]);
                            listData.push(obj);
                        } else {
                            console.log('ERRORdataA[%s] :%s', i, dataA[i]);
                            break;
                        }
                    }
                    for (var ib = 0; ib < dataA.length - 1; ib++) {
                        var buffer = Buffer.from(listData[ib].contentData);
                        lengthSum += buffer.length;
                        fileContent.push(buffer);
                        console.log(buffer, buffer.length);
                    }
                    console.log("lengthSum" + lengthSum);
                    var bufferSum = Buffer.alloc(lengthSum);
                    var obj1 = {};
                    obj1.filename = fileName;
                    for (var ic = 0; ic < count; ic++) {
                        fileContent[ic].copy(bufferSum, ic * 256, 0);
                    }
                    obj1.filestring = bufferSum;
                    console.log(obj1.filestring.length, bufferSum.length);
                    var json = JSON.stringify(obj1);
                    //console.log("json:" + json,typeof json);
                    ws.send(json);
                    dataSum = "";
                    fileName = "";
                    client.destroy();
                    // var fs = require('fs');
                    // var w_data = new Buffer(fileString);
                    // console.log("filename2" + fileName);
                    // fs.writeFile(__dirname + '/client/' + fileName, w_data, { flag: 'w' }, function(err) {
                    //     if (err) {
                    //         console.error(err);

                    // });  //     } else {
                    //         console.log('写入成功');
                    //     }

                }
            }
        });
        client.on('connect', function(data) {
            console.log('Connect is sccussful');

        });
        // 为客户端添加“close”事件处理函数
        client.on('close', function() {
            console.log('Connection closed');
        });
    });
});
