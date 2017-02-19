/*
nobo
*/
define(function(require){
	require('Nex');	
	var EventObject = require('../EventObject');

	var router = Nex.define('Nex.router.Router', EventObject,{
		xtype : 'route',
		alias : 'Nex.Router',
		config : function(){
			return {
				routes : {},
				removeHTag : true,//删除 #
				removeHTagData : /^#/, 
				location : window.location,
				//使用html5 pushState
				html5Mode : false,
				doc : document,
				hashChangeFirstOnRoute : true, //页面加载时也自动调用路由匹配(路由是hash值)
				hashChangeOnRoute : true, //如果触发hashchange时 触发路由匹配 (路由是hash值)
				hash : '',
				//区分大小写
				caseInsensitiveMatch : false
			};		
		}	
	});
	router.supportHashChange = (function(win){
		var  documentMode = document.documentMode;
		return ('onhashchange' in window) && ( documentMode === void 0 || documentMode > 7 );	
	})(window);
	router.supportPushState = !!history.pushState;
	router.override({
		routes : [],
		//历史记录
		history : [],
		currentUrl : '/',
		currentUrlInfo : {},
		currentUrlData : {},
		currentParams : {},
		initComponent : function(opt) {
			var self = this;
			self._super(arguments);
			
			self.routes = [];
			self.history = [];
			self.currentUrlInfo = {};
			self.currentUrlData = {};
			self.currentParams = {};
			
			self.initRoute();
		},
		/*sysEvents : function(){
			var self = this;
			var opt = self.configs;
			self._super(arguments);
			return self;
		},*/
		_getHash : function( url ) {
			var self = this;
			var opt = self.C();
            url = url || opt.location.href;
			return '#' + decodeURIComponent(url).replace( /^[^#]*#?(.*)$/, '$1' );
        },
		getHash : function( url ){
			var self = this;	
			var opt = self.C();
			opt.hash = self._getHash( url );
			self.onGetHash( opt );
			self.fireEvent('onGetHash',[ opt ]);	
			return opt.hash;
		},
		onGetHash : function( opt ){
			if( opt.removeHTag ) {
				opt.hash = opt.hash.replace( opt.removeHTagData ,'');	
			}	
		},
		initRoute : function(){
			var self = this;
			var opt = self.C();	
			$(document).ready(function(){
				var hash = self.getHash();
				self.onInitHashChange( hash );
				self.fireEvent('onInitHashChange',[ hash,opt ]);	
				$(window).bind('hashchange.'+opt.id,function(){
					var hash = self.getHash();
					self.onHashChange( hash );
					self.fireEvent('onHashChange',[ hash,opt ]);	
				});						   
			});
		},
		onInitHashChange : function( hash ){
			var self = this;
			var opt = this.configs;
			var routes = opt.routes;
			for( var reg in routes ) {
				self.when(reg, routes[reg]);	
			}
			setTimeout(function(){
				opt.hashChangeFirstOnRoute && self.checkRoute( hash );		
			},10);
		},
		onHashChange : function( hash ){
			this.configs.hashChangeOnRoute && this.checkRoute( hash );	
		},
		'reload' : function(){
			var self = this,
				opt = this.configs;
				self.checkRoute( self.currentUrl );
			return self;		
		}, 
		//@m true 默认产生历史记录 false 不产生历史记录
		redirectTo : function( path, m ){
			var m = this._undef( m,true );
			if( m ) {
				this.configs.location.hash = path;
			} else {
				this.checkRoute( path );
			}
			return this;	
		},
		redirect : function(){
			return this.redirectTo.apply( this, arguments );	
		},
		path : function( path, m ){
			return this.redirectTo.apply( this,arguments );
		},
		checkRoute : function( hash ){
			var self = this,
				opt = this.configs,
				path = '';//'/'	
			/*if( hash.charAt(0) !== '/' ) {
				hash = '/'+hash;	
			}*/
			
			self.currentUrl = hash;
			self.history.push( hash );
			
			var _hash = {
				hash : hash
			};
			
			var e = self.fireEvent('onVisitPage',[ _hash ]);
			if( e === false ) {
				return;	
			}
			
			self.currentUrl = _hash.hash === hash ? self.currentUrl : _hash.hash;
			
			if( hash ) {
				var ourl = Nex.parseUrl( hash );//self.urlResolve(hash);
				path = ourl.pathname ? ourl.pathname : path;
			}
			
			self.currentUrlInfo = ourl;
			
			var params = {};
			if( hash && ourl && ourl.search ) {
				ourl.search = ourl.search.replace(/^\?/,'');
				var p = ourl.search.split('&');
				$.each( p,function(i,v){
					if( !v ) return;
					var param = v.split('=');
					params[ param[0] ] = param[1] ? param[1] : '';
				} );	
			}
			
			var r = self.parseRoute( path ) || {};
			
			self.currentUrlData = r;
			
			self.currentParams = $.extend(r.pathParams,params);
			
			if( r && $.isFunction(r.callback) ) {
				r.callback.call( self,self.currentParams );
			}
			return self;
		},
		checkUrl : function(){
			return this.checkRoute.apply( this, arguments );
		},
		/*
		*examples:
			var p1 = '/Index/:action';
				pathRegExp(p1,{}).exec('/Index/index'); // action=index true
				pathRegExp(p1,{}).exec('/Index/index/'); // false
				pathRegExp(p1,{}).exec('/Index/index/a...'); // false
			var p1 = '/Index/:action*';
				pathRegExp(p1,{}).exec('/Index/index'); // action=index true
				pathRegExp(p1,{}).exec('/Index/index/'); // action=index/ true
				pathRegExp(p1,{}).exec('/Index/index/a...'); // action=index/a... true
			var p1 = '/Index/:action?';
				pathRegExp(p1,{}).exec('/Index/index'); // action=index true
				pathRegExp(p1,{}).exec('/Index/index/'); // action=null true
			var x = pathRegExp(p1,{}).exec('/Index/index/a...'); // false	
			var p = switchRouteMatcher( '/Index/get',x );
		*/
		pathRegExp : function(path, opts) {
		  opts = opts || {};	
		  var insensitive = opts.caseInsensitiveMatch,
			  ret = {
					originalPath: path,
					regexp: path
				  },
				  keys = ret.keys = [];
			
			  path = path
				.replace(/([().])/g, '\\$1')
				.replace(/(\/)?:(\w+)([\?|\*])?/g, function(_, slash, key, option){
				  var optional = option === '?' ? option : null;
				  var star = option === '*' ? option : null;
				  keys.push({ name: key, optional: !!optional });
				  slash = slash || '';
				  return ''
					+ (optional ? '' : slash)
					+ '(?:'
					+ (optional ? slash : '')
					+ (star && '(.+?)' || '([^/]+)')
					+ (optional || '')
					+ ')'
					+ (optional || '');
				})
				.replace(/([\/$\*])/g, '\\$1');
			
			  ret.regexp = new RegExp('^' + path + '$', insensitive ? 'i' : '');
			  return ret;
		},
		/*
		*实际路径根据route匹配出参数
		*/
		switchRouteMatcher : function(url, route) {
			  var keys = route.keys,
				  params = {};
		
			  if (!route.regexp) return null;
		
			  var m = route.regexp.exec(url);
			  if (!m) return null;
		
			  for (var i = 1, len = m.length; i < len; ++i) {
				var key = keys[i - 1];
		
				var val = 'string' == typeof m[i]
					  ? decodeURIComponent(m[i])
					  : m[i];
		
				if (key && val) {
				  params[key.name] = val;
				}
				//如果是自定义路由 则使用下标
				if( !key && val ) {
					params[i - 1] = val;	
				}
			  }
			  return params;
		},
		/*
		*匹配正确的url
		*/
		parseRoute : function(url) {
			var self = this,
				opt = this.configs,
				routes = this.routes;
			/*if( self._otherwise.slice(-1) ) {
				routes.push( self._otherwise.slice(-1) );	
			}	*/	
			  // Match a route
			  var params, match;
			  $.each(routes, function(i, route) {
					if (!match && route && (params = self.switchRouteMatcher(url, route))) {
					  match = $.extend({
						  		pathParams : params,
								params : params
						 	},route);
					}
			  });
			  // No route matched; fallback to "otherwise" route
			  if( !match ) {
				  	match = {
						pathParams : {},
						params : {}	
					};
					if( $.isFunction( self._otherwise ) ) {
						match.callback = self._otherwise;
					} else {
						match.callback = function(){
							(self._otherwise !== null) && self.redirectTo( self._otherwise+'', false );	
						};
					} 
			  }
			  return match;
		},
		removeRoute : function( path ){
			var self = this;
			var routes = self.routes;
			var rp = $.type( path ) === 'regexp' ? path.toString() : path + '';
			$.each( routes, function( i, route ){
				if( route.originalPath == rp ) {
					routes[ i ] = null;	
				}
			} );	
			return self;
		},
		/*
		* 注：相同的path不会会被覆盖，如果想删除已经定义的path 使用when(path,null)
		*/
		when : function( path,func ){
			var self = this,
				opt = this.configs;	
			//批量添加
			if( arguments.length === 1 ) {
				if( $.isPlainObject( path ) ) {
					$.each( path,function(k,v){
						self.when( k,v );	
					} );	
				}
				if( $.isFunction( path ) ) {
					var r = path.call( self );
					if( r ) {
						self.when( r );	
					}	
				}
				return self;
			}
			if( func === null ) {
				return self.removeRoute( path );	
			}
			//如果是字符串 表示当前地址会重定向到后面地址的解析这样的重定向不触发历史记录
			if( $.type( func ) === 'string' ) {
				var redirectTo = func;
				func = function(){
					self.redirectTo( redirectTo, false );	
				};
			}
			
			var routes = self.routes;
			
			if( $.type( path ) === 'regexp' ) {
				routes.push(
					{
						callback : func,
						originalPath : path.toString(),
						regexp : path,
						keys : []
					}
				);	
			} else {
				routes.push(
					$.extend( {
							callback : func
						},self.pathRegExp( path,{
							caseInsensitiveMatch : opt.caseInsensitiveMatch	
						} ) )
				);
			}
			/*if (path) {
				var redirectPath = path+'';
				if( redirectPath.charAt(0) !== '/' ) {
					redirectPath = '/'+redirectPath;	
				}
				self.routes[redirectPath] = $.extend( {
						callback : func
					},self.pathRegExp( redirectPath,{
					caseInsensitiveMatch : opt.caseInsensitiveMatch	
				} ) );
			}*/
			return self;
		},
		_otherwise : null,
		//会覆盖原有的
		otherwise : function( func ){
			this._otherwise = func;
			return this;
		},
		destroy : function(  ){
			var self = this,
				opt = this.configs;	
			$(window).unbind('.'+opt.id);	
			//self.removeCmp();
			self._super(arguments);
			return this;
		},
		//关闭路由
		'stop' : function(){	
			var self = this,
				opt = this.configs;	
			opt.hashChangeFirstOnRoute = false;
			opt.hashChangeOnRoute = false;
			return self;	
		},
		'start' : function(){		
			var self = this,
				opt = this.configs;	
			opt.hashChangeFirstOnRoute = true;
			opt.hashChangeOnRoute = true;
			return self;		
		}
	});
	
	return router;
});