"use strict";

var QWebChannelMessageTypes = {
  signal: 1,
  propertyUpdate: 2,
  init: 3,
  idle: 4,
  debug: 5,
  invokeMethod: 6,
  connectToSignal: 7,
  disconnectFromSignal: 8,
  setProperty: 9,
  response: 10,
  invokeJSMethod: 11,
};

var QWebChannel = function (transport, initCallback) {
  if (typeof transport !== "object" || typeof transport.send !== "function") {
    console.error(
      "The QWebChannel expects a transport object with a send function and onmessage callback property." +
        " Given is: transport: " +
        typeof transport +
        ", transport.send: " +
        typeof transport.send
    );
    return;
  }

  var channel = this;
  this.transport = transport;

  this.send = function (data) {
    if (typeof data !== "string") {
      data = JSON.stringify(data);
    }
    channel.transport.send(data);
  };

  this.transport.onmessage = function (message) {
    var data = message.data;
    if (typeof data === "string") {
      data = JSON.parse(data);
    }
    switch (data.type) {
      case QWebChannelMessageTypes.signal:
        channel.handleSignal(data);
        break;
      case QWebChannelMessageTypes.response:
        channel.handleResponse(data);
        break;
      case QWebChannelMessageTypes.propertyUpdate:
        channel.handlePropertyUpdate(data);
        break;
      default:
        console.error("invalid message received:", message.data);
        break;
    }
  };

  this.objects = {};

  this.execId = 0;
  this.execCallbacks = {};

  this.registerCallback = function (callback) {
    var idx = -1;
    if (callback) {
      if (channel.execId === Number.MAX_VALUE) {
        channel.execId = Number.MIN_VALUE;
      }
      idx = channel.execId++;
      channel.execCallbacks[idx] = callback;
    }
    return idx;
  };

  this.exec = function (data, callback) {
    if (!callback) {
      // if no callback is given, send directly
      channel.send(data);
      return;
    }
    if ("id" in data) {
      console.error(
        "Cannot exec message with property id: " + JSON.stringify(data)
      );
      return;
    }
    data.id = channel.registerCallback(callback);
    channel.execCallbacks[data.id] = callback;
    channel.send(data);
  };

  this.handleSignal = function (message) {
    var object = channel.objects[message.object];
    if (object) {
      object.signalEmitted(message.signal, message.args);
    } else {
      console.warn(
        "Unhandled signal: " + message.object + "::" + message.signal
      );
    }
  };

  this.handleResponse = function (message) {
    // if (!message.hasOwnProperty("id")) {
    if (!("id" in message)) {
      console.error(
        "Invalid response message received: ",
        JSON.stringify(message)
      );
      return;
    }
    channel.execCallbacks[message.id](message.data);
    delete channel.execCallbacks[message.id];
  };

  this.handlePropertyUpdate = function (message) {
    message.data.forEach((data) => {
      var object = channel.objects[data.object];
      if (object) {
        object.propertyUpdate(data.signals, data.properties);
      } else {
        console.warn(
          "Unhandled property update: " + data.object + "::" + data.signal
        );
      }
    });
    channel.exec({ type: QWebChannelMessageTypes.idle });
  };

  this.handleModule = function (message, module) {
    var object = this.objects[message.id];
    if (object === undefined) {
      console.warn("handleModule: ObjectName undefined.");
      return;
    }

    function addMethod(methodData, module) {
      var methodName = methodData[0];
      var methodIdx = methodData[1];

      module[methodName] = function () {
        var args = [];
        var callback = undefined;
        for (let i = 0, len = arguments.length; i < len; ++i) {
          var argument = arguments[i];
          if (typeof argument === "function") callback = argument;
          else args.push(argument);
        }

        var idx = channel.registerCallback(callback);

        channel.exec({
          type: QWebChannelMessageTypes.invokeJSMethod,
          object: object.__id__,
          name: methodName,
          method: methodIdx,
          args: args,
          callback: idx,
        });
      };
    }

    function addObject(data, target) {
      for (const key of Object.keys(data)) {
        if (key === "__methods__") {
          data.__methods__.forEach(function (methodData) {
            addMethod(methodData, target);
          });
        } else {
          let c = {};
          target[key] = c;
          addObject(data[key], c);
        }
      }
    }

    addObject(message.module, module);
  };

  this.modules = {};

  this.importModule = function (url, moduleName, callback) {
    this.modules[url] = {
      module: moduleName,
      callback: callback,
    };

    let core = this.objects.Core;
    core.importModule(url);
  };

  this.debug = function (message) {
    channel.send({ type: QWebChannelMessageTypes.debug, data: message });
  };

  channel.exec({ type: QWebChannelMessageTypes.init }, function (data) {
    for (const objectName of Object.keys(data)) {
      new QObject(objectName, data[objectName], channel);
    }

    // now unwrap properties, which might reference other registered objects
    for (const objectName of Object.keys(channel.objects)) {
      channel.objects[objectName].unwrapProperties();
    }

    if (initCallback) {
      initCallback(channel);
    }

    channel.exec({ type: QWebChannelMessageTypes.idle });
  });
};

