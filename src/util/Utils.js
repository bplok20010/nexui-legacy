define(function(require){
	
	var Nex = require('../Nex');
	
	var utils = {
		inherits : function(subclass, superclass, overwrite){
			//..	
		},
		
		extend : function(){
			return this.inherits.apply( this, arguments );	
		},
		
		htmlEncode: (function() {
			var entities = {
				'&': '&amp;',
				'>': '&gt;',
				'<': '&lt;',
				'"': '&quot;'
			}, keys = [], p, regex;
	
			for (p in entities) {
				keys.push(p);
			}
	
			regex = new RegExp('(' + keys.join('|') + ')', 'g');
	
			return function(value) {
				return (!value) ? value : String(value).replace(regex, function(match, capture) {
					return entities[capture];
				});
			};
		})(),
		htmlDecode: (function() {
			var entities = {
				'&amp;': '&',
				'&gt;': '>',
				'&lt;': '<',
				'&quot;': '"'
			}, keys = [], p, regex;
	
			for (p in entities) {
				keys.push(p);
			}
	
			regex = new RegExp('(' + keys.join('|') + '|&#[0-9]{1,5};' + ')', 'g');
	
			return function(value) {
				return (!value) ? value : String(value).replace(regex, function(match, capture) {
					if (capture in entities) {
						return entities[capture];
					} else {
						return String.fromCharCode(parseInt(capture.substr(2), 10));
					}
				});
			};
		})(),
		addCssRules : function(style, cssSelector, cssText, update){
			function fcamelCase( all, letter ) {
				return ( letter + "" ).toUpperCase();
			}
			function camelCase( string ){
				var rmsPrefix = /^-ms-/,
					rdashAlpha = /-([\da-z])/gi;
				return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
			}
			function $caller(cssSelector, cssText, update){
				var undef;
				var update = update === undef ? true : update;
				return update ? updateRules.apply(this,[cssSelector, cssText]) : addRules.apply(this,[cssSelector, cssText]);
			};
			function addRules( cssSelector, cssText ){
				var styleSheet = style.styleSheet?style.styleSheet:style.sheet;
				var rules = styleSheet.cssRules || styleSheet.rules;
				if( styleSheet.addRule ) {
					styleSheet.addRule(cssSelector,cssText);	
				} else {
					styleSheet.insertRule(cssSelector+"{"+cssText+"}", rules.length);	
				}
				return $caller;
			}
			function updateRules( cssSelector, cssText ){
				var styleSheet = style.styleSheet?style.styleSheet:style.sheet;
				var rules = styleSheet.cssRules || styleSheet.rules;
				var rule = null;
				for( var i=0, len=rules.length; i<len; i++ ) {
					//只修改最后一个样式
					if( rules[i].selectorText.toLowerCase() === cssSelector.toLowerCase() ) {
						rule = rules[i];
					}
				}
				if( !rule ) {
					return addRules( cssSelector, cssText );
				} else {
					var css = ( cssText + "" ).split(';');
					for( var k=0, len2 = css.length; k < len2; k++ ) {
						var d = css[k].split(':');
						rule.style[ $.trim(camelCase(d[0])) ] = d[1];	
					}	
				}
				return $caller;
			}
			return cssSelector ? $caller(cssSelector, cssText, update) : $caller;
		},
		parseUrl : function( url ){
			var urlParseRE = /^\s*(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/;	
			if ( $.type( url ) === "object" ) {
				return url;
			}
			var matches = urlParseRE.exec( url || "" ) || [];
			return {
				href:         matches[  0 ] || "",
				hrefNoHash:   matches[  1 ] || "",
				hrefNoSearch: matches[  2 ] || "",
				domain:       matches[  3 ] || "",
				protocol:     matches[  4 ] || "",
				doubleSlash:  matches[  5 ] || "",
				authority:    matches[  6 ] || "",
				username:     matches[  8 ] || "",
				password:     matches[  9 ] || "",
				host:         matches[ 10 ] || "",
				hostname:     matches[ 11 ] || "",
				port:         matches[ 12 ] || "",
				pathname:     matches[ 13 ] || "",
				directory:    matches[ 14 ] || "",
				filename:     matches[ 15 ] || "",
				search:       matches[ 16 ] || "",
				hash:         matches[ 17 ] || ""
			};
		},	
		/*
		*监控一个函数并使得此函数有 before after 回调
		*	examples : 
		*		f = Nex.monitor( fn );
		*		f.before( function(){
		*			console.log('before call')	
		*		} );
		*		f.after( function(){
		*			console.log('after call')	
		*		} )
		*/
		monitor : function( fn ){
			var newFn;
			newFn = function(){
				var rt;
				newFn._callBefore.apply( this, arguments );
				rt = fn.apply( this, arguments );	
				newFn._callAfter.apply( this, arguments );
				return rt;
			}
			
			var q = [];
			
			newFn._callBefore = function(){
				for( var i=0, len=q.length; i<len; i++ ) {
					var cb = q[i];
					if( !cb ) continue;
					if( cb.above ) {
						cb.fn.apply( this, arguments );	
					}
				}	
			};
			newFn._callAfter = function(){
				for( var i=0, len=q.length; i<len; i++ ) {
					var cb = q[i];
					if( !cb ) continue;
					if( !cb.above ) {
						cb.fn.apply( this, arguments );	
					}
				}	
			};
			newFn.before = function( fn ){
				return q.push( {
					above : true,
					fn : fn	
				} ) - 1;
			};	
			newFn.after = function( fn ){
				return q.push( {
					above : false,
					fn : fn	
				} ) - 1;
			};
			newFn.remove = function( i ){
				return q[i] && (q[i] = null);
			};
			newFn.beforeOnce = function( fn ){
				var i;
				i = newFn.before( function(){
					fn.apply( this, arguments );
					newFn.remove(i);	
				} );
			};	
			newFn.afterOnce = function( fn ){
				var i;
				i = newFn.after( function(){
					fn.apply( this, arguments );
					newFn.remove(i);	
				} );
			};
			
			return newFn;
		},
		/*
		*判断元素垂直滚动条是否滚动到底 @dom
		*/
		_checkYScrollEnd : function( el ){
			var scrollTop = 0;
			var clientHeight = 0;
			var scrollHeight = 0;	
			if( el === document.body || el === document || el === window ) {
				if (document.documentElement && document.documentElement.scrollTop) {
					scrollTop = document.documentElement.scrollTop;
				} else if (document.body) {
					scrollTop = document.body.scrollTop;
				}
				if (document.body.clientHeight && document.documentElement.clientHeight) {
					clientHeight = (document.body.clientHeight < document.documentElement.clientHeight) ? document.body.clientHeight: document.documentElement.clientHeight;
				} else {
					clientHeight = (document.body.clientHeight > document.documentElement.clientHeight) ? document.body.clientHeight: document.documentElement.clientHeight;
				}
				scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
			} else {
				if( !el.nodeType ) return false;
				scrollTop = el.scrollTop;
				clientHeight = el.clientHeight;
				scrollHeight = el.scrollHeight;
			}
			if( clientHeight >= scrollHeight ) {
				return false;
			} else if (scrollTop + clientHeight >= scrollHeight) {//必须要使用>= 因为缩放后会大于scrollHeight
				return true;
			} else {
				return false;
			}	
		},
		/**
		* 判断元素水平滚动条是否滚动到底
		* @param {!NODE}
		*/
		_checkXScrollEnd : function( el ){
			var scrollLeft = 0;
			var clientWidth = 0;
			var scrollWidth = 0;	
			if( el === document.body || el === document || el === window ) {
				if (document.documentElement && document.documentElement.scrollLeft) {
					scrollLeft = document.documentElement.scrollLeft;
				} else if (document.body) {
					scrollLeft = document.body.scrollLeft;
				}
				if (document.body.clientWidth && document.documentElement.clientHeight) {
					clientWidth = (document.body.clientWidth < document.documentElement.clientWidth) ? document.body.clientWidth: document.documentElement.clientWidth;
				} else {
					clientWidth = (document.body.clientWidth > document.documentElement.clientWidth) ? document.body.clientWidth: document.documentElement.clientWidth;
				}
				scrollWidth = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
			} else {
				if( !el.nodeType ) return false;
				scrollLeft = el.scrollLeft;
				clientWidth = el.clientWidth;
				scrollWidth = el.scrollWidth;
			}
			if( clientWidth >= scrollWidth ) {
				return false;
			} else if (scrollLeft + clientWidth >= scrollWidth) {//必须要使用>= 因为缩放后会大于scrollWidth
				return true;
			} else {
				return false;
			}		
		},
		/*
		*验证是否滚动到低 @el dom @a left/top
		*/
		isScrollEnd : function( el,a ){
			var self = this,
				undef;
			if( a == 'left' ) {
				return self._checkXScrollEnd( el );	
			} else {
				return self._checkYScrollEnd( el );		
			}
		},
		/*
		*判断是否出现滚动条
		* @param el dom
		* @param a left top
		* @param t boolean defalut:false 如果t=true则只要超出宽度就会认定有滚动条，但是未必有滚动条一般拿来检测是否子节点的宽度大于父节点
		*/
		hasScroll: function( el, a, t ) {
			
			var el = $(el)[0];//el 是dom
			
			//If overflow is hidden, the element might have extra content, but the user wants to hide it
			/*
			//IE下 只要overflow-x/overflow-y设置了hidden那么获得的overflow就是hidden 所以我们要只取-x -y
			if ( $( el ).css( "overflow" ) === "hidden") {
				return false;
			}
			*/
			if( t !== true ) {
				if( a === "left" ) {
					if ( $( el ).css( "overflow-x" ) === "hidden") {
						return false;
					}
				} else {
					if ( $( el ).css( "overflow-y" ) === "hidden") {
						return false;
					}	
				}
			}
			var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop",
				has = false;
			if ( el[ scroll ] > 0 ) {
				return true;
			}
			// TODO: determine which cases actually cause this to happen
			// if the element doesn't have the scroll set, see if it's possible to
			// set the scroll
			el[ scroll ] = 1;
			has = ( el[ scroll ] > 0 );
			el[ scroll ] = 0;
			return has;
		},
		/*
		* 获取浏览器滚动条大小
		*/
		getScrollbarSize: function () {
			if (!Nex.scrollbarSize) {
				var db = document.body,
					div = document.createElement('div');

				div.style.width = div.style.height = '100px';
				div.style.overflow = 'scroll';
				div.style.position = 'absolute';

				db.appendChild(div); 
				
				Nex.scrollbarSize = {
					width: div.offsetWidth - div.clientWidth,//竖
					height: div.offsetHeight - div.clientHeight//横
				};
				//IE下 出现过有一边获取不到的情况 就是为0
				Nex.scrollbarSize.width = Nex.scrollbarSize.width || Nex.scrollbarSize.height;
				Nex.scrollbarSize.height = Nex.scrollbarSize.height || Nex.scrollbarSize.width;
				
				Nex.scrollbarSize.x = Nex.scrollbarSize.height;
				Nex.scrollbarSize.y = Nex.scrollbarSize.width;
				
				db.removeChild(div);
				
			}
			return Nex.scrollbarSize;
		}
	};	
	
	return utils;
});