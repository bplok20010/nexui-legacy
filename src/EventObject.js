/**
 * 事件类
 * @module Nex/EventObject
 * @class  Nex.EventObject
 * @constructor
 */
define(function(require){
	
	var Nex = require('./Nex');
	
	return Nex.Class('Nex.EventObject',{
		xtype : 'eventobject',
		
		context : null,
		
		stopOnFalse : true,
		/**
			eg:
			'onA' : 'onClick'	
		*/
		eventMaps : null,
		
		_events : null,
		
		/**
		 * 构造函数
		 * @method constructor
		 * @param config 参数
		 * @param listeners 事件
		 * @param props 属性或方法重写
		 */
		constructor : function(config, listeners, props){
			this._events = {};	
			this.eventMaps = {};	
			
			this._super(arguments);
			
			var config = this.initConfig.apply(this, [config, props]);
			
			//this.initConfigEvents(config);
			//this.bindConfigEvents(config);
			
			//this.extend( config );
			
			//this.initialConfig = config;
			//兼容老版本的Nex组件
			this.config = this.configs = this;
			//this.config = this.configs = config;
			
			if( listeners ) {
				this.initConfigEvents( {
					listeners : listeners	
				} );
			}
			
			//if( props ) {
			//	this.extend( props );
			//}
			
		},
		//override
		parseInitConfig : function(){
			this.initConfigEvents(arguments[0]);
			this.bindConfigEvents(arguments[0]);	
			
			return this._super(arguments);
		},
		
		initConfigEvents : function(opt){
			var self = this;
			function bind(e){
				if( Nex.isPlainObject(e) && !Nex.isEmptyObject(e) ) {
					for(var k in e){
						var _evt = k,
							fn = e[k],
							context = null;	
						if( Nex.isPlainObject( fn ) && !Nex.isEmptyObject( fn ) ) {
							context = fn.scope || fn.context || null;
							fn = fn.func || fn.fn || fn.callBack || fn.callback;
						}
						if( Nex.isFunction( fn ) && fn !== Nex.noop ) {
							self.bind(_evt,fn,context);	
						}
					}
				}	
			}
			if( opt.events ) {
				bind.call(self, opt.events);
				delete opt.events;
			}
			
			if( opt.listeners ) {
				bind.call(self, opt.listeners);
				delete opt.listeners;
			}
			
		},
		/**
		 * examples:
		 *	Nex.Create('myApp', {
		 *		//context : null,
		 *		'onCreate' : function(){
		 *			console.log('onCreate')	
		 *		},
		 *		':@onCreate.alias' : function(){
		 *			//this === self
		 *			console.log('onCreate')	
		 *		},
		 *		':onCreate.ty' : {
		 *			context : window,
		 *			callback : function(){
		 *				console.log( this === window )//true	
		 *			}	
		 *		}
		 *	});
		 */
		bindConfigEvents : function(opt){
			var self = this;
			//var opt = self.config;
			//var e = opt.events ? opt.events : {};
			var reg = /^\s*:?@?on[A-Z][\S|\.]*$/;///^:@?on[A-Z][\w|\.]*$/
			for(var x in opt ) {
				if( reg.test(x) ) {
					var fn = opt[x],
						context = null;
					
					delete opt[x];
				
					if( Nex.isPlainObject( fn ) && !Nex.isEmptyObject( fn ) ) {
						context = fn.context || fn.scope || null;	
						fn = fn.func || fn.fn || fn.callBack || fn.callback;
					}
					if( Nex.isFunction(fn) && fn !== Nex.noop ){
						self.bind(String(x).replace(/^\s*:/, ''),fn,context);	
					}
				}
			}
		},
		$eventIndex : 1,
		/**
		 * 事件绑定
		 *  @eventType {String} 事件名
		 *  @func      {Function|{ scope,fn }} 事件回调
		 *  @scope     {Object} this对象(可选)
		 *  @return    {int} 事件ID or false
		 * @expamle
		 *  app.bind('@onClick', fn);
		 *  app.bind('onClick.root', fn);
		 *  app.bind('@onClick onMouseDown.a onMouseDown.b', fn);
		 *  app.bind({
		 *		onClick :　fn,
		 *		onMouseDown : {
		 *			context : jQuery,
		 *			callback : fn	
		 *		} 
		 *	});
		 */
		bind : function(eventType, func, scope){
			var self = this;
			var opt = self;
			var event = self._events;
			
			if( typeof eventType == "undefined" ) {
				return false;	
			}
			if( eventType === '' || eventType === '@' ) {
				return false;	
			}
			
			//批量绑定
			if( Nex.type( eventType ) === 'object' ) {
				var ids = [];
				for( var ev in eventType ) {
					var context = scope;
					var fn = eventType[ev];
					if( Nex.isPlainObject( fn ) && !Nex.isEmptyObject( fn ) ) {
						context = fn.scope || fn.context || context;
						fn = fn.func || fn.fn || fn.callBack || fn.callback;
					}
					var _i = self.bind( ev, fn, context );	
					ids.push( _i );
				}
				return ids;
			} else {//字符串 
				var _ev = (eventType+'').split(/\s+|,/);	
				if( _ev.length>1 ) {
					var ids = [];
					for( var _e=0;_e<_ev.length;_e++ ) {
						if( !_ev[_e] ) continue;
						ids.push( self.bind( _ev[_e], func, scope ) );
					}
					return ids;
				}					
			}
			
			var _f1 = eventType.charAt(0);
			if( _f1 === '@' ) {
				scope = self;
				eventType = eventType.slice(1);	
			}	
			
			var _type = eventType.split(".");
			eventType = _type[0];
			_type = _type.slice(1);
			var ext = _type.join('.');//_type.length == 2 ? _type[1] : '';
			
			if( !eventType ) {
				return false;	
			}
			
			//事件名映射处理
			//eventMaps
			if( eventType in self.eventMaps ) {
				eventType = self.eventMaps[eventType];
			}
			
			event[eventType] = event[eventType] || [];
			
			if( Nex.isFunction( event[eventType] ) ) {
				event[eventType] = [];
			}
			
			if( !Nex.isFunction( func ) || func === Nex.noop ) {
				return false;	
			}
			
			var _e = {
					scope : !!scope ? scope : null,
					func : func,
					ext : ext,
					_index : self.$eventIndex++
				};
			
			var id = self._toFirst ? event[eventType].unshift(_e) : event[eventType].push(_e);
		
			return _e._index;
		},
		_toFirst : false,
		/**
		 * 把事件绑定到顶端
		 */
		first : function(){
			this._toFirst = true;
			var ids = this.bind.apply(this, arguments);	
			this._toFirst = false;
			return ids;
		},
		on : function(){
			return this.bind.apply(this,arguments);	
		},
		/*
		*同bind 区别在于只执行一次
		*/
		one : function(eventType, func, scope){
			if( typeof eventType == "undefined" ) {
				return false;	
			}
			var func = func || $.noop;
			var self = this;
			var scope = !!scope ? scope : self;
			
			var _ = function(){
					self.unbind(_.id);
					var r = func.apply(this, arguments);
					return r;
				},
				id = null;
				
			id = self.bind( eventType, _, scope );
			_.id = id;
			return id;
		},
		/*
		* 取消事件绑定
		*  @eventType {String} 事件名,
		*  @id        Number 事件ID
		*/
		unbind : function(eventType,id){
			var self = this;
			var undef;
			var opt = self;
			//...unbind('onClick onClick2.yrd')
			var _ev = (eventType+'').split(/\s+|,/);	
			if( _ev.length>1 ) {
				for( var _e=0;_e<_ev.length;_e++ ) {
					if( !_ev[_e] ) continue;
					self.unbind( _ev[_e] );
				}
				return self;
			}					
			
			var event = self._events;
			var id = id === undef ? false : id;
			
			//根据事件ID...unbind(3)
			if( typeof eventType === 'number' ) {
				for( var tp in event ) {
					self.unbind( tp,eventType );	

				}
				return self;		
			}
			
			var _type = (eventType+'').split(".");
			eventType = _type[0];
			_type = _type.slice(1);
			var ext = _type.join('.');
			//绑定所有后缀为.test的事件...unbind('.test')
			if( eventType === '' && ext !== '' ) {
				for( var tp in event ) {
					if( tp ) {
						self.unbind( [tp,ext].join('.') );	
					}
				}
				return self;	
			}
			
			//事件名映射处理
			//eventMaps
			if( eventType in opt.eventMaps ) {
				eventType = opt.eventMaps[eventType];
			}
			
			if( !(eventType in event) ) {
				return self;	
			}
			
			if( Nex.isFunction( event[eventType] ) ) {
				event[eventType] = [];
				return self;
			}
			var ves = [];
			if(id === false) {
				if( ext === '' ) {
					event[eventType] = [];
				} else {
					for(var i=0;i<event[eventType].length;i++) {
						var _e = event[eventType][i];
						if( (typeof _e === 'object') && _e.ext === ext ) {
							///event[eventType][i] = null;	
							continue;
						}
						ves.push( _e );
					}
				}
			} else {
				for(var i=0;i<event[eventType].length;i++) {
					var _e = event[eventType][i];
					if( (typeof _e === 'object') && _e._index === id ) {
						continue;
					}
					ves.push( _e );
				}
			}
			event[eventType] = ves;
			return self;
		},
		off : function(){
			return this.unbind.apply(this,arguments);	
		},
		/*
		* 锁定事件
		*  @eventType {String} 事件名
		*/
		lockEvent : function(eventType){
			var self = this;	
			//事件锁
			var eventLocks = self._eventLocks || {};
			eventLocks[eventType] = true;
			self._eventLocks = eventLocks;
			return true;
		},
		/*
		* 取消锁定事件
		*  @eventType {String} 事件名
		*/
		unLockEvent : function(eventType){
			var self = this;	
			//事件锁
			var eventLocks = self._eventLocks || {};
			eventLocks[eventType] = false;
			self._eventLocks = eventLocks;
			return true;
		},
		_denyEvent : false,
		_eventLocks : null,
		_executeEventMaps : null,//正在的执行的事件
		/*
		* 事件触发
		*  @argv0 {String} 事件名 如果事件名带@开头 说明当前事件是系统事件
		*  argv1,argv2,...
		*/
		fireEvent : function(){
			var self = this;
			var opt = self;
			var undef;
			if( self._denyEvent ) {
				return;	
			}
			
			var args = [].slice.apply(arguments);
			var eventType = args.shift();
			var data = args;
			var context = self.context || self;
			
			var ct = (eventType+'').charAt(0);
			var _sys = false;
			if( ct === '@' ) {
				_sys = true;
				eventType = (eventType+'').slice(1);	
			}	
			
			if( !eventType ) {
				return;	
			}
			//事件名映射处理
			//eventMaps
			if( eventType in self.eventMaps ) {
				eventType = self.eventMaps[eventType];
			}
		
			var events = self._events[eventType];
			/*
			if( Nex.isArray( data ) ) {
				data = data;	
			} else if( Nex.type( data ) === 'object' ){
				if( Nex.isArguments(data) ) {
					data = [].slice.apply(data);	
				} else {
					data = [data];	
				}
			} else {
				data = [data];
			}
			*/
			//data = $.isArray( data ) ? data : [data];
			//添加事件锁
			var eventLocks = self._eventLocks || {};
			if( eventLocks[eventType] ) {
				return;	
			}
			self._executeEventMaps = self._executeEventMaps || {};
			//防止死循环事件
			if( self._executeEventMaps[eventType] ) {
				return;	
			}
			self._executeEventMaps[eventType] = true;
			
			var r = true;
			if( Nex.isArray(events) ) {
				var len = events.length;
				for(var i=0;i<len;i++) {
					var _e = events[i];
					if( Nex.isPlainObject( _e ) ) {
						r = _e.func.apply(_e.scope || context,data);
					} else if( Nex.isFunction( _e ) ){
						r = _e.apply(self,data);
					}
					if( opt.stopOnFalse ) {
						if(r === false) break;	
					}
				}	
				
			} else if(Nex.isFunction(events)) {
				r = events.apply(self,data);
			}
			
			self._executeEventMaps[eventType] = false;
			
			return r;
		},
		fire : function(){
			return this.fireEvent.apply(this,arguments);	
		}
	});	
});