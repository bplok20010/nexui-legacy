/**
* Base.js
*/
define(function(require, exports, module){
	
	var lang = require('./lang');
	
	var ClassManager = require('./ClassManager');
	
	var noArgs = [],
		enumerables = lang.enumerables,
		op = Object.prototype,
		toString = op.toString,
		slice    = Array.prototype.slice,
		/**
		* 类的保护属性，无法通过继承覆盖。 千万不要通过prototype去重写
		*/
		protectedProps = {
			"$className" : true,
			//"$isClass" : true,
			//"xtype" : true,
			"superclass" : true,
			'superproto' : true,
			"self" : true
		},
		/**
		* 类的保护静态属性，无法通过继承覆盖。 不要去重写
		*/
		protectedCtorProps = {
			'_configList' : true,
			'_mixinConfigList' : true,
			'xtype' : true,
			'superclass' : true,
			'superproto' : true,
			'$className' : true,
			'$isClass' : true	
		},
		/**
		* 定义基类Base, 通过Class定义的类 一定会继承Base
		*/
		Base = function(){
			var a = arguments;
			if(!(this instanceof a.callee)){
				return a.callee.create.apply(a.callee, a);
			}
			this.constructor.apply(this, a);
		};
		
	function err(msg, cls){ throw new Error("Base" + (cls ? " " + cls : "") + ": " + msg); }
	
	/**
	* 重写父类方法，保留继承链
	* @param {Function} - 当前类
	* @param {Object} - 需要重写的
	* @return {Function}
	*/
	function override(target, source){
		
		var proto = lang.isFunction(target) ? target.prototype : target,
			names = [],
			i, ln, name, member,
			cloneFunction = function(method){
				return function() {
					return method.apply(this, arguments);
				};	
			};
		
		for (name in source) {
			names.push(name);
		}
		
		if (enumerables) {
			names.push.apply(names, enumerables);
		}
		
		for (i = 0,ln = names.length; i < ln; i++) {
			name = names[i];
			
			if( name == 'config' ) {
				target.setConfig( source[name] );
				continue;	
			}
			
			if( protectedProps.hasOwnProperty(name) ) {
				continue;	
			}
			
			if (source.hasOwnProperty(name)) {
				member = source[name];
				
				if (toString.call(member) == "[object Function]" && !member.$isClass) {
					if (typeof member.$owner != 'undefined') {
						member = cloneFunction(member);
					}
					
					member.$owner = target;
					member.$name = name;
				}
				
				proto[name] = member;
			}
			
		}
		
		return target;
	}
	/**
	* 重写父类方法，不保留继承链
	*/
	function addMembers(target, source){
		
		var proto = lang.isInstance(target) ? target : target.prototype,
			names = [],
			i, ln, name, member;
		
		for (name in members) {
			names.push(name);
		}
		
		if (enumerables) {
			names.push.apply(names, enumerables);
		}
		
		for (i = 0,ln = names.length; i < ln; i++) {
			
			if( name == 'config' ) {
				target.setConfig( source[name] );
				continue;	
			}
			
			if( protectedProps[name] ) {
				continue;	
			}
			
			if (source.hasOwnProperty(name)) {
				member = source[name];
				
				if (toString.call(member) == "[object Function]" && !member.$isClass) {
					member.$owner = target;
					member.$name = name;
				}
				proto[name] = member;
			}
			
		}
		
		return target;
	}
	/**
	* 添加静态成员
	*/
	function addStatics(target, source){
		var member, name;

		for (name in source) {
			if( protectedCtorProps.hasOwnProperty(name) ) continue;
			if (source.hasOwnProperty(name)) {
				target[name] = source[name];
			}
		}

		return target;	
	}
	
	function mixin(dest, sources){
		return lang.mixin.apply(lang, arguments);
	}	
	
	lang.extend( Base, {
		$className: 'Nex.Base',
		$isClass: true,	
		xtype : 'Nex.Base',
		superclass : null,
		//参数列表
		_configList : [],
		//组合参数列表
		_mixinConfigList : [],
		/**
		 * 类的扩展函数
		 *
		 * @static
		 * @memberOf Nex.Base
		 * @param {object}  重写的属性和方法
		 * @returns {object} this 
		 * @example
		 *
		 * Nex.Base.override({
		 *	 getUserNmae : function{
		 *	  	var name = this._super();
		 *	  	return name + ' 000'; 
		 *	 }
		 * });
		 *		
		 */
		override: function(members) {
			return override( this, members );
		},
		/**
		 * 类的静态成员扩展函数
		 *
		 * @static
		 * @memberOf Nex.Base
		 * @param {object}  重写的属性和方法
		 * @returns {object} this 
		 *		
		 */
		addStatics: function(members) {
			return addStatics( this, members );
		},
		/**
		 * 作用同override	
		 */
		addMembers: function(members) {
			return addMembers( this, members );
		},
		/**
		 * 作用同override 参数不一样
		 * @param {string}  重写的属性和方法名
		 * @param {*}  重写的属性和方法
		 * @returns {object} this 
		 */
		addMember: function(name, member) {
			var m = {};
			m[name] = member;
			return this.addMembers(m);
		},
		/**
		 * 组合
		 * @param {...Object|Function} 组合对象
		 * @returns {object} this 
		 */
		mixin: function() {
			var i=0, t, proto = this.prototype,
				subclass = this, mixins = arguments; 
		
			for( ;i<mixins.length;i++ ) {
				t = mixins[i];
				if( !t ) continue;
				if( lang.isFunction( t ) ) {
					mixin( subclass, t );
					mixin( proto, t.prototype );
					
					if( lang.isClass( t ) ) {
						subclass.mixinConfig(function(scope){
							return t.getConfig(scope);	
						});	
					}
					
				} else if( lang.isInstance( t ) ) {
					mixin( subclass, t.self );
					mixin( proto, t );
					subclass.mixinConfig(function(scope){
						return t.self.getConfig(scope);	
					});	
				} else {
					if( t.config ) {
						subclass.mixinConfig(t.config);
						delete config;	
					}
					mixin( proto, t );
				}
			}
			return this;
		},
		/**
		 * 设置类的xtype
		 * @param {string}
		 * @returns {object} this 
		 */
		setXType : function(xtype){
			ClassManager.setXType( this, xtype );
			return this;	
		},
		/**
		 * 获取类的xtype
		 * @returns {string} 
		 */
		getXType : function(){
			return this.xtype;	
		},
		/**
		 * 获取类的别名
		 * @param {string} 可通过空格分别，一次性设置多个别名
		 * @returns {object} this 
		 */
		setAlias : function( aliasName ){
			
			ClassManager.setAlias( this, aliasName );
				
			return this;
		},
		/**
		 * 获取类的别名
		 * private
		 * @param {string} 可通过空格分别，一次性设置多个别名
		 * @returns {object} this 
		 */
		register: function(){
			ClassManager.set( this.$className, this );	
		},
		/**
		 * 获取类指定成员之
		 * @param {string}
		 * @returns {*} 
		 */
		getSuperProp: function(prop){
			var superclass = this.getSuperClass();
			if( superclass ) {
				return superclass.prototype[prop];	
			}	
			return null;
		},
		/**
		 * private
		 */
		mixinConfig : function(options){
			if( lang.isObject( options ) ) {
				var _opts = options;
				options = function(){
					return _opts;
				}
			}
			if( lang.isFunction( options ) ) {
				this._mixinConfigList.push( function( scope ){
					return options.call( this, scope );
				} );
			}
			return this;
		},
		/**
		 * 设置类的参数
		 */
		setConfig : function( options ){
			if( lang.isObject( options ) ) {
				var _opts = options;
				options = function(){
					return _opts;
				}
			}
			if( lang.isFunction( options ) ) {
				this._configList.push( function( opt, scope ){
					return options.call( this, opt, scope );
				} );
			}
			return this;
		},
		/**
		 * private
		 */
		getConfig : function( scope ){
			var opt = {};
			var list = this._configList || [];
			var mixinsList = this._mixinConfigList || [];
			var opts = this.getSuperClassConfig( scope ) || [];
			var mixins = this.getSuperClassMixinsConfig( scope ) || [];
			
			opts = opts.concat(list);
			//注：组合列表的参数不会被后续组合覆盖
			mixins = mixins.concat(mixinsList);
			
			for( var i = 0, len = opts.length; i < len; i++ ) {
				var o = opts[i];
				lang.extend( opt, o.call( this, opt, scope || this ) );	
			}
			
			for( var t = 0; t < mixins.length; t++ ) {
				var c = mixins[t];
				mixin( opt, c.call( this, opt, scope || this ) );	
			}
		
			return opt;
		},
		
		setOptions: function(){
			return this.setConfig.apply(this, arguments);	
		},
		getOptions: function(){
			return this.getConfig.apply(this, arguments);	
		},
		/**
		 * 获取当前类的父类
		 */
		getSuperClass : function(){
			return this.superclass;	
		},
		/**
		 * private
		 */
		getSuperClassConfig : function( scope ){
			var subclass = this,
				opts = [];
				
			while( subclass = subclass.getSuperClass() ) {
				
				opts.push.apply( opts, subclass._configList || [] );
				
			}
			
			return opts.reverse();
		},
		/**
		 * private
		 */
		getSuperClassMixinsConfig : function( scope ){
			var subclass = this,
				opts = [];
				
			while( subclass = subclass.getSuperClass() ) {
				
				opts.push.apply( opts, subclass._mixinConfigList || [] );
				
			}
			
			return opts.reverse();
		},
		getSuperClassOptions: function(){
			return this.getSuperClassConfig.apply(this, arguments);		
		},
		/**
		 * 实例当前类
		 */
		create : function(){
			return ClassManager.create.apply( ClassManager, [ this ].concat( [].slice.apply( arguments ) ) );	
		},
		/**
		* 生成类构造器 factory
		*/
		creator : function(cfg){
			var me = this;
			
			function merge(array1, array2){
				var newArray = [],a,a1,a2,a1Len = array1.length, a2Len = array2.length,
					eachArray = array1.length > array2.length ? array1 : array2;
				
				for( var i=0;i<eachArray.length;i++ ) {
					a1 = lang.isFunction(array1[i]) ? array1[i]() : array1[i];
					a2 = lang.isFunction(array2[i]) ? array2[i]() : array2[i];
					if( i > a2Len - 1 ) a2 = a1;
					if( lang.isObject( a1 ) && lang.isObject(a2) ) {
						a = lang.extend( {}, a1, a2 );	
					} else {
						a = a2;	
					}
					newArray.push(a);
				}
				return newArray;
			}
			
			var array1 = slice.call( arguments );
			
			var ctor = function(){
				return me.create.apply(me, merge( array1, slice.call( arguments ) ));	
			}
			
			ctor.$isCreator = true;
			
			return ctor;
		}
	} );
	lang.extend( Base.prototype, {
		isInstance : true,
		$className : 'Nex.Base',
		self 	   : Base,
		superclass : null,
		superproto : null,
		_super : function(args){
			var method,
				fn = function(){},
				superMethod = (method = this._super.caller) && 
							  (method = method.$owner ? method : method.caller) &&
							   method.$owner.superproto[method.$name];
				superMethod = superMethod || fn;	
			return superMethod.apply(this, args || noArgs);	
		},
		constructor: function(){
			//this.initConfig.apply( this,arguments );	
		},
		destroy: function(){},
		getXType : function(){
			return this.self.getXType();	
		},
		extend : function( data ){
			var self = this;
			var Class = self.self;	
			if( data && lang.isObject( data ) ) {
				Class.override.call( self, data );
			}
			return self;
		},
		/**
		* 动态组合
		* @param {...Class|Object}
		*/
		mixin : function(){
			var self = this;
			var opt = this.config;
			
			var mixs = [].slice.call( arguments );
			
			var configs = [], properties = {}, i=0, len = mixs.length;
			
			if( !len ) return self;
			
			for( ;i<len;i++ ) {
				var m = mixs[i];
				if( lang.isString( m ) ) {
					m = ClassManager.get( m );	
					if( !m ) continue;
				}
				if( lang.isClass( m ) ) {
					configs.push( function( opt, scope ){
						return m.getOptions( scope );	
					} );	
					mixin( self, m.prototype || {} );
				} else if( lang.isObject( m ) ){
					if( m.config ) {
						configs.push( m.config );
						delete m.config;
					}
					mixin( self, m );
				}
			}
			//组合成员
			//self.extend(properties);
			//组合参数
			if( configs.length ) {
				for( var i=0, len=configs.length; i<len; i++ ) {
					var cfg = configs[i];
					if( lang.isFunction( cfg ) ) {
						mixin( opt, cfg( opt, self ) );	
					} 	
					if( lang.isObject( cfg ) ) {
						mixin( opt, cfg );		
					}
				}
			}
			return self;
		},
		//解析当前参数
		parseInitConfig : function(config, cover){
			var self = this;
			//属性动态扩展
			//取消config.props存在时进行属性扩展
			//if( config.props ) {
			//	self.extend( config.props );	
			//	delete config.props;
			//}
			//动态组合
			if( config.mixins ) {
				self.mixin.apply( self, lang.isArray( config.mixins ) ? config.mixins : [ config.mixins ] );
				delete config.mixins;
			}
			
			cover ? lang.extend( self, config ) : lang.extendIf( self, config );
			
			return config;	
		},
		
		/**
		* 初始化当前类参数
		*/
		initConfig : function(cfg, props){
			var self = this;
			var Class = self.self;
			
			if( self._initConf ) return self.config;
			
			var opts = Class.getOptions( self );
			
			var cfg = cfg || {};
			
			if( lang.isFunction( cfg ) ) {
				cfg = cfg.call( self, opts ) || {};	
			}
			
			var _orig = self.parseInitConfig(opts, false);
	
			var _init = self.parseInitConfig(cfg, true);
			
			if( props ) {
				self.extend( props );
			}
			
			this.origConfig = _init;
			
			this.initialConfig  = lang.extend({}, _orig, _init);
			
			self._initConf = true;
			
			return this.initialConfig;
		},
		C : function(key,value){
			return this._config.apply( this, arguments );
		},
		/**
		* 获取当前类的参数
		*/
		getConfig : function(){
			return this._config.apply(this, arguments);	
		},
		/**
		* 设置当前类的参数
		*/
		setConfig : function(cfg){
			this._config.apply(this, arguments);
			return this;	
		},
		_config: function(key, value){
			if( key === void 0 ) {
				return this;
			} else if( lang.isString(key) ) {
				return this[key];
			} else if( arguments.length > 1 ) {
				this[key] = value;
			} else {
				lang.extend( this, key );
			}	
			
			return this;
		}
	} );
	
	Base.fn = Base.prototype;
	
	Base.register();
	//Base.setXType(Base, 'Nex.Base');
	//lang.setNamespace( 'Nex.Base', Base );

	return Base;
});