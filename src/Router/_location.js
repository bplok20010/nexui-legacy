define(function(require){
	var Nex = require('../Nex');
	var util = require('../util/Utils');
	
	function config(){
		return {
			rootElement : document,
			//使用html5的pushSate 或者 hash 
			/**
			* 是否使用html5 pushState模式 默认启用
			* html5Mode 模式下最好不要用#/some/path方式来兼容hash模式，会自动处理 
			* 对于不支持pushState都会转成hash模式
			* @expamles:
			*  | <a href="/center/10">用户中心</a> 兼容2者模式
			*  | <a href="#/center/10">用户中心</a> 只对hash模式下有效即html5Mode = false
			*/
			html5Mode : false,
			// 是否监控所有a连接 如果开启html5Mode必须开启
			// 纯hash模式下可以关闭
			rewriteLinks : true
		};	
	}
	
	var RouterLocation = {
		config : config,
		currentUrl : null,
		lastUrl : null,
		lastState : null,
		beginWithUrl : '',
		$rootElement : null,
		IGNORE_URI_REGEXP : /^\s*(javascript|mailto|tel):/i,
		initRouterLocation : function(){
			var self = this;
			
			if( !this.rootElement ) return this;
			
			var $rootElement = this.$rootElement = $(this.rootElement);
			var IGNORE_URI_REGEXP = self.IGNORE_URI_REGEXP;
			
			$rootElement.on('click', function(event){
				if (!self.rewriteLinks || event.ctrlKey || event.metaKey || event.shiftKey || event.which == 2 || event.button == 2) return;
				var target = self.findClosestLink(event.target);
				
				if( !target ) return;
				
				var elm = $(target);	
				// get the actual href attribute - see
				// http://msdn.microsoft.com/en-us/library/ie/dd347148(v=vs.85).aspx
				var href = elm.attr('href') || elm.attr('xlink:href');
				
				if (IGNORE_URI_REGEXP.test(href)) return;
				
				if ( href && !elm.attr('target') && 
						!event.isDefaultPrevented() && 
						!( self.isExternal( href ) && self.isAbsoluteUrl( href ) )) {
							
					event.preventDefault();	
					
					self.url(self.stripBeginsWith(self.beginWithUrl, href));
					
				}
				
			});
			
			var history = this.getHistory();
			var location = this.getLocation();
			
			//IE 10-11 hash改变时不会触发popstate
			// html5 history api - popstate event
			if (history.pushState) $(window).on('popstate', function(){
				var state = history.state;
				var url;
				
				if( !state || !state.url ) {
					url = self.url();
				} else {
					url = state.url;
				}
			
				self._fireUrlChange(url);
			});
			// hashchange event
			$(window).on('hashchange', function(){
				self._fireUrlChange(self.url());	
			});
					
		},
		
		_fireUrlChange : function(url){
			if (this.lastUrl === url && (this.getCurrentState() || null) === this.lastState) {
				return;
			}	
			
			this.lastUrl = url;
			this.lastState = this.getHistory().state || null;
			
			if( !this.html5Mode || !this.supportPushState ) {
				url = this.getHash(url).replace('#', '');
			}
			
			this.currentUrl = url;
			
			if(this.fireEvent('onBeforeUrlChange', this.currentUrl) !== false) {
				this.go(this.currentUrl);	
				this.fireEvent('onUrlChange', this.currentUrl);
			}
		},
		
		getCurrentPath : function(){
			return this.currentUrl;	
		},
		
		getLocation : function(){
			return window.location;	
		},
		
		getHistory : function(){
			return window.history;	
		},
		
		getCurrentState : function(){
			try {
				return history.state;
			} catch (e) {
			    // MSIE can reportedly throw when there is no state (UNCONFIRMED).
			}	
		},
		
		hash : function(hash){
			this.getLocation().hash = hash;	
		},
		
		pushState : function(url, replace){
			var history = this.getHistory();	
			history[replace ? 'replaceState' : 'pushState']({
				url : url	
			}, '', url);
			
			this._fireUrlChange(url);	
		},
		
		url : function(url, replace){
			var self = this;
			var lastUrl = self.lastUrl;
		
			var location = this.getLocation();
			var history = this.getHistory();
		
			// setter
			if (url) {
				if (lastUrl === url) {
					return self;
				}
				
				if( url[0] !== '#' && self.html5Mode && history.pushState ) {
					self.pushState(url, replace);
				} else {
					self.hash(url.replace(/^#/, ''));		 
				}
				
				return self;
			// getter
			} else {
				return (location.pathname + location.search + location.hash).replace(/%27/g,"'");//location.href.replace(/%27/g,"'");
			}	
		},
		stripBeginsWith : function(begin, whole) {
			if (whole.indexOf(begin) === 0) {
				return whole.substr(begin.length);
			}
			return whole;
		},
		trimEmptyHash : function(url) {
			return url.replace(/(#.+)|#$/, '$1');
		},		
		stripHash : function (url) {
		  var index = url.indexOf('#');
		  return index == -1 ? url : url.substr(0, index);
		},
		getHash : function (url) {
			var index = url.indexOf('#');
			return index === -1 ? '' : url.substr(index);
		},
		isExternal: function( url ) {
			var u = util.parseUrl( url );
			var docUrl = util.parseUrl( location.href );
	
			return !!( u.protocol &&
				( u.domain.toLowerCase() !== docUrl.domain.toLowerCase() ) );
		},
		isAbsoluteUrl: function( url ) {
			return util.parseUrl( url ).protocol !== "";
		},
		findClosestLink : function(target){
			var $rootElement = this.$rootElement;
			
			while ( target ) {
				if (target === $rootElement[0]) {
					target = null;
					break;
				};
				
				if ( ( typeof target.nodeName === "string" ) && target.nodeName.toLowerCase() === "a" ) {
					break;
				}
				
				target = target.parentNode;
			}	
			
			return target;
		}
	}
	
	return RouterLocation;
});