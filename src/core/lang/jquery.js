if( window.jQuery || window.Zepto ) {
	define('jquery', function(){
		return window.jQuery || window.Zepto;	
	});	
}
define(function(require){
	var $ = require('jquery');
	
	/*
	*返回相对offsetParent的绝对高度，而不是相对
	*/
	$.fn._position = function(_f){
		var undef;
		if( _f === undef ) {
			var t = this.eq(0);
			var op = t.offsetParent();
			if( op.is('body') || op.is('html') ) {
				return t.offset();	
			} else {
				var _a = t.offset(),
					_b = op.offset(),
					_c = parseFloat(op.css('borderLeftWidth')) || 0,
					_e = parseFloat(op.css('paddingLeft')) || 0,
					_c1 = parseFloat(op.css('borderTopWidth')) || 0,
					_e1 = parseFloat(op.css('paddingTop')) || 0;
				var pos = {
					top : _a.top - _b.top - _c1 - _e1,
					left : _a.left - _b.left - _c - _e
				};
				return {
					top : pos.top + op.scrollTop(),	
					left : pos.left + op.scrollLeft()
				};
			}
		} else {
			return this.css( _f );	
		}
	};
	
	// support: jQuery <1.8
	if ( !$( "<a>" ).outerWidth( 1 ).jquery ) {
		$.each( [ "Width", "Height" ], function( i, name ) {
			var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
				type = name.toLowerCase(),
				orig = {
					innerWidth: $.fn.innerWidth,
					innerHeight: $.fn.innerHeight,
					outerWidth: $.fn.outerWidth,
					outerHeight: $.fn.outerHeight
				};
	
			function reduce( elem, size, border, margin ) {
				$.each( side, function() {
					size -= parseFloat( $.css( elem, "padding" + this ) ) || 0;
					if ( border ) {
						size -= parseFloat( $.css( elem, "border" + this + "Width" ) ) || 0;
					}
					if ( margin ) {
						size -= parseFloat( $.css( elem, "margin" + this ) ) || 0;
					}
				});
				return size;
			}
	
			$.fn[ "inner" + name ] = function( size ) {
				if ( size === undefined ) {
					return orig[ "inner" + name ].call( this );
				}
	
				return this.each(function() {
					$( this ).css( type, reduce( this, size ) + "px" );
				});
			};
	
			$.fn[ "outer" + name] = function( size, margin ) {
				if ( typeof size !== "number" ) {
					return orig[ "outer" + name ].call( this, size );
				}
	
				return this.each(function() {
					$( this).css( type, reduce( this, size, true, margin ) + "px" );
				});
			};
		});
	}
	
	// support: jQuery <1.8
	if ( !$.fn.addBack ) {
		$.fn.addBack = function( selector ) {
			return this.add( selector == null ?
				this.prevObject : this.prevObject.filter( selector )
			);
		};
	}
	
	$.fn.extend({
	
		disableSelection: (function() {
			var eventType = "onselectstart" in document.createElement( "div" ) ?
				"selectstart" :
				"mousedown";
	
			return function() {
				return this.bind( eventType + ".ui-disableSelection", function( event ) {
					event.preventDefault();
				});
			};
		})(),
	
		enableSelection: function() {
			return this.unbind( ".ui-disableSelection" );
		}
	});
	
	// selectors
	function focusable( element, isTabIndexNotNaN ) {
		var map, mapName, img,
			nodeName = element.nodeName.toLowerCase();
		if ( "area" === nodeName ) {
			map = element.parentNode;
			mapName = map.name;
			if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
				return false;
			}
			img = $( "img[usemap='#" + mapName + "']" )[ 0 ];
			return !!img && visible( img );
		}
		return ( /^(input|select|textarea|button|object)$/.test( nodeName ) ?
			!element.disabled :
			"a" === nodeName ?
				element.href || isTabIndexNotNaN :
				isTabIndexNotNaN) &&
			// the element and all of its ancestors must be visible
			visible( element );
	}
	
	function visible( element ) {
		return $.expr.filters.visible( element ) &&
			!$( element ).parents().addBack().filter(function() {
				return $.css( this, "visibility" ) === "hidden";
			}).length;
	}
	
	$.extend( $.expr[ ":" ], {
		
		focusable: function( element ) {
			return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
		},
		
		NexCtor: function(){
				
		},
		
		NexInst: function(){
				
		}
	});
	
	var ua = navigator.userAgent.toLowerCase();
	var ie8 = /msie (?:7|8)/.test(ua);
	//部分IE8版本不完全支持 max-* min-* 和 box-sizing:border-bo混用会有问题
	//部分IE7也支持max min
	//如果max-* min-*生效时 box-sizing会失效
	var supportMaxMin = true;
	if( ie8 ) {
		/*
		检查是否完全支持
		*/
		jQuery(function() {
			var body = document.body,
				div = body.appendChild( div = document.createElement( "div" ) );
				
			$(div).css({
				boxSizing : 'border-box',
				MsBoxSizing : 'border-box',
				height : 0,
				width : 10,
				padding : '0 5px',
				minWidth : 15		
			});
			
			supportMaxMin = $(div).outerWidth() == 15;
		
			// set display to none to avoid a layout bug in IE
			// http://dev.jquery.com/ticket/4014
			body.removeChild( div ).style.display = "none";
			if( !supportMaxMin ) {
				$(body).addClass('boxsizing-mm-fixed');
			}
		});
	}
	
	$.each(['maxWidth', 'maxHeight', 'minWidth', 'minHeight'], function(i, fn){
		var ac1 = {
			maxWidth : 'outerWidth',
			minWidth : 'outerWidth',
			maxHeight : 'outerHeight',
			minHeight : 'outerHeight'
		};
		var ac2 = {
			maxWidth : 'width',
			minWidth : 'width',
			maxHeight : 'height',
			minHeight : 'height'
		};
		function isPerc(v){
			return (v+'').indexOf('%') === -1 ? false : true;	
		}
		$.fn[fn] = function( v ){
			var list = [];
			var tmp = ( isPerc(v) || supportMaxMin ) ?
				this.css(fn, v) :
				this.each(function(x, el){
					list.push(el);
					var that = $(el);
					var _ndiff;
					if( that._ndiff ) {
						_ndiff = that._ndiff;	
					} else {
						_ndiff = (that[ac1[fn]]() - that[ac2[fn]]());	
						that._ndiff = _ndiff;
					}
					var pix = parseFloat(v, 10) - _ndiff;
					that.css(fn, pix);
				});
			if( list.length ) {
				setTimeout(function(){
					$.each(list, function(i, el){
						el._ndiff = null;
					});	
				},0);	
			}	
			return this;	
		};	
	});	
	
	return $;

});