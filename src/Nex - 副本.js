//防止用户先加载jquery 再加载boot.js
if( window.jQuery || window.Zepto ) {
	define('jquery', function(){
		return window.jQuery || window.Zepto;	
	});	
}
define(function(require, exports, module){
	
	////////////////////////////////////////////////
	////////////////////////////////////////////////
	/////////////////////CORE///////////////////////
	////////////////////////////////////////////////
	////////////////////////////////////////////////
	
	var $ = require('jquery');
	var Nex = window.Nex = window.Nex || {},
		objectPrototype = Object.prototype,
        toString = objectPrototype.toString,
        enumerables = null,
        noop = $.noop,
        i;
	
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
    Nex.enumerables = enumerables;
	
	Nex.apply = function(object, config, defaults) {
        if (defaults) {
            Nex.apply(object, defaults);
        }

        if (object && config && typeof config === 'object') {
            var i, j, k;

            for (i in config) {
                object[i] = config[i];
            }

            if (enumerables) {
                for (j = enumerables.length; j--;) {
                    k = enumerables[j];
                    if (config.hasOwnProperty(k)) {
                        object[k] = config[k];
                    }
                }
            }
        }

        return object;
    };
	
	Nex._extend = function(dest, source) {
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
	
	Nex.extend = function(dest, sources){
		if(!dest){ dest = {}; }
		for(var i = 1, l = arguments.length; i < l; i++){
			Nex._extend(dest, arguments[i]);
		}
		return dest;
	}
	
	Nex.extendIf = function(dest, sources) {
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
	
	function _mixin(dest, source, copyFunc){
		var name, s, i, empty = {};
		for(name in source){
			s = source[name];
			if(!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))){
				dest[name] = copyFunc ? copyFunc(s) : s;
			}
		}

		if(enumerables){
			if(source){
				for(i = 0; i < enumerables.length; ++i){
					name = enumerables[i];
					s = source[name];
					if(!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))){
						dest[name] = copyFunc ? copyFunc(s) : s;
					}
				}
			}
		}

		return dest;
	}
	
	function mixin(dest, sources){
		if(!dest){ dest = {}; }
		for(var i = 1, l = arguments.length; i < l; i++){
			_mixin(dest, arguments[i]);
		}
		return dest;
	}
	
	//common
	Nex.apply( Nex, {
		version : '1.0',
		//aid : 1,
		guid : 1,
		utils : {},
		addUtil : function(n, v){
			this.utils[n] = v;	
		},
		mixin : mixin,
		//scrollbarSize : false,
		//resizeOnHidden : true,	
		//easingDef : $.easing.def ? $.easing.def : 'swing',
		/*
		*返回随机字符串
		*@param {Number} 返回自定的长度的随机字符串 默认是6位
		*@return {String}
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
			var str = Nex.uniqueId(n||6);
			var guid = str+'-'+Nex.guid++;
			return guid;		
		}
	} );
	
	Nex.apply( Nex, {
		isCreator : function( crt ){
			return this.isFunction(crt) && crt.$isCreator;
		},
		/*
		*检测当前对象是否是Nex类
		*/
		isClass : function(v){
			return  typeof v === 'function' && v.$isClass  ? true : false;
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
		isInstance : function(v){
			return  typeof v === 'object' && v.isInstance  ? true : false;
		},
		/*
		*判断当前对象是否是xtype的对象类型 
		*/
		isXType : function(obj){
			return typeof obj === 'object' && ('xtype' in obj )	? true : false;
		},
		/*
		*检测是否是jquery实例
		*/
		isjQuery : function(obj){
			return $.type(obj) === 'object' && (obj instanceof $) ? true :　false;	
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
                    clone[i] = Nex.clone(item[i], excludeNode);
                }
            }
            // Object
            else if (type === '[object Object]' && item.constructor === Object) {
                clone = {};

                for (key in item) {
                    clone[key] = Nex.clone(item[key], excludeNode);
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
			var type = $.type(value);
			if (type === 'object') {
                if(value.nodeType !== undefined) {
                    if(value.nodeType === 3) {
                        return (/\S/).test(value.nodeValue) ? 'textnode' : 'whitespace';
                    } else {
                        return 'element';
                    }
                }
                return 'object';
            } else {
				return type;	
			}	
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
            return (value === null) || (value === undefined) || (!allowEmptyString ? value === '' : false) || (Nex.isArray(value) && value.length === 0);
        },

        /**
         * Returns true if the passed value is a JavaScript Array, false otherwise.
         *
         * @param {Object} target The target to test
         * @return {Boolean}
         * @method
         */
        isArray: $.isArray,

        /**
         * Returns true if the passed value is a JavaScript Date object, false otherwise.
         * @param {Object} object The object to test
         * @return {Boolean}
         */
        isDate: function(value) {
            return toString.call(value) === '[object Date]';
        },

        /**
         * Returns true if the passed value is a JavaScript Object, false otherwise.
         * @param {Object} value The value to test
         * @return {Boolean}
         * @method
         */
        isObject: (toString.call(null) === '[object Object]') ?
        function(value) {
            // check ownerDocument here as well to exclude DOM nodes
            return value !== null && value !== undefined && toString.call(value) === '[object Object]' && value.ownerDocument === undefined;
        } :
        function(value) {
            return toString.call(value) === '[object Object]';
        },
		isEmptyObject : $.isEmptyObject,
		isPlainObject : $.isPlainObject,
        isSimpleObject: function(value) {
            return value instanceof Object && value.constructor === Object;
        },
        isArguments : function(value){
			return toString.call(value) === '[object Arguments]' || !!value.callee;	
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
         * Returns true if the passed value is a JavaScript Function, false otherwise.
         * @param {Object} value The value to test
         * @return {Boolean}
         * @method
         */
        isFunction:
        // Safari 3.x and 4.x returns 'function' for typeof <NodeList>, hence we need to fall back to using
        // Object.prorotype.toString (slower)
        (typeof document !== 'undefined' && typeof document.getElementsByTagName('body') === 'function') ? function(value) {
            return toString.call(value) === '[object Function]';
        } : function(value) {
            return typeof value === 'function';
        },

        /**
         * Returns true if the passed value is a number. Returns false for non-finite numbers.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isNumber: function(value) {
            return typeof value === 'number' && isFinite(value);
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
         * Returns true if the passed value is a string.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isString: function(value) {
            return typeof value === 'string';
        },

        /**
         * Returns true if the passed value is a boolean.
         *
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isBoolean: function(value) {
            return typeof value === 'boolean';
        },

        /**
         * Returns true if the passed value is an HTMLElement
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isElement: function(value) {
            return value ? value.nodeType === 1 : false;
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
		inArray : function(elem,arr){
			if( $.type( elem ) === 'number' ) {
				elem = elem+'';	
			}
			if ( arr ) {
				var len = arr.length;
				var i = 0;
				for ( ; i < len; i++ ) {
					// Skip accessing in sparse arrays
					var v = arr[ i ];
					if( $.type( v ) === 'number' ) {
						v = v+'';	
					}
					if ( i in arr && (v === elem) ) {
						return i;
					}
				}
			}
			return -1;
		},
		copy : function(data){
			if( Nex.isArray( data ) ) {
				return  [].concat(data);	
			} else if( Nex.isPlainObject(data) ) {
				return Nex.apply({},data);
			} else {
				return data;	
			}
		},
		when : function(){
			var arr = [].slice.apply(arguments);
			var deferreds = [];
			for( var i=0,len=arr.length;i<len;i++ ) {
				var cmp;
				var deferred = arr[i];
				if( Nex.isXType( deferred ) || Nex.isString( deferred ) ) {
					var cmp = Nex.create( deferred );
					if( cmp && cmp.getDeferred ) {
						deferred = cmp.getDeferred();	
					} else {
						deferred = null;
					}
				}
				
				if( Nex.isInstance( deferred ) ) {
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
		noop : noop,
		error : function( msg ){
			var undef,
				e = new Error((msg===undef?'':msg));
			throw e;
			return e;	
		}	
    });

    Nex.apply( Nex, {
        invoke : function(arr, methodName){
            var ret = [],
                args = Array.prototype.slice.call(arguments, 2);
            $.each(arr, function(i,v) {
                if (v && typeof v[methodName] == 'function') {
                    ret.push(v[methodName].apply(v, args));
                } else {
                    ret.push(undefined);
                }
            });
            return ret;
        }
    } );
	
	Nex.apply( Nex, {
		/*类的别名*/
		aliases : {},
		/*
		*xtype对应的类
		*/
		xtypes : {},
		/*类*/
		classes : {},
		getClass : function( name ){
			return this.classes[name] || this.aliases[name] || this.xtypes[name];
		},
		addClass : function( name,cls ){
			this.classes[name] = cls;
			return this;
		},
		addXType : function( name,cls ){
			this.xtypes[name] = cls;
			return this;	
		},
		addAlias : function( name,cls ){
			this.aliases[name] = cls;
			return this;	
		},
		/*
		*创建类
		*	examples:
		*		function Class( age,name ){
		*			this.age = age;
		*			this.name=name;	
		*		}
		*		Class.prototype = {
		*			getAge : function(){
		*				return this.age; 	
		*			},
		*			getName : function(){
		*				return this.name; 	
		*			}
		*		}
		*		var obj = new Class( 21, nobo );
		*		or
		*		var obj = Nex.createClass( Class, 21, 'nobo' );
		*/
		createClass : (function(){
			function cloneFn( fn ){
				var constructor = function(){};
				constructor.prototype = fn.prototype;
				return constructor;
			}
			return 	function(){//Class, argv1,argv2,...
				var Class = arguments[0];
				var Args  = [].slice.call( arguments, 1 );	
				
				if( typeof Class != 'function' ) {
					return null;	
				}
				
				var instance = new (cloneFn( Class ));
				Class.apply( instance, Args );
				return instance;
			};
		})(),
		/*
		*实例化Nex类
		*	examples:
		*		Nex.define('MyApp',{
		*			age : null,
		*			name : null,
		*			constructor : function( age, name ){
		*				if( Nex.isObject( age ) ) {
		*					this.age = age.age;
		*					this.name=age.name;	
		*				} else {
		*					this.age = age;
		*					this.name=name;
		*				}
		*			},
		*			say : function(){
		*				alert('Hello '+this.name);	
		*			}	
		*		});
		*		new MyApp(21, 'nobo');
		*		or
		*		Nex.create('MyApp', 21, 'nobo');
		*		or
		*		Nex.create(MyApp, 21, 'nobo');
		*		or
		*		Nex.create({
		*			xtype : 'MyApp',
		*			age : 21,
		*			name : 'nobo'	
		*		});
		*/
		create : function(){
			var self = this,undef;
			var argvs = [].slice.apply(arguments);
			
			var Class = argvs[0];
			var params = argvs.slice(1);
			
			var len = argvs.length;
			if( len<=0 ) {
				this.error('missing parameter!');
				return false;
			}
			
			if( Nex.isInstance( Class ) ) {
				return Class;	
			}
			
			if( Nex.isClass( Class ) ) {
				return Nex.createClass.apply( Nex, [ Class ].concat( params ) );
			}
			
			if( Nex.isXType(Class) ) {
				var opts = Class;
				var xtype = opts.xtype;
				delete opts.xtype;	
				Class = Nex.getClass( xtype );
				if( Class ) {
					if( Nex.isInstance( Class ) ) {
						return Class;			
					}
					return Nex.createClass.apply( Nex, [ Class,opts  ].concat( params ) ); 	
				} else {
					this.error('[xtype]'+xtype + ' not exists!');
					return false;	
				}
			}
			
			if( Nex.isString( Class ) ) {
				Class = Nex.getClass( Class );	
				if( !Class ) {
					this.error('[class]'+xtype + ' not exists!');
					return false;	
				}
				if( Nex.isInstance( Class ) ) {
					return Class;			
				}
				return Nex.createClass.apply( Nex, [ Class ].concat( params ) );
			}
			
			return false;
		},
		Create : function(){
			return this.create.apply( this, arguments );	
		}
	} );
	
	////////////////////////////////////////////////
	////////////////////////////////////////////////
	/////////////////////BASE.js////////////////////
	////////////////////////////////////////////////
	////////////////////////////////////////////////
	
	var noArgs = [],
	enumerables = Nex.enumerables,
	Base = function(){};
	
	Nex.apply( Base, {
		$className: 'Nex.Base',
		$isClass: true,	
		xtype : 'Nex.Base',
		superclass : null,
		override: function(members) {
			var prototype = Nex.isInstance(this) ? this : this.prototype,
				names = [],
				i, ln, name, member,
				cloneFunction = function(method){
					return function() {
						return method.apply(this, arguments);
					};	
				};
				
			var className = this.$className || '';	
			
			for (name in members) {
				names.push(name);
			}
			
			if (enumerables) {
				names.push.apply(names, enumerables);
			}
			
			for (i = 0,ln = names.length; i < ln; i++) {
				name = names[i];

				if (members.hasOwnProperty(name)) {
					member = members[name];
					
					if (typeof member == 'function' && !member.$isClass) {
						if (typeof member.$owner != 'undefined') {
							member = cloneFunction(member);
						}
						member.$owner = this;
						member.$name = name;
					}
					prototype[name] = member;
				}
			}
			
			prototype.$className = className;	
			prototype.self = this;	
			
			return this;
		},
		addStatics: function(members) {
			var member, name;

			for (name in members) {
				if( Nex.inArray(name, [ '_optionsList', 'xtype', 'superclass', '$className', '$isClass']) !== -1 ) continue;
				if (members.hasOwnProperty(name)) {
					member = members[name];
					this[name] = member;
				}
			}

			return this;
		},
		addMembers: function(members) {
			var prototype = Nex.isInstance(this) ? this : this.prototype,
				names = [],
				i, ln, name, member;
				
			var className = this.$className || '';	
			
			for (name in members) {
				names.push(name);
			}

			if (enumerables) {
				names.push.apply(names, enumerables);
			}

			for (i = 0,ln = names.length; i < ln; i++) {
				name = names[i];

				if (members.hasOwnProperty(name)) {
					member = members[name];

					if (typeof member == 'function' && !member.$isClass) {
						member.$owner = this;
						member.$name = name;
					}

					prototype[name] = member;
				}
			}
			
			prototype.$className = className;	
			prototype.self = this;	
			
			return this;
		},
		addMember: function(name, member) {
			var m = {};
			m[name] = member;
			return this.addMembers(m);
		},
		mixins: function(members) {
			if( members.configs ) {
				this.setOptions(members.configs);
				delete members.configs;
			}
			return this.addMembers(members);
		},
		
		/**
		 * Borrow another class' members to the prototype of this class.
		 *
		 *     Nex.define('Bank', {
		 *         money: '$$$',
		 *         printMoney: function() {
		 *             alert('$$$$$$$');
		 *         }
		 *     });
		 *
		 *     Nex.define('Thief', {
		 *         ...
		 *     });
		 *
		 *     Thief.borrow(Bank, ['money', 'printMoney']);
		 *
		 *     var steve = new Thief();
		 *
		 *     alert(steve.money); // alerts '$$$'
		 *     steve.printMoney(); // alerts '$$$$$$$'
		 *
		 * @param {Nex.Base} fromClass The class to borrow members from
		 * @param {Array/String} members The names of the members to borrow
		 * @return {Nex.Base} this
		 * @static
		 * @inheritable
		 * @private
		 */
		borrow: function(fromClass, members) {
			var prototype = Nex.isInstance(this) ? this : this.prototype,
				fromPrototype = fromClass.$isClass ? fromClass.prototype : 
				( (fromClass = Nex.getClass(fromClass)) ? fromClass.prototype : {} ),
				i, ln, name, fn, toBorrow;

			members = Nex.isArray( members ) ? [].concat(members) : [ members ];

			for (i = 0,ln = members.length; i < ln; i++) {
				name = members[i];

				toBorrow = fromPrototype[name];

				if (typeof toBorrow == 'function') {
					fn = function() {
						return toBorrow.apply(this, arguments);
					};

					fn.$owner = this;
					fn.$name = name;

					prototype[name] = fn;
				}
				else {
					prototype[name] = toBorrow;
				}
			}
			
			prototype.self = this;	
				
			return this;
		},
		setXType : function(xtype){
			var undef;
			if( xtype === undef ) return this;
			
			this.xtype = xtype;
			
			//Nex.classes[ xtype ] = this;
			Nex.addXType( xtype, this );
			
			return this;	
		},
		getXType : function(){
			return this.xtype;	
		},
		setAliasName : function( aliasName ){
			var self = this;
			if( aliasName ) {
				var aliasNames = $.trim(aliasName).split(/\s+/g);
				$.each( aliasNames,function(i,n){
					Nex.setNamespace( n,self );
					Nex.addAlias( n,self );
				} );
			}	
			return self;
		},
		_optionsList : [],
		setOptions : function( options ){
			if( Nex.isObject( options ) ) {
				var _opts = options;
				options = function(){
					return _opts;//Nex.clone( _opts, true );
				}
			}
			if( Nex.isFunction( options ) ) {
				this._optionsList.push( function( opt, scope ){
					return options.call( this, opt, scope );
				} );
			}
			return this;
		},
		getOptions : function( scope ){
			var opt = {};
			var list = this._optionsList || [];
			var opts = this.getSuperClassOptions( scope ) || {};
			opts = opts.concat(list);
			var len = opts.length;
			if( len ) {
				for( var i = 0; i < len; i++ ) {
					var o = opts[i];
					Nex.apply( opt, o.call( this, opt, scope || this ) );	
				}
			}
			return Nex.clone(opt, true);
		},
		getSuperClass : function(){
			return this.superclass ? this.superclass.self : null;	
		},
		getSuperClassOptions : function( scope ){
			var subClass = this,
				opts = [];
				
			while( subClass = subClass.getSuperClass() ) {
				
				opts.push.apply( opts, subClass._optionsList || [] );
				
			}
			
			return opts.reverse();
		},
		create : function(){
			return Nex.create.apply( Nex, [ this ].concat( [].slice.apply( arguments ) ) );	
		},
		/**
		* 生成一个构造器
		*/
		creator : function(cfg){
			var me = this;
			
			var opts = cfg || {};
			
			var crt = function(s){
				return me.create.apply(me, [ Nex.apply({}, s || {}, opts) ]);	
			}
			
			crt.$isCreator = true;
			
			return crt;
		}
	} );
	Nex.apply( Base.prototype, {
		isInstance : true,
		$className : 'Nex.Base',
		self 	   : Base,
		superclass : null,
		_super : function(args){
			var method,
				fn = function(){},
				superMethod = (method = this._super.caller) && 
							  (method = method.$owner ? method : method.caller) &&
							   method.$owner.superclass[method.$name];
				superMethod = superMethod || fn;	
			return superMethod.apply(this, args || noArgs);	
		},
		getXType : function(){
			return this.self.getXType();	
		},
		extend : function( data ){
			var self = this;
			var Class = self.self;	
			if( data && Nex.isPlainObject( data ) ) {
				Class.override.call( self, data );
			}
			return self;
		},
		/**
		*动态组合
		*	obj.addMixins( mixin1,mixin2,... )
		*/
		addMixins : function(){
			var self = this;
			var opt = this.configs;
			
			var mixs = [].slice.call( arguments, 0);
			
			var configs = [], properties = {}, i=0, len = mixs.length;
			
			if( !len ) return self;
			
			for( ;i<len;i++ ) {
				var m = mixs[i];
				if( Nex.isString( m ) ) {
					m = Nex.getClass( m );	
					if( !m ) continue;
				}
				if( Nex.isClass( m ) ) {
					configs.push( function( opt, scope ){
						return m.getOptions( scope );	
					} );	
					Nex.apply( properties, m.prototype || {} );
				} else if( Nex.isObject( m ) ){
					if( m.configs ) {
						configs.push( m.configs );
					}
					delete m.configs;
					Nex.apply( properties, m );
				}
			}
			//组合成员
			self.extend(properties);
			//组合参数
			if( configs.length ) {
				var mopts = {};	
				for( var i=0, len=configs.length; i<len; i++ ) {
					var cfg = configs[i];
					if( Nex.isFunction( cfg ) ) {
						Nex.apply( mopts, cfg( mopts, self ) || {} );	
					} 	
					if( Nex.isObject( cfg ) ) {
						Nex.apply( mopts, Nex.clone( cfg, true ) );		
					}
				}
				Nex.apply( opt, mopts );
			}
			return self;
		},
		//_initConf : false,
		initConfigs : function( cfg ){
			var self = this;
			var Class = self.self;
			
			if( self._initConf ) return self.configs;
			
			var opts = Class.getOptions( self );
			
			var cfg = cfg || {};
			
			if( Nex.isFunction( cfg ) ) {
				cfg = cfg.call( self,opts ) || {};	
			}
			
			var configs = opts;
			self.configs = configs;
			
			var mixins = cfg.mixins || opts.mixins;
			
			if( cfg.mixins ) delete cfg.mixins;
			if( opts.mixins ) delete opts.mixins;
			
			if( mixins ) {
				self.addMixins.apply( self, Nex.isArray( mixins ) ? mixins : [ mixins ] );
			}
			
			/*如果参数中有properties,则当前属性会赋值到当前对象的properties*/
			var properties = [];

			configs.properties && properties.push(configs.properties);

			configs.override && properties.push(configs.override);

			if( properties.length ) {
				configs.properties = null;
				configs.override = null;
				delete configs.properties;
				delete configs.override;
				for( var i=0, len=properties.length;i<len;i++ ) {
					var proto = properties[i];
					if( !proto ) continue;
					if( Nex.isFunction( proto ) ) {
						proto = proto.call( self,configs );
					}
					if( !proto ) continue;
					if( Nex.isObject( proto ) ) {
						self.extend( proto );
					}
				}
			}
			//合并自定义参数
			self.configs = Nex.apply( {}, cfg, configs );
			
			self._initConf = true;
			
			return self.configs;
		},
		/*
		*组件参数设置和获取
		*/
		C : function(key,value){
			var args = arguments;
			if( !args.length ) {
				return this.configs;	
			}
			if( args.length == 1 ) {
				return this.configs[key];	
			}
			if( args.length > 1 ) {
				this.configs[key] = value;	
				return this;
			}
			return this;
		},
		getOptions : function(){
			return this.configs;	
		},
		setOptions : function(cfgs){
			this.configs = cfgs;
			return this;	
		},
		// Default constructor
		constructor: function( cfg ) {
			this.initConfigs.apply( this,arguments );
		}	
	} );
	
	Base.fn = Base.prototype;
	
	Nex.Base = Base;
	
	Nex.classes['Nex.Base'] = Base;
	
	////////////////////////////////////////////////
	////////////////////////////////////////////////
	/////////////////////CLASS.js///////////////////
	////////////////////////////////////////////////
	////////////////////////////////////////////////
	
	function chain(object) {
		var TC = function() {};
		TC.prototype = object;
		var result = new TC();
		TC.prototype = null;
		return result;
	};
	
	function extendClass(subClass, superClass) {
		var superPrototype = superClass.prototype,
			prototype, name;
				
		if( Nex.isObject(superClass) ) {
			subClass.override( superClass );
			return;
		}
		
		for( var k in superClass ) {
			if( superClass.hasOwnProperty(k) ) {
				subClass[k] = superClass[k];
			}	
		}
		
		prototype = subClass.fn = subClass.prototype = chain(superPrototype);
				
		subClass.superclass = prototype.superclass = superPrototype;
		
		prototype.self = subClass;//作用同 prototype.constructor
	}
	
	win = window,
	Base = Nex.Base,
	baseChain = function(className){
		
		var basePrototype = Base.prototype;
		
		function constructor() {
			return this.constructor.apply(this, arguments);
		}
		
		extendClass(constructor, Base);
		
		if( className === null ) {
			className = Nex.uuid();	
		}
		
		constructor.$className = className;	
		constructor.prototype.$className = className;	
		constructor._optionsList = [];
		return constructor;		
	}
	;
	
	Nex.apply( Nex, {
		/**
		*定义类
		*	extend 继承
		*	alias  别名
		*	xtype 设置组件的xtype 注意实际中  alias和xtype的唯一区别是 alias会自动生成命名控件
		*	configs 参数
		*	mixins  组合
		*	singleton 单例模式	
		*/		
		Class : function(className, superName, overrides){
			if( !arguments.length ) {
				Nex.error('className not exists!');	
				return this;
			}
			
			var args = [];
			
			//如果className是对象则定义一个佚名类
			if( Nex.isObject(className) ) {
				superName = className;
				className = null;
			}
			//定义一个Nex基础类Base
			var subClass = baseChain(className);
			
			className =  subClass.$className;
			
			subClass.xtype = className;
			
			this.classes[ className ] = subClass;
			
			if( subClass ) {
				args.push(subClass);
			}
			
			if( superName ) {
				args.push(superName);
			}
			
			if( overrides ) {
				args.push(overrides);
			}
			
			//设置作用域
			this.setNamespace( className, Nex.extend.apply(Nex, args) );
			
			subClass.$className = className;
			
			subClass.prototype.$className = className;
			
			return subClass;
		},
		define : function(){
			return this.Class.apply(this, arguments);	
		},
		extendx : function(className, superName, members){
			var subClass,
				superClass,
				_extendClass;
			if( arguments.length === 2 && Nex.isObject(superName) ) {
				members = superName;	
				superName  = null;
			}
			if( typeof className === 'function' && className.$isClass ) {
				subClass = className;
			} else {
				subClass = Nex.getClass( className );
			}
			
			if( !subClass ) {
				subClass = Nex.Class(className);
			}
			
			if( subClass.isInstance ) {
				throw new Error("extend error, class is isInstance!");		
			}
			
			if( arguments.length === 1 ) return subClass;
			
			members = Nex.apply({},members) || {};
			
			_extendClass = members.extend || superName;
			
			delete members.extend;
			
			if( _extendClass && typeof _extendClass === 'function' && _extendClass.$isClass ) {
				superClass = _extendClass;
			} else {
				superClass = _extendClass ? Nex.getClass( _extendClass ) : _extendClass;
			}
			
			var _xtype = subClass.xtype;
			var _optionsList = subClass._optionsList;
			
			if( superClass ) {
				extendClass( subClass, superClass );
			}
			
			subClass.xtype = _xtype;
			subClass._optionsList = _optionsList;
			
			var aliasName,xtype,configs,mixins;
			if( 'alias' in members && members.alias ) {
				aliasName = members.alias + "";
				delete members.alias; 	
			}
			if( 'xtype' in members && members.xtype ) {
				xtype = members.xtype + "";
				delete members.xtype; 
			}
			if( 'configs' in members && members.configs ) {
				configs = members.configs;
				delete members.configs; 	
			}
			if( 'mixins' in members && members.mixins ) {
				mixins = members.mixins;
				delete members.mixins; 	
			}
			
			if( configs ) {
				subClass.setOptions(configs);		
			}	
			
			//默认设置xtype等于类名
			subClass.setXType( subClass.$className );
			
			subClass.override( members );
			
			this._setMixins( mixins, subClass );
			
			var isSingleton = !!subClass.prototype.singleton;
			//判断是否单例模式 singleton = true
			if( isSingleton ) {
				subClass = new subClass();	
			}
			//别名设置
			if( aliasName ) {
				this._setAliasName( aliasName, subClass );
			}
			if( !isSingleton && subClass.$isClass ) {
				this._setClassXtype( xtype, subClass );	
			}
			
			return subClass;
		},
		/**
		* 定义类的时候 组合数据，此处的组合是会覆盖的
		*/
		_setMixins : function( mixins, subClass ){
		
			var mixs = Nex.isArray( mixins ) ? mixins : [ mixins ];	
						
			var configs = [], properties = {}, i=0, len = mixs.length;
			
			if( !len ) return;
			
			for( ;i<len;i++ ) {
				var m = mixs[i];
				if( Nex.isString( m ) ) {
					m = Nex.getClass( m );	
					if( !m ) continue;
				}
				if( Nex.isClass( m ) ) {
					configs.push( function( opt, scope ){
						return m.getOptions( scope );	
					} );	
					Nex.apply( properties, m.prototype || {} );
				} else if( Nex.isObject( m ) ){
					if( m.configs ) {
						configs.push( m.configs );
					}
					delete m.configs;
					Nex.apply( properties, m );
				}
			}
			//组合成员
			subClass.override(properties);
			//Nex.apply( subClass.prototype, properties );
			//组合参数
			if( configs.length ) {
				subClass.setOptions( function( opts,scope ){
					var opts = opts || {};
					var scope = scope || this;
					
					var mopts = {};	
					for( var i=0, len=configs.length; i<len; i++ ) {
						var cfg = configs[i];
						if( Nex.isFunction( cfg ) ) {
							Nex.apply( mopts, cfg( mopts, scope ) || {} );	
						} 	
						if( Nex.isObject( cfg ) ) {
							Nex.apply( mopts, Nex.clone( cfg, true ) );		
						}
					}
					return mopts;//Nex.apply( opts, mopts );
				} );
			}
		},
		_setAliasName : function( aliasName, subClass ){
			var aliasNames = $.trim(aliasName).split(/\s+/g);	
			$.each( aliasNames,function(i,n){
				if( !n ) return;
				Nex.setNamespace( n,subClass );
				Nex.addAlias( n,subClass );
			} );
		},
		_setClassXtype : function( xtype, subClass ){
			var xtypes = $.trim(xtype).split(/\s+/g);
			$.each( xtypes,function(i,t){
				if( !t ) return;
				subClass.setXType(t);		
			} );	
		},
		namespace : function( str ){
			var undef,
				t = win,
				s = str+'';	
			s = s.split('.');
			for( var i=0,len=s.length-1;i<len;i++ ) {
				var e = s[i];
				if( !(e in t) || !t[e] ) {
					t[e] = {};	
				}
				t = t[e];	
			}	
			return t[s[i]] = t[s[i]] === undef ? {} : t[s[i]];
		},
		setNamespace : function(str,v){
			var undef,
				t = win,
				s = str+'';	
			v = v === undef ? {} : v;	
			s = s.split('.');
			for( var i=0,len=s.length-1;i<len;i++ ) {
				var e = s[i];
				if( !(e in t) || !t[e] ) {
					t[e] = {};	
				}
				t = t[e];	
			}	
			return t[s[i]] = v;
		},
		getNamespace : function( str ){
			var undef,
				t = win,
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
		}
	} );
	
	return Nex;
});