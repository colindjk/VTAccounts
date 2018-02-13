
export const param = function (a) {
  var s = [];
  var rbracket = /\[\]$/;
  var add = function (k, v) {
    v = typeof v === 'function' ? v() : v;
    v = v === null ? '' : v === undefined ? '' : v;
    s[s.length] = encodeURIComponent(k) + '=' + encodeURIComponent(v);
  };
  var buildParams = function (prefix, obj) {
    var i, len, key;

    if (prefix) {
      if (Array.isArray(obj)) {
        for (i = 0, len = obj.length; i < len; i++) {
          if (rbracket.test(prefix)) {
            add(prefix, obj[i]);
          } else {
            buildParams(
              prefix + '[' + (typeof obj[i] === 'object' && obj[i] ? i : '') + ']',
              obj[i]
            );
          }
        }
      } else if (String(obj) === '[object Object]') {
        for (key in obj) {
          buildParams(prefix + '[' + key + ']', obj[key]);
        }
      } else {
        add(prefix, obj);
      }
    } else if (Array.isArray(obj)) {
      for (i = 0, len = obj.length; i < len; i++) {
        add(obj[i].name, obj[i].value);
      }
    } else {
      for (key in obj) {
        buildParams(key, obj[key]);
      }
    }
    return s;
  };

  return buildParams('', a).join('&');
};

export const fetchFromObject = function(obj, prop) {

  if(typeof obj === 'undefined') {
    return false;
  }

  var _index = prop.indexOf('.')
  if(_index > -1) {
    return fetchFromObject(obj[prop.substring(0, _index)], prop.substr(_index + 1));
  }

  return obj[prop];
}

export const setToObject = function(obj, prop, value) {

  if(typeof obj === 'undefined') {
    return false;
  }

  var _index = prop.indexOf('.')
  if(_index > -1) {
    setToObject(obj[prop.substring(0, _index)], prop.substr(_index + 1), value);
    return;
  }

  obj['isVirtual'] = false;
  obj[prop] = value;
}

