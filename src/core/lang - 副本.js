/**
* lang.js
*/
define(function(require, exports, module){
	
	var _ = require('./lang/underscore');
	
	var template = require('./lang/template');
	
	require('./lang/jquery');
	
	var lang = {},
		root = self || global,
        enumerables = null,
		_pattern = /\{([^\}]+)\}/g,
        noop = function(){},
        i; 
		
	var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

	var
		push             = ArrayProto.push,
		slice            = ArrayProto.slice,
		concat           = ArrayProto.concat,
		toString         = ObjProto.toString,
		hasOwnProperty   = ObjProto.hasOwnProperty;
		
	
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
	
	function extend(dest, sources){
		if(!dest){ dest = {}; }
		for(var i = 1, l = arguments.length; i < l; i++){
			_extend(dest, arguments[i]);
		}
		return dest;
	}
	
	function extendIf(dest, sources) {
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
	
	function mixin(dest, sources){
		if(!dest){ dest = {}; }
		for(var i = 1, l = arguments.length; i < l; i++){
			extendIf(dest, arguments[i]);
		}
		return dest;
	}
	
	var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	var isArrayLike = function(obj){
		var length = obj == null ? void 0 : obj.length;
		return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;	
	}
	
	var isEmpty = _.isEmpty;
	
	function each(obj, iterator, context){
		if (obj == null) return obj;
		var i, length, hasContext = context === void 0 ? false : true;
		if (lang.isArrayLike(obj)) {
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
	}
	
	lang.extend = extend;
	
	lang.extendIf = extendIf;
	
	lang.mixin = mixin;
	
	lang.each = lang.forEach = each;
	
	lang.extend( lang, {
		guid : 1,
		/**
		* 返回随机字符串
		* @param {Number} 返回自定的长度的随机字符串 默认是6位
		* @return {String}
		*/
		uniqueId : function(n){
			var n = n || 6;
			var chars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
			var res = "";
			 for(var i = 0; i < n ; i ++) {
				 var id = Math.ceil(Math.random()*35);
				 res += chars[id];
			 }
			 return res;	
		},
		uuid : function(n){
			var str = lang.uniqueId(n||6);
			var guid = str+'-'+this.guid++;
			return guid;		
		}
	} );
	
	/**
	* Collection
	* see http://www.bootcss.com/p/underscore/#collections
	*/
	lang.extend(lang, {
		map : _.map, 
		reduce : _.reduce, 
		reduceRight : _.reduceRight, 
		filter : _.filter, 
		find : _.find,
		where : _.where,
		findWhere : _.findWhere,
		every : _.every, 
		some : _.some, 
		contains : _.contains, 
		groupBy : _.groupBy, 
		shuffle : _.shuffle,
		toArray : _.toArray,
		partition : _.partition,
		sortBy : _.sortBy,
		invoke : _.invoke,
		pluck : _.pluck,
		max : _.max,
		min : _.min,
		indexBy : _.indexBy,
		countBy : _.countBy,
		sample : _.sample,
		size : _.size
	});
	
	/**
	* Array
	* see http://www.bootcss.com/p/underscore/#arrays
	*/
	lang.extend(lang, {
		first: _.first, 	
		last: _.last, 
		compact: _.compact, 
		without: _.without, 
		difference: _.difference, 
		uniq: _.uniq,
		unique: _.unique,
		indexOf: _.indexOf, 
		lastIndexOf: _.lastIndexOf, 
		range: _.range,
		object: _.object,
		zip: _.zip
	});
	
	/**
	* Function
	* see http://www.bootcss.com/p/underscore/#functions
	*/
	lang.extend(lang, {
		bind : _.bind,
		bindAll : _.bindAll,
		partial : _.partial,
		delay: _.delay,	
		defer: _.defer,
		throttle: _.throttle,
		debounce: _.debounce,
		once: _.once,
		wrap: _.wrap,
		after: _.after,
		before: _.before
	});
	
	/**
	* Object
	* see http://www.bootcss.com/p/underscore/#objects
	*/
	lang.extend(lang, {
		keys: _.keys, 	
		values: _.values, 
		pick: _.pick, 
		functions : _.functions,
		omit : _.omit,
		defaults: _.defaults,
		copy: _.clone,
		property: _.property,
		has : _.has,
		isEqual : _.isEqual,
		isElement : _.isElement,
		isArrayLike: isArrayLike,
		isArray : _.isArray,
		isObject : _.isObject,
		isArguments : _.isArguments,
		isFunction : _.isFunction,
		isString : _.isString,
		isNumber : _.isNumber,
		isFinite : _.isFinite,
		isBoolean : _.isBoolean,
		isDate : _.isDate,
		isRegExp : _.isRegExp,
		isNaN : _.isNaN,
		isNull : _.isNull,
		isUndefined : _.isUndefined
	});
	
	/**
	* utils
	*/
	lang.extend( lang, {
		noop : noop,	
		times : _.times,
		identity: _.identity,
		escape : _.escape,	
		unescape : _.unescape,	
		now : _.now,		
		random : _.random
	});
	
	lang.extend( lang, {
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
                    if (Nex.isSafari) {
                        checkLength = value instanceof NodeList || value instanceof HTMLCollection;
                    }
                } else {
                    checkLength = true;
                }
            }
            return checkLength ? value.length !== undefined : false;
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
			return (value === null) || (value === undefined) || (!allowEmptyString ? value === '' : false) || (Nex.isArray(value) && value.length === 0) || (Nex.isObject(value) && Nex.isEmptyObject(value));
            //return (!allowEmptyString ? value === '' : false) || isEmpty(value);
        },
		
		isPromiseLike: function(promise) {
            return promise && Nex.isFunction(promise.then);
        },
		
		trim : String.prototype.trim ?
			function(str){ return str.trim(); } :
			function(str){ return str.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); },
		
		isWindow: function( obj ) {
			/* jshint eqeqeq: false */
			return obj != null && obj == obj.window;
		},
		
		isObject: (toString.call(null) === '[object Object]') ?
        function(value) {
            // check ownerDocument here as well to exclude DOM nodes
            return value !== null && value !== undefined && toString.call(value) === '[object Object]' && value.ownerDocument === undefined;
        } :
        function(value) {
            return toString.call(value) === '[object Object]';
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
		
		unDefined: function (val, d) {
			return val === undefined ? d : val;
		},
		
		isStore : function(obj){
			return Nex.isInstance(obj) && obj['$isStore'];
		},
		
		htmlEncode: function(v){
			return v;	
		},
		
		htmlDecode: function(v){
			return v;	
		},
		
		replace: function(tmpl, map, pattern){
			// example:
			//	|	// uses a dictionary for substitutions:
			//	|	Nex.replace("Hello, {name.first} {name.last} AKA {nick}!",
			//	|		{
			//	|			nick: "Bob",
			//	|			name: {
			//	|				first:	"Robert",
			//	|				middle: "X",
			//	|				last:		"Cringely"
			//	|			}
			//	|		});
			//	|	// returns: Hello, Robert Cringely AKA Bob!
			// example:
			//	|	// uses an array for substitutions:
			//	|	Nex.replace("Hello, {0} {2}!",
			//	|		["Robert", "X", "Cringely"]);
			//	|	// returns: Hello, Robert Cringely!
			// example:
			//	|	// uses a function for substitutions:
			//	|	function sum(a){
			//	|		var t = 0;
			//	|		arrayforEach(a, function(x){ t += x; });
			//	|		return t;
			//	|	}
			//	|	Nex.replace(
			//	|		"{count} payments averaging {avg} USD per payment.",
			//	|		lang.hitch(
			//	|			{ payments: [11, 16, 12] },
			//	|			function(_, key){
			//	|				switch(key){
			//	|					case "count": return this.payments.length;
			//	|					case "min":		return Math.min.apply(Math, this.payments);
			//	|					case "max":		return Math.max.apply(Math, this.payments);
			//	|					case "sum":		return sum(this.payments);
			//	|					case "avg":		return sum(this.payments) / this.payments.length;
			//	|				}
			//	|			}
			//	|		)
			//	|	);
			//	|	// prints: 3 payments averaging 13 USD per payment.
			// example:
			//	|	// uses an alternative PHP-like pattern for substitutions:
			//	|	Nex.replace("Hello, ${0} ${2}!",
			//	|		["Robert", "X", "Cringely"], /\$\{([^\}]+)\}/g);
			//	|	// returns: Hello, Robert Cringely!
		
			return tmpl.replace(pattern || _pattern, lang.isFunction(map) ?
				map : function(_, k){ return lang.getObject(k, false, map); });
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
		//作废
		when : function(){
			var arr = [].slice.apply(arguments);
			var deferreds = [];
			for( var i=0,len=arr.length;i<len;i++ ) {
				var cmp;
				var deferred = arr[i];
				if( lang.isXType( deferred ) || lang.isString( deferred ) ) {
					var cmp = lang.create( deferred );
					if( cmp && cmp.getDeferred ) {
						deferred = cmp.getDeferred();	
					} else {
						deferred = null;
					}
				}
				
				if( lang.isInstance( deferred ) ) {
					deferred = deferred.getDeferred ? deferred.getDeferred() : null;

				}
				if( deferred ) {
					deferreds.push( deferred );
				}
			}
			return $.extend($.when.apply( $, deferreds ),{
				success : function(){
					this.done.apply( this,arguments )	
				},
				error : function(){
					this.fail.apply( this,arguments )	
				},
				complete : function(){
					this.always.apply( this,arguments )	
				}	
			});	
		},
		error : function( msg ){
			throw new Error( msg );
		}	
    });
	
	return lang;
});