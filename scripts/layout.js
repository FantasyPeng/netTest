function insertAfter(newElement, targetElement) {
    var parent = targetElement.parentNode;
    if (parent.lastChild == targetElement) {
        parent.appendChild(newElement);
    } else {
        parent.insertBefore(newElement, targetElement.nextSibling);
    }
}

function highlightRows() {
    // body... 
    if (!document.getElementsByTagName) return false;
    var rows = document.getElementsByTagName("tr");
    for (var i = 0; i < rows.length; i++) {
        rows[i].onmouseover = function() {
            this.style.fontWeight = "bold";
        };
        rows[i].onmouseout = function() {
            this.style.fontWeight = "normal";
        };
    }
}

function stripeTable() {
    if (!document.getElementsByTagName) return false;
    var tables = document.getElementsByTagName("table");
    var odds, rows;
    for (var i = 0; i < tables.length; i++) {
        odd = false;
        rows = tables[i].getElementsByTagName("tr");
        for (var j = 0; j < rows.length; j++) {
            if (odd === true) {
                rows[j].style.background = "#8c92a0";
                odd = false;
            } else {
                odd = true;
            }
        }
    }
}

function changeSlices() {
    var select = document.getElementById("select");
    var newSlices = dataAl[select.selectedIndex].size;
    var mySelect2 = document.getElementById("slices");
    mySelect2.options.length = 0;
    for (var i = 1; i <= newSlices; i++) {
        mySelect2.options.add(new Option(i));
    }
}

function changeAccept() {
    var fileIndex = $("#select").get(0).selectedIndex;
    var acceptSlices = $("#slices").val();
    var mytable = document.getElementsByTagName("table");
    mytable[0].rows[fileIndex + 1].cells[2].innerText = acceptSlices;
}

function createForm(data) {

    var mySelect = document.getElementById("select");
    var mySelect2 = document.getElementById("slices");
    for (var i = 0; i < data.length; i++) {
        mySelect.options.add(new Option(data[i].name));
    }
    var slices = data[0].size;
    for (var i = 1; i <= slices; i++) {
        mySelect2.options.add(new Option(i));
    }
}

function createTable(data) {
    var table = document.createElement('table');
    table.setAttribute("class", "table");
    var tbody = document.createElement('tbody');
    var tr1 = document.createElement('tr');
    var th0 = document.createElement('th');
    var inner0 = document.createTextNode("Filename");
    th0.appendChild(inner0);
    tr1.appendChild(th0);
    var th1 = document.createElement('th');
    var inner1 = document.createTextNode("AllSlices");
    th1.appendChild(inner1);
    tr1.appendChild(th1);
    var th2 = document.createElement('th');
    var inner2 = document.createTextNode("Accept Slices");
    th2.appendChild(inner2);
    tr1.appendChild(th2);
    tbody.appendChild(tr1);
    for (var i = 0; i < data.length; i++) {
        var tr = document.createElement('tr');
        for (var j = 0; j < 3; j++) {
            var td = document.createElement('td');
            if (j == 0) {
                var inner = document.createTextNode(data[i].name);
            } else if (j == 1) {
                var inner = document.createTextNode(data[i].size);
            } else {
                var inner = document.createTextNode("0");
            }
            td.appendChild(inner);
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    document.getElementsByTagName("body")[0].appendChild(table);
    highlightRows();
    stripeTable();
    createForm(data);
}

var dataAl = {};
var ws = new WebSocket("ws://localhost:8181");
ws.onopen = function(e) {
    console.log('Connection to server opened');
    ws.send("getlist");
};

function sendMessage() {
    var favDialog = document.getElementById('favDialog');
    favDialog.showModal();
    console.log("select:" + $("#select").val());
    console.log("slices:" + $("#slices").val());
    var message = $("#select").val() + " " + $("#slices").val();
    ws.send(message);
}

ws.onmessage = function(e) {
    console.log("in onmessage:", e.data);
    var data = JSON.parse(e.data);

    //  若返回数据为文件列表
    if (data.length) {
        dataAl = data;
        createTable(data);
        // appendLog(data.type, data.nickname, data.message);            
    } else { //  若返回数据为文件内容
        var fileName = data.filename;
        var fileContent = data.filestring.data;
        console.log(fileContent);
        var ab = toArrayBuffer(fileContent);

        // var fileContent1 = new ArrayBuffer(fileContent, 'base64');
        // var str = fileContent1.toString();
        //处理异常,将ascii码小于0的转换为大于0
        // var binary_string = window.atob(fileContent);
        // var len = binary_string.length;

        // var bytes = new Uint8Array(len);
        // for (var i = 0; i < len; i++) {
        //     bytes[i] = binary_string.charCodeAt(i);
        // }
        //console.log("str:" + str);
        var favDialog = document.getElementById('favDialog');
        favDialog.close();

        createAndDownloadFile(fileName, ab);
        changeAccept();
    }
};

function toArrayBuffer(buffer) {

    // 创建一个缓存对象，长度等于buffer.length
    var ab = new ArrayBuffer(buffer.length);
    // 创建一个Uint8类型的数组对象。
    var view = new Uint8Array(ab);

    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i]; // 把buffer的数据拷贝到ab缓存内。
    }
    return ab; // 返回新的 ArrayBuffer对象。
}
//实现下载文件
function createAndDownloadFile(fileName, content) {
    var aTag = document.createElement('a');
    var blob = new Blob([content]);
    aTag.download = fileName;
    aTag.href = URL.createObjectURL(blob);
    aTag.click();
    URL.revokeObjectURL(blob);
    var favDialog = document.getElementById('favDialog1');
    favDialog.showModal();
}
function closeThe () {
     var favDialog1 = document.getElementById('favDialog1');
     favDialog1.close();
}
