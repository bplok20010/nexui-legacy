define(function(require, exports, module){
	
	var tpl = require('Nex/utils/Template');
	require('Nex/Manager');
	require('Nex/EventObject');
	
	var configs = function(){
			return {
				prefix : 'nex',
				id : '',
				autoResize : false,
				autoDestroy : true,
				autoRender : true,
				denyManager : false,
				groupBy : '',//组件分类
				deferred : $.Deferred ? $.Deferred() : null,
				plugins : []
			}	
		};
	
	return Nex.Class('Nex.AbstractComponent',{
		$parent : null,
		extend : 'Nex.EventObject',
		xtype : 'abstractcomponent',
		_isInit : false,
		configs : configs,
		Template : tpl,
		//getScrollbarSize : Nex.getScrollbarSize,
		//判断当前是否正在初始化
		isInit : function(){
			return 	this._isInit;
		},
		//判断是否自动渲染组件
		isAtuoRender : function(){
			return this.configs.autoRender;	
		},
		constructor : function(){
			this._super( arguments );
			var opt = this.configs;
			opt.id = this.getId();
			
			if( this.isAtuoRender() ) {
				this.initialize();
			}
			
		},
		rendered : false,
		//初始化
		initialize : function(){
			var self = this;
			var opt = this.configs;
			
			if( self.rendered ) {
				return self;	
			}
			
			self._isInit = true;
			
			self.initPlugins();
			
			self.fireEvent("onStart", opt);
			
			self.onStart( opt );
			
			self.rendered = true;
			
			if( !opt.denyManager ) {
				Nex.Manager.add( self );
			}
			
			self.initInstance( opt );
			
			return self;	
		},
		_initPlugins : false,
		initPlugins : function(){
			var self = this;
			var opt = this.configs;
			
			var plugins = opt.plugins || [];
			
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
		//onResize
		initInstance : function(cfg){
			var self = this;
			var opt = self.configs;	
			
			self.onInitComponent();
			
			self.fireEvent('onInitComponent');
			
			self.initComponent();
			
			self.onCreate(opt);
			
			self.fireEvent('onCreate');
			
			this._isInit = false;	
		},
		onInitComponent : function(){},
		//初始化组件 一般做布局等。。。
		initComponent : function(){},
		onCreate : function(){},
		render : function(){
			
			if( !this.rendered ) {
				
				this.initialize();	
			
			}
			
			return this;	
		},
		//判断是否render
		isRendered : function(){
			return this.rendered;	
		},
		_checkToRender : function(){
			if( !this.rendered ) {
				this.render();	
			}	
		},
		
		_getId : function(){
			var opt = this.configs;
			return opt.prefix + (++Nex.guid);	
		},
		getId : function(){
			var opt = this.configs;
			if( Nex.isEmpty( opt.id ) ) {
				return this._getId();	
			}
			return opt.id;	
		},
		/*
		* @m default=false true(更新层级关系)
		*/
		enableAutoResize : function(  ){	
			this.configs.autoResize = true;
			return this;
		},
		/*
		* @m default=false true(更新层级关系)
		*/
		disabledAutoResize : function( m ){
			this.configs.autoResize = false;
			return this;
		},
		_undef : function (val, d) {
			return val === undefined ? d : val;
		},	
		__ars : true,
		//判断当前组件是否接受autoResize
		isAcceptResize : function(){
			var opt = this.configs;
			return opt.autoResize && this.__ars;	
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
			var opt = self.configs;
			var undef;
			
			var data = data || {};
			
			if( !tpl ) return tpl;
			
			var argvs = [].slice.apply( arguments, [ 1 ] );
			
			var renderer = self.getTplFn( tpl );
			
			return renderer.apply(self,argvs);
			
		},
		getTplFn : function( str ){
			var self = this;
			var opt = self.configs;
			var undef;
			if( Nex.isFunction( str ) ){
				return str;
			} else if( str in self ) {
				return self[str];
			} else {
				return self.Template( str + "" );
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
			
			var opt = this.configs;
			
			Nex.Manager.remove( opt.id );
			
			this.onDestroy();
			
			this.fireEvent('onDestroy');
			
			return this;
		},
		onDestroy : function(){},
		getDom : function(){
			return [];	
		},
		getDeferred : function(){
			var opt = this.configs;
			return opt.deferred;
		}
	});	
});