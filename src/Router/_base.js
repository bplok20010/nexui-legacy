define(function(require){
	var Nex = require('../Nex');
	var util = require('../util/Utils');
	
	function config(){
		return {
			caseInsensitiveMatch : false	
		};	
	}
	var RouterBase = {
		config : config,
		_routes : null,
		_otherwise : null,
		//
		// 解析规则
		// - ? 可选 /index/:user?
		// - * 任意 /index/:user*/:id
		// - :name /index/:user
		//
		//caseInsensitiveMatch 是否区分大小写 - true 不区分 - false 区分 默认
		pathRegExp : function(path, caseInsensitiveMatch) {
			var insensitive = caseInsensitiveMatch,
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
		/**
		* 解析url
		* @param string url地址
		* @parma pathRegExp()
		*/
		switchRouteMatcher : function(url, route){
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
		parseRoute : function(url){
			var self = this,
				opt = this.configs,
				routes = this._routes || [];
				
			// Match a route
			var params, match;
			Nex.each(routes, function(route, i) {
				if (!match && route && (params = self.switchRouteMatcher(url, route))) {
				  match = Nex.extend({
							pathParams : params,
							params : params
						}, route);
				}
			});
			
			// No route matched; fallback to "otherwise" route
			if( !match ) {
				match = {
					pathParams : {},
					params : {}	
				};
				if( Nex.isFunction( self._otherwise ) ) {
					match.callback = self._otherwise;
				} else {
					match.callback = function(){
						if( !self._otherwise ) return;
						
						var destPath = self._otherwise;
						self.go(destPath);
						//var destRoute = self.getRouteByPath(destPath);
						//destRoute && destRoute.callback.apply(self, arguments);
					};
				} 
			}
			return match;	
		},
		// index 是否返回索引 
		getRouteByPath : function(path, index){
			var route = null,i=0,routes = this._routes || [];
			
			for(;i<routes.length;i++) {
				if( routes[i].originalPath === path ) {
					route = index ? i : routes[i];
					break;
				}
			}
			
			return route;
		},
		
		removeRoute : function(path){
			var routes = this._routes || [];
			var index = this.getRouteByPath(paht, true);
			
			if( index === null ) return this;
			
			routes.splice(index, 1);
			
			return this;	
		},
		
		otherwise : function( fn ){
			this._otherwise = fn;
			return this;
		},
		/**
		* @param string 规则
		* @param string|function -符合规则时的回调 如果是字符串则当作跳转用
		* @examples
		* router.when('/userinfo/:id', callback1)
		* router.when('/', '/userinfo/:id') //会执行 callback1
		*/
		when : function( path,func ){
			var self = this,
				routes = this._routes || [];	
			//批量添加
			if( arguments.length === 1 ) {
				if( Nex.isObject( path ) ) {
					Nex.each( path, function(callback, p){
						self.when( p, callback );	
					} );	
				}
				
				return self;
			}
			if( func === null ) {
				return self.removeRoute( path );	
			}
			//如果是字符串 表示当前地址会重定向到后面地址的解析这样的重定向不触发历史记录
			if( Nex.isString(func) ) {
				var destPath = func;
				func = function(){
					self.go(destPath);
					//var destRoute = self.getRouteByPath(destPath);
					//destRoute && destRoute.callback.apply(self, arguments);
				};
			}
			
			if( Nex.isRegExp( path ) ) {
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
					Nex.extend( {
						callback : func
					}, self.pathRegExp( path, self.caseInsensitiveMatch	 ) )
				);
			}
			
			this._routes = routes;
			
			return self;
		},
		go : function(path){
			var self = this,
				opt = this.configs;
			if( path.charAt(0) !== '/' ) {
				path = '/'+path;	
			}
			
			var ourl = util.parseUrl( path );
			path = ourl.pathname;
			
			self.currentUrlInfo = ourl;
			
			var params = {};
			if( ourl.search ) {
				ourl.search = ourl.search.replace(/^\?/,'');
				var p = ourl.search.split('&');
				$.each( p,function(i,v){
					if( !v ) return;
					var param = decodeURIComponent(v).split('=');
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
		}
	}
	
	return RouterBase;
});