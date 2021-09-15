//获得WebSocketServerr类型
var WebSocketServer = require('ws').Server;
//创建WebSocketServer对象实例，监听指定端口
var wss = new WebSocketServer({ port:8080 });
//创建保存所有已连接到服务器的客户端对象的数组
var clients=[];

//为服务器添加connection事件监听，当有客户端连接到服务端时，立刻将客户端对象保存进数组中
wss.on('connection', function (client) {
      console.log("一个客户端连接到服务器")
      if(clients.indexOf(client)===-1){//如果是首次连接
            clients.push(client) //就将当前连接保存到数组备用
            console.log("有"+clients.length+"个客户端在线")
       //为每个client对象绑定message事件，当某个客户端发来消息时，自动触发
       client.on('message',function(msg){
             console.log('收到消息: '+msg)
            //遍历clients数组中每个其他客户端对象，并发送消息给其他客户端
            for(var c of clients){
                  if(c!=client){//把消息发给别人
                        c.send(msg);
                  }
            }
       })

 }
})