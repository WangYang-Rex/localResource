# 静态资源本地化缓存方案
### 使用
引入 localResource.js
```js
<script src="https://g.alicdn.com/dingding/dingtalk-pc-api/2.7.0/index.js" type="text/javascript" charset="utf-8" ></script>
```

在html中加入下面的代码
```
window.localResource.init({
    noCache: false,
    version: '20170901',
    resourceList: [
        '//g.alicdn.com/platform/tingle-ui/1.1.12/salt-ui.min.css',
        '//g.alicdn.com/platform/c/??jquery/1.11.3/dist/jquery.min.js,lodash/4.6.1/lodash.min.js,react/0.14.3/react-with-addons.min.js,react/0.14.3/react-dom.min.js,react-router/2.8.1/umd/ReactRouter.min.js,reflux/5.0.4/dist/reflux.min.js,lie/3.0.2/dist/lie.polyfill.min.js,natty-storage/1.1.1/dist/natty-storage.min.js,natty-fetch/2.2.0/dist/natty-fetch.pc.min.js',
        '//g.alicdn.com/dingding/dingtalk-pc-api/2.7.0/index.js',
        '//g.alicdn.com/platform/tingle-ui/1.1.12/salt-ui.min.js',
        './app.js',
        './app.css'
    ]
})
```