## 前言
为什么会扯到这个话题，最初是源于在网页上听[QQ音乐](https://y.qq.com/)。

- 播放器处于单独的一个页面
- 当你在另外的一个页面搜索到你满意的歌曲的时候，点击播放或添加到播放队列
- 你会发现，播放器页面做出了响应

这里我又联想到了商城的购物车的场景，这些都涉及到了跨浏览器窗口通讯。

---

## window.name
### 定义
可设置或返回存放窗口的名称的一个字符串。
### 作用
可以在原网页和被打开的网页之间进行数据通信。

---
## 定时器 + 客户端存储
- 定时器：setTimeout/setInterval/requestAnimationFrame
- 客户端存储： cookie/localStorage/sessionStorage/indexDB/chrome的FileSystem

定时器没啥好说的，关于客户端存储如下：

> - cookie: 每次会带到服务端，并且能存的并不大，4kb
> - localStorage/sessionStorage: 一般是5MB，sessionStorage关闭浏览器就和你说拜拜。
> - [indexDB](http://www.ruanyifeng.com/blog/2018/07/indexeddb.html): 这玩意就强大了，不过读取都是异步的，还能存 Blob文件，真的是很high。
> - chrome的[FileSystem](https://www.cnblogs.com/tianma3798/p/6439258.html): Filesystem & FileWriter API,主要是chrome和opera支持。网络应用可以创建、读取、导航用户本地文件系统中的沙盒部分以及向其中写入数据。

---
## [postMessage](https://www.runoob.com/js/met-win-postmessage.html)
### 定义
postMessage() 方法用于安全地实现跨源通信。
### 语法

```
otherWindow.postMessage(message, targetOrigin, [transfer])
```


otherWindow：其他窗口的一个引用，比如 iframe 的 contentWindow 属性、执行 window.open 返回的窗口对象、或者是命名过或数值索引的 window.frames。

message：将要发送到其他 window的数据。

targetOrigin：指定哪些窗口能接收到消息事件，其值可以是 *（表示无限制）或者一个 URI。

transfer：可选，是一串和 message 同时传递的 Transferable 对象。这些对象的所有权将被转移给消息的接收方，而发送一方将不再保有所有权。
> 栗子：https://www.runoob.com/js/met-win-postmessage.html

---
## [StorageEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/StorageEvent)
#### page1:
```
localStorage.setItem('message',JSON.stringify({
    message: '消息',
    from: 'Page 1',
    date: Date.now()
}))
```
#### page2:

```
window.addEventListener("storage", function(e) {
    console.log(e.key, e.newValue, e.oldValue)
});
```
如上， Page 1设置消息， Page 2注册storage事件，就能监听到数据的变化啦。

上面的e就是StorageEvent,有下面特有的属性（都是只读）：

- key ：代表属性名发生变化.当被clear()方法清除之后所有属性名变为null
- newValue：新添加进的值.当被clear()方法执行过或者键名已被删除时值为null
- oldValue：原始值.而被clear()方法执行过，或在设置新值之前并没有设置初始值时则返回null
- storageArea：被操作的storage对象
- url：key发生改变的对象所在文档的URL地址
---
## WebSocket
WebSocket 是 HTML5 开始提供的一种在单个 TCP 连接上进行全双工通讯的协议。当然是有代价的，需要服务器来支持。

对大部分web开发者来说，上面这段描述有点枯燥，其实只要了解以下两点就可以了：

- WebSocket可以在浏览器里使用；
- 支持双向通信
---
## [Broadcast Channel](https://developer.mozilla.org/zh-CN/docs/Web/API/BroadcastChannel)
BroadcastChannel 接口代理了一个命名频道，可以让指定 origin 下的任意 browsing context 来订阅它。它允许同源的不同浏览器窗口，Tab页，frame或者 iframe 下的不同文档之间相互通信。通过触发一个 message 事件，消息可以广播到所有监听了该频道的 BroadcastChannel 对象。
使用起来也很简单, 创建BroadcastChannel, 然后监听事件。 只需要注意一点，渠道名称一致就可以。

#### page1:
```
    var channel = new BroadcastChannel("channel-BroadcastChannel");
    channel.postMessage('Hello, BroadcastChannel!')
```
#### page2:

```
    var channel = new BroadcastChannel("channel-BroadcastChannel");
    channel.addEventListener("message", function(ev) {
        console.log(ev.data)
    });
```

---
## [SharedWorker](https://developer.mozilla.org/zh-CN/docs/Web/API/SharedWorker)
这是Web Worker之后出来的共享的Worker，不通页面可以共享这个Worker。

MDN这里给了一个比较完整的例子[simple-shared-worker](https://github.com/mdn/simple-shared-worker)。
这里来个插曲，Safari有几个版本支持这个特性，后来又不支持啦，还是你Safari，真是6。

虽然，SharedWorker本身的资源是共享的，但是要想达到多页面的互相通讯，那还是要做一些手脚的。
先看看MDN给出的例子的ShareWoker本身的代码：

```
onconnect = function(e) {
  var port = e.ports[0];

  port.onmessage = function(e) {
    var workerResult = 'Result: ' + (e.data[0] * e.data[1]);
    port.postMessage(workerResult);
  }

}
```
上面的代码其实很简单，port是关键，这个port就是和各个页面通讯的主宰者，既然SharedWorker资源是共享的，那好办，把port存起来就是啦。
看一下，如下改造的代码：

```
var portList = [];

onconnect = function(e) {
  var port = e.ports[0];
  ensurePorts(port);
  port.onmessage = function(e) {
    var data = e.data;
    disptach(port, data);
  };
  port.start();
};

function ensurePorts(port) {
  if (portList.indexOf(port) < 0) {
    portList.push(port);
  }
}

function disptach(selfPort, data) {
  portList
    .filter(port => selfPort !== port)
    .forEach(port => port.postMessage(data));
}
```
SharedWorker就成为一个纯粹的订阅发布者啦，哈哈。

---
## [MessageChannel](https://developer.mozilla.org/zh-CN/docs/Web/API/MessageChannel)
Channel Messaging API的 MessageChannel 接口允许我们创建一个新的消息通道，并通过它的两个MessagePort 属性发送数据。

其需要先通过 postMessage先建立联系。

MessageChannel的基本使用：

```
var channel = new MessageChannel();
var para = document.querySelector('p');

var ifr = document.querySelector('iframe');
var otherWindow = ifr.contentWindow;

ifr.addEventListener("load", iframeLoaded, false);

function iframeLoaded() {
  otherWindow.postMessage('Hello from the main page!', '*', [channel.port2]);
}

channel.port1.onmessage = handleMessage;
function handleMessage(e) {
  para.innerHTML = e.data;
}   
```
至于在线的例子，MDN官方有一个版本 [MessageChannel 通讯](https://mdn.github.io/dom-examples/channel-messaging-basic/)。









