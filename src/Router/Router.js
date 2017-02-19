/*
nobo
*/
define(function(require){
	require('Nex');	
	var EventObject = require('../EventObject');
	var _base = require('./_base');
	var _location = require('./_location');
	
	var supportHashChange = (function(win){
		var  documentMode = document.documentMode;
		return ('onhashchange' in window) && ( documentMode === void 0 || documentMode > 7 );	
	})(window);
	
	var supportPushState = !!window.history.pushState;

	var router = Nex.define('Nex.router.Router', [EventObject, _base, _location],{
		xtype : 'route',
		alias : 'Nex.Router',
		supportHashChange : supportHashChange,
		supportPushState : supportPushState,
		config : function(){
			return {
				routes : {},
				hashChangeFirstOnRoute : true //页面加载时也自动调用路由匹配(路由是hash值)
			};		
		},
		constructor : function(){
			var self = this;
			
			this._super(arguments);
			
			this.when(this.routes || {});
			
			this.initRouterLocation();	
			
			if( this.hashChangeFirstOnRoute ) {
				Nex.delay(function(){
					self.initFirstRoute();	
				},10);
			}
			if( !supportHashChange ) {
				//对于不支持hashchange的浏览器 如果不加载相应的hashchang插件
				//会影响前进后退功能
				throw new Error("hashchange does not support!");
			}
		},
		_initFirst : false,
		initFirstRoute : function(){
			if( this._initFirst ) return;
			
			this._initFirst = true;
			
			var url = window.location.hash;
			
			if( this.html5Mode ) {
				url = this.stripBeginsWith(this.beginWithUrl, this.url());	
			}
			
			this._fireUrlChange(url);
		}	
	});
	
	//router.override(RouterBase);
	
	//router.override(RouterLocation);
	
	return router;
});