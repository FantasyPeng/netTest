var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: 8181 });
wss.on('connection', function(ws) {
    console.log('client connected');
    ws.on('message', function(message) {
        console.log(message);
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
        var fileString = "";
        var fileName = "";
        // 为客户端添加“data”事件处理函数
        // data是服务器发回的数据

        client.on('data', function(data) {
            console.log('DATA: ' + data,typeof data);
            var dataString = data.toString();
            var dataStringArray = dataString.split("$");

            if (dataStringArray[0] != 'list') {

                var dataStiringArray2 = dataStringArray[0].split("\f");
                // console.log(dataStiringArray2.length);
                for (var ic = 0; ic < dataStiringArray2.length - 1; ic++) {
                    var dataStiringArray3 = dataStiringArray2[ic].split("@");
                    //console.log(dataStiringArray3[0], ic);
                    if (ic === 0) {
                        fileName = "";
                        fileName += dataStiringArray3[0];
                        // console.log("filename1" + fileName);
                    }
                    if (dataStiringArray3[2] != undefined)
                        fileString += dataStiringArray3[2];
                }
                if (dataStringArray[1] == 'end') {
                    
                    var obj = {};
                    obj.filename = fileName;
                    obj.filestring = fileString;
                    var json = JSON.stringify(obj);
                    console.log("json:" + json,typeof json);
                    ws.send(json);

                    // var fs = require('fs');
                    // var w_data = new Buffer(fileString);
                    // console.log("filename2" + fileName);
                    // fs.writeFile(__dirname + '/client/' + fileName, w_data, { flag: 'w' }, function(err) {
                    //     if (err) {
                    //         console.error(err);
                    //     } else {
                    //         console.log('写入成功');
                    //     }
                    // });
                    fileString = "";
                    fileName = "";
                    client.destroy();
                }
            } else {            	
                ws.send(dataStringArray[1]);
                client.destroy();
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

