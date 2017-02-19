/**
* ClassManager.js
*/
define(function(require, exports, module){
	
	var lang = require('./lang');
	
	var ClassManager,
		slice    = Array.prototype.slice;
	ClassManager = {
		classes: {},
		aliases: {},
		xtypes: {},
		/**
		* 设置别名
		*/
		setAlias : function (subclass, aliasName){
			var me = ClassManager;
			if( aliasName ) {
				var aliasNames = lang.trim(aliasName).split(/\s+/g);
				lang.each( aliasNames, function(n, i){
					lang.setNamespace( n, subclass );
					me.aliases[name] = subclass;
				} );
			}	
			return subclass;
		},
		/**
		* 设置xtype
		*/
		setXType : function( cls, name ){
			this.xtypes[name] = cls;
			return this;	
		},
		/**
		* 添加类
		*/
		set: function(name, value){
			this.classes[name] = value;	
			return this;	
		},
		/**
		* 获取类
		*/
		get: function(name){
			
			if( lang.isInstance(name) ) {
				return name.self;	
			}
			
			return this.classes[name] || this.aliases[name] || this.xtypes[name];	
		},
		/**
		* 创建类
		* @examples:
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
		createClass : (function(Class, arg1){//arg1*
			function cloneFn( fn ){
				var ctor = function(){};
				ctor.prototype = fn.prototype;
				return ctor;
			}
			return 	function(){//Class, argv1,argv2,...
				var Class = arguments[0];
				var Args  = slice.call( arguments, 1 );	
				
				if( typeof Class != 'function' ) {
					throw new TypeError('create class error. the first parameter is not a function');
				}
				
				var instance = new (cloneFn( Class ));
				Class.apply( instance, Args );
				return instance;
			};
		})(),
		/*
		* 实例化Nex类
		* @examples:
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
			var self = ClassManager,undef;
			var argvs = slice.apply(arguments);
			
			var Class = argvs[0];
			var params = argvs.slice(1);
			
			var len = argvs.length;
			if( len<=0 ) {
				throw new TypeError('create error. missing parameter!');
			}
			
			if( lang.isInstance( Class ) ) {
				return Class;	
			}
			
			if( lang.isFunction( Class ) ) {//lang.isClass( Class )
				return self.createClass.apply( self, [ Class ].concat( params ) );
			}
			
			if( lang.isXType(Class) ) {
				var opts = Class;
				var xtype = opts.xtype;
				delete opts.xtype;	
				Class = lang.isFunction( xtype ) ? xtype : self.get( xtype );
				if( Class ) {
					if( lang.isInstance( Class ) ) {
						return Class;			
					}
					return self.createClass.apply( self, [ Class,opts  ].concat( params ) ); 	
				} else {
					throw new TypeError('create error. '+xtype+' not exists!');
				}
			}
			
			if( lang.isString( Class ) ) {
				Class = self.get( Class );	
				if( !Class ) {
					throw new TypeError('create error. '+ Class +' not exists!');
				}
				if( lang.isInstance( Class ) ) {
					return Class;			
				}
				return self.createClass.apply( self, [ Class ].concat( params ) );
			}
			
			throw new TypeError('create error. unknown error!');
		}	
	};
	
	return ClassManager;
});