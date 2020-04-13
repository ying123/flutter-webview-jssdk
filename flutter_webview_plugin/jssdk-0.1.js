import Conf from './conf.json';

class AppSdk {
  NAME = Conf.name';

  /// 是否在客户端内
  isApp() {
    var NAME = this.NAME;
    try {
      iframe.contentWindow.location.href = "${NAME}://app.com";
      return true;
    } catch(e) {
      if (e.name == "NS_ERROR_UNKNOWN_PROTOCOL") {}
      return false;
    }
  }

  close () {
    this.on('close');
  }

  /**
   * 通信指令
   * @param method
   * @param data
   * @returns {Promise<any>}
   */
  on(method = "none", {data = new Object()}) {
    var strData;
    var NAME = this.NAME;

    var util = new AppUtil();

    if (typeof data != "object") {
      console.log("data 为Object类型");
      return;
    }

    return new Promise(async (resolve, reject) => {
      switch (method) {
        case "close":
          strData = "${NAME}://type=close";
          break;
        case "back":
          strData = "${NAME}://type=back";
          break;
        case "forward":
          strData = "${NAME}://type=forward";
          break;
        case "refresh":
          strData = "${NAME}://type=refresh";
          break;
        case "toPage":
          data.type = method;
          strData = "${NAME}://" + util.urlEncode(data).slice(1);
          break;
        case "toWeb":
          data.type = method;
          strData = "${NAME}://" + util.urlEncode(data).slice(1);
          break;
        case "storeData":
          data.type = method;

          if (data.name == null || data.data == null || data.type == null) {
            console.log(`${method}方式参数错误，请检查该事件接收参数格式`);
            return;
          }

          strData = "${NAME}://" + util.urlEncode(data).slice(1);
          break;
        case "none":
        default:
          reject({
            "code": -1
          });
          break;
      }

      /**
       * 跳转协议， app接受
       * @type {string}
       */
      window.location.href = strData;

      resolve({
        "code": 0,
        "data": data,
        "youejiaAppUrl": strData,
      });
    })

  }
}


/**
 * 处理App外部url
 */
 class AppWeb {
  on(type = "", {data = new Object()}) {
    const SDK = new AppSDk();
    const util = new AppUtil();
    const NAME = SDK.NAME;
    var uri = "${Conf.name}://app.com/";

    switch (type) {
      case "toPage_app":
        data.type = type;
        uri += util.urlEncode(data).slice(1);
        window.location.href = uri;
        break;
      case "openApp":
        if (navigator.userAgent.match(/(iPhone|iPod|iPad);?/i)) {
          var loadDateTime = new Date();

          window.setTimeout(function() {
            var timeOutDateTime = new Date();
            if (timeOutDateTime - loadDateTime <2200) {
              window.location = Conf.download.ios;
            } else {
              window.close();
            }
          },2000);

          window.location = "${NAME}://${Conf.schema.ios}";

        } else if (navigator.userAgent.match(/android/i)) {
          var loadDateTime = new Date();

          window.setTimeout(function() {
            var timeOutDateTime = new Date();
            if (timeOutDateTime - loadDateTime < 2200) {
              window.location = Conf.download.android;
            } else {
              window.close();
            }
          },2000);

          window.location = "${NAME}://${Conf.schema.android}";

        }
        break;
      default:
        console.log("type is ''");
        break;
    }
  }
}

class AppUtil {
  /**
  * 工具类 检查平台
  */
  isVersion () {
   if (navigator.userAgent.match(/(iPhone|iPod|iPad);?/i)) {
     return 'ios';
   } else if (navigator.userAgent.match(/android/i)) {
     return 'android';
   } else {
     return 'none';
   }
  }

  /**
   * 工具类 解析url地址
   * @param param
   * @param key
   * @param encode
   * @returns {string}
   */
  urlEncode(param, key, encode) {
    if (param == null) return '';
    var paramStr = '';
    var t = typeof (param);
    if (t == 'string' || t == 'number' || t == 'boolean') {
      paramStr += '&' + key + '=' + ((encode == null || encode) ? encodeURIComponent(param) : param);
    } else {
      for (var i in param) {
        var k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i)
        paramStr += this.urlEncode(param[i], k, encode)
      }
    }
    return paramStr;
  }
}