var net = require('net');
var HOST = '127.0.0.1';
var PORT = 8124;
// 创建一个TCP服务器实例，调用listen函数开始监听指定端口
// 传入net.createServer()的回调函数将作为”connection“事件的处理函数
// 在每一个“connection”事件中，该回调函数接收到的socket对象是唯一的
var server = net.createServer();
server.listen(PORT, HOST);
server.on('connection', function(sock) {
    console.log('ServerCONNECTED: ' +
        sock.remoteAddress + ':' + sock.remotePort);
    // 为这个socket实例添加一个"data"事件处理函数
    sock.on('data', function(data) {

        console.log(data.toString());
        var dataString = data.toString();
        if (dataString !== 'getlist') {
            var dataArray = dataString.split(" ");
            var count = parseInt(dataArray[1]);
            var fs = require("fs");
            var readLength = 256;
            fs.readFile(__dirname + '/database/' + dataArray[0],function(err, data) {
                if (err) throw err;
                var pages = parseInt(data.length / readLength) + 1;
                console.log(data,typeof data);
                var bufferArray = [];
                for (var ic = 0; ic < pages; ic++) {
                    var testSum = 0;
                    var buffer = Buffer.alloc(readLength);
                    if (ic != pages - 1) {
                        data.copy(buffer, 0, ic * readLength, ic * readLength + readLength);

                        for (var ib = 0; ib < readLength; ib++) {
                            testSum += buffer[ib];
                        }
                        // console.log(testSum,testSum % 256);
                        testSum = testSum % 256;
                        console.log(buffer.toString());
                        bufferArray.push(buffer.toString() + "@" + testSum);
                    } else {
                        lastData = data.length - readLength * ic;
                        data.copy(buffer, 0, data.length - lastData, data.length);
                        for (var ia = 0; ia < lastData; ia++) {
                            testSum += buffer[ia];
                        }
                        // console.log(buffer.toString());
                        testSum = testSum % 256;
                        bufferArray.push(buffer.slice(0, lastData).toString() + "@" + testSum);
                    }
                }
                for (var i = 0; i < count; i++) {
                    sock.write(dataArray[0].toString() + "@" + "161430131pjf" + i * readLength + "@" + bufferArray[i].toString() + "\f");
                }
                sock.write("$end");
            });
        } else {
            // 返回文件列表数据
            var fs = require('fs');
            var fileNameString = "";
            //遍历文件夹，获取所有文件夹里面的文件信息
            function geFileList(path) {
                var filesList = [];
                readFile(path, filesList);

                return filesList;
            }
            //遍历读取文件
            function readFile(path, filesList) {
                files = fs.readdirSync(path); //需要用到同步读取
                files.forEach(walk);

                function walk(file) {
                    states = fs.statSync(path + '/' + file);
                    if (states.isDirectory()) {
                        readFile(path + '/' + file, filesList);
                    } else {
                        //创建一个对象保存信息
                        var obj = {};
                        obj.size = parseInt(states.size / 256) + 1; //文件大小，以字节为单位
                        obj.name = file; //文件名
                        // obj.path = path + '/' + file; //文件绝对路径
                        //fileNameString += obj.size.toString() + " " + obj.name + ',';
                        filesList.push(obj);
                    }
                }
            }
            var fileName = geFileList(__dirname + '/database/');
            var json = JSON.stringify(fileName);
            console.log("json:" + JSON.stringify(fileName),typeof json);
          //  console.log(fileNameString);
           // sock.write('list' + '$' + fileNameString);
            sock.write('list' + '$' + json);
        }
    });
    // 为这个socket实例添加一个"close"事件处理函数
    sock.on('close', function(data) {
        console.log('CLOSED: ' +
            sock.remoteAddress + ' ' + sock.remotePort);
    });
});
console.log('Server listening on ' + HOST + ':' + PORT);