function QObject(name, data, webChannel) {
  this.__id__ = name;
  webChannel.objects[name] = this;

  // List of callbacks that get invoked upon signal emission
  this.__objectSignals__ = {};

  // Cache of all properties, updated when a notify signal is emitted
  this.__propertyCache__ = {};

  var object = this;

  // ----------------------------------------------------------------------

  this.unwrapQObject = function (response) {
    if (response instanceof Array) {
      // support list of objects
      return response.map((qobj) => object.unwrapQObject(qobj));
    }
    if (!(response instanceof Object)) return response;

    if (!response["__QObject*__"] || response.id === undefined) {
      var jObj = {};
      for (const propName of Object.keys(response)) {
        jObj[propName] = object.unwrapQObject(response[propName]);
      }
      return jObj;
    }

    var objectId = response.id;
    if (webChannel.objects[objectId]) return webChannel.objects[objectId];

    if (!response.data) {
      console.error(
        "Cannot unwrap unknown QObject " + objectId + " without data."
      );
      return;
    }

    var qObject = new QObject(objectId, response.data, webChannel);
    qObject.destroyed.connect(function () {
      if (webChannel.objects[objectId] === qObject) {
        delete webChannel.objects[objectId];
        // reset the now deleted QObject to an empty {} object
        // just assigning {} though would not have the desired effect, but the
        // below also ensures all external references will see the empty map
        // NOTE: this detour is necessary to workaround QTBUG-40021
        Object.keys(qObject).forEach((name) => delete qObject[name]);
      }
    });
    // here we are already initialized, and thus must directly unwrap the properties
    qObject.unwrapProperties();
    return qObject;
  };

  this.unwrapProperties = function () {
    for (const propertyIdx of Object.keys(object.__propertyCache__)) {
      object.__propertyCache__[propertyIdx] = object.unwrapQObject(
        object.__propertyCache__[propertyIdx]
      );
    }
  };

  function addSignal(signalData, isPropertyNotifySignal) {
    var signalName = signalData[0];
    var signalIndex = signalData[1];
    object[signalName] = {
      connect: function (callback) {
        if (typeof callback !== "function") {
          console.error(
            "Bad callback given to connect to signal " + signalName
          );
          return;
        }

        object.__objectSignals__[signalIndex] =
          object.__objectSignals__[signalIndex] || [];
        object.__objectSignals__[signalIndex].push(callback);

        // only required for "pure" signals, handled separately for properties in propertyUpdate
        if (isPropertyNotifySignal) return;

        // also note that we always get notified about the destroyed signal
        if (
          signalName === "destroyed" ||
          signalName === "destroyed()" ||
          signalName === "destroyed(QObject*)"
        )
          return;

        // and otherwise we only need to be connected only once
        if (object.__objectSignals__[signalIndex].length == 1) {
          webChannel.exec({
            type: QWebChannelMessageTypes.connectToSignal,
            object: object.__id__,
            signal: signalIndex,
          });
        }
      },
      disconnect: function (callback) {
        if (typeof callback !== "function") {
          console.error(
            "Bad callback given to disconnect from signal " + signalName
          );
          return;
        }
        // This makes a new list. This is important because it won't interfere with
        // signal processing if a disconnection happens while emittig a signal
        object.__objectSignals__[signalIndex] = (
          object.__objectSignals__[signalIndex] || []
        ).filter(function (c) {
          return c != callback;
        });
        if (
          !isPropertyNotifySignal &&
          object.__objectSignals__[signalIndex].length === 0
        ) {
          // only required for "pure" signals, handled separately for properties in propertyUpdate
          webChannel.exec({
            type: QWebChannelMessageTypes.disconnectFromSignal,
            object: object.__id__,
            signal: signalIndex,
          });
        }
      },
      then: function (callback) {
        this.connect(callback);
      },
    };
  }

  /**
   * Invokes all callbacks for the given signalname. Also works for property notify callbacks.
   */
  function invokeSignalCallbacks(signalName, signalArgs) {
    var connections = object.__objectSignals__[signalName];
    if (connections) {
      connections.forEach(function (callback) {
        callback.apply(callback, signalArgs);
      });
    }
  }

  this.propertyUpdate = function (signals, propertyMap) {
    // update property cache
    for (const propertyIndex of Object.keys(propertyMap)) {
      var propertyValue = propertyMap[propertyIndex];
      object.__propertyCache__[propertyIndex] =
        this.unwrapQObject(propertyValue);
    }

    for (const signalName of Object.keys(signals)) {
      // Invoke all callbacks, as signalEmitted() does not. This ensures the
      // property cache is updated before the callbacks are invoked.
      invokeSignalCallbacks(signalName, signals[signalName]);
    }
  };

  this.signalEmitted = function (signalName, signalArgs) {
    invokeSignalCallbacks(signalName, this.unwrapQObject(signalArgs));
  };

  function addMethod(methodData) {
    var methodName = methodData[0];
    var methodIdx = methodData[1];

    // Fully specified methods are invoked by id, others by name for host-side overload resolution
    var invokedMethod =
      methodName[methodName.length - 1] === ")" ? methodIdx : methodName;

    object[methodName] = function () {
      var args = [];
      var callback = undefined;
      var errCallback;
      for (var i = 0; i < arguments.length; ++i) {
        var argument = arguments[i];
        if (typeof argument === "function") callback = argument;
        else args.push(argument);
      }

      var hasCallback = callback !== undefined;

      var result;
      // during test, webChannel.exec synchronously calls the callback
      // therefore, the promise must be constucted before calling
      // webChannel.exec to ensure the callback is set up
      if (!callback && typeof Promise === "function") {
        result = new Promise(function (resolve, reject) {
          callback = resolve;
          errCallback = reject;
        });
      }

      webChannel.exec(
        {
          type: QWebChannelMessageTypes.invokeMethod,
          object: object.__id__,
          method: invokedMethod,
          args: args,
          callback: hasCallback,
        },
        function (response) {
          if (response !== undefined) {
            var result = object.unwrapQObject(response);
            if (callback) {
              callback(result);
            }
          } else if (errCallback) {
            errCallback();
          }
        }
      );

      return result;
    };
  }

  function bindGetterSetter(propertyInfo) {
    var propertyIndex = propertyInfo[0];
    var propertyName = propertyInfo[1];
    var notifySignalData = propertyInfo[2];
    // initialize property cache with current value
    // NOTE: if this is an object, it is not directly unwrapped as it might
    // reference other QObject that we do not know yet
    object.__propertyCache__[propertyIndex] = propertyInfo[3];

    if (notifySignalData) {
      if (notifySignalData[0] === 1) {
        // signal name is optimized away, reconstruct the actual name
        notifySignalData[0] = propertyName + "Changed";
      }
      addSignal(notifySignalData, true);
    }

    Object.defineProperty(object, propertyName, {
      configurable: true,
      get: function () {
        var propertyValue = object.__propertyCache__[propertyIndex];
        if (propertyValue === undefined) {
          // This shouldn't happen
          console.warn(
            'Undefined value in property cache for property "' +
              propertyName +
              '" in object ' +
              object.__id__
          );
        }

        return propertyValue;
      },
      set: function (value) {
        if (value === undefined) {
          console.warn(
            "Property setter for " +
              propertyName +
              " called with undefined value!"
          );
          return;
        }
        object.__propertyCache__[propertyIndex] = value;
        var valueToSend = value;
        webChannel.exec({
          type: QWebChannelMessageTypes.setProperty,
          object: object.__id__,
          property: propertyIndex,
          value: valueToSend,
        });
      },
    });
  }

  // ----------------------------------------------------------------------

  data.methods.forEach(addMethod);

  data.properties.forEach(bindGetterSetter);

  data.signals.forEach(function (signal) {
    addSignal(signal, false);
  });

  Object.assign(object, data.enums);
}

