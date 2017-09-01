var localResource = {
    noCache: false,  //是否不使用本地缓存
    version: '',
    _localStorageSupport: window.localStorage ? 1 : 0,
    _AjaxList:[],  //需要ajax获取资源的文件
    _elmHead: document.getElementsByTagName('head')[0], 
    /**
     * 获取本地资源列表缓存的版本
     * 
     * @param {obj} path            路径
     * @returns {String} version    版本号
     */
    getLocVersion: function (path){
        var ls = window.localStorage,
            sourcemap = JSON.parse(ls.getItem('localResource::sourcemap'));
        var item = sourcemap[path.filename];
        return item ? item.version : ''
    },
    /**
     * 获得本地的内容资源
     * @param {String} mixFileName		经过处理url 后的key
     * @return {Boolean} isExist		是否存在
     */
    getContent:function(filename) {
        if (!filename) { return 0; }
        return window.localStorage.getItem('localResource::' + filename);
    },

    /**
     * 
     * 将需要保存的代码内容保存到本地或者替换本地之前的内容
     * @param {obj} path				        路径
     * @param {content} content					当前的代码的内容
     * @param {Function} callback				保存完成之后的回调
     */
    saveContent:function(path, content, callback) {
        var ls = window.localStorage,
            sourcemap = JSON.parse(ls.getItem('localResource::sourcemap'));
        
        //不管本地存不存在，更新sourcemap，并把资源保存在本地
        sourcemap[path.filename] = path;
        ls.setItem('localResource::'+path.filename, content); 
        ls.setItem('localResource::sourcemap', JSON.stringify(sourcemap));

        callback && callback();
    },
    /**
     * 手动获取存储的js
     */
    backup:function(cb){
        var _this = this;
        // if(!window.Ajax){
        //     console.log('Ajax error');
        //     return false;
        // }
        // var need = this._AjaxList;
        // if(!need.length){
        //     console.log('_AjaxList null');
        //     return false;
        // }

        // while(need.length){
        //     var url = need.pop();
        //     var path = this.urlParse(url);
            
        //     (function(path){
        //         var url = path.sourceUrl;
                
        //         window.Ajax({
        //             url: url,
        //             dataType: 'text',
        //             success: function (content) {
        //                 localResource.saveContent(path, content, function () {
        //                     console.time('资源 ' + url + ' 的保存时间');
        //                 }, function () {
        //                     console.time('资源 ' + url + ' 的保存时间');
        //                     console.log('保存资源 ' + url + ' 成功');
        //                     if(!need.length){
        //                         console.time('资源全部的保存时间');
        //                         console.log('保存全部资源成功');
        //                         cb && cb();
        //                     }
        //                 });
        //             },
        //             error: function () {
        //                 console.log('读取资源: ' + url + ',  读取失败');
        //             }
        //         });
        //     })(path);
        // }
    },
    /**
    *
    * 根据代码获取的url解析成 filename(含version)＋后缀的格式
    * @param {String} url							代码文件的url
    * @return {String} mixedFileName				返回当前文件名＋后缀
    * @example filename_version_siffix
    */
    urlParse: function(url) {
        //url: '//g.alicdn.com/platform/tingle-ui/1.1.12/salt-ui.min.js'
        var siffixIdx = url.lastIndexOf('.'),
            siffixStr = url.slice(siffixIdx, url.length),
            siffix = siffixStr.slice(1, siffixStr.indexOf('?') !== -1 ? siffixStr.indexOf('?') : siffixStr.length);
        var filename = url.substr(url.lastIndexOf('/')+1); //salt-ui.min.js
        
        return {
            sourceUrl: url,
            filename: filename,
            version: this.version, //目前所有资源统一用一个version
            siffix: siffix
        };
    },
    /**
     * 
     * 创建一个link 或者 script 标签
     * @param {String} resource 资源的地址
     * @param {String} type 资源的类型
     */
    createNode: function(resource, type) {
        var node ;
        if (type === 'css') {
            node = document.createElement('link');
            node.href = resource + '';
            node.type = 'text/css';
            node.rel = "stylesheet";
        }

        if (type === 'js') {
            node = document.createElement('script');
            node.type = 'text/javascript';
            node.charset = 'utf-8';
            node.src = resource;
            // 设置可以跨域
            node.crossorigin = 'crossorigin';
        }
        return node;
    },
    
    /**
     * 
     * 读取本地的资源
     * @param {String} siffix		    类型
     * @param {Function} beforeLoad		当资源预备渲染出去的时候
     * @param {Function} callback		资源渲染完成的回调
     * @return {Boolean|HTMLElement}	返回资源状态
     */
    loadSourceByContent: function (siffix, content,before) {
        var head = this._elmHead;
        var doc = document,
            elm = doc.createElement(siffix === 'css' ? 'style' : 'script');
        before && before();
        elm.appendChild(doc.createTextNode(content));
        elm.type = 'text/' + (siffix === 'css' ? 'css' : 'javascript');
        head.appendChild(elm);
    },
    /**
     * src获取资源
     */
    loadSourceBySRC:function(url, cb){
        var head = this._elmHead;
        var _this = this;
        // 这里暂时只考虑 webkit 为主的浏览器操作. 所以事件使用 onload.
        // 另外我们约定目前的资源后缀必须是原后缀, 如 css || js
        var path = this.urlParse(url);
        // 使用src
        var node = this.createNode(url, path.siffix);
        if (path.siffix === 'css') {
            cb && cb(null, url);
        }
        if (path.siffix === 'js') {
            node.onload = function() {
                cb && cb(null, url);
            };
            node.onerror = function(evt) {
                cb && cb('error', url);
                console.log('scripterror', 'Script error for: ' + data);
            };
        }
        if (node) head.appendChild(node);
        // ajax请求资源并保存到本地
        ajax({
            url: url,
            success: function(res){
                console.log('load success', url)
                // _this.loadSourceByContent(path.siffix, res);
                _this.saveContent(path, res);
            },
            error: function(error){
                console.log('load error', url)
                
            }
        })
    },
    /**
     *  
     * 资源加载与下一步的处理
     * @private
     * @param {Array} url					资源的数据列表
     * @param {Function} function				当资源加载完成的回调
     */
    _require: function(url, cb) {
        var _this = this;
        var locVetion, content;
        
        console.log('加载资源: ' + url);
        var path = this.urlParse(url);
        if (!path.version) {
            console.log('资源' + url + '没有获取到版本');
        }
        
        if(!_this.noCache && _this._localStorageSupport){
            locVetion = localResource.getLocVersion(path);
            content = localResource.getContent(path.filename);
        }
        
        if (locVetion && path.version === locVetion && content) { // 本地存在内容
            this.loadSourceByContent(path.siffix, content, function () {
                // localResource.saveContent(path, content);
            });
            if (cb) cb(null, url);
        } else { // 本地不存在
            console.log('加载资源: ' + url + ',  资源本地不存在');
            this.loadSourceBySRC(url, cb);
            this._AjaxList.push(url);
        }
        
    },
    /**
     * 
     * 使用异步加载的模式去请求一段js／css
     * @param {String} resources	string || array 需要请求的地址或者地址数组
     * @param {Function} func		请求成功之后回调
     * @param {Number} timeout 		请求过期时间
     */
    require: function(resourceList, func) {
        if(resourceList && resourceList.length>0){
            for(var i=0; i<resourceList.length; i++){
                if (typeof resourceList[i] === 'string') {
                    this._require(resourceList[i], function(err,res) {
                        func && func(err,res);
                    });
                }
            }
        }
    },

    init: function(option){
        if(!option || !option.resourceList || resourceList.length<1){
            return
        }
        this.noCache = option.noCache || false;
        this.version = option.version || '';
        this.require(option.resourceList);
    }
}
window.localResource = localResource;
/**
 *
 * 单独封装的ajax，它支持和jq类似的处理逻辑，但是更简化
 * @param {Object} settings			设置选项
 * @param {Boolean} settings.async			是否异步，默认true
 * @param {Boolean} settings.cache			是否会需要添加随机字串在后面从而不缓存，默认true
 * @param {Boolean|String} settings.contentType		(default: 'application/x-www-form-urlencoded; charset=UTF-8')
 * @param {Object|String} settings.data		需要发送过去的内容，可以是对象也可以是字符串, 数字, 数组 等
 * @param {String} settings.dataType		需要返回的内容 (xml, json, script, or html)，我们默认不指定则为string
 * @param {Function} settings.fail			失败之后的执行操作
 * @param {Function} settings.success		成功之后的回调（data，status，xhr）
 * @param {String} settings.type			发送方式，默认“get”
 * @param {String} settings.url				需要发送的地址，默认相对当前地址
 * @return {Object} xhr						返回一个xhr对象
 *
 */
