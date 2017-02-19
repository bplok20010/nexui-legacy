/*
Window.js
http://www.extgrid.com/window
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱

*/
define(function(require){	
	require('../jqueryui/draggable');
	var Nex = require('../Nex');
	var _maxminimize = require('./_maxminimize');	
	var _position = require('./_position');
	var _modal = require('./_modal');		
	//require('../jqueryui/resizable');
	var Panel = require('Nex/panel/Panel');

	var win = Nex.define('Nex.window.Window', [Panel, _maxminimize, _modal], {
		alias : 'Nex.Window',
		xtype : 'window',
		prefix : 'nexwindow-',
		componentCls : [Panel.fn.componentCls, 'nex-window'].join(' '),
		config : function( opt, t ){
			return {
				renderTo : window,
				
				autoShow : true,
				
				isFixed : true,
				
				closable : true,
				//拖拽设置
				draggable : true,
				//self header callback
				dragHandle : 'header',
				draggableOptions : {},
				//resize window setting
				resizable : true,//尚未实现
				resizableOptions : {},
				
				zIndex : Nex.zIndex,
				
				focusToFront : true,
				alwaysOnTop : false,
				
				maxWidth : function(){
					var self = this;
					var opt = self;
					var renderTo = this.C('renderTo');	
					
					return $(renderTo).width();
				},
				maxHeight : function(){
					var self = this;
					var opt = self;
					var renderTo = this.C('renderTo');
					
					return $(renderTo).height();
				}
			};	
		}		
	});
	win.override({ 
		initComponent : function(){
			this._super(arguments);
			var parent = $(this.renderTo)[0];
			
			if( parent == window || 
				parent == document|| 
				parent == document.documentElement ||
				parent == document.body ) {
				this.renderTo = window;		
			}
			
		},
		onContainerCreate : function(el){	
			this._super(arguments);
			if( this.isFixed ) {
				this.el.addClass('nex-window-fixed');	
			}
		},
		onHeaderCreate : function(header){
			this._super(arguments);
			header.addClass('nex-window-header');
			$('>.nex-panel-tools',header).addClass('nex-window-tools');
		},
		onBodyCreate : function(bd){
			this._super(arguments);
			bd.addClass('nex-window-body');
		},
		onFooterCreate : function(footer){
			this._super(arguments);
			footer.addClass('nex-window-footer');
		},
		
		onLayout : function(){
			this._super(arguments);
			
			if( this.isAutoHeight() ) {
				
				var bd =  this.getBody();
			
				var height = this.el.outerHeight();
			
				var bdHeight = bd.outerHeight();
				
				this._diffHeight = height - bdHeight;
			}	
			/*
			if( this.isAutoWidth() ) {
				
				var bd =  this.getBody();
			
				var width = this.el.outerWidth();
			
				var bdWidth = bd.outerWidth();
				
				this._diffWidth = width - bdWidth;
			}	*/
		},
		
		_diffHeight : 0,
		
		_diffWidth : 0,
		
		getDiffHeight : function(){
			return this._diffHeight;	
		},
		
		getDiffWidth : function(){
			return this._diffWidth;	
		},
		
		setViewSize : function(){
			this._super(arguments);
			
			if( this.isAutoHeight() ) {
				var bd =  this.getBody();
				var rh = $(this.renderTo).height();
				
				
				var maxHeight = this.__lastMaxHeight || rh;
				
				if( /%$/.test(maxHeight) ) {
					maxHeight = parseFloat( maxHeight )/100 * rh; 	
				}
				
				bd.css('maxHeight', parseFloat(maxHeight) - this.getDiffHeight());
			}
			//没有必要为width计算max
		},
		//override
		_setSysTools : function( tools ){
			var self = this,
				opt=this;
			var header = opt.views['header'];			
			var $tools = $('>.nex-panel-tools',header);
			
			var tools = this._super(arguments);
			
			//max
			if( opt.maximizable ) {
				tools.unshift( {
					iconCls : 'tools-maximize-icon',
					handler : function(){
						self.toggleMaximize();	
					}
				} );
			}
			
			//min
			if( opt.minimizable ) {
				tools.unshift( {
					iconCls : 'tools-minimize-icon',
					handler : function(){
						self.minimize();	
					}
				} );	
			}
			
			return tools;
		},
		
		setzIndex : function(){
			var self = this;
			var opt = self;
			var container = self.el;
			var zIndex = Nex[ opt.alwaysOnTop ? 'topzIndex' : 'zIndex' ] + 2;
			
			Nex[opt.alwaysOnTop ? 'topzIndex' : 'zIndex'] = zIndex;
			
			opt.zIndex = zIndex; 
			
			container.css('zIndex',opt.zIndex);
			
			var modal = opt.views['modal'];	
			if( modal ) {
				modal.css('z-index',opt.zIndex-1);
			}			
		},
		
		toFront : function(){
			this.setzIndex();
			return this;	
		},
		
		initEvents : function(){
			var self = this;
			this._super(arguments);
			
			if( this.focusToFront ) {
				this.el.on('mousedown', function(){
					self.toFront();	
				});
			}
		},
		
		_hasInitDrag : false,
		initDrag : function(){
			var self = this;
			if( this._hasInitDrag ) return;
			
			var header = this.getHeader();
			
			var options = Nex.extend({
					scroll : false
				}, this.draggableOptions, {
				handle : Nex.isFunction( this.dragHandle ) ? this.dragHandle() : this.dragHandle	
			});
			
			this.fireEvent('onInitDrag', options);
			
			if( options.handle === 'self' ) {
				options.handle = false;	
			} else if( options.handle === 'header' ) {
				if( !header ) return;
				options.handle = header;
			}
			
			options.start = function(e, ui){
				self.onDragStart();
				return self.fireEvent('onDragStart', e, ui );	
			};
			options.drag = function(e, ui){
				self.onDrag();
				return self.fireEvent('onDrag', e, ui );	
			};
			options.stop = function(e, ui){
				self.onDragStop();
				return self.fireEvent('onDragStop', e, ui );	
			};
			
			this.el.draggable(options);
			
			this._hasInitDrag = true;
		},
		onDragStart : function(){},
		onDrag : function(){
			if( this.resetPosOnResize == 'auto' ) {
				this.resetPosOnResize = false;	
			}	
		},
		onDragStop : function(){},
		
		disableDrag : function(){
			if( !this._hasInitDrag ) return this;
			
			this.el.draggable('option', 'disabled', true);
			
			return this;	
		},
		
		enableDrag : function(){
			if( !this._hasInitDrag ) return this;
			
			this.el.draggable('option', 'disabled', false);
			
			return this;		
		},
		
		initResize : function(){
				
		},
		
		_hidden : true,
		//onInitComplete
		onAfterCreate : function(){
			this._super(arguments);
			
			this.initDrag();
			
			this.initShowAt();
			//window 默认隐藏
			this.el.hide();
			
			if( this.autoShow && !this.minimized ) {
				if( this.maximized ) {
					this.el.show();
					//修改初始状态
					this._hidden = false;
					this.maximized = false;
					
					this.maximize();
					//setSize 在init时不会调用resize, 只会调用setContainerSize
					//这里我们要手动调用setViewSize
					this.setViewSize();
				} else {
					this.show();
				}	
			}
		},
		
		destroy : function(){
			this._super(arguments);
			
			this.destroyModal();	
		}
	});
	
	win.override(_position);
	
	return win;
});	