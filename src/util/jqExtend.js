define(function(require){
	
	require('../Nex');
	
	(function($){
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
	})(jQuery);
	(function($){
		/*
		selection扩展
		*/
		jQuery.support.selectstart = false;
		jQuery.fn.extend({
			disableSelection: function() {
				return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
					".nex-disableSelection", function( event ) {
						event.preventDefault();
					});
			},
			enableSelection: function() {
				return this.unbind( ".nex-disableSelection" );
			}
		});
		/*
		兼容 jquery 1.9 以上 移除 $.support.boxMoal
		*/
		if( jQuery.support.boxModel === undefined ) {
			jQuery.support.boxModel = document.compatMode === "CSS1Compat";
		}
		/*
		是否支持 onselectstart 检查
		*/
		jQuery(function() {
			var body = document.body,
				div = body.appendChild( div = document.createElement( "div" ) );
				
			$.support.selectstart = "onselectstart" in div;
		
			// set display to none to avoid a layout bug in IE
			// http://dev.jquery.com/ticket/4014
			body.removeChild( div ).style.display = "none";
		});
	})(jQuery);
	(function($){
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
					var pos = t.position();
					return {
						top : pos.top + op.scrollTop(),	
						left : pos.left + op.scrollLeft()
					};
				}
			} else {
				return this.css( _f );	
			}
		};	
	})(jQuery);
	return $;
	
});