var ajax = function (settings) {
    if(!settings.url) return
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if(xhr.readyState === 4){
            if( (xhr.status >= 200 && xhr.status < 300 )|| xhr.status === 304) {
                // 成功 || 被跳转了 || 失败, 都应该走到这个流程里来
                // console.log('load success', settings.url)
                settings.success && settings.success(xhr.responseText);
            } else {
                // console.log('load fail', settings.url)
                settings.fail && settings.fail()
            }
        }
    }
    xhr.open(settings.type || 'get', settings.url, settings.isAsync || true );
    xhr.send(null);
}
window.ajax = ajax;

// (function load(){
//     var resource = [
//         '//g.alicdn.com/platform/tingle-ui/1.1.12/salt-ui.min.css',
//         '//g.alicdn.com/platform/c/??jquery/1.11.3/dist/jquery.min.js,lodash/4.6.1/lodash.min.js,react/0.14.3/react-with-addons.min.js,react/0.14.3/react-dom.min.js,react-router/2.8.1/umd/ReactRouter.min.js,reflux/5.0.4/dist/reflux.min.js,lie/3.0.2/dist/lie.polyfill.min.js,natty-storage/1.1.1/dist/natty-storage.min.js,natty-fetch/2.2.0/dist/natty-fetch.pc.min.js',
//         '//g.alicdn.com/dingding/dingtalk-pc-api/2.7.0/index.js',
//         '//g.alicdn.com/platform/tingle-ui/1.1.12/salt-ui.min.js',
//         './app.js',
//         './app.css'
//     ];
//     for(var i =0;i<resource.length; i++){
//         ajax({
//             url: resource[i],
//         })
//     }
// })()