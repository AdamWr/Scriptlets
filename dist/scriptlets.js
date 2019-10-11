
/**
 * AdGuard Scriptlets
 * Version 1.0.10
 */

(function () {
    function randomId() {
      return Math.random().toString(36).substr(2, 9);
    }

    function setPropertyAccess(object, property, descriptor) {
      var currentDescriptor = Object.getOwnPropertyDescriptor(object, property);
      if (currentDescriptor && !currentDescriptor.configurable) {
        return false;
      }
      Object.defineProperty(object, property, descriptor);
      return true;
    }

    function getPropertyInChain(base, chain) {
      var pos = chain.indexOf('.');
      if (pos === -1) {
        return {
          base: base,
          prop: chain
        };
      }
      var prop = chain.slice(0, pos);
      var own = base[prop];
      chain = chain.slice(pos + 1);
      if (own !== undefined) {
        return getPropertyInChain(own, chain);
      }
      Object.defineProperty(base, prop, {
        configurable: true
      });
      return {
        base: own,
        prop: prop,
        chain: chain
      };
    }

    var escapeRegExp = function escapeRegExp(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };
    var toRegExp = function toRegExp(str) {
      if (str[0] === '/' && str[str.length - 1] === '/') {
        return new RegExp(str.slice(1, -1));
      }
      var escaped = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(escaped);
    };

    function createOnErrorHandler(rid) {
      var nativeOnError = window.onerror;
      return function onError(error) {
        if (typeof error === 'string' && error.indexOf(rid) !== -1) {
          return true;
        }
        if (nativeOnError instanceof Function) {
          for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }
          return nativeOnError.apply(this, [error].concat(args));
        }
        return false;
      };
    }

    var noop = function noop() {};
    var noopNull = function noopNull() {
      return null;
    };
    function noopThis() {
      return this;
    }
    var noopArray = function noopArray() {
      return [];
    };
    var noopStr = function noopStr() {
      return '';
    };

    var hit = function hit(source, message) {
      if (source.verbose !== true) {
        return;
      }
      try {
        var log = console.log.bind(console);
        var trace = console.trace.bind(console);
        if (message) {
          log("".concat(source.ruleText, " message:\n").concat(message));
        }
        log("".concat(source.ruleText, " trace start"));
        if (trace) {
          trace();
        }
        log("".concat(source.ruleText, " trace end"));
      } catch (e) {}
      if (typeof window.__debugScriptlets === 'function') {
        window.__debugScriptlets(source);
      }
    };



    var dependencies = /*#__PURE__*/Object.freeze({
        randomId: randomId,
        setPropertyAccess: setPropertyAccess,
        getPropertyInChain: getPropertyInChain,
        escapeRegExp: escapeRegExp,
        toRegExp: toRegExp,
        createOnErrorHandler: createOnErrorHandler,
        noop: noop,
        noopNull: noopNull,
        noopThis: noopThis,
        noopArray: noopArray,
        noopStr: noopStr,
        hit: hit
    });

    function abortOnPropertyRead(source, property) {
      if (!property) {
        return;
      }
      var rid = randomId();
      var abort = function abort() {
        hit(source);
        throw new ReferenceError(rid);
      };
      var setChainPropAccess = function setChainPropAccess(owner, property) {
        var chainInfo = getPropertyInChain(owner, property);
        var base = chainInfo.base;
        var prop = chainInfo.prop,
            chain = chainInfo.chain;
        if (chain) {
          var setter = function setter(a) {
            base = a;
            if (a instanceof Object) {
              setChainPropAccess(a, chain);
            }
          };
          Object.defineProperty(owner, prop, {
            get: function get() {
              return base;
            },
            set: setter
          });
          return;
        }
        setPropertyAccess(base, prop, {
          get: abort,
          set: function set() {}
        });
      };
      setChainPropAccess(window, property);
      window.onerror = createOnErrorHandler(rid).bind();
    }
    abortOnPropertyRead.names = ['abort-on-property-read', 'abort-on-property-read.js', 'ubo-abort-on-property-read.js', 'abp-abort-on-property-read'];
    abortOnPropertyRead.injections = [randomId, setPropertyAccess, getPropertyInChain, createOnErrorHandler, hit];

    function abortOnPropertyWrite(source, property) {
      if (!property) {
        return;
      }
      var rid = randomId();
      var abort = function abort() {
        hit(source);
        throw new ReferenceError(rid);
      };
      var setChainPropAccess = function setChainPropAccess(owner, property) {
        var chainInfo = getPropertyInChain(owner, property);
        var base = chainInfo.base;
        var prop = chainInfo.prop,
            chain = chainInfo.chain;
        if (chain) {
          var setter = function setter(a) {
            base = a;
            if (a instanceof Object) {
              setChainPropAccess(a, chain);
            }
          };
          Object.defineProperty(owner, prop, {
            get: function get() {
              return base;
            },
            set: setter
          });
          return;
        }
        setPropertyAccess(base, prop, {
          set: abort
        });
      };
      setChainPropAccess(window, property);
      window.onerror = createOnErrorHandler(rid).bind();
    }
    abortOnPropertyWrite.names = ['abort-on-property-write', 'abort-on-property-write.js', 'ubo-abort-on-property-write.js', 'abp-abort-on-property-write'];
    abortOnPropertyWrite.injections = [randomId, setPropertyAccess, getPropertyInChain, createOnErrorHandler, hit];

    function preventSetTimeout(source, match, delay) {
      var nativeTimeout = window.setTimeout;
      var nativeIsNaN = Number.isNaN || window.isNaN;
      delay = parseInt(delay, 10);
      delay = nativeIsNaN(delay) ? null : delay;
      match = match ? toRegExp(match) : toRegExp('/.?/');
      var timeoutWrapper = function timeoutWrapper(cb, d) {
        if ((!delay || d === delay) && match.test(cb.toString())) {
          hit(source);
          return nativeTimeout(function () {}, d);
        }
        for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }
        return nativeTimeout.apply(window, [cb, d].concat(args));
      };
      window.setTimeout = timeoutWrapper;
    }
    preventSetTimeout.names = ['prevent-setTimeout', 'setTimeout-defuser.js', 'ubo-setTimeout-defuser.js'];
    preventSetTimeout.injections = [toRegExp, hit];

    function preventSetInterval(source, match, interval) {
      var nativeInterval = window.setInterval;
      var nativeIsNaN = Number.isNaN || window.isNaN;
      interval = parseInt(interval, 10);
      interval = nativeIsNaN(interval) ? null : interval;
      match = match ? toRegExp(match) : toRegExp('/.?/');
      var intervalWrapper = function intervalWrapper(cb, d) {
        if ((!interval || d === interval) && match.test(cb.toString())) {
          hit(source);
          return nativeInterval(function () {}, d);
        }
        for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }
        return nativeInterval.apply(window, [cb, d].concat(args));
      };
      window.setInterval = intervalWrapper;
    }
    preventSetInterval.names = ['prevent-setInterval', 'setInterval-defuser.js', 'ubo-setInterval-defuser.js'];
    preventSetInterval.injections = [toRegExp, hit];

    function preventWindowOpen(source, inverse, match) {
      var nativeOpen = window.open;
      inverse = inverse ? !+inverse : !!inverse;
      match = match ? toRegExp(match) : toRegExp('/.?/');
      var openWrapper = function openWrapper(str) {
        if (inverse === match.test(str)) {
          for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }
          return nativeOpen.apply(window, [str].concat(args));
        }
        hit(source);
      };
      window.open = openWrapper;
    }
    preventWindowOpen.names = ['prevent-window-open', 'window.open-defuser.js', 'ubo-window.open-defuser.js'];
    preventWindowOpen.injections = [toRegExp, hit];

    function abortCurrentInlineScript(source, property) {
      var search = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var regex = search ? toRegExp(search) : null;
      var rid = randomId();
      var getCurrentScript = function getCurrentScript() {
        if (!document.currentScript) {
          var scripts = document.getElementsByTagName('script');
          return scripts[scripts.length - 1];
        }
        return document.currentScript;
      };
      var ourScript = getCurrentScript();
      var abort = function abort() {
        var scriptEl = getCurrentScript();
        var content = scriptEl.textContent;
        try {
          var textContentGetter = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent').get;
          content = textContentGetter.call(scriptEl);
        } catch (e) {}
        if (scriptEl instanceof HTMLScriptElement && content.length > 0 && scriptEl !== ourScript && (!regex || regex.test(scriptEl.textContent))) {
          hit(source);
          throw new ReferenceError(rid);
        }
      };
      var setChainPropAccess = function setChainPropAccess(owner, property) {
        var chainInfo = getPropertyInChain(owner, property);
        var base = chainInfo.base;
        var prop = chainInfo.prop,
            chain = chainInfo.chain;
        if (chain) {
          var setter = function setter(a) {
            base = a;
            if (a instanceof Object) {
              setChainPropAccess(a, chain);
            }
          };
          Object.defineProperty(owner, prop, {
            get: function get() {
              return base;
            },
            set: setter
          });
          return;
        }
        var currentValue = base[prop];
        setPropertyAccess(base, prop, {
          set: function set(value) {
            abort();
            currentValue = value;
          },
          get: function get() {
            abort();
            return currentValue;
          }
        });
      };
      setChainPropAccess(window, property);
      window.onerror = createOnErrorHandler(rid).bind();
    }
    abortCurrentInlineScript.names = ['abort-current-inline-script', 'abort-current-inline-script.js', 'ubo-abort-current-inline-script.js', 'abp-abort-current-inline-script'];
    abortCurrentInlineScript.injections = [randomId, setPropertyAccess, getPropertyInChain, toRegExp, createOnErrorHandler, hit];

    function setConstant(source, property, value) {
      if (!property) {
        return;
      }
      var nativeIsNaN = Number.isNaN || window.isNaN;
      var constantValue;
      if (value === 'undefined') {
        constantValue = undefined;
      } else if (value === 'false') {
        constantValue = false;
      } else if (value === 'true') {
        constantValue = true;
      } else if (value === 'null') {
        constantValue = null;
      } else if (value === 'noopFunc') {
        constantValue = function constantValue() {};
      } else if (value === 'trueFunc') {
        constantValue = function constantValue() {
          return true;
        };
      } else if (value === 'falseFunc') {
        constantValue = function constantValue() {
          return false;
        };
      } else if (/^\d+$/.test(value)) {
        constantValue = parseFloat(value);
        if (nativeIsNaN(constantValue)) {
          return;
        }
        if (Math.abs(constantValue) > 0x7FFF) {
          return;
        }
      } else if (value === '') {
        constantValue = '';
      } else {
        return;
      }
      var canceled = false;
      var mustCancel = function mustCancel(value) {
        if (canceled) {
          return canceled;
        }
        canceled = value !== undefined && constantValue !== undefined && typeof value !== typeof constantValue;
        return canceled;
      };
      var setChainPropAccess = function setChainPropAccess(owner, property) {
        var chainInfo = getPropertyInChain(owner, property);
        var base = chainInfo.base;
        var prop = chainInfo.prop,
            chain = chainInfo.chain;
        if (chain) {
          var setter = function setter(a) {
            base = a;
            if (a instanceof Object) {
              setChainPropAccess(a, chain);
            }
          };
          Object.defineProperty(owner, prop, {
            get: function get() {
              return base;
            },
            set: setter
          });
          return;
        }
        if (mustCancel(base[prop])) {
          return;
        }
        hit(source);
        setPropertyAccess(base, prop, {
          get: function get() {
            return constantValue;
          },
          set: function set(a) {
            if (mustCancel(a)) {
              constantValue = a;
            }
          }
        });
      };
      setChainPropAccess(window, property);
    }
    setConstant.names = ['set-constant', 'set-constant.js', 'ubo-set-constant.js'];
    setConstant.injections = [getPropertyInChain, setPropertyAccess, hit];

    function removeCookie(source, match) {
      var regex = match ? toRegExp(match) : toRegExp('/.?/');
      var removeCookieFromHost = function removeCookieFromHost(cookieName, hostName) {
        var cookieSpec = "".concat(cookieName, "=");
        var domain1 = "; domain=".concat(hostName);
        var domain2 = "; domain=.".concat(hostName);
        var path = '; path=/';
        var expiration = '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = cookieSpec + expiration;
        document.cookie = cookieSpec + domain1 + expiration;
        document.cookie = cookieSpec + domain2 + expiration;
        document.cookie = cookieSpec + path + expiration;
        document.cookie = cookieSpec + domain1 + path + expiration;
        document.cookie = cookieSpec + domain2 + path + expiration;
        hit(source);
      };
      var rmCookie = function rmCookie() {
        document.cookie.split(';').forEach(function (cookieStr) {
          var pos = cookieStr.indexOf('=');
          if (pos === -1) {
            return;
          }
          var cookieName = cookieStr.slice(0, pos).trim();
          if (!regex.test(cookieName)) {
            return;
          }
          var hostParts = document.location.hostname.split('.');
          for (var i = 0; i <= hostParts.length - 1; i += 1) {
            var hostName = hostParts.slice(i).join('.');
            if (hostName) {
              removeCookieFromHost(cookieName, hostName);
            }
          }
        });
      };
      rmCookie();
      window.addEventListener('beforeunload', rmCookie);
    }
    removeCookie.names = ['remove-cookie', 'cookie-remover.js', 'ubo-cookie-remover.js'];
    removeCookie.injections = [toRegExp, hit];

    function preventAddEventListener(source, event, funcStr) {
      event = event ? toRegExp(event) : toRegExp('/.?/');
      funcStr = funcStr ? toRegExp(funcStr) : toRegExp('/.?/');
      var nativeAddEventListener = window.EventTarget.prototype.addEventListener;
      function addEventListenerWrapper(eventName, callback) {
        if (event.test(eventName.toString()) && funcStr.test(callback.toString())) {
          hit(source);
          return undefined;
        }
        for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }
        return nativeAddEventListener.apply(this, [eventName, callback].concat(args));
      }
      window.EventTarget.prototype.addEventListener = addEventListenerWrapper;
    }
    preventAddEventListener.names = ['prevent-addEventListener', 'addEventListener-defuser.js', 'ubo-addEventListener-defuser.js'];
    preventAddEventListener.injections = [toRegExp, hit];

    function preventBab(source) {
      var _this = this;
      var nativeSetTimeout = window.setTimeout;
      var babRegex = /\.bab_elementid.$/;
      window.setTimeout = function (callback) {
        if (typeof callback !== 'string' || !babRegex.test(callback)) {
          for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }
          return nativeSetTimeout.call.apply(nativeSetTimeout, [_this, callback].concat(args));
        }
        hit(source);
      };
      var signatures = [['blockadblock'], ['babasbm'], [/getItem\('babn'\)/], ['getElementById', 'String.fromCharCode', 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 'charAt', 'DOMContentLoaded', 'AdBlock', 'addEventListener', 'doScroll', 'fromCharCode', '<<2|r>>4', 'sessionStorage', 'clientWidth', 'localStorage', 'Math', 'random']];
      var check = function check(str) {
        for (var i = 0; i < signatures.length; i += 1) {
          var tokens = signatures[i];
          var match = 0;
          for (var j = 0; j < tokens.length; j += 1) {
            var token = tokens[j];
            var found = token instanceof RegExp ? token.test(str) : str.indexOf(token) > -1;
            if (found) {
              match += 1;
            }
          }
          if (match / tokens.length >= 0.8) {
            return true;
          }
        }
        return false;
      };
      var nativeEval = window.eval;
      window.eval = function (str) {
        if (!check(str)) {
          return nativeEval(str);
        }
        hit(source);
        var bodyEl = document.body;
        if (bodyEl) {
          bodyEl.style.removeProperty('visibility');
        }
        var el = document.getElementById('babasbmsgx');
        if (el) {
          el.parentNode.removeChild(el);
        }
      };
    }
    preventBab.names = ['prevent-bab', 'bab-defuser.js', 'ubo-bab-defuser.js'];
    preventBab.injections = [hit];

    function nowebrtc(source) {
      var propertyName = '';
      if (window.RTCPeerConnection) {
        propertyName = 'RTCPeerConnection';
      } else if (window.webkitRTCPeerConnection) {
        propertyName = 'webkitRTCPeerConnection';
      }
      if (propertyName === '') {
        return;
      }
      var rtcReplacement = function rtcReplacement(config) {
        hit(source, "Document tried to create an RTCPeerConnection: ".concat(config));
      };
      var noop = function noop() {};
      rtcReplacement.prototype = {
        close: noop,
        createDataChannel: noop,
        createOffer: noop,
        setRemoteDescription: noop
      };
      var rtc = window[propertyName];
      window[propertyName] = rtcReplacement;
      if (rtc.prototype) {
        rtc.prototype.createDataChannel = function (a, b) {
          return {
            close: noop,
            send: noop
          };
        }.bind(null);
      }
    }
    nowebrtc.names = ['nowebrtc', 'nowebrtc.js', 'ubo-nowebrtc.js'];
    nowebrtc.injections = [hit];

    function logAddEventListener(source) {
      var log = console.log.bind(console);
      var nativeAddEventListener = window.EventTarget.prototype.addEventListener;
      function addEventListenerWrapper(eventName, callback) {
        hit(source);
        log("addEventListener(\"".concat(eventName, "\", ").concat(callback.toString(), ")"));
        for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }
        return nativeAddEventListener.apply(this, [eventName, callback].concat(args));
      }
      window.EventTarget.prototype.addEventListener = addEventListenerWrapper;
    }
    logAddEventListener.names = ['log-addEventListener', 'addEventListener-logger.js', 'ubo-addEventListener-logger.js'];
    logAddEventListener.injections = [hit];

    function logSetInterval(source) {
      var log = console.log.bind(console);
      var nativeSetInterval = window.setInterval;
      function setIntervalWrapper(callback, timeout) {
        hit(source);
        log("setInterval(\"".concat(callback.toString(), "\", ").concat(timeout, ")"));
        for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }
        return nativeSetInterval.apply(window, [callback, timeout].concat(args));
      }
      window.setInterval = setIntervalWrapper;
    }
    logSetInterval.names = ['log-setInterval', 'setInterval-logger.js', 'ubo-setInterval-logger.js'];
    logSetInterval.injections = [hit];

    function logSetTimeout(source) {
      var log = console.log.bind(console);
      var nativeSetTimeout = window.setTimeout;
      function setTimeoutWrapper(callback, timeout) {
        hit(source);
        log("setTimeout(\"".concat(callback.toString(), "\", ").concat(timeout, ")"));
        for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }
        return nativeSetTimeout.apply(window, [callback, timeout].concat(args));
      }
      window.setTimeout = setTimeoutWrapper;
    }
    logSetTimeout.names = ['log-setTimeout', 'setTimeout-logger.js', 'ubo-setTimeout-logger.js'];
    logSetTimeout.injections = [hit];

    function logEval(source) {
      var log = console.log.bind(console);
      var nativeEval = window.eval;
      function evalWrapper(str) {
        hit(source);
        log("eval(\"".concat(str, "\")"));
        return nativeEval(str);
      }
      window.eval = evalWrapper;
      var nativeFunction = window.Function;
      function FunctionWrapper() {
        hit(source);
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        log("new Function(".concat(args.join(', '), ")"));
        return nativeFunction.apply(this, [].concat(args));
      }
      FunctionWrapper.prototype = Object.create(nativeFunction.prototype);
      FunctionWrapper.prototype.constructor = FunctionWrapper;
      window.Function = FunctionWrapper;
    }
    logEval.names = ['log-eval'];
    logEval.injections = [hit];

    function log() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      console.log(args);
    }
    log.names = ['log'];

    function noeval(source) {
      window.eval = function evalWrapper(s) {
        hit(source, "AdGuard has prevented eval:\n".concat(s));
      }.bind();
    }
    noeval.names = ['noeval', 'noeval.js', 'silent-noeval.js', 'ubo-noeval.js', 'ubo-silent-noeval.js'];
    noeval.injections = [hit];

    function preventEvalIf(source, search) {
      search = search ? toRegExp(search) : toRegExp('/.?/');
      var nativeEval = window.eval;
      window.eval = function (payload) {
        if (!search.test(payload.toString())) {
          return nativeEval.call(window, payload);
        }
        hit(source, payload);
        return undefined;
      }.bind(window);
    }
    preventEvalIf.names = ['prevent-eval-if', 'noeval-if.js', 'ubo-noeval-if.js'];
    preventEvalIf.injections = [toRegExp, hit];

    function preventFab(source) {
      hit(source);
      var Fab = function Fab() {};
      Fab.prototype.check = noop;
      Fab.prototype.clearEvent = noop;
      Fab.prototype.emitEvent = noop;
      Fab.prototype.on = function (a, b) {
        if (!a) {
          b();
        }
        return this;
      };
      Fab.prototype.onDetected = function () {
        return this;
      };
      Fab.prototype.onNotDetected = function (a) {
        a();
        return this;
      };
      Fab.prototype.setOption = noop;
      window.FuckAdBlock = window.BlockAdBlock = Fab;
      window.fuckAdBlock = window.blockAdBlock = new Fab();
    }
    preventFab.names = ['prevent-fab-3.2.0', 'fuckadblock.js-3.2.0', 'ubo-fuckadblock.js-3.2.0'];
    preventFab.injections = [noop, hit];

    function setPopadsDummy(source) {
      delete window.PopAds;
      delete window.popns;
      Object.defineProperties(window, {
        PopAds: {
          get: function get() {
            hit(source);
            return {};
          }
        },
        popns: {
          get: function get() {
            hit(source);
            return {};
          }
        }
      });
    }
    setPopadsDummy.names = ['set-popads-dummy', 'popads-dummy.js', 'ubo-popads-dummy.js'];
    setPopadsDummy.injections = [hit];

    function preventPopadsNet(source) {
      var rid = randomId();
      var throwError = function throwError() {
        throw new ReferenceError(rid);
      };
      delete window.PopAds;
      delete window.popns;
      Object.defineProperties(window, {
        PopAds: {
          set: throwError
        },
        popns: {
          set: throwError
        }
      });
      window.onerror = createOnErrorHandler(rid).bind();
      hit(source);
    }
    preventPopadsNet.names = ['prevent-popads-net', 'popads.net.js', 'ubo-popads.net.js'];
    preventPopadsNet.injections = [createOnErrorHandler, randomId, hit];

    function preventAdfly(source) {
      var isDigit = function isDigit(data) {
        return /^\d$/.test(data);
      };
      var handler = function handler(encodedURL) {
        var evenChars = '';
        var oddChars = '';
        for (var i = 0; i < encodedURL.length; i += 1) {
          if (i % 2 === 0) {
            evenChars += encodedURL.charAt(i);
          } else {
            oddChars = encodedURL.charAt(i) + oddChars;
          }
        }
        var data = (evenChars + oddChars).split('');
        for (var _i = 0; _i < data.length; _i += 1) {
          if (isDigit(data[_i])) {
            for (var ii = _i + 1; ii < data.length; ii += 1) {
              if (isDigit(data[ii])) {
                var temp = parseInt(data[_i], 10) ^ parseInt(data[ii], 10);
                if (temp < 10) {
                  data[_i] = temp.toString();
                }
                _i = ii;
                break;
              }
            }
          }
        }
        data = data.join('');
        var decodedURL = window.atob(data).slice(16, -16);
        if (window.stop) {
          window.stop();
        }
        window.onbeforeunload = null;
        window.location.href = decodedURL;
      };
      var val;
      var applyHandler = true;
      var result = setPropertyAccess(window, 'ysmm', {
        configurable: false,
        set: function set(value) {
          if (applyHandler) {
            applyHandler = false;
            try {
              if (typeof value === 'string') {
                handler(value);
              }
            } catch (err) {}
          }
          val = value;
        },
        get: function get() {
          return val;
        }
      });
      if (result) {
        hit(source);
      } else {
        window.console.error('Failed to set up prevent-adfly scriptlet');
      }
    }
    preventAdfly.names = ['prevent-adfly', 'adfly-defuser.js', 'ubo-adfly-defuser.js'];
    preventAdfly.injections = [setPropertyAccess, hit];

    function debugOnPropertyRead(source, property) {
      if (!property) {
        return;
      }
      var rid = randomId();
      var abort = function abort() {
        hit(source);
        debugger;
      };
      var setChainPropAccess = function setChainPropAccess(owner, property) {
        var chainInfo = getPropertyInChain(owner, property);
        var base = chainInfo.base;
        var prop = chainInfo.prop,
            chain = chainInfo.chain;
        if (chain) {
          var setter = function setter(a) {
            base = a;
            if (a instanceof Object) {
              setChainPropAccess(a, chain);
            }
          };
          Object.defineProperty(owner, prop, {
            get: function get() {
              return base;
            },
            set: setter
          });
          return;
        }
        setPropertyAccess(base, prop, {
          get: abort,
          set: function set() {}
        });
      };
      setChainPropAccess(window, property);
      window.onerror = createOnErrorHandler(rid).bind();
    }
    debugOnPropertyRead.names = ['debug-on-property-read'];
    debugOnPropertyRead.injections = [randomId, setPropertyAccess, getPropertyInChain, createOnErrorHandler, hit];

    function debugOnPropertyWrite(source, property) {
      if (!property) {
        return;
      }
      var rid = randomId();
      var abort = function abort() {
        hit(source);
        debugger;
      };
      var setChainPropAccess = function setChainPropAccess(owner, property) {
        var chainInfo = getPropertyInChain(owner, property);
        var base = chainInfo.base;
        var prop = chainInfo.prop,
            chain = chainInfo.chain;
        if (chain) {
          var setter = function setter(a) {
            base = a;
            if (a instanceof Object) {
              setChainPropAccess(a, chain);
            }
          };
          Object.defineProperty(owner, prop, {
            get: function get() {
              return base;
            },
            set: setter
          });
          return;
        }
        setPropertyAccess(base, prop, {
          set: abort
        });
      };
      setChainPropAccess(window, property);
      window.onerror = createOnErrorHandler(rid).bind();
    }
    debugOnPropertyWrite.names = ['debug-on-property-write'];
    debugOnPropertyWrite.injections = [randomId, setPropertyAccess, getPropertyInChain, createOnErrorHandler, hit];

    function debugCurrentInlineScript(source, property) {
      var search = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var regex = search ? toRegExp(search) : null;
      var rid = randomId();
      var getCurrentScript = function getCurrentScript() {
        if (!document.currentScript) {
          var scripts = document.getElementsByTagName('script');
          return scripts[scripts.length - 1];
        }
        return document.currentScript;
      };
      var ourScript = getCurrentScript();
      var abort = function abort() {
        var scriptEl = getCurrentScript();
        if (scriptEl instanceof HTMLScriptElement && scriptEl.textContent.length > 0 && scriptEl !== ourScript && (!regex || regex.test(scriptEl.textContent))) {
          hit(source);
          debugger;
        }
      };
      var setChainPropAccess = function setChainPropAccess(owner, property) {
        var chainInfo = getPropertyInChain(owner, property);
        var base = chainInfo.base;
        var prop = chainInfo.prop,
            chain = chainInfo.chain;
        if (chain) {
          var setter = function setter(a) {
            base = a;
            if (a instanceof Object) {
              setChainPropAccess(a, chain);
            }
          };
          Object.defineProperty(owner, prop, {
            get: function get() {
              return base;
            },
            set: setter
          });
          return;
        }
        var currentValue = base[prop];
        setPropertyAccess(base, prop, {
          set: function set(value) {
            abort();
            currentValue = value;
          },
          get: function get() {
            abort();
            return currentValue;
          }
        });
      };
      setChainPropAccess(window, property);
      window.onerror = createOnErrorHandler(rid).bind();
    }
    debugCurrentInlineScript.names = ['debug-current-inline-script'];
    debugCurrentInlineScript.injections = [randomId, setPropertyAccess, getPropertyInChain, toRegExp, createOnErrorHandler, hit];

    function removeAttr(source, attrs, selector) {
      if (!attrs) {
        return;
      }
      attrs = attrs.split(/\s*\|\s*/);
      if (!selector) {
        selector = "[".concat(attrs.join('],['), "]");
      }
      var rmattr = function rmattr(ev) {
        if (ev) {
          window.removeEventListener(ev.type, rmattr, true);
        }
        var nodes = [].slice.call(document.querySelectorAll(selector));
        var removed = false;
        nodes.forEach(function (node) {
          attrs.forEach(function (attr) {
            node.removeAttribute(attr);
            removed = true;
          });
        });
        if (removed) {
          hit(source);
        }
      };
      if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', rmattr, true);
      } else {
        rmattr();
      }
    }
    removeAttr.names = ['remove-attr', 'remove-attr.js', 'ubo-remove-attr.js'];
    removeAttr.injections = [hit];

    function disableNewtabLinks(source) {
      document.addEventListener('click', function (ev) {
        var target = ev.target;
        while (target !== null) {
          if (target.localName === 'a' && target.hasAttribute('target')) {
            ev.stopPropagation();
            ev.preventDefault();
            hit(source);
            break;
          }
          target = target.parentNode;
        }
      });
    }
    disableNewtabLinks.names = ['disable-newtab-links', 'disable-newtab-links.js', 'ubo-disable-newtab-links.js'];
    disableNewtabLinks.injections = [hit];

    function adjustSetInterval(source, match, interval, boost) {
      var nativeInterval = window.setInterval;
      var nativeIsNaN = Number.isNaN || window.isNaN;
      var nativeIsFinite = Number.isFinite || window.isFinite;
      interval = parseInt(interval, 10);
      interval = nativeIsNaN(interval) ? 1000 : interval;
      boost = parseInt(boost, 10);
      boost = nativeIsNaN(interval) || !nativeIsFinite(boost) ? 0.05 : boost;
      match = match ? toRegExp(match) : toRegExp('/.?/');
      if (boost < 0.02) {
        boost = 0.02;
      }
      if (boost > 50) {
        boost = 50;
      }
      var intervalWrapper = function intervalWrapper(cb, d) {
        if (d === interval && match.test(cb.toString())) {
          d *= boost;
          hit(source);
        }
        for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }
        return nativeInterval.apply(window, [cb, d].concat(args));
      };
      window.setInterval = intervalWrapper;
    }
    adjustSetInterval.names = ['adjust-setInterval', 'nano-setInterval-booster.js', 'ubo-nano-setInterval-booster.js'];
    adjustSetInterval.injections = [toRegExp, hit];

    function adjustSetTimeout(source, match, timeout, boost) {
      var nativeTimeout = window.setTimeout;
      var nativeIsNaN = Number.isNaN || window.isNaN;
      var nativeIsFinite = Number.isFinite || window.isFinite;
      timeout = parseInt(timeout, 10);
      timeout = nativeIsNaN(timeout) ? 1000 : timeout;
      boost = parseInt(boost, 10);
      boost = nativeIsNaN(timeout) || !nativeIsFinite(boost) ? 0.05 : boost;
      match = match ? toRegExp(match) : toRegExp('/.?/');
      if (boost < 0.02) {
        boost = 0.02;
      }
      if (boost > 50) {
        boost = 50;
      }
      var timeoutWrapper = function timeoutWrapper(cb, d) {
        if (d === timeout && match.test(cb.toString())) {
          d *= boost;
          hit(source);
        }
        for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }
        return nativeTimeout.apply(window, [cb, d].concat(args));
      };
      window.setTimeout = timeoutWrapper;
    }
    adjustSetTimeout.names = ['adjust-setTimeout', 'nano-setTimeout-booster.js', 'ubo-nano-setTimeout-booster.js'];
    adjustSetTimeout.injections = [toRegExp, hit];

    function dirString(source, times) {
      var _console = console,
          dir = _console.dir;
      times = parseInt(times, 10);
      function dirWrapper(object) {
        var temp;
        for (var i = 0; i < times; i += 1) {
          temp = "".concat(object);
        }
        if (typeof dir === 'function') {
          dir.call(this, object);
        }
        hit(source, temp);
      }
      console.dir = dirWrapper;
    }
    dirString.names = ['dir-string', 'abp-dir-string'];
    dirString.injections = [hit];

    function jsonPrune(source, propsToRemove, obligatoryProps) {
      var log = console.log.bind(console);
      var prunePaths = propsToRemove !== undefined && propsToRemove !== '' ? propsToRemove.split(/ +/) : [];
      var needlePaths = obligatoryProps !== undefined && obligatoryProps !== '' ? obligatoryProps.split(/ +/) : [];
      var isPruningNeeded = function isPruningNeeded(root) {
        for (var i = 0; i < needlePaths.length; i += 1) {
          var needlePath = needlePaths[i];
          var details = getPropertyInChain(root, needlePath);
          var nestedPropName = needlePath.split('').pop();
          if (details.base[nestedPropName] === undefined) return false;
        }
        return true;
      };
      var nativeParse = JSON.parse;
      var parseWrapper = function parseWrapper() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        var r = nativeParse.apply(window, args);
        if (prunePaths.length === 0) {
          log(window.location.hostname, r);
          return r;
        }
        hit(source);
        if (isPruningNeeded(r) === false) {
          return r;
        }
        prunePaths.forEach(function (path) {
          var ownerObj = getPropertyInChain(r, path);
          delete ownerObj.base[ownerObj.prop];
        });
        return r;
      };
      JSON.parse = parseWrapper;
    }
    jsonPrune.names = ['json-prune', 'json-prune.js', 'ubo-json-prune.js'];
    jsonPrune.injections = [hit, getPropertyInChain];

    function GoogleSyndicationAdsByGoogle(source) {
      window.adsbygoogle = window.adsbygoogle || {
        length: 0,
        loaded: true,
        push: function push() {
          this.length += 1;
        }
      };
      var adElems = document.querySelectorAll('.adsbygoogle');
      var css = 'height:1px!important;max-height:1px!important;max-width:1px!important;width:1px!important;';
      var executed = false;
      for (var i = 0; i < adElems.length; i += 1) {
        var frame = document.createElement('iframe');
        frame.id = "aswift_".concat(i + 1);
        frame.style = css;
        var childFrame = document.createElement('iframe');
        childFrame.id = "google_ads_frame".concat(i);
        frame.appendChild(childFrame);
        document.body.appendChild(frame);
        executed = true;
      }
      if (executed) {
        hit(source);
      }
    }
    GoogleSyndicationAdsByGoogle.names = ['googlesyndication-adsbygoogle', 'ubo-googlesyndication_adsbygoogle.js', 'googlesyndication_adsbygoogle.js'];
    GoogleSyndicationAdsByGoogle.injections = [hit];

    function GoogleTagManagerGtm(source) {
      window.ga = window.ga || noop;
      var _window = window,
          dataLayer = _window.dataLayer;
      if (dataLayer instanceof Object === false) {
        return;
      }
      if (dataLayer.hide instanceof Object && typeof dataLayer.hide.end === 'function') {
        dataLayer.hide.end();
      }
      if (typeof dataLayer.push === 'function') {
        dataLayer.push = function (data) {
          if (data instanceof Object && typeof data.eventCallback === 'function') {
            setTimeout(data.eventCallback, 1);
          }
        };
      }
      hit(source);
    }
    GoogleTagManagerGtm.names = ['googletagmanager-gtm', 'ubo-googletagmanager_gtm.js', 'googletagmanager_gtm.js'];
    GoogleTagManagerGtm.injections = [hit, noop];

    function GoogleAnalytics(source) {
      var Tracker = function Tracker() {};
      var proto = Tracker.prototype;
      proto.get = noop;
      proto.set = noop;
      proto.send = noop;
      var googleAnalyticsName = window.GoogleAnalyticsObject || 'ga';
      function ga() {
        var len = arguments.length;
        if (len === 0) {
          return;
        }
        var lastArg = arguments[len - 1];
        if (typeof lastArg !== 'object' || lastArg === null || typeof lastArg.hitCallback !== 'function') {
          return;
        }
        try {
          lastArg.hitCallback();
        } catch (ex) {}
      }
      ga.create = function () {
        return new Tracker();
      };
      ga.getByName = noopNull;
      ga.getAll = function () {
        return [];
      };
      ga.remove = noop;
      ga.loaded = true;
      window[googleAnalyticsName] = ga;
      var _window = window,
          dataLayer = _window.dataLayer;
      if (dataLayer instanceof Object && dataLayer.hide instanceof Object && typeof dataLayer.hide.end === 'function') {
        dataLayer.hide.end();
      }
      hit(source);
    }
    GoogleAnalytics.names = ['google-analytics', 'ubo-google-analytics_analytics.js', 'google-analytics_analytics.js'];
    GoogleAnalytics.injections = [hit, noop, noopNull];

    function ScoreCardResearchBeacon(source) {
      window.COMSCORE = {
        purge: function purge() {
          window._comscore = [];
        },
        beacon: function beacon() {}
      };
      hit(source);
    }
    ScoreCardResearchBeacon.names = ['scorecardresearch-beacon', 'ubo-scorecardresearch_beacon.js', 'scorecardresearch_beacon.js'];
    ScoreCardResearchBeacon.injections = [hit];

    function GoogleAnalyticsGa(source) {
      function Gaq() {}
      Gaq.prototype.Na = noop;
      Gaq.prototype.O = noop;
      Gaq.prototype.Sa = noop;
      Gaq.prototype.Ta = noop;
      Gaq.prototype.Va = noop;
      Gaq.prototype._createAsyncTracker = noop;
      Gaq.prototype._getAsyncTracker = noop;
      Gaq.prototype._getPlugin = noop;
      Gaq.prototype.push = function (data) {
        if (typeof data === 'function') {
          data();
          return;
        }
        if (Array.isArray(data) === false) {
          return;
        }
        if (data[0] === '_link' && typeof data[1] === 'string') {
          window.location.assign(data[1]);
        }
        if (data[0] === '_set' && data[1] === 'hitCallback' && typeof data[2] === 'function') {
          data[2]();
        }
      };
      var gaq = new Gaq();
      var asyncTrackers = window._gaq || [];
      if (Array.isArray(asyncTrackers)) {
        while (asyncTrackers[0]) {
          gaq.push(asyncTrackers.shift());
        }
      }
      window._gaq = gaq.qf = gaq;
      function Gat() {}
      var api = ['_addIgnoredOrganic', '_addIgnoredRef', '_addItem', '_addOrganic', '_addTrans', '_clearIgnoredOrganic', '_clearIgnoredRef', '_clearOrganic', '_cookiePathCopy', '_deleteCustomVar', '_getName', '_setAccount', '_getAccount', '_getClientInfo', '_getDetectFlash', '_getDetectTitle', '_getLinkerUrl', '_getLocalGifPath', '_getServiceMode', '_getVersion', '_getVisitorCustomVar', '_initData', '_link', '_linkByPost', '_setAllowAnchor', '_setAllowHash', '_setAllowLinker', '_setCampContentKey', '_setCampMediumKey', '_setCampNameKey', '_setCampNOKey', '_setCampSourceKey', '_setCampTermKey', '_setCampaignCookieTimeout', '_setCampaignTrack', '_setClientInfo', '_setCookiePath', '_setCookiePersistence', '_setCookieTimeout', '_setCustomVar', '_setDetectFlash', '_setDetectTitle', '_setDomainName', '_setLocalGifPath', '_setLocalRemoteServerMode', '_setLocalServerMode', '_setReferrerOverride', '_setRemoteServerMode', '_setSampleRate', '_setSessionTimeout', '_setSiteSpeedSampleRate', '_setSessionCookieTimeout', '_setVar', '_setVisitorCookieTimeout', '_trackEvent', '_trackPageLoadTime', '_trackPageview', '_trackSocial', '_trackTiming', '_trackTrans', '_visitCode'];
      var tracker = api.reduce(function (res, funcName) {
        res[funcName] = noop;
        return res;
      }, {});
      tracker._getLinkerUrl = function (a) {
        return a;
      };
      Gat.prototype._anonymizeIP = noop;
      Gat.prototype._createTracker = noop;
      Gat.prototype._forceSSL = noop;
      Gat.prototype._getPlugin = noop;
      Gat.prototype._getTracker = function () {
        return tracker;
      };
      Gat.prototype._getTrackerByName = function () {
        return tracker;
      };
      Gat.prototype._getTrackers = noop;
      Gat.prototype.aa = noop;
      Gat.prototype.ab = noop;
      Gat.prototype.hb = noop;
      Gat.prototype.la = noop;
      Gat.prototype.oa = noop;
      Gat.prototype.pa = noop;
      Gat.prototype.u = noop;
      var gat = new Gat();
      window._gat = gat;
      hit(source);
    }
    GoogleAnalyticsGa.names = ['google-analytics-ga', 'ubo-google-analytics_ga.js', 'google-analytics_ga.js'];
    GoogleAnalyticsGa.injections = [hit, noop];

    function GoogleTagServicesGpt(source) {
      var companionAdsService = {
        addEventListener: noopThis,
        enableSyncLoading: noop,
        setRefreshUnfilledSlots: noop
      };
      var contentService = {
        addEventListener: noopThis,
        setContent: noop
      };
      function PassbackSlot() {}
      PassbackSlot.prototype.display = noop;
      PassbackSlot.prototype.get = noopNull;
      PassbackSlot.prototype.set = noopThis;
      PassbackSlot.prototype.setClickUrl = noopThis;
      PassbackSlot.prototype.setTagForChildDirectedTreatment = noopThis;
      PassbackSlot.prototype.setTargeting = noopThis;
      PassbackSlot.prototype.updateTargetingFromMap = noopThis;
      function SizeMappingBuilder() {}
      SizeMappingBuilder.prototype.addSize = noopThis;
      SizeMappingBuilder.prototype.build = noopNull;
      function Slot() {}
      Slot.prototype.addService = noopThis;
      Slot.prototype.clearCategoryExclusions = noopThis;
      Slot.prototype.clearTargeting = noopThis;
      Slot.prototype.defineSizeMapping = noopThis;
      Slot.prototype.get = noopNull;
      Slot.prototype.getAdUnitPath = noopArray;
      Slot.prototype.getAttributeKeys = noopArray;
      Slot.prototype.getCategoryExclusions = noopArray;
      Slot.prototype.getDomId = noopStr;
      Slot.prototype.getSlotElementId = noopStr;
      Slot.prototype.getSlotId = noopThis;
      Slot.prototype.getTargeting = noopArray;
      Slot.prototype.getTargetingKeys = noopArray;
      Slot.prototype.set = noopThis;
      Slot.prototype.setCategoryExclusion = noopThis;
      Slot.prototype.setClickUrl = noopThis;
      Slot.prototype.setCollapseEmptyDiv = noopThis;
      Slot.prototype.setTargeting = noopThis;
      var pubAdsService = {
        addEventListener: noopThis,
        clear: noop,
        clearCategoryExclusions: noopThis,
        clearTagForChildDirectedTreatment: noopThis,
        clearTargeting: noopThis,
        collapseEmptyDivs: noop,
        defineOutOfPagePassback: function defineOutOfPagePassback() {
          return new PassbackSlot();
        },
        definePassback: function definePassback() {
          return new PassbackSlot();
        },
        disableInitialLoad: noop,
        display: noop,
        enableAsyncRendering: noop,
        enableSingleRequest: noop,
        enableSyncRendering: noop,
        enableVideoAds: noop,
        get: noopNull,
        getAttributeKeys: noopArray,
        getTargeting: noop,
        getTargetingKeys: noopArray,
        getSlots: noopArray,
        refresh: noop,
        set: noopThis,
        setCategoryExclusion: noopThis,
        setCentering: noop,
        setCookieOptions: noopThis,
        setForceSafeFrame: noopThis,
        setLocation: noopThis,
        setPublisherProvidedId: noopThis,
        setRequestNonPersonalizedAds: noopThis,
        setSafeFrameConfig: noopThis,
        setTagForChildDirectedTreatment: noopThis,
        setTargeting: noopThis,
        setVideoContent: noopThis,
        updateCorrelator: noop
      };
      var _window = window,
          _window$googletag = _window.googletag,
          googletag = _window$googletag === void 0 ? {} : _window$googletag;
      var _googletag$cmd = googletag.cmd,
          cmd = _googletag$cmd === void 0 ? [] : _googletag$cmd;
      googletag.apiReady = true;
      googletag.cmd = [];
      googletag.cmd.push = function (a) {
        try {
          a();
        } catch (ex) {}
        return 1;
      };
      googletag.companionAds = function () {
        return companionAdsService;
      };
      googletag.content = function () {
        return contentService;
      };
      googletag.defineOutOfPageSlot = function () {
        return new Slot();
      };
      googletag.defineSlot = function () {
        return new Slot();
      };
      googletag.destroySlots = noop;
      googletag.disablePublisherConsole = noop;
      googletag.display = noop;
      googletag.enableServices = noop;
      googletag.getVersion = noopStr;
      googletag.pubads = function () {
        return pubAdsService;
      };
      googletag.pubadsReady = true;
      googletag.setAdIframeTitle = noop;
      googletag.sizeMapping = function () {
        return new SizeMappingBuilder();
      };
      window.googletag = googletag;
      while (cmd.length !== 0) {
        googletag.cmd.push(cmd.shift());
      }
      hit(source);
    }
    GoogleTagServicesGpt.names = ['googletagservices-gpt', 'ubo-googletagservices_gpt.js', 'googletagservices_gpt.js'];
    GoogleTagServicesGpt.injections = [hit, noop, noopThis, noopNull, noopArray, noopStr];

    function metrikaYandexWatch(source) {
      var cbName = 'yandex_metrika_callbacks';
      var asyncCallbackFromOptions = function asyncCallbackFromOptions() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var callback = options.callback;
        var ctx = options.ctx;
        if (typeof callback === 'function') {
          callback = ctx !== undefined ? callback.bind(ctx) : callback;
          setTimeout(function () {
            return callback();
          });
        }
      };
      function Metrika() {}
      Metrika.prototype.addFileExtension = noop;
      Metrika.prototype.getClientID = noop;
      Metrika.prototype.setUserID = noop;
      Metrika.prototype.userParams = noop;
      Metrika.prototype.extLink = function (url, options) {
        asyncCallbackFromOptions(options);
      };
      Metrika.prototype.file = function (url, options) {
        asyncCallbackFromOptions(options);
      };
      Metrika.prototype.hit = function (url, options) {
        asyncCallbackFromOptions(options);
      };
      Metrika.prototype.reachGoal = function (target, params, cb, ctx) {
        asyncCallbackFromOptions({
          callback: cb,
          ctx: ctx
        });
      };
      Metrika.prototype.notBounce = asyncCallbackFromOptions;
      if (window.Ya) {
        window.Ya.Metrika = Metrika;
      } else {
        window.Ya = {
          Metrika: Metrika
        };
      }
      if (window[cbName] && Array.isArray(window[cbName])) {
        window[cbName].forEach(function (func) {
          if (typeof func === 'function') {
            func();
          }
        });
      }
      hit(source);
    }
    metrikaYandexWatch.names = ['metrika-yandex-watch'];
    metrikaYandexWatch.injections = [hit, noop];

    function metrikaYandexTag(source) {
      var asyncCallbackFromOptions = function asyncCallbackFromOptions(param) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var callback = options.callback;
        var ctx = options.ctx;
        if (typeof callback === 'function') {
          callback = ctx !== undefined ? callback.bind(ctx) : callback;
          setTimeout(function () {
            return callback();
          });
        }
      };
      var init = noop;
      var addFileExtension = noop;
      var extLink = asyncCallbackFromOptions;
      var file = asyncCallbackFromOptions;
      var getClientID = function getClientID(cb) {
        setTimeout(cb(null));
      };
      var hitFunc = asyncCallbackFromOptions;
      var notBounce = asyncCallbackFromOptions;
      var params = noop;
      var reachGoal = function reachGoal(target, params, callback, ctx) {
        asyncCallbackFromOptions(null, {
          callback: callback,
          ctx: ctx
        });
      };
      var setUserID = noop;
      var userParams = noop;
      var api = {
        init: init,
        addFileExtension: addFileExtension,
        extLink: extLink,
        file: file,
        getClientID: getClientID,
        hit: hitFunc,
        notBounce: notBounce,
        params: params,
        reachGoal: reachGoal,
        setUserID: setUserID,
        userParams: userParams
      };
      function ym(id, funcName) {
        for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }
        return api[funcName] && api[funcName].apply(api, args);
      }
      window.ym = ym;
      hit(source);
    }
    metrikaYandexTag.names = ['metrika-yandex-tag'];
    metrikaYandexTag.injections = [hit, noop];



    var scriptletList = /*#__PURE__*/Object.freeze({
        abortOnPropertyRead: abortOnPropertyRead,
        abortOnPropertyWrite: abortOnPropertyWrite,
        preventSetTimeout: preventSetTimeout,
        preventSetInterval: preventSetInterval,
        preventWindowOpen: preventWindowOpen,
        abortCurrentInlineScript: abortCurrentInlineScript,
        setConstant: setConstant,
        removeCookie: removeCookie,
        preventAddEventListener: preventAddEventListener,
        preventBab: preventBab,
        nowebrtc: nowebrtc,
        logAddEventListener: logAddEventListener,
        logSetInterval: logSetInterval,
        logSetTimeout: logSetTimeout,
        logEval: logEval,
        log: log,
        noeval: noeval,
        preventEvalIf: preventEvalIf,
        preventFab: preventFab,
        setPopadsDummy: setPopadsDummy,
        preventPopadsNet: preventPopadsNet,
        preventAdfly: preventAdfly,
        debugOnPropertyRead: debugOnPropertyRead,
        debugOnPropertyWrite: debugOnPropertyWrite,
        debugCurrentInlineScript: debugCurrentInlineScript,
        removeAttr: removeAttr,
        disableNewtabLinks: disableNewtabLinks,
        adjustSetInterval: adjustSetInterval,
        adjustSetTimeout: adjustSetTimeout,
        dirString: dirString,
        jsonPrune: jsonPrune,
        GoogleSyndicationAdsByGoogle: GoogleSyndicationAdsByGoogle,
        GoogleTagManagerGtm: GoogleTagManagerGtm,
        GoogleAnalytics: GoogleAnalytics,
        ScoreCardResearchBeacon: ScoreCardResearchBeacon,
        GoogleAnalyticsGa: GoogleAnalyticsGa,
        GoogleTagServicesGpt: GoogleTagServicesGpt,
        metrikaYandexWatch: metrikaYandexWatch,
        metrikaYandexTag: metrikaYandexTag
    });

    function attachDependencies(scriptlet) {
      var _scriptlet$injections = scriptlet.injections,
          injections = _scriptlet$injections === void 0 ? [] : _scriptlet$injections;
      return injections.reduce(function (accum, dep) {
        return "".concat(accum, "\n").concat(dependencies[dep.name]);
      }, scriptlet.toString());
    }
    function addScriptletCall(scriptlet, code) {
      return "".concat(code, ";\n        const updatedArgs = args ? [].concat(source).concat(args) : [source];\n        ").concat(scriptlet.name, ".apply(this, updatedArgs);\n    ");
    }
    function passSourceAndPropsToScriptlet(source, code) {
      if (source.hit) {
        source.hit = source.hit.toString();
      }
      var sourceString = JSON.stringify(source);
      var argsString = source.args ? "[".concat(source.args.map(JSON.stringify), "]") : undefined;
      var params = argsString ? "".concat(sourceString, ", ").concat(argsString) : sourceString;
      return "(function(source, args){\n".concat(code, "\n})(").concat(params, ");");
    }
    function wrapInNonameFunc(code) {
      return "function(source, args){\n".concat(code, "\n}");
    }
    function getScriptletByName(name) {
      var scriptlets = Object.keys(scriptletList).map(function (key) {
        return scriptletList[key];
      });
      return scriptlets.find(function (s) {
        return s.names && s.names.indexOf(name) > -1;
      });
    }
    function isValidScriptletSource(source) {
      if (!source.name) {
        return false;
      }
      var scriptlet = getScriptletByName(source.name);
      if (!scriptlet) {
        return false;
      }
      return true;
    }
    function getScriptletCode(source) {
      if (!isValidScriptletSource(source)) {
        return null;
      }
      var scriptlet = getScriptletByName(source.name);
      var result = attachDependencies(scriptlet);
      result = addScriptletCall(scriptlet, result);
      result = source.engine === 'corelibs' ? wrapInNonameFunc(result) : passSourceAndPropsToScriptlet(source, result);
      return result;
    }

    scriptlets = function () {
      return {
        invoke: getScriptletCode
      };
    }();

}());

/**
 * -------------------------------------------
 * |                                         |
 * |  If you want to add your own scriptlet  |
 * |  please put your code below             |
 * |                                         |
 * -------------------------------------------
 */
//# sourceMappingURL=scriptlets.js.map
