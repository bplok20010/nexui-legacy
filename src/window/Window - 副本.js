/*
Window.js
http://www.extgrid.com/window
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱

*/
define(function(require){
	require('Nex/showat/ShowAt');	
	require('Nex/drag/Drag');
	require('Nex/resize/Resize');
	require('Nex/panel/Panel');

	var win = Nex.define('Nex.window.Window',{
		extend : 'Nex.panel.Panel',
		alias : 'Nex.Window',
		xtype : 'window',
		configs : function( opt,t ){
			return {
				prefix : 'nexwindow-',
				border : true,
				borderCls : [opt.borderCls,'nex-window-border'].join(' '),
				containerCls : [opt.containerCls,'nex-window'].join(' '),
				tabIndex : -1,
				autoScroll : false,
				//显示之前检查是否是autoSize 如果是调用autoSetSize设置大小 不建议开启
				autoSizeOnShow : false,
				autoShow : true,
				isFixed : false,
				refreshPosOnResize : true,//浏览器大小改变时 重新设置window的位置
				resetPosOnShow : false, //每次显示窗口时 都会重新设置位置
				showShadow : true,
				shadowCls : 'nex-window-shadow',
				focusOnToFront : true,
				constrain : false,//开启后 不能移出 父元素的空间
				constrainEdge : 0,
				constrainHeader : false,
				closeToRemove : true,
				actionOnEsc : 'close',
				closeOnEsc : true,//按Esc时 关闭
				/*
				* 绑定当在某元素上触发相应操作时关闭窗口
				*/
				_closeOnDom : {
					/*默认关闭当前功能*/
					enable : false,	
					/*触发事件*/
					event  : 'mousedown',
					/*执行操作*/
					action : 'close',
					/*取消触发事元素*/
					cancel : '',
					/*触发事件元素*/
					attach : document
				},
				closeOnDom : {},
				/*关闭倒计时 毫秒*/
				closeOnTime : 0,
				/*倒计时关闭时执行操作*/
				actionOnTime : 'close',
				draggable : true,
				dragCls : '',
				dragHelper : 'header',//header container body....
				_dragConfig : {
					cancel : '.nex-panel-tools',
					distance : 1	
				},
				dragConfig : {},
				resizeable : false,
				resizeDelay : 50,
				_resizeConfig : {},
				resizeConfig : {},
				closable 	: true,
				minimizable : false,
				maximizable : false,
				maximized   : false,
				maximizedCls : '',
				minimized   : false,
				headerSelectionable : false,
				items : [],
				renderTo : window,
				animate : true,//开启动画显示 开启后可设置effect等参数
				animateDist : 50,
				animDuration : 200,
				animEasing   : Nex.easingDef,
				showFn : null,//自定义显示函数
				hideFn : null,//自定义关闭函数
				_showAt : {
					xAlign : 'center',
					yAlign : 'center',
					zAlign : 'y',
					visibleable : true	
				},
				showAt : {},
				useShowAtPos : true,//位置计算交给showAt组件 如果关闭 位置计算需要自己通过showFn来计算
				resetPositionDuration : 200,
				alwaysOnTop : false,//保持置顶
				zIndex : Nex.zIndex,
				modal : false,
				modalCls : '',
				modalRenderTo : null,//默认同renderTo
				checkAutoSize : true,//开启后 maxWidth minWidth.. 才有效
				maxWidth : function(){
					var self = this;
					var opt = self.configs;
					var renderTo = this.C('renderTo');	
					return $(renderTo).width();
					if( $.isWindow(opt.renderTo) ) {
						return $(renderTo).width();
					} else {
						return 0;		
					}
				},
				maxHeight : function(){
					var self = this;
					var opt = self.configs;
					var renderTo = this.C('renderTo');
					return $(renderTo).height();
					if( $.isWindow(opt.renderTo) ) {
						return $(renderTo).height();
					} else {
						return 0;	
					}
				}
				//denyEvents : ['scroll'],
				//events : {}
			};	
		}		
	});
	win.override({ 
		onContainerCreate : function(el, opt){	
			this.callParent(arguments);
			if( this.isFixed() ) {
				el.addClass('nex-window-fixed');	
			}
		},
		onHeaderCreate : function(header, opt){
			this.callParent(arguments);
			header.addClass('nex-window-header');
			$('>.nex-panel-tools',header).addClass('nex-window-tools');
		},
		onBodyCreate : function(bd, opt){
			this.callParent(arguments);
			bd.addClass('nex-window-body');
		},
		onFooterCreate : function(footer, opt){
			this.callParent(arguments);
			footer.addClass('nex-window-footer');
		},
		sysEvents : function(){
			var self = this;
			var opt = self.configs;
			self.callParent(arguments);
			//设置fixed样式 并且隐藏
			//self.bind('onContainerCreate._sys',function(el){
//				if( self.isFixed() ) {
//					el.addClass('nex-window-fixed');	
//				}
//				
//			},self);
			//设置refreshPosOnResize
			self.bind('onCreate._sys',self._refreshPosOnResize,self);
			//设置closeOnEsc
			self.bind('onKeyDown._sys',function(el,e){
				if( e.keyCode === 27 && opt.actionOnEsc ) {
					//self.close();	
					if( $.isFunction(opt.actionOnEsc) ) {
						opt.actionOnEsc.call( self );
					} else if( self[ opt.actionOnEsc ] ) {
						self[ opt.actionOnEsc ]();
					}
				}	
			},self);
			
			//设置zindex
			self.bind('onFocusin._front',function(){
				if( opt.focusOnToFront ) {
					self.setzIndex();	
				}	
			},self);
			//拖拽设置
			self.bind('onCreate._sys',self._draggable,self);
			//resizeable
			self.bind('onCreate._sys',self._resizeable,self);
			//拖拽检测
			self.bind('onWindowDrag._sys',self._checkDragConstrain,self);
			//自定义关闭window操作
			self.bind('onShow._sys',self._setCustomCloseEvent,self);
			self.bind('onHide._sys',self._unsetCustomCloseEvent,self);
			//关闭倒计时
			self.bind('onShow._sys',self._closeOnTime,self);
			self.bind('onHide._sys',self._uncloseOnTime,self);
			//清理异常
			self.bind('onDestroy._sys',function(){
				self._unsetCustomCloseEvent();
				self._uncloseOnTime();
			},self);
			
			return self;
		},
		__sce : 0,
		_setCustomCloseEvent : function(){
			var self = this;
			var opt = this.configs;	
		
			var cfg = $.extend({}, opt._closeOnDom, opt.closeOnDom);
			if(!cfg.enable) {
				return;	
			}
			
			self.__sce = setTimeout(function(){
				self.__sce = 0;
				if(cfg.attach) {
					var $attach = $(cfg.attach);
					if( !$attach.length ) return;
					$attach.bind(cfg.event+'._close_'+opt.id, function(e){
						var target = e.target || e.srcElement;
						if( $(target).is( '#'+opt.id )
							|| $(target).parents('#'+opt.id).length
						) {
							return;	
						}
						if(cfg.cancel) {
							if( $(target).is( cfg.cancel ) ) {
								return;
							}
							var m = false;
							$(target).parents().each(function(){
								if($(this).is(cfg.cancel)) {
									m = true;
									return false;	
								}	
							});
							if(m) {
								return;	
							}
						}
						self[cfg.action]();		
					});
				}	
			},0);
		},
		_unsetCustomCloseEvent : function(){
			var self = this;
			var opt = this.configs;	
			
			var cfg = $.extend({}, opt.closeOnDom, opt._closeOnDom);
			if(!cfg.enable) {
				return;	
			}
			if( self.__sce = 0 ) {
				clearTimeout(self.__sce);	
			} 	
			if(cfg.attach) {
				var $attach = $(cfg.attach);
				if( !$attach.length ) return;
				$attach.unbind(cfg.event+'._close_'+opt.id);	
			}
		},
		__cot : 0, 
		_closeOnTime : function(){
			var self = this;
			var opt = this.configs;	
			if( opt.closeOnTime && Nex.isNumeric(opt.closeOnTime) ) {
				self.__cot = setTimeout(function(){
					self.__cot = 0;
					self[opt.actionOnTime]();	
				},parseInt(opt.closeOnTime,10));	
			}
		},
		_uncloseOnTime : function(){
			if( this.__cot ) {
				clearTimeout(this.__cot);	
			}
		},
		hidden : true,
		checkToAutoSetSize : function(){
			var self = this;
			var opt = this.configs;	
			if( opt.width === 'auto' && opt.height === 'auto' ) {
				self.clearContainerSizeCache();
				self.autoSetSize();
			} else if( opt.width === 'auto' ) {
				self.clearContainerSizeCache();
				self.autoSetWidth();	
			} else if( opt.height === 'auto' ) {
				self.clearContainerSizeCache();
				self.autoSetHeight();	
			}
		},
		_afterCreate : function(){
			var self = this;
			var opt = this.configs;//cfg
			var el = this.el;
			//var container = opt.views['container'];
			
			//window 设置 width/height = auto 时会自动设置width height
			
			//self.checkToAutoSetSize();
			
			if( opt.autoShow ) {
				this.show();//需要重写show
			}
			if( opt.maximized ) {
				this.maximize();	
			}
			//折叠
			self.callParent(arguments);
			
			if( opt.minimized ) {
				el.stop(true,true);
				this.minimize(false);	
			}
		},
		__rpr : false, 
		__rptt : 0,
		_refreshPosOnResize : function(){
			var self = this;
			var opt = this.configs;
			if( !Nex.ComponentManager ) return;
			if( self.__rpr ) return;
			self.__rpr = true;
			self.bind('onDestroy._sys',function(){
				Nex.ComponentManager.unbind('._'+opt.id);	
			});
			Nex.ComponentManager.bind('onBrowserResize._'+opt.id,function(){
				
				self.fireEvent('onBrowserSizeChange');
				
				if( !self.rendered || self.isHidden() ) return;
				
				if( opt.modal ) {	 
					self.refreshModalSizeAndPos();
				}
				
				if( !opt.refreshPosOnResize ) return;
				if( self.maximized ||
					 self.collapsed ) return;
				if( self.__rptt ) {	 
					clearTimeout( self.__rptt );
					self.__rptt = 0;
				}
				self.__rptt = setTimeout(function(){
					clearTimeout( self.__rptt );
					self.__rptt = 0;
					if( !self.isShowing ) {
						self.resetPosition();	
					} else {
						//onShow
						self.unbind('._resize__'+opt.id);
						self.one('onShow._resize__'+opt.id,function(){
							self.resetPosition();		
						})	
					}
				},0);		 
				
			});	
		},
		_checkDragConstrain : function(t,pos,e,_opt){
			var self = this,
				opt=this.configs;
				
			if( !opt.constrain ) return;
				
			var el = self.el;
			var sLeft = $(opt.renderTo).scrollLeft();	
			var sTop = $(opt.renderTo).scrollTop();	
			var left = pos.left;
			var top = pos.top;
			
			var clientWidth = $.isWindow( opt.renderTo ) ? $(opt.renderTo).width() : $(opt.renderTo)[0].clientWidth;
			var clientHeight = $.isWindow( opt.renderTo ) ? $(opt.renderTo).height() : $(opt.renderTo)[0].clientHeight;
			
			//self.html( [clientWidth,clientHeight].join(':') )
			
			var ew = el.outerWidth();
			var eh = el.outerHeight();
			
			var edge = opt.constrainEdge;
			
			if( (left-sLeft)<edge ) {
				pos.left = sLeft + edge;	
			}
			if( (top-sTop)<edge ) {
				pos.top = sTop + edge;	
			}
			if( (ew + left - sLeft)>(clientWidth - edge) ) {
				pos.left = clientWidth - ew + sLeft - edge;	
			}
			//constrainHeader
			var header_h = 0;
			if( opt.constrainHeader && opt.views['header'] ) {
				header_h = opt.views['header'].outerHeight() 
							+ (parseFloat(el.css('borderTop')) || 0) 
							+  (parseFloat(el.css('paddingTop')) || 0);
				header_h = el.outerHeight() - header_h;			
			}
			if( (eh + top - sTop)>(clientHeight + header_h - edge) ) {
				pos.top = clientHeight - eh + sTop - edge + header_h;
			}
		},
		_setSysTools : function( tools ){
			var self = this,
				opt=this.configs;
			var header = opt.views['header'];			
			var $tools = $('>.nex-panel-tools',header);
			if( opt.collapsible ) {
				tools.push( {
					iconCls : 'tools-collapse-icon',
					handler : function(){
						self.toggleCollapse();	
					}
				} );	
				self.unbind('.collapse');
				self.bind('onCollapse.collapse',function(){
					$('>.tools-collapse-icon',$tools).addClass('tools-expand-icon');	
				},self);
				self.bind('onExpand.collapse',function(){
					$('>.tools-collapse-icon',$tools).removeClass('tools-expand-icon');	
				},self);
			}
			//min
			if( opt.minimizable ) {
				tools.push( {
					iconCls : 'tools-minimize-icon',
					handler : function(){
						self.minimize();	
					}
				} );	
			}
			//max
			if( opt.maximizable ) {
				tools.push( {
					iconCls : 'tools-maximize-icon',
					handler : function(){
						self.toggleMaximize();	
					}
				} );
				self.unbind('.maximize');
				self.bind('onMaximize.maximize',function(){
					$('>.tools-maximize-icon',$tools).addClass('tools-restore-icon');	
				},self);
				self.bind('onRestore.maximize',function(){
					$('>.tools-maximize-icon',$tools).removeClass('tools-restore-icon');	
				},self);	
			}
			//close
			if( opt.closable ) {
				tools.push( {
					iconCls : 'tools-close-icon',
					handler : function(){
						self.close();	
					}
				} );	
			}
			return tools;
		},
		setzIndex : function(){
			var self = this;
			var opt = self.configs;		
			var container = self.el;
			var zIndex = Nex[ opt.alwaysOnTop ? 'topzIndex' : 'zIndex' ]+2;
			Nex[opt.alwaysOnTop ? 'topzIndex' : 'zIndex'] = zIndex;
			opt.zIndex = zIndex; 
			
			container.css('z-index',opt.zIndex);
			
			var modal = opt.views['modal'];	
			if( modal ) {
				modal.css('z-index',opt.zIndex-1);
			}		
		},
		toFront : function(){
			var opt = this.configs;
			if( opt.focusOnToFront ) {
				this.focus();	
			}	
			return this;	
		},
		_drmodal : null,
		showDragAndResizeOuterModal : function(){
			var el = this.el;
			if( !this._drmodal ) {
				this._drmodal = $('<div class="nex-window-tmp-modal"></div>');
			}	
			var p = el.parent();
			p.append( this._drmodal );
			this._drmodal.css({
				width : p.width(),
				height : p.height()
			});
			return this._drmodal;
		},
		removeDragAndResizeOuterModal : function(){
			if( this._drmodal )	{
				this._drmodal.remove();
				this._drmodal = null;	
			}
		},
		dragger : null,
		_draggable : function(){
			var self = this;
			var el = this.el;
			var opt = self.configs;
			if( !opt.draggable || !Nex.drag.Drag ) return;
			var helper = opt.views[ opt.dragHelper ] || self.el;
			var dcfg = {
				helper : helper,
				target:el	
			};
			var cfg = {
				//dragCls : opt.dragCls	
			};
			var dragModal = null;
			cfg[ 'onBeforeDrag._drag_'+opt.id ] = function(e,_opt){
				
					if( e.which !== 1 || !opt.draggable || self.maximized || self.isResizing ) return false;
					
					var r = self.fireEvent("onWindowBeforeDrag",[e,_opt]);	
					if( r === false) return r;
					
					this.C('dragCls',opt.dragCls)
					
				};
			cfg[ 'onStartDrag._drag_'+opt.id ] = function(helper,e,_opt){
					self.fireEvent("onWindowStartDrag",[helper,e,_opt]);	
					helper.addClass('nex-window-dragging');
					if( !dragModal ) {
						dragModal = $('<div class="nex-window-drag-modal"></div>');	
						el.append( dragModal );
					}
					self.showDragAndResizeOuterModal();
				};	
			cfg[ 'onDrag._drag_'+opt.id ] = function(helper,pos,e,_opt){
					var r = self.fireEvent("onWindowDrag",[helper,pos,e,_opt]);	
					if( r === false) return r;
				};
			cfg[ 'onStopDrag._drag_'+opt.id ] = function(helper,pos,e,_opt){
					helper.removeClass('nex-window-dragging');
					var r = self.fireEvent("onWindowStopDrag",[helper,pos,e,_opt]);	
					if( r === false) return r;
				};
			cfg[ 'onAfterDrag._drag_'+opt.id ] = function(pos,e,_opt){
					if( self.isFixed() ) {
						el.css( {
							position : 'fixed',
							left : pos.left - $(window).scrollLeft(),	//parseFloat(el.css('left'))
							top : pos.top - $(window).scrollTop()  //parseFloat(el.css('top'))
						} );	
					}	
					if( dragModal ) {
						dragModal.remove();
						dragModal = null;
					}
					self.removeDragAndResizeOuterModal();
					
					self.fireEvent("onWindowAfterDrag",[pos,e,_opt]);
				};				
			self.dragger = Nex.Create('draggable',$.extend(cfg,opt._dragConfig,opt.dragConfig ||　{},dcfg));
		},
		resizer : null,
		isResizing : false,
		_resizeable : function(){
			var self = this;
			var opt = self.configs;
			if( !opt.resizeable || !Nex.resize.Resize || opt.autoSize ) return;
			var container = self.el;
			//resizeConfig
			var dcfg = {
				target : container	
			};
			var cfg = {};
			var dragModal = null;
			var delay = opt.resizeDelay;
			var dt = 0;
			cfg[ 'onBeforeResize._drag_'+opt.id ] = function(e,_opt){
					
					if( e.which !== 1 || !opt.resizeable || self.collapsed || self.maximized ) return false;
					
					var r = self.fireEvent("onWindowBeforeResize",[e,_opt]);	
					if( r === false) return r;	
					
					$.extend( this.configs,{
						minWidth: self._getMinWidth(),	
						minHeight: self._getMinHeight(),
						maxWidth: self._getMaxWidth(),	
						maxHeight: self._getMaxHeight()
					} );
					
					self.isResizing = true;
					
				};
			cfg[ 'onStartResize._drag_'+opt.id ] = function(e,_opt){
					self.fireEvent("onWindowStartResize",[e,_opt]);	
					dragModal = $('<div class="nex-window-drag-modal"></div>');	
					container.append( dragModal );
					self.showDragAndResizeOuterModal();
				};
			cfg[ 'onResize._drag_'+opt.id ] = function(w,h,e,_opt){
					var r = self.fireEvent("onWindowResize",[w,h,e,_opt]);	
					if( r === false) return r;	
					clearTimeout( dt );
					dt = setTimeout( function(){
						self.setSize( _opt.width,_opt.height );	
					},delay );
				};	
			cfg[ 'onStopResize._drag_'+opt.id ] = function(w,h,e,_opt){
					var r = self.fireEvent("onWindowStopResize",[w,h,e,_opt]);	
					if( r === false) return r;	
				};	
			cfg[ 'onAfterResize._drag_'+opt.id ] = function(w,h,e,_opt){
					self.isResizing = false;
					if( dragModal ) {
						dragModal.remove();
						dragModal = null;
					}
					self.removeDragAndResizeOuterModal();
					
					self.fireEvent("onWindowAfterResize",[w,h,e,_opt]);	
				};			
			self.resizer = Nex.Create('resizable',$.extend( cfg, opt._resizeConfig, opt.resizeConfig || {}, dcfg ));
		},
		//检查是否fixed
		isFixed : function(){
			var opt = this.configs;	
			if( !$.isWindow(opt.renderTo) || (Nex.IEVer && Nex.IEVer<=6) ) {
				return false;	
			}
			return opt.isFixed;
		},
		getShowAt : function(){
			var opt = this.configs;
			if( this._currShowAt ) {
				return this._currShowAt.configs.at;	
			}	
			var cfg = $.extend( {}, opt._showAt, opt.showAt );
			return cfg.at || opt.renderTo;
		},
		_currShowAt : null,
		_currShowAtConf : null,
		/*
		*获取显示的位置
		*@param conf 配置参数
		*/
		getShowAtPos : function( conf ){
			var opt = this.configs;
			var conf = this._undef(conf,{});
			var cusConf = opt.showAt;
			if(Nex.isArray( cusConf )) {
				cusConf = {
					at : {
						left : cusConf[0],
						top : cusConf[1]
					}
				};	
			} else if( !Nex.isPlainObject(cusConf) ) {
				cusConf = {
					at : cusConf	
				};		
			}
			//修改后的
			var currConf = {};
			if( this._currShowAtConf ) {
				currConf = this._currShowAtConf;
			}
			var cfg = $.extend( {}, opt._showAt, cusConf, currConf, conf );
			
			cfg.parent = opt.renderTo;
			cfg.el = cfg.el || this.el;
			cfg.at = cfg.at || opt.renderTo;
			cfg.autoShow = false;
			this._currShowAtConf = cfg;
			var showAt = Nex.Create('showAt',cfg);
			this._currShowAt = showAt;
			var pos = showAt.getShowPos();
			if( this.isFixed() ) {
				pos.left -= $(window).scrollLeft();	
				pos.top -= $(window).scrollTop();
			}
			return pos;
		},
		getPosition : function(){
			return this.getShowAtPos.apply(this, arguments);	
		},
		showAt : function( conf ){
			var self = this,
				opt=this.configs;
			var el = self.el;
			var cfg = {};
			var at = {};
			
			//( 0,100 )
			if( typeof arguments[0] === 'number' ) {
				at.left = arguments[0];	
			}
			if( typeof arguments[1] === 'number' ) {
				at.top = arguments[1];	
			}
			// ( { left : 0,top:0 } )
			if( $.type(conf) === 'object' && !( 'at' in conf ) ) {
				if( !( 'at' in conf ) ) {
					at = conf;	
				} else {
					cfg = conf;
					at = conf.at;		
				}
			}
			if( $.isArray( conf ) ) {
				at.left = conf[0] || 0;	
				at.top = conf[1] || 0;
			}
			
			cfg.at = at;
			
			if( $.isEmptyObject( at ) ) {
				delete cfg.at;	
			}
			//这里应该加 如果等待队列
			if( opt.animate ) {
				el.stop(true,true);	
			}
			
			var pos = self.getShowAtPos( cfg );	
			
			if( !self.isVisible() ) {
				el.css( pos );	
				Nex.panel.Panel.prototype.show.apply(this);
			} else {
				if( opt.animate ) {
					el.animate( pos, opt.resetPositionDuration, Nex.easingDef,function(){
						self.fireEvent("onResetPosition",[el,opt]);		
					} );	
				} else {
					el.css( pos );	
					self.fireEvent("onResetPosition",[el,opt]);		
				}
				/*opt.animate ? 
					el.animate( pos, opt.resetPositionDuration, Nex.easingDef,function(){
						self.fireEvent("onResetPosition",[el,opt]);		
					} ) : 
					el.css( pos );	*/	
			}
			return self;
		},
		resetPosition : function(){
			if( !this.rendered ) return this;
			return this.showAt.apply(this,arguments);	
		},
		//设置到指定显示位置 和 showAt不同在于 以当前坐标为显示坐标 ，不做计算
		setPosition : function( x,y ){
			if( !this.rendered ) return this;
			var opt = this.configs;	
			var el = this.el;
			var pos = {};
			if( x !== undefined ) {
				pos.left = x;	
			}
			if( y !== undefined ) {
				pos.top = y;	
			}
			opt.animate ? 
					el.stop(true,true).animate( pos, opt.resetPositionDuration, Nex.easingDef) : 
					el.css( pos );		
			return this;
		},
		/*
		*只适应大小 并且调整位置
		*/
		autoSizeAndPos : function(){
			this.autoSetSize();
			this.resetPosition();
			return this;	
		},
		onBeforeHide : function(){
			this.callParent();
			this.hideModal();	
		},
		_initShow : false,
		onBeforeShow : function(){
			var self = this;
			var opt = this.configs;
			var el = this.el;
			
			this.callParent();
			this.showModal();
			
			if( opt.autoSizeOnShow ) {
				var isHidden = el.is(':hidden');
				isHidden && el.show();
				self.checkToAutoSetSize();
				isHidden && el.hide();	
			}
			if( opt.useShowAtPos ) {
				if( (opt.resetPosOnShow && !self.collapsed) || !self._initShow ) {
					self._initShow = true;
					var pos = self.getShowAtPos();
					el.css( pos );
				}
			}
			
			self.setzIndex();
			
		},
		doShow : function(cb){
			var el = this.el;
			var opt = this.configs;
			if( !opt.animate ) {
				el.show();
				cb();
				return;	
			}
			
			var top = parseFloat(el.css('top'), 10) || 0;
			
			el.css({
				top : top - opt.animateDist,
				opacity : 0	
			});
			
			this.el.animate({
				top : top,
				opacity : 1	
			}, opt.animDuration, opt.animEasing, cb);
		},
		doHide : function(cb){
			var el = this.el;
			var opt = this.configs;
			if( !opt.animate ) {
				el.hide();
				cb();
				return;	
			}	
			
			var top = parseFloat(el.css('top'), 10) || 0;
			this.el.animate({
				top : top + opt.animateDist,
				opacity : 0
			}, opt.animDuration, opt.animEasing, cb);
		},
		maximized : false,
		maximize : function(){
			var self = this,
				el = self.el,
				opt = self.configs;
				
			if( !self.isVisible() || self.maximized || self.collapsed ) {
				return self;	
			}	
			
			if( self.fireEvent('onBeforeMaximize',[opt]) === false ) {
				return self;	
			}
			
			var props = {
				width : opt.width,
				height : opt.height,
				left : el.css('left') || 0,
				top : el.css('top') || 0	
			};
			el.data('_maxrestore',props);
			
			self.maximized = true;	
			
			//maximizedCls
			el.addClass( 'nex-window-maximized '+opt.maximizedCls );
			
			el.stop(true,true);
			self.setSize('100%','100%');
			
			var left = 0;
			var top = 0;
			//IE 下 window document 获取paddingLeft报错
			try{
				 left = $(opt.renderTo).css('paddingTop') || 0;	
				 top = $(opt.renderTo).css('paddingLeft') || 0;	
			}catch(e){}
			
			el.css( {
				left : left,
				top : top
			} );
			self.fireEvent('onMaximize', [ opt ]);
			return self;
		},
		restore : function(){
			var self = this,
				el = self.el,
				opt = self.configs;
			if( !self.isVisible() || !self.maximized || self.collapsed ) {
				return self;	
			}	
			
			if( self.fireEvent('onBeforeRestore',[opt]) === false ) {
				return self;	
			}
			
			var d = el.data( '_maxrestore' ) || {};
			el.removeData( '_maxrestore' );
			
			this.maximized = false;
			//maximizedCls
			el.removeClass( 'nex-window-maximized '+opt.maximizedCls );
			
			self.setSize(d.width,d.height);	
			
			//el.css( self.getShowAtPos() );
			el.css( {
				left : d.left,
				top : d.top	
			} );
			
			self.fireEvent('onRestore', [ opt ]);
			return self;	
		},
		toggleMaximize : function(){
			return this[ this.maximized ? 'restore' : 'maximize' ]();	
		},
		toggle : function(){
			return this[ this.hidden ? 'show' : 'hide' ].apply(this,arguments);		
		},
		minimize : function(){
			return this.hide.apply(this,arguments);	
		},
		toggleMinimize : function(){
			return this.toggle.apply(this,arguments);	
		},
		_getModalRenderTo : function(){
			var el = this.el;
			var opt = this.configs;
			var wraper = el.parent();
			if( opt.modalRenderTo ) {
				var modalWraper = $( opt.modalRenderTo );
				wraper = modalWraper.length ? modalWraper : wraper;	
			}
			return wraper;
		},
		_createModal : function (){
			var self = this;
			var opt = self.configs;	
			
			if( !opt.modal ) return null;
			if( opt.views['modal'] ) return null;
			
			
			var container = self.el;
			
			var modalRenderTo = !opt.modalRenderTo ? opt.renderTo : $(opt.modalRenderTo).length ? opt.modalRenderTo : opt.renderTo;
			
			var cls = ['nex-window-modal'];
			
			if( $.isWindow( modalRenderTo ) && self.isFixed() ) {
				cls.push('nex-window-modal-fixed');	
			}
			
			if( opt.modalCls ) {
				cls.push( opt.modalCls );	
			}
			
			var modal = $('<div class="'+cls.join(' ')+'" id="'+opt.id+'_modal"></div>');	
			opt.views['modal'] = modal;
			
			modal.css( 'zIndex',opt.zIndex-1 );

			modal.bind({
				'click._modal' : function(e){
					self.fireEvent('onModalClick',[modal,e,opt]);
					$(document).trigger('click',[e]);
					return false;
				},
				'dblclick._modal' : function(e){
					self.fireEvent('onModalDblClick',[modal,e,opt]);
					$(document).trigger('dblclick',[e]);
					return false;
				},
				'mousedown._modal' : function(e){
					self.fireEvent('onModalMouseDown',[modal,e,opt]);
					$(document).trigger('mousedown',[e]);
					return false;	
				},
				'mouseup._modal' : function(e){
					self.fireEvent('onModalMouseUp',[modal,e,opt]);
					$(document).trigger('mouseup',[e]);
					return false;	
				},
				'keydown._modal' : function(e){
					self.fireEvent('onModalKeyDown',[modal,e,opt]);
					$(document).trigger('keydown',[e]);
					return false;		
				},
				'keyup._modal' : function(e){
					self.fireEvent('onModalKeyUp',[modal,e,opt]);
					$(document).trigger('keyup',[e]);
					return false;		
				},
				'mousewheel._modal' : function(e){
					self.fireEvent('onModalMouseWheel',[modal,e,opt]);	
				},
				'mouseover._modal' : function(e){
					self.fireEvent('onModalMouseOver',[modal,e,opt]);
					$(document).trigger('mouseover',[e]);
					return false;		
				},
				'mouseout._modal' : function(e){
					self.fireEvent('onModalMouseOut',[modal,e,opt]);
					$(document).trigger('mouseout',[e]);
					return false;		
				}
			});
			var wraper = self._getModalRenderTo();
			wraper.append(modal);	
			self.fireEvent("onModelCreate",[modal,opt]);
			
			self.bind('onDestroy._sys',function(){
				modal.remove();	
			},self);
			
			return modal;
		},
		getModal : function(){
			var opt = this.configs;
			return opt.views['modal'] ? opt.views['modal'] : this._createModal();	
		},
		showModal : function(){
			var opt = this.configs;
			var modal = this.getModal();
			if( !modal ) return;
			modal.css( {
				zIndex  : opt.zIndex-1
				//,opacity : 0
			} );
			modal.show();
			this.refreshModalSizeAndPos();
			//用时css3来实现过渡把
			/*
			modal.animate({
				opacity : 0.1	
			},opt.animDuration);
			*/
			this.fireEvent( 'onModalShow',[ modal,opt ] );
			
			return this;
		},
		hideModal : function(){
			var opt = this.configs;
			var modal = this.getModal();
			if( !modal ) return;
			modal.fadeOut(opt.animDuration);	
			this.fireEvent( 'onModalHide',[ modal,opt ] );
			return this;
		},
		refreshModalSizeAndPos : function(){
			var self = this,
				opt=this.configs,
				undef;
			
			var modal = self.getModal();
			
			if( !modal ) return self;	
			
			modal._removeStyle('width height');
			
			var render = !opt.modalRenderTo ? opt.renderTo : $(opt.modalRenderTo).length ? opt.modalRenderTo : opt.renderTo;
			
			var  isWin = $.isWindow( render );
			
			render = $(render);
			
			var w = isWin ? 0 : parseInt(render.css('paddingLeft')) + parseInt(render.css('paddingRight'));
			var h = isWin ? 0 : parseInt(render.css('paddingTop')) + parseInt(render.css('paddingBottom'));
			
			var mw = render._width() + w,
				mh = render._height() + h;
			
			if( isWin ) {
				var winWidth = $(window).width();
				var winHeight = $(window).height();
				w = parseInt($(document.body).css('paddingLeft')) + parseInt($(document.body).css('paddingRight'));
				h = parseInt($(document.body).css('paddingTop')) + parseInt($(document.body).css('paddingBottom'));
				mw = Math.max( winWidth,$(document.body).width() + w );
				mh = Math.max( winHeight,$(document.body).height() + h );
			}
			
			//if( Nex.isIE6 ) {
			//	modal._outerWidth( mw );
			//}
			modal._outerHeight( mh );
			
			self.fireEvent('onModalSizeChange',[ modal,opt ]);
			return self;
		}
	});
	
	return win;
});	