define(function(require, exports, module){
	
	var Nex = require('./Nex');
	var Manager = require('./ComponentManager');
	var EventObject = require('./EventObject');
	
	return Nex.Class('Nex.ComponentBase', EventObject, {
		$service : false,
		xtype : 'componentbase',
		prefix : 'nex-',
		el : null,
		config : function(){
			return {
				autoResize : false, 
				denyManager : false,
				autoDestroy : true,
				groupBy : '',
				id : '',
				autoRender : true,
				renderTo: null,
				plugins : [],
				focusable: false	
			};	
		},
		
		$isInit : false,
		$parent : null,
		//getScrollbarSize : Nex.getScrollbarSize,
		//判断当前是否正在初始化
		isInit : function(){
			return 	this.$isInit;
		},
		//判断是否自动渲染组件
		isAtuoRender : function(){
			return this.autoRender;	
		},
		isFocusable : function(){
			return this.focusable;	
		},
		constructor : function(){
			this._super( arguments );
			
			this.id = this.getId();
			
			if( this.isAtuoRender() ) {
				this.initialize();
			}
		},
		rendered : false,
		
		render : function( parent ){
			
			if( !this.rendered ) {
				this.renderTo = parent;
				this.initialize();	
			
			} else {
				if( !this.el ) {
					this.renderTo = parent;
					this.setupRendder();	
				}
			}
			
			return this;	
		},
		//初始化
		initialize : function(){
			var self = this;
			
			if( self.rendered ) {
				return self;	
			}
			
			self.$isInit = true;
			
			self.initPlugins();
			
			self.onStart();
			
			self.fireEvent("onStart");
			
			self.rendered = true;
			
			if( !self.denyManager ) {
				Manager.add( self );
			}
			
			self.initComponent();
			
			//if (self.renderTo) {
			self.render(self.renderTo);
			//}
			
			self.onCreate();
			
			self.fireEvent('onCreate');
			
			self.onAfterCreate();
			
			self.onInitComplete();
			
			this.$isInit = false;	
			
			return self;	
		},
		_initPlugins : false,
		initPlugins : function(){
			var self = this;
			
			var plugins = self.plugins || [];
			
			if( self._initPlugins ) {
				return self;	
			}
			
			self._initPlugins = true;
			
			for( var i=0, len=plugins.length; i<len; i++ ) {
				self.constructorPlugin( plugins[i] );
			}
			
			return self;
		},
		constructorPlugin : function( plugin ){
			var _plugin = plugin;
			var plugin = Nex.create( plugin );
			if( plugin && typeof plugin.init == 'function' ) {
				plugin.init( this );	
			} else {
				if( typeof _plugin == 'function' ) {
					_plugin( this );		
				}	
			}	
			return this;
		},
		onStart : function(){},
		onInitComponent : function(){},
		//初始化组件 一般做布局等。。。
		initComponent : function(){},
		setupRendder : function(){},
		onCreate : function(){},
		onAfterCreate : function(){},
		onInitComplete :　function(){},
		//判断是否render
		isRendered : function(){
			return this.rendered;	
		},
		_checkToRender : function(){
			if( !this.rendered ) {
				this.render();	
			}	
		},
		
		getId : function(){
			if( Nex.isEmpty( this.id ) ) {
				return this.prefix + (++Nex.guid);	
			}
			return this.id;	
		},
		
		_undef : function (val, d) {
			return val === undefined ? d : val;
		},	
		__ars : true,
		//判断当前组件是否接受autoResize
		isAcceptResize : function(){
			return this.autoResize && this.__ars;	
		},
		setAcceptResize : function(m){
			var m = m === undefined ? true : m;
			this.__ars = !!m;
			return this;	
		},
		/**
		 * 模板处理函数(用户自定义模版级别最高,其次模板函数,最后_Tpl中的模版)
		 *  @tpl {String,Function} 模板内容
		 *  @data {Object} 模板数据 如果tpl是Function data不一定需要Object
		 *  @return {String} 模板内容
		 */
		tpl : function( tpl, data ){
			var self = this;
			var undef;
			
			var data = data || {};
			
			if( !tpl ) return tpl;
			
			var argvs = [].slice.apply( arguments, [ 1 ] );
			
			var renderer = self.getTplFn( tpl );
			
			return renderer.apply(self,argvs);
			
		},
		getTplFn : function( str ){
			var self = this;
			var undef;
			
			if( Nex.isFunction( str ) ){
				return str;
			} else if( str in self ) {
				return self[str];
			} else {
				return Nex.template( str + "" );
			}
		},
		//获取组件的父级组件
		getParent : function(){
			return this.$parent;
		},
		/*
		*移除组件 最好需要重载
		*/
		destroy : function(){
			
			Manager.remove( this.id );
			
			this.onDestroy();
			
			this.fireEvent('onDestroy');
			
			this.destroy = Nex.noop;
			
			return this;
		},
		onDestroy : function(){},
		getDom : function(){
			return null;	
		}
	});	
});