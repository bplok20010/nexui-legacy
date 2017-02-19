/**
* lang.js
*/
define(function(require, exports, module){
	
	var support = require('./support');
	
	var template = require('./lang/template');
	
	var lang = {},
		root = self || global,
        enumerables = null,
        noop = function(){},
        i; 
		
	var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

	var
		push             = ArrayProto.push,
		slice            = ArrayProto.slice,
		concat           = ArrayProto.concat,
		toString         = ObjProto.toString,
		hasOwnProperty   = ObjProto.hasOwnProperty;
		
	var
		nativeIsArray      = Array.isArray,
		nativeKeys         = Object.keys,
		nativeBind         = FuncProto.bind,
		nativeCreate       = Object.create;	
		
	
	// Keys in IE 6-? that won't be iterated by `for key in ...` and thus missed.
	function enumerablesTest(){
		for(var i in {toString: 1}){
			return 0;
		}
		return 1;	
	}
	
    if (enumerablesTest()) {
        enumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable',
                       'toLocaleString', 'toString', 'constructor'];//Object.prototype
    }

    /**
     * An array containing extra enumerables for old browsers
     * @property {String[]}
     */
    lang.enumerables = enumerables;	
	
	lang.template = (function(){
		var caches = {};
		return function(str, setting){
			if( caches[str] ) {
				return caches[str];	
			} else {
				return caches[str] = template.apply( this, arguments );	
			}	
		};	
	})();
	
	/**
     * An array containing extra enumerables for old browsers
     * @property {String[]}
     */
    lang.enumerables = enumerables;
	
	function _extend(dest, source) {
         var i, j, k;
		
		for(i in source){
			dest[i] = source[i];
		}
		
		if (enumerables) {
			for (j = enumerables.length; j--;) {
				k = enumerables[j];
				if (source.hasOwnProperty(k)) {
					dest[k] = source[k];
				}
			}
		}

        return dest;
    };
	
	var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	var isArrayLike = function(obj){
		var length = obj == null ? void 0 : obj.length;
		return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;	
	}
	
	lang.isObject = (toString.call(null) === '[object Object]') ?
	function(value) {
		// check ownerDocument here as well to exclude DOM nodes
		return value !== null && value !== undefined && toString.call(value) === '[object Object]' && value.ownerDocument === undefined;
	} :
	function(value) {
		return toString.call(value) === '[object Object]';
	};
	//(+new Date)
	lang.now = Date.now || function() {
		return new Date().getTime();
	};
	
	lang.identity = function(value){
		return value;	
	};
	
	lang.noop = noop;
	
	lang.extend = function(dest, sources){
		if(!dest){ dest = {}; }
		for(var i = 1, l = arguments.length; i < l; i++){
			_extend(dest, arguments[i]);
		}
		return dest;
	}
	
	lang.extendIf = function(dest, sources) {
		var i=1, l=arguments.length, prop;
		
       	if(!dest){ dest = {}; }
		
		for(; i < l; i++){
			for(prop in arguments[i]){
				if (dest[prop] === undefined) {
					dest[prop] = arguments[i][prop];
				}
			}
		}
		
		return dest;
    };
	
	lang.mixin = function(dest, sources){
		if(!dest){ dest = {}; }
		
		for(var i = 1, l = arguments.length; i < l; i++){
			lang.extendIf(dest, arguments[i]);
		}
		
		return dest;
	}
	
	lang.random = function(min, max){
		if (max == null) {
			max = min;
			min = 0;
		}
		
		return min + Math.floor(Math.random() * (max - min + 1));	
	};
	
	lang.times = function(n, iteratee, context){
		var accum = Array(Math.max(0, n));
		var cb = function(i){
			if( context === void 0 ) {
				return iteratee(i);	
			} else {
				return iteratee.call(context, i);	
			}	
		};
		for (var i = 0; i < n; i++) accum[i] = cb(i);
		return accum;	
	};
	
	lang.has = function(obj, key) {
		return obj != null && hasOwnProperty.call(obj, key);
	};
	
	lang.keys = function(obj) {
		if (!lang.isObject(obj)) return [];
		
		if (nativeKeys) return nativeKeys(obj);
		
		var keys = [];
		
		for (var key in obj) if (lang.has(obj, key)) keys.push(key);
		// Ahem, IE < 9.
		if (lang.enumerables) {
			for (var j = lang.enumerables.length; j--;) {
				k = lang.enumerables[j];
				if (obj.hasOwnProperty(k)) {
					keys.push(k);
				}
			}	
		} 
		
		return keys;
	};
	
	lang.invert = function(obj) {
		var result = {};
		var keys = lang.keys(obj);
		
		for (var i = 0, length = keys.length; i < length; i++) {
			result[obj[keys[i]]] = keys[i];
		}
		
		return result;
	};
	
	lang.allKeys = function(obj) {
		if (!lang.isObject(obj)) return [];
		
		if (nativeKeys) return nativeKeys(obj);
		
		var keys = [];
		
		for (var key in obj) keys.push(key);
		// Ahem, IE < 9.
		if (lang.enumerables) {
			for (var j = lang.enumerables.length; j--;) {
				k = lang.enumerables[j];
				if (obj.hasOwnProperty(k)) {
					keys.push(k);
				}
			}	
		} 
		
		return keys;
	};
	
	lang.values = function(obj) {
		var keys = lang.keys(obj);
		var length = keys.length;
		var values = Array(length);
		
		for (var i = 0; i < length; i++) {
		  values[i] = obj[keys[i]];
		}
		
		return values;
	};
	
	lang.toArray = function(obj) {
		if (!obj) return [];
		if (lang.isArray(obj)) return slice.call(obj);
		if (isArrayLike(obj)) return lang.map(obj, lang.identity);
		
		return lang.values(obj);
	};
	
	lang.forEach = lang.each = function(obj, iterator, context){
		if (obj == null) return obj;
		
		var i, length, hasContext = context === void 0 ? false : true;
		
		if (isArrayLike(obj)) {
			for (i = 0, length = obj.length; i < length; i++) {
				if (iterator.call(hasContext ? context : obj[i], obj[i], i, obj) === false) break;
			}
		} else {
			var keys = lang.keys(obj);
			
			for (i = 0, length = keys.length; i < length; i++) {
				if (iterator.call(hasContext ? context : obj[keys[i]], obj[keys[i]], keys[i], obj) === false) break;
			}
		}
		
		return obj;
	};
	
	lang.map = function(obj, iterator, context){
		if (obj == null) return obj;
		
		var i, length, results = [], hasContext = context === void 0 ? false : true;
		
		if (isArrayLike(obj)) {
			for (i = 0, length = obj.length; i < length; i++) {
				results.push(iterator.call(hasContext ? context : obj[i], obj[i], i, obj));
			}
		} else {
			var keys = lang.keys(obj);
			
			for (i = 0, length = keys.length; i < length; i++) {
				results.push(iterator.call(hasContext ? context : obj[keys[i]], obj[keys[i]], keys[i], obj));
			}
		}
		
		return results;
	};
	
	// An internal function used for aggregate "group by" operations.
	var group = function(behavior) {
		return function(obj, iteratee, context) {
			var result = {}, hasContext = context === void 0 ? false : true;
			
			lang.each(obj, function(value, index) {
				var key = iteratee.call(hasContext ? context : value, value, index, obj);
			  
			  	behavior(result, value, key);
			});
			
			return result;
		};
	};
	
	// Groups the object's values by a criterion. Pass either a string attribute
	// to group by, or a function that returns the criterion.
	lang.groupBy = group(function(result, value, key) {
		if (lang.has(result, key)) result[key].push(value); else result[key] = [value];
	});
	
	// Indexes the object's values by a criterion, similar to `groupBy`, but for
	// when you know that your index values will be unique.
	lang.indexBy = group(function(result, value, key) {
		result[key] = value;
	});
	
	// Counts instances of an object that group by a certain criterion. Pass
	// either a string attribute to count by, or a function that returns the
	// criterion.
	lang.countBy = group(function(result, value, key) {
		if (lang.has(result, key)) result[key]++; else result[key] = 1;
	});
	
	lang.size = function(obj) {
		if (obj == null) return 0;
		return isArrayLike(obj) ? obj.length : lang.keys(obj).length;
	};
	
	//遍历list中的每个值，返回包含所有通过predicate真值检测的元素值。
	lang.filter = function(obj, iterator, context) {
		var results = [], hasContext = context === void 0 ? false : true;
		
		lang.each(obj, function(value, index, list) {
		 	if (iterator.call(hasContext ? context : value, value, index, list)) results.push(value);
		});
		
		return results;
	};
	
	lang.every = function(obj, predicate, context) {
		var keys = !isArrayLike(obj) && lang.keys(obj),
			length = (keys || obj).length,
			hasContext = context === void 0 ? false : true;
			
		for (var index = 0; index < length; index++) {
			var currentKey = keys ? keys[index] : index;
			if (!predicate.call(hasContext ? context : obj[currentKey], obj[currentKey], currentKey, obj)) return false;
		}
		
		return true;
	};
	
	lang.some = function(obj, predicate, context) {
		var keys = !isArrayLike(obj) && lang.keys(obj),
			length = (keys || obj).length,
			hasContext = context === void 0 ? false : true;
			
		for (var index = 0; index < length; index++) {
			var currentKey = keys ? keys[index] : index;
			if (predicate.call(hasContext ? context : obj[currentKey], obj[currentKey], currentKey, obj)) return true;
		}
		
		return false;
	};
	
	//返回一个除去所有false值的 array副本。 在javascript中, false, null, 0, "", undefined 和 NaN 都是false值.
	lang.compact = function(array) {
		return lang.filter(array, lang.identity);
	};
	
	lang.indexOf = function(array, item){
		var i = 0, length = array && array.length;
		
		for (; i < length; i++) if (array[i] === item) return i;
		
    	return -1;	
	};
	
	lang.contains = function(array, item){
    	return lang.indexOf(array, item) >= 0;	
	};
	
	lang.uniq = function(array){
		if (array == null) return [];
		
		var result = [];
		
		for (var i = 0, length = array.length; i < length; i++) {
			var value = array[i];
			
			if (!lang.contains(result, value)) {
				result.push(value);
			}
		}
		
		return result;
	};
	
	lang.range = function(start, stop, step) {
		if (arguments.length <= 1) {
		  stop = start || 0;
		  start = 0;
		}
		
		step = step || 1;
		
		var length = Math.max(Math.ceil((stop - start) / step), 0);
		var range = Array(length);
		
		for (var idx = 0; idx < length; idx++, start += step) {
		  range[idx] = start;
		}
		
		return range;
	};
	
	lang.bind = function(func, context){
		if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    	if (!lang.isFunction(func)) throw new TypeError('Bind must be called on a function');
		
        return function() {
           return func.apply(context, arguments);
        };	
	};
	
	lang.partial = function(func){
		var boundArgs = slice.call(arguments, 1);
		
		return function(){
			var arg = 0, length = boundArgs.length, args = Array(length);
			
			for ( var i = 0; i < length; i++ ) {
				args[i] = boundArgs[i] === undefined ? arguments[arg++] : boundArgs[i];
			}
			
			return func.apply(this, args); 
		}; 
	};
	
	lang.delay = function(func, wait) {
		var args = slice.call(arguments, 2);
		
		return setTimeout(function(){
			return func.apply(null, args);
		}, wait);
	};
	
	lang.defer = lang.partial(lang.delay, undefined, 1);
	
	//创建并返回一个像节流阀一样的函数，当重复调用函数的时候，至少每隔 wait毫秒调用一次该函数。对于想控制一些触发频率较高的事件有帮助。
	//默认情况下，throttle将在你调用的第一时间尽快执行这个function，并且，如果你在wait周期内调用任意次数的函数，都将尽快的被覆盖。
	//如果你想禁用第一次首先执行的话，传递{leading: false}，还有如果你想禁用最后一次执行的话，传递{trailing: false}。
	lang.throttle = function(func, wait, options) {
		var context, args, result;
		var timeout = null;
		var previous = 0;
		
		if (!options) options = {};
		
		var later = function() {
			previous = options.leading === false ? 0 : lang.now();
			timeout = null;
			result = func.apply(context, args);
			
			if (!timeout) context = args = null;
		};
		
		return function() {
			var now = lang.now();
			
			if (!previous && options.leading === false) previous = now;
			
			var remaining = wait - (now - previous);
			context = this;
			args = arguments;
			
			if (remaining <= 0 || remaining > wait) {
				if (timeout) {
					clearTimeout(timeout);
					timeout = null;
				}
				
				previous = now;
				result = func.apply(context, args);
				
				if (!timeout) context = args = null;
				
			} else if (!timeout && options.trailing !== false) {
				timeout = setTimeout(later, remaining);
			}
			
			return result;
		};
	};

	//返回 function 函数的防反跳版本, 将延迟函数的执行(真正的执行)在函数最后一次调用时刻的 wait 毫秒之后. 对于必须在一些输入（多是一些用户操作）停止到达之后执行的行为有帮助。
	//传参 immediate 为 true， debounce会在 wait 时间间隔的开始调用这个函数 。（愚人码头注：并且在 waite 的时间之内，不会再次调用。）在类似不小心点了提交按钮两下而提交了两次的情况下很有用。 
	lang.debounce = function(func, wait, immediate) {
		var timeout, args, context, timestamp, result;
		
		var later = function() {
			var last = lang.now() - timestamp;
			
			if (last < wait && last >= 0) {
				timeout = setTimeout(later, wait - last);
			} else {
				timeout = null;
				if (!immediate) {
					result = func.apply(context, args);
					if (!timeout) context = args = null;
				}
			}
		};
		
		return function() {
			context = this;
			args = arguments;
			timestamp = lang.now();
			
			var callNow = immediate && !timeout;
			
			if (!timeout) timeout = setTimeout(later, wait);
			
			if (callNow) {
				result = func.apply(context, args);
				context = args = null;
			}
			
			return result;
		};
	};
	
	//创建一个函数, 只有在运行了 count 次之后才有效果. 在处理同组异步请求返回结果时, 
	//如果你要确保同组里所有异步请求完成之后才 执行这个函数, 这将非常有用。
	lang.after = function(times, func) {
		return function() {
			if (--times < 1) {
				return func.apply(this, arguments);
			}
		};
	};
	
	//创建一个函数,调用不超过count 次。 当count已经达到时，最后一个函数调用的结果将被记住并返回。
	lang.before = function(times, func) {
		var memo;
		return function() {
			if (--times > 0) {
				memo = func.apply(this, arguments);
			}
			
			if (times <= 1) func = null;
			
			return memo;
		};
	};
	
	//创建一个只能调用一次的函数。重复调用改进的方法也没有效果，只会返回第一次执行时的结果。 
	//作为初始化函数使用时非常有用, 不用再设一个boolean值来检查是否已经初始化完成.
	lang.once = lang.partial(lang.before, 2);
	
	// List of HTML entities for escaping.
	var escapeMap = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#x27;',
		'`': '&#x60;'
	};
	var unescapeMap = lang.invert(escapeMap);
	
	// Functions for escaping and unescaping strings to/from HTML interpolation.
	var createEscaper = function(map) {
		var escaper = function(match) {
			return map[match];
		};
		// Regexes for identifying a key that needs to be escaped
		var source = '(?:' + lang.keys(map).join('|') + ')';
		var testRegexp = RegExp(source);
		var replaceRegexp = RegExp(source, 'g');
		
		return function(string) {
			string = string == null ? '' : '' + string;
			return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
		};
	};
	
	lang.escape = createEscaper(escapeMap);
	
	lang.unescape = createEscaper(unescapeMap);
	
	lang.guid = 1;
	
	lang.uniqueId = lang.uuid = function(n){
		var n = n || 6;
		var chars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
		var res = "";
		 for(var i = 0; i < n ; i ++) {
			 var id = Math.ceil(Math.random()*35);
			 res += chars[id];
		 }
		 return res + lang.guid++;		
	};
	
	// Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
	lang.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
		lang['is' + name] = function(obj) {
		  return toString.call(obj) === '[object ' + name + ']';
		};
	});
	
	// Define a fallback version of the method in browsers (ahem, IE < 9), where
	// there isn't any inspectable "Arguments" type.
	if (!lang.isArguments(arguments)) {
		lang.isArguments = function(obj) {
			return lang.has(obj, 'callee');
		};
	}
	
	// Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
	// IE 11 (#1621), and in Safari 8 (#1929).
	if (typeof /./ != 'function' && typeof Int8Array != 'object') {
		lang.isFunction = function(obj) {
			return typeof obj == 'function' || false;
		};
	}
	
	var ua = navigator.userAgent.toLowerCase();
	
	lang.extend( lang, {
		
		isCreator : function( ctor ){
			return this.isFunction(ctor) && ctor.$isCreator;
		},
		/*
		*检测当前对象是否是Nex类
		*/
		isClass : function(obj){
			return obj && typeof obj === 'function' && obj.$isClass  ? true : false;
		},
		isNexConstructor : function(obj){
			return this.isClass(obj);	
		},
		/*
		*检测当前对象是否是Nex实例对象
		*/
		isNex : function(obj){
			return this.isInstance(obj);	
		},
		isInstance : function(obj){
			return  obj && typeof obj === 'object' && obj.isInstance  ? true : false;
		},
		/*
		*判断当前对象是否是xtype的对象类型 
		*/
		isXType : function(obj){
			return obj && typeof obj === 'object' && ('xtype' in obj )	? true : false;
		},
		/*
		*检测是否是jquery实例
		*/
		isjQuery : function(obj){
			return lang.type(obj) === 'object' && (obj instanceof $) ? true :　false;	
		},
		
		/**
         * Returns true if the passed value is iterable, false otherwise
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isIterable: function(value) {
            var type = typeof value,
                checkLength = false;
            if (value && type != 'string') {
                // Functions have a length property, so we need to filter them out
                if (type == 'function') {
                    // In Safari, NodeList/HTMLCollection both return "function" when using typeof, so we need
                    // to explicitly check them here.
                    if (support.isSafari) {
                        checkLength = value instanceof NodeList || value instanceof HTMLCollection;
                    }
                } else {
                    checkLength = true;
                }
            }
            return checkLength ? value.length !== undefined : false;
        },
		
		isArrayLike: isArrayLike,
		
		/**
         * Returns true if the passed value is an HTMLElement
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isElement: function(value) {
            return value ? value.nodeType === 1 : false;
        },
		
		isArray: nativeIsArray ? nativeIsArray : function(value) {
            return toString.call(value) === '[object Array]';
        },
		
		isFinite : function(obj) {
			return isFinite(obj) && !isNaN(parseFloat(obj));
		},
		
		isNaN : function(obj){
			return lang.isNumber(obj) && obj !== +obj;	
		},
		
		isBoolean : function(obj){
			return obj === true || obj === false || toString.call(obj) === '[object Boolean]';	
		},
		
		isNull : function(obj){
			return obj === null;
		},
		
		isUndefined : function(obj){
			return obj === void 0;
		},

        /**
         * Returns true if the passed value is empty, false otherwise. The value is deemed to be empty if it is either:
         *
         * - `null`
         * - `undefined`
         * - a zero-length array
         * - a zero-length string (Unless the `allowEmptyString` parameter is set to `true`)
         *
         * @param {Object} value The value to test
         * @param {Boolean} allowEmptyString (optional) true to allow empty strings (defaults to false)
         * @return {Boolean}
         * @markdown
         */
        isEmpty: function(value, allowEmptyString) {
			return (value === null) || (value === undefined) || (!allowEmptyString ? value === '' : false) || (lang.isArray(value) && value.length === 0) || (lang.isObject(value) && lang.isEmptyObject(value));
            //return (!allowEmptyString ? value === '' : false) || isEmpty(value);
        },
		
		isPromiseLike: function(promise) {
            return promise && lang.isFunction(promise.then);
        },
		
		isWindow: function( obj ) {
			/* jshint eqeqeq: false */
			return obj != null && obj == obj.window;
		},
		
		isEmptyObject : function( obj ) {
			var name;
			for ( name in obj ) {
				return false;
			}
			return true;
		},
		isPlainObject : function( obj ) {
			var key;
	
			// Must be an Object.
			// Because of IE, we also have to check the presence of the constructor property.
			// Make sure that DOM nodes and window objects don't pass through, as well
			if ( !obj || lang.type(obj) !== "object" || obj.nodeType || lang.isWindow( obj ) ) {
				return false;
			}
	
			try {
				// Not own constructor property must be Object
				if ( obj.constructor &&
					!hasOwnProperty.call(obj, "constructor") &&
					!hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf") ) {
					return false;
				}
			} catch ( e ) {
				// IE8,9 Will throw exceptions on certain host objects #9897
				return false;
			}
	
			// Own properties are enumerated firstly, so to speed up,
			// if last one is own, then all properties are own.
			for ( key in obj ) {}
	
			return key === undefined || hasOwnProperty.call( obj, key );
		},
        isSimpleObject: function(value) {
            return value instanceof Object && value.constructor === Object;
        },
        /**
         * Returns true if the passed value is a JavaScript 'primitive', a string, number or boolean.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isPrimitive: function(value) {
            var type = typeof value;

            return type === 'string' || type === 'number' || type === 'boolean';
        },

        /**
         * Validates that a value is numeric.
         * @param {Object} value Examples: 1, '1', '2.34'
         * @return {Boolean} True if numeric, false otherwise
         */
        isNumeric: function(value) {
            return !isNaN(parseFloat(value)) && isFinite(value);
        },

        /**
         * Returns true if the passed value is a TextNode
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isTextNode: function(value) {
            return value ? value.nodeName === "#text" : false;
        },

        /**
         * Returns true if the passed value is defined.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isDefined: function(value) {
            return typeof value !== 'undefined';
        },
		
		isStore : function(obj){
			return lang.isInstance(obj) && obj['$isStore'];
		},
		
		inArray : function(elem, arr){
			if ( arr ) {
				for ( var i=0, len = arr.length; i < len; i++ ) {
					// Skip accessing in sparse arrays
					var v = arr[ i ];
					
					if ( i in arr && (v === elem) ) {
						return i;
					}
				}
			}
			return -1;
		},
		
		/**
         * Returns the type of the given variable in string format. List of possible values are:
         *
         * - `undefined`: If the given value is `undefined`
         * - `null`: If the given value is `null`
         * - `string`: If the given value is a string
         * - `number`: If the given value is a number
         * - `boolean`: If the given value is a boolean value
         * - `date`: If the given value is a `Date` object
         * - `function`: If the given value is a function reference
         * - `object`: If the given value is an object
         * - `array`: If the given value is an array
         * - `regexp`: If the given value is a regular expression
         * - `element`: If the given value is a DOM Element
         * - `textnode`: If the given value is a DOM text node and contains something other than whitespace
         * - `whitespace`: If the given value is a DOM text node and contains only whitespace
         *
         * @param {Object} value
         * @return {String}
         * @markdown
         */
		type : function(value){
			if (value === null) {
                return 'null';
            }

            var type = typeof value;

            if (type === 'undefined' || type === 'string' || type === 'number' || type === 'boolean') {
                return type;
            }

            var typeToString = toString.call(value);

            switch(typeToString) {
                case '[object Array]':
                    return 'array';
                case '[object Date]':
                    return 'date';
                case '[object Boolean]':
                    return 'boolean';
                case '[object Number]':
                    return 'number';
                case '[object RegExp]':
                    return 'regexp';
            }

            if (type === 'function') {
                return 'function';
            }

            if (type === 'object') {
                if (value.nodeType !== undefined) {
                    if (value.nodeType === 3) {
                        return (/\S/).test(value.nodeValue) ? 'textnode' : 'whitespace';
                    }
                    else {
                        return 'element';
                    }
                }

                return 'object';
            }	
		}, 
		
		/**
         * @property
         * @private
         */
        globalEval: ('execScript' in root) ? function(code) {
            root.execScript(code)
        } : function(code) {
            (function(){
                eval(code);
            })();
        },
		
		/**
         * Clone almost any type of variable including array, object, DOM nodes and Date without keeping the old reference
         * @param {Object} item The variable to clone
         * @return {Object} clone
         */
		clone: function(item, excludeNode) {
            if (item === null || item === undefined) {
                return item;
            }
			
			if( excludeNode === undefined ) {
				excludeNode = false;	
			}

            // DOM nodes
            // TODO proxy this to Ext.Element.clone to handle automatic id attribute changing
            // recursively
            if ( item.nodeType && item.cloneNode ) {
                return excludeNode ? item : item.cloneNode(true);
            }

            var type = toString.call(item);

            // Date
            if (type === '[object Date]') {
                return new Date(item.getTime());
            }

            var i, j, k, clone, key;

            // Array
            if (type === '[object Array]') {
                i = item.length;

                clone = [];

                while (i--) {
                    clone[i] = lang.clone(item[i], excludeNode);
                }
            }
            // Object
            else if (type === '[object Object]' && item.constructor === Object) {
                clone = {};

                for (key in item) {
                    clone[key] = lang.clone(item[key], excludeNode);
                }

                if (enumerables) {
                    for (j = enumerables.length; j--;) {
                        k = enumerables[j];
                        clone[k] = item[k];
                    }
                }
            }

            return clone || item;
        },
		
		trim : String.prototype.trim ?
			function(str){ return str.trim(); } :
			function(str){ return str.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); },
		
		unDefined: function (val, d) {
			return val === undefined ? d : val;
		},
		
		htmlEncode: function(v){
			return lang.escape(v);	
		},
		
		htmlDecode: function(v){
			return lang.unescape(v);	
		},
		
		namespace : function( str, v ){
			var t = root,
				s = str+'';	
			s = s.split('.');
			for( var i=0,len=s.length-1;i<len;i++ ) {
				var e = s[i];
				if( !(e in t) || !t[e] ) {
					t[e] = {};	
				}
				t = t[e];	
			}	
			return t[s[i]] = t[s[i]] === void 0 ? ( v === void 0 ? {} : v ) : t[s[i]];
		},
		setNamespace : function(str,v){
			return this.namespace(str , v);
		},
		getNamespace : function( str ){
			var undef,
				t = root,
				s = str+'';	
			s = s.split('.');
			for( var i=0,len=s.length-1;i<len;i++ ) {
				var e = s[i];
				if( !(e in t) || !t[e] ) {
					return undef;
				}
				t = t[e];	
			}	
			return t[s[i]];
		},
		ns : function(){
			return this.namespace.apply( this, arguments );	
		},
		error : function( msg ){
			throw new Error( msg );
		}	
    });
	
	return lang;
});