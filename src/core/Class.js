/**
* Class.js
*/
define(function(require, exports, module){
	
	var lang = require('./lang');
	
	var Base = require('./Base');
	
	var ClassManager = require('./ClassManager');
	
	var noArgs = [],
	enumerables = lang.enumerables,
	toString = Object.prototype.toString,
	slice    = Array.prototype.slice,
	protectedProps = {
		"$className" : true,
		//"$isClass" : true,
		//"xtype" : true,
		"superclass" : true,
		'superproto' : true,
		"self" : true
	};
	
	function err(msg, cls){ throw new Error("Class" + (cls ? " " + cls : "") + ": " + msg); }
	/**
	* 创建继承链
	*/
	function chain(object) {
		var ctor = function(){};
		ctor.prototype = object;
		var result = new ctor();
		ctor.prototype = null;
		return result;
	};
	
	var _addStatics = Base.addStatics;
	var _override = Base.override;
	var _mixin = Base.mixin;
	var _register = Base.register;
	
	function addStatics(subclass, superclass){
		return _addStatics.call( subclass, superclass );		
	}
	function override(subclass, superclass){
		return _override.call( subclass, superclass );		
	}
	function mixin(subclass, mixins){
		return _mixin.call( subclass, mixins );		
	}
	function register(subclass){
		return _register.call( subclass );		
	}
	
	
	/**
	* 继承指定类
	*/
	function extendClass(subclass, superclass) {
				
		if( !lang.isFunction(superclass) ) {
			override( subclass, superclass );
		} else {
			addStatics( subclass, superclass );	
			subclass.fn = subclass.prototype = chain(superclass.prototype);
		}
		
		return subclass;
	}
	/**
	* 生成原型
	*/
	function makeCtor(){
		return function(){
			var a = arguments;
			if(!(this instanceof a.callee)){
				return a.callee.create.apply(a.callee, a);
			}
			this.constructor.apply(this, a);
		};	
	}
	/**
	* 生成类
	* 生成的类继承Base
	*/
	function makeClass(className){
		var subclass = makeCtor(), _cn = className;
		
		extendClass(subclass, Base);
		
		if( className === null ) {
			className = lang.uuid();	
		}
		
		subclass.$className = className;	
		subclass.$isClass = true;
		subclass.xtype = className;	
		subclass.prototype.$className = className;	
		subclass._configList = [];
		subclass._mixinConfigList = [];
		subclass.superclass = subclass.prototype.superclass = Base;
		subclass.superproto = subclass.prototype.superproto = Base.prototype;
		
		subclass.prototype.self = subclass;
		
		if( _cn ) {
			lang.setNamespace( _cn, subclass );
			register(subclass);
		}
		
		return subclass;		
	}
	/**
	* @examples:
	* Class(className, superclass, props) //定义类并继承再扩展
	* 
	* Class(null) //定义类佚名类
	* Class('myClass') //定义类myClass
	* Class(myClass)   //定义一个佚名类并继承类myClass
	* Class([myClass,myClass2, 'myClass3'])   //定义一个佚名类并继承类myClass 同时组合 myClass2 myClass3
	* Class({ method: noop }) //定义一个佚名类并扩展
	* 
	* Class('B', 'A') //定义类B并继承类A
	* Class('B', { method : noop }) //定义类B并扩展
	* Class([A,A1], { method : noop }) //定义佚名类并继承类A同时组合A1并扩展
	* Class(A, { method : noop }) //定义佚名类并继承类A并扩展
	* Class(null, { method : noop }) //定义佚名类 并扩展
	* Class(null, A) //定义佚名类 并继承A
	* Class( A, null) //定义佚名类 并继承A
	* Class( 'K', null) //定义K 
	*/
	
	function Class(className, superclass, props){
		var i, t, ctor, name, bases, configs, mixins = [], a = arguments;
		if( !a.length ) {
			err('Invalid parameter. unknown base class.');
		}
		
		///props = props || {};
		
		if( a.length === 3 && (lang.isClass(className) || lang.isInstance(className)) ) {
			err('class already exists.', className);		
		}
		
		if( a.length === 1 ) {	
			if( typeof className != "string" && ( lang.isArray(className) || lang.isFunction(className) ) ){
				superclass = className;
			} else if( lang.isObject(className) ) {
				superclass = null;
				props = className;	
			}
		}
		
		if( a.length === 2 ) {
			if( lang.isArray(className) || lang.isFunction(className) ){
				props = superclass;	
				superclass = className;
			} else if( lang.isObject(className) ) {
				superclass = null;
				props = className;	
			} else {//把className当作string
				if( superclass && !lang.isArray(superclass) && !lang.isFunction(superclass) ) {
					props = superclass;	
					superclass = null;
				}
			}
		}
		
		className = typeof className != 'string' ? null : className;
		if( className && ClassManager.get(className) ) {
			err('class already exists.', className);	
		}
		
		if( lang.isFunction(props) ) {
			props = props();	
		}
		
		var extendProps;
		
		if( Nex.isArray(props) ) {
			extendProps = props;	
			props = props[0];
		}
		
		props = props || {};
		
		//如果superclass 不存在
		//尝试检测props.extend
		//并不推荐这个操作，最好指明继承类
		if( !superclass && props.extend ) {
			superclass = props.extend;
			delete props.extend;	
		}
		
		if( lang.isArray( superclass ) ) {
			mixins = superclass.slice(1);
			superclass = superclass[0] || null;	
		}
		
		superclass = typeof superclass == 'string' ? ClassManager.get(superclass) : superclass;
		
		var subclass = makeClass(className);
		
		if( superclass ) {
			extendClass( subclass, superclass );
			subclass.superclass = subclass.prototype.superclass = superclass;
			subclass.superproto = subclass.prototype.superproto = superclass.prototype;
			subclass.prototype.$className = subclass.$className;
			subclass.prototype.self = subclass;
		}
		
		if( props.alias ) {
			subclass.setAlias( props.alias );
			delete props.alias; 	
		}
		
		if( props.xtype ) {
			subclass.setXType( props.xtype );
			subclass.xtype = props.xtype;
			delete props.xtype; 	
		}
		
		if( props.config ) {
			subclass.setConfig( props.config );
			delete props.config; 	
		}
		
		if( props.mixins ) {
			mixins.push.apply( mixins, lang.isArray( props.mixins ) ? props.mixins : [ props.mixins ] );
			delete props.mixins; 	
		}
		
		subclass.override( props );
	
		subclass.mixin.apply( subclass, mixins );
		
		if( extendProps && extendProps.length > 1 ) {
			for( var i=1;i<extendProps.length;i++ ) {
				var props = extendProps[i];
				if( props.config ) {
					subclass.setConfig( props.config );
					delete props.config; 	
				}	
				subclass.override( props );
			}	
		}
	
		return subclass;
	}
	
	return Class;
});