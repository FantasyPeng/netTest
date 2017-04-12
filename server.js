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
             obj.size = parseInt(states.size / readLength) + 1; //文件片数
             obj.name = file; //文件名
             filesList.push(obj);
         }
     }
 }

 var readLength = 256;
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
         var objDt = [];
         console.log(data.toString());
         var dataString = data.toString();
         if (dataString !== 'getlist') {
             var dataArray = dataString.split(" ");
             var count = parseInt(dataArray[1]);
             var fs = require("fs");
             fs.readFile(__dirname + '/database/' + dataArray[0], function(err, data) {
                 if (err) throw err;
                 var pages = parseInt(data.length / readLength) + 1;
                 // var dataStringBase = data.toString('base64');
                 console.log(data, typeof data);

                 //var newReadLength = parseInt(dataStringBase.length / pages) + 1;
                 var bufferArray = [];
                 for (var ic = 0; ic < pages; ic++) {
                     var testSum = 0;
                     var buffer = Buffer.alloc(readLength);
                     // var message = Buffer.from("161430131pjf" + ic * readLength);
                     var message = "161430131pjf" + ic * readLength;
                     var objBuffer = {};
                     if (ic != pages - 1) {
                         data.copy(buffer, 0, ic * readLength, ic * readLength + readLength);
                         //var strSlices = dataStringBase.substring(ic * newReadLength, ic * newReadLength + newReadLength);
                         for (var ib = 0; ib < readLength; ib++) {
                             testSum += buffer[ib];
                         }
                         testSum = testSum % 256;
                         message += "testSum";
                         objBuffer.contentData = buffer;
                         objBuffer.message = message;
                         //console.log(strSlices, typeof strSlices);
                         bufferArray.push(objBuffer);
                     } else {
                         var lastData0 = data.length - readLength * ic;
                         //var lastData = dataStringBase.length - newReadLength * ic;
                         data.copy(buffer, 0, data.length - lastData0, data.length);
                         //var strSlices1 = dataStringBase.substring(dataStringBase.length - lastData);

                         for (var ia = 0; ia < lastData0; ia++) {
                             testSum += buffer[ia];
                         }
                         message += "testSum";
                         objBuffer.contentData = buffer.slice(0, lastData0);
                         objBuffer.message = message;
                         //console.log(strSlices1, typeof strSlices1);
                         testSum = testSum % 256;
                         bufferArray.push(objBuffer);
                     }
                 }
                 for (var i = 0; i < count; i++) {
                     var bufferJson = JSON.stringify(bufferArray[i]);
                     console.log("bufferJson:" + bufferJson);
                    // objDt.push(bufferArray[i])
                     sock.write(bufferJson + "\f");
                 }
                 sock.write("$end");
             });
         } else {
             // 返回文件列表数据
             var fileName = geFileList(__dirname + '/database/');
             var content = {};
             content.filename = fileName;
             content.value = "list";
             var json = JSON.stringify(content);
             console.log("json:" + json, typeof json);
             sock.write("list" + "\f" + json + "$end");
         }
     });
     // 为这个socket实例添加一个"close"事件处理函数
     sock.on('close', function(data) {
         console.log('CLOSED: ' +
             sock.remoteAddress + ' ' + sock.remotePort);
     });
 });
 console.log('Server listening on ' + HOST + ':' + PORT);
