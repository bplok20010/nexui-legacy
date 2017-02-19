define(function(require){
	var $ = require('jquery');

/*! Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.6
 * 
 * Requires: 1.2.2+
 */	
(function($){var types=['DOMMouseScroll','mousewheel'];if($.event.fixHooks){for(var i=types.length;i;){$.event.fixHooks[types[--i]]=$.event.mouseHooks;}}
$.event.special.mousewheel={setup:function(){if(this.addEventListener){for(var i=types.length;i;){this.addEventListener(types[--i],handler,false);}}else{this.onmousewheel=handler;}},teardown:function(){if(this.removeEventListener){for(var i=types.length;i;){this.removeEventListener(types[--i],handler,false);}}else{this.onmousewheel=null;}}};$.fn.extend({mousewheel:function(fn){return fn?this.bind("mousewheel",fn):this.trigger("mousewheel");},unmousewheel:function(fn){return this.unbind("mousewheel",fn);}});function handler(event){var orgEvent=event||window.event,args=[].slice.call(arguments,1),delta=0,returnValue=true,deltaX=0,deltaY=0;event=$.event.fix(orgEvent);event.type="mousewheel";if(orgEvent.wheelDelta){delta=orgEvent.wheelDelta/120;}
if(orgEvent.detail){delta=-orgEvent.detail/3;}
deltaY=delta;if(orgEvent.axis!==undefined&&orgEvent.axis===orgEvent.HORIZONTAL_AXIS){deltaY=0;deltaX=-1*delta;}
if(orgEvent.wheelDeltaY!==undefined){deltaY=orgEvent.wheelDeltaY/120;}
if(orgEvent.wheelDeltaX!==undefined){deltaX=-1*orgEvent.wheelDeltaX/120;}
args.unshift(event,delta,deltaX,deltaY);return($.event.dispatch||$.event.handle).apply(this,args);}})(jQuery);
	
	
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
		
	$.fn.extend({
		scrollParent: function( includeHidden ) {
			var position = this.css( "position" ),
				excludeStaticParent = position === "absolute",
				overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
				scrollParent = this.parents().filter( function() {
					var parent = $( this );
					if ( excludeStaticParent && parent.css( "position" ) === "static" ) {
						return false;
					}
					return overflowRegex.test( parent.css( "overflow" ) + parent.css( "overflow-y" ) + parent.css( "overflow-x" ) );
				}).eq( 0 );
	
			return position === "fixed" || !scrollParent.length ? $( this[ 0 ].ownerDocument || document ) : scrollParent;
		},
		
		disableSelection: (function() {
			var eventType = "onselectstart" in document.createElement( "div" ) ?
				"selectstart" :
				"mousedown";
	
			return function(pfx) {
				return this.bind( eventType + ".ui-disableSelection"+(pfx || ''), function( event ) {
					event.preventDefault();
				});
			};
		})(),
	
		enableSelection: function(pfx) {
			return this.unbind( ".ui-disableSelection"+(pfx || '') );
		}
	});
	
	var dataSpace = 'nex-data';
	
	// Saves a set of properties in a data storage
	$._save = function( element, set ) {
		for ( var i = 0; i < set.length; i++ ) {
			if ( set[ i ] !== null ) {
				element.data( dataSpace + set[ i ], element[ 0 ].style[ set[ i ] ] );
			}
		}
	};

	// Restores a set of previously saved properties from a data storage
	$._restore = function( element, set ) {
		var val, i;
		for ( i = 0; i < set.length; i++ ) {
			if ( set[ i ] !== null ) {
				val = element.data( dataSpace + set[ i ] );
				// support: jQuery 1.6.2
				// http://bugs.jquery.com/ticket/9917
				// jQuery 1.6.2 incorrectly returns undefined for any falsy value.
				// We can't differentiate between "" and 0 here, so we just assume
				// empty string since it's likely to be a more common value...
				if ( val === undefined ) {
					val = "";
				}
				element.css( set[ i ], val );
			}
		}
	};
	
	
	$(function(){
			
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
		
	});
	
	return $;
});