QObject.prototype.toJSON = function () {
  if (this.__id__ === undefined) return {};
  return {
    id: this.__id__,
    "__QObject*__": true,
  };
};

export default function SSWebChannel(element, callback) {
  var mouseDown = false;
  var mousePosition = { x: 0, y: 0 };
  var core;

  function getPosition(element, event, result) {
    if (element === document) {
      result.x = event.clientX;
      result.y = event.clientY;
      return result;
    }

    var rect = element.getBoundingClientRect();
    result.x = event.clientX - rect.left;
    result.y = event.clientY - rect.top;
    return result;
  }

  function registerListener(domType, element, callback) {
    function listener(e) {
      // console.log(domType);
      callback(element, e);
    }

    element.addEventListener(domType, listener, {
      capture: false,
      passive: true,
    });

    console.log("registerListener " + domType);
  }

  function getChangedTouches(element, event) {
    var list = [];
    var changedTouches = event.changedTouches;
    for (let i = 0, len = changedTouches.length; i < len && i < 2; ++i) {
      let touch = changedTouches[i];
      let position = getPosition(element, touch, mousePosition);
      list.push({
        id: touch.identifier,
        x: position.x,
        y: position.y,
      });
    }
    return list;
  }

  function handleTouchStart(element, event) {
    mouseDown = true;
    let list = getChangedTouches(element, event);
    core.touchStart(list);
  }

  var lastMove = 0;
  var lastHour = -1;

  function handleTouchMove(element, event) {
    if (mouseDown) {
      let t = new Date();
      let hour = t.getHours();
      if (lastHour > hour) {
        lastMove = 0;
      }
      let current =
        hour * (60 * 60) +
        t.getMinutes() * 60 +
        t.getSeconds() +
        t.getMilliseconds() * 1e-3;
      if (current - lastMove > 1.0 / 20.0) {
        lastMove = current;
        lastHour = hour;
        let list = getChangedTouches(element, event);
        core.touchMove(list);
      }
    }
  }

  function handleTouchEnd(element, event) {
    if (mouseDown) {
      core.touchEnd();
    }
    mouseDown = false;
  }

  let baseUrl = "ws://localhost:21435";
  var socket = new WebSocket(baseUrl);

  socket.onclose = function () {
    console.error("web channel closed");
  };
  socket.onerror = function (error) {
    console.error("web channel error: " + error);
  };
  socket.onopen = function () {
    new QWebChannel(socket, function (channel) {
      // make core object accessible globally
      core = channel.objects.Core;

      var viewer = {};
      viewer.listeners = {};
      viewer.listeners["update"] = [];
      window.GlobalViewer = viewer;

      viewer.addEventListener = (type, callback) => {
        if (type === "update") {
          viewer.listeners["update"].push(callback);
          core.frameUpdate.connect(callback);
          return callback;
        }
      };

      viewer.removeEventListener = (listener) => {
        let listeners = viewer.listeners["update"];
        let index = listeners.indexOf(listener);
        if (index !== -1) {
          core.frameUpdate.disconnect(listener);
          listeners.splice(index, 1);
        }
      };

      viewer.onNativeNotify = (callback) => {
        core.nativeNotify.connect((data) => {
          callback(data);
        });
      };

      core.outputMessage.connect((msg) => {
        console.log(msg);
      });

      core.moduleLoaded.connect((url, data) => {
        let moduleData = channel.modules[url];
        let moduleName = moduleData.module;
        let callback = moduleData.callback;

        let module;
        if (!moduleName || moduleName === "") {
          module = window;
        } else {
          if (window[moduleName] === undefined) {
            window[moduleName] = {};
          }
          module = window[moduleName];
        }

        channel.handleModule(data, module);

        if (callback) {
          callback();
        }

        console.log("module loaded: " + url);
      });

      core.nativeCallback.connect((message) => {
        let callback = channel.execCallbacks[message.callback];
        if (!callback) {
          console.error(
            "Invalid response message received: ",
            JSON.stringify(message)
          );
          return;
        }
        callback(message.data);
        // delete channel.execCallbacks[message.callback];
      });
      console.log("web channel initialized", element);

      element.onmouseover = () => {
        core.mouseOverCanvas();
      };

      element.onmouseout = () => {
        core.mouseOutCanvas();
      };

      registerListener("touchstart", element, handleTouchStart);
      registerListener("touchmove", document, handleTouchMove);
      registerListener("touchend", document, handleTouchEnd);
      registerListener("touchcancel", document, handleTouchEnd);

      if (callback) {
        callback(channel);
      }
    });
  };
}

//required for use with nodejs
// if (typeof module === 'object') {
//     module.exports = {
//         SSWebChannel: SSWebChannel
//     };
// }
