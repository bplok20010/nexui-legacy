/*
resizable - jQuery Nex
nobo
zere.nobo@gmail.com
qq : 505931977
var drag = new Nex.resizable({target:$('#drag')});
*/
define(function(require){
	var Nex = require('../Nex');
	
	var EventObject = require('../EventObject');

	var resize = Nex.define('Nex.resize.Resize', EventObject, {
		alias : 'Nex.Resize',
		xtype : 'resize resizable',
		config : function(){
			return {
				denyManager : true,
				target: null,
				disabled: false,
				handles:'n, e, s, w, ne, se, sw, nw, all',
				minWidth: 10,
				minHeight: 10,
				maxWidth: 10000,//$(document).width(),
				maxHeight: 10000,//$(document).height(),
				edge : 5,//移动边缘宽度
				left : 0,
				top : 0,
				_sLeft : 0,
				_sTop : 0,
				_sX : 0,
				_sY : 0,
				_sWidth : 0,
				_sHeight : 0,
				width : 0,
				height : 0,
				dir : ''
			};	
		}		
	});
	
	resize.override({
		constructor : function() {
			var self = this;
			
			self._super(arguments);
			
			var opt = this.configs;
			
			if( opt.el ) {
				opt.target = opt.el;	
			}
			
			if( !opt.target ) return;
			
			$(opt.target).data('nex.resizable', self);
			
			opt.target.bind('mousedown.resizable', $.proxy( self,'mouseDown' ));
			opt.target.bind('mousemove.resizable', $.proxy( self,'mouseMove' ));
			opt.target.bind('mouseleave.resizable', $.proxy( self,'mouseLeave' ));
		},
		//系统事件
		/*_sysEvents : function(){
			var self = this;
			var opt = self.configs;
			//self.bind("onStart",self.onStart);	
		},*/
		getDirection : function(e) {
			var self = this;
			var opt = self.configs;
			var tt = $(opt.target);
			var dir = '';
			var offset = tt.offset();
			var width = tt.outerWidth();
			var height = tt.outerHeight();
			var edge = opt.edge;
			if (e.pageY > offset.top && e.pageY < offset.top + edge) {
				dir += 'n';
			} else if (e.pageY < offset.top + height && e.pageY > offset.top + height - edge) {
				dir += 's';
			}
			if (e.pageX > offset.left && e.pageX < offset.left + edge) {
				dir += 'w';
			} else if (e.pageX < offset.left + width && e.pageX > offset.left + width - edge) {
				dir += 'e';
			}
			
			var handles = opt.handles.split(',');
			for(var i=0; i<handles.length; i++) {
				var handle = handles[i].replace(/(^\s*)|(\s*$)/g, '');
				if (handle == 'all' || handle == dir) {
					return dir;
				}
			}
			return '';
		},
		resize : function(e){
			var self = this;
			var opt = self.configs;
			var width,height;
			if (opt.dir.indexOf('e') != -1) {
				width = opt._sWidth + e.pageX - opt._sX;
				width = Math.min(
							Math.max(width, opt.minWidth,0),
							opt.maxWidth <= 0 ? Math.max(width, opt.minWidth) : opt.maxWidth
						);
				opt.width = width;			
			}
			if (opt.dir.indexOf('s') != -1) {
				height = opt._sHeight + e.pageY - opt._sY;
				height = Math.min(
						Math.max(height, opt.minHeight,0),
						opt.maxHeight <= 0 ? Math.max(height, opt.minHeight) : opt.maxHeight
				);
				opt.height = height;
			}
			if (opt.dir.indexOf('w') != -1) {
				width = opt._sWidth - e.pageX + opt._sX;
				var _width = Math.min(
							Math.max(width, opt.minWidth,0),
							opt.maxWidth <= 0 ? Math.max(width, opt.minWidth) : opt.maxWidth
						);
				if( width == _width ) {
					opt.left = opt._sLeft + e.pageX - opt._sX;
				}
				opt.width = _width;	
			}
			if (opt.dir.indexOf('n') != -1) {
				height = opt._sHeight - e.pageY + opt._sY;
				var _height = Math.min(
						Math.max(height, opt.minHeight,0),
						opt.maxHeight <= 0 ? Math.max(height, opt.minHeight) : opt.maxHeight
				);
				if( height == _height ) {
					opt.top = opt._sTop + e.pageY - opt._sY;
				}
				opt.height = _height;
			}
		},
		setWH : function(){
			var self = this;
			var opt = self.configs;	
			
			var el = $(opt.target);
			
			var v = el.outerWidth() - el.width();
			var h = el.outerHeight() - el.height();
			
			el.width( opt.width-v );
			el.height( opt.height-h );
			if( $.inArray(el.css('position'),['absolute','fixed']) !== -1 ) {
				el.css({
					left : opt.left,
					top : opt.top	
				});
			}
		},
		_doDown : function(e){
			var self = this;
			var opt = self.configs;
			
			//$(document).bind("selectstart.resizable",function(){return false;});	
			$(document).disableSelection();
			
			//取消startResize可以取消ressize 应该在before
			//var r = self.fireEvent('onStartResize',[e,opt]);
			//if( r === false) return;
			self.fireEvent('onStartResize',[e,opt]);
			
		},
		_doMove : function(e){
			var self = this;
			var opt = self.configs;
			if( opt.disabled ) return;
			
			self.resize(e);
			
			var r = self.fireEvent('onResize',[opt.width,opt.height,e,opt]);
			if( r === false) return ;
			
			self.setWH();
		},
		_doUp : function(e){
			var self = this;
			var opt = self.configs;
			
			$(document).unbind('.resizable');
			$(document).enableSelection();	
			$('body').css('cursor','');
			//self.resize(e);
			
			if( opt.disabled ) return;
			
			var r = self.fireEvent('onStopResize',[opt.width,opt.height,e,opt]);
			if( r !== false) {
				self.setWH();	
			}
			self.fireEvent('onAfterResize',[opt.width,opt.height,e,opt]);
			
		},
		mouseDown : function(e){
			var self = this;
			var opt = self.configs;
			
			if( opt.disabled ) return;
			
			var dir = self.getDirection(e);
			if (dir == '') return;
			
			var el = $(opt.target); 
			
			function getCssValue(css) {
				var val = parseInt(el.css(css));
				return val || 0;
			}
			
			opt.dir = dir;
			opt._sLeft = getCssValue('left');
			opt._sTop = getCssValue('top');
			opt.left = opt._sLeft;
			opt.top = opt._sTop;
			opt._sX = e.pageX;
			opt._sY = e.pageY;
			opt._sWidth = el.outerWidth();
			opt._sHeight = el.outerHeight();
			opt.width = el.outerWidth();
			opt.height = el.outerHeight();
			
			var r = self.fireEvent('onBeforeResize',[e,opt]);
			if( r === false) return;
		
			$(document).bind('mousedown.resizable', $.proxy( self,'_doDown' ));
			$(document).bind('mousemove.resizable', $.proxy( self,'_doMove' ));
			$(document).bind('mouseup.resizable', $.proxy( self,'_doUp' ));	
			$('body').css('cursor', dir+'-resize');	
		},
		mouseMove : function(e){
			var self = this;
			var opt = self.configs;
			
			var dir = self.getDirection(e);
			if (dir == '') {
				$(opt.target).css('cursor', '');
			} else {
				$(opt.target).css('cursor', dir + '-resize');
			}
		},
		mouseLeave : function(e){
			var self = this;
			var opt = self.configs;
			
			$(opt.target).css('cursor', '');
		}
	});
	
	return resize;
});	