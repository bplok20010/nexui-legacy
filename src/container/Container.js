define(function(require, exports, module){
	var Nex = require('../Nex');
	var Component = require('../Component');
	var VirtualScrollBar = require('./VirtualScrollBar');
	var utils = require('../util/Utils');
	
	var container = Nex.Class('Nex.container.Container', Component, {
		alias : 'Nex.Container',
		xtype : 'container',
		prefix : 'container-',
		componentCls : 'nex-container',
		
		config : function(){
			return {
				borderCls    : 'nex-container-border',
				autoScroll : true,
				defaultType : 'container',
				denyEvents : false,
				focusable : true,
				padding : null,
				margin : null,
				overflow : null,
				overflowX : null,
				overflowY : null,
				showFn : null,
				hideFn : null,
				loaderMsg : '加载中...',
				//加载容器 默认是container
				loaderTarget : null
			};	
		},
		
		//容器创建后设置相应属性
		onLayout : function(){
			this._super(arguments);
			
			this._setBorder();
			this._setPadding();
			this._setMargin();
			this._setAutoScrollCls();
			this._setOverflow();
		},
		
		initEvents : function(){
			var self = this;
			this._super( arguments );
			
			this.setContainerEvent();	
			
			this.setScrollEvent();	
				
		},
		
		onInitComplete : function(){
			this._super(arguments);	
			
			if( this.virtualScroll ) {
				this.initVirtualScrollBar();	
			}
		},
		
		onResize : function(){
			var self = this;
			var scroller = this.scroller;
			this._super(arguments);	
			
			if( this.virtualScroll && scroller ) {
				if( this.deferUpdateScrollBar ) {
					//防止延迟
					self.updateScrollBar();		
					Nex.delay(function(){
						self.updateScrollBar();		
					}, 16);
				} else {
					self.updateScrollBar();		
				}
			}
		},
		
		getElParent : function(){
			if( this.virtualScroll && this.scroller && this.scroller.autoWrapper ) {
				var $parent = this.el.parent();
				if( $parent.hasClass('nex-scroller-wrapper') ) {
					return $parent.parent();	
				}
				
				return $parent;	
			}
			
			return this.el.parent();
		},
		
		_setBorder : function(){
			var opt = this;
			var el = this.el;
			if( opt.border && Nex.type( opt.border ) === 'string' ) {
				el.css('border', opt.border);	
			}
		},
		_setPadding : function(){
			var self = this,
				opt = self;
			var ct = self.el;
			if( opt.padding !== null ) {
				ct.css('padding',opt.padding);
			}
		},
		_setMargin : function(){
			var self = this,
				opt = self;
			var ct = self.el;
			if( opt.margin !== null ) {
				ct.css('margin',opt.margin);
			}
		},
		_setAutoScrollCls : function(){
			var self = this,
				opt = self;
			var ct = self.getScrollView();
			if( opt.overflow === null ) {
				opt.overflow = opt.autoScroll ? 'auto' : 'hidden';
			}
		},
		_setOverflow : function(){
			var self = this,
				opt = self;
			var ct = self.getScrollView();
			
			if( this.virtualScroll ) {
				ct.css('overflow', 'hidden');	
				return;
			}
			
			if( opt.overflow !== null ) {
				ct.css('overflow',opt.overflow);
			}
			if( opt.overflowX !== null ) {
				ct.css('overflowX',opt.overflowX);
			}	
			if( opt.overflowY !== null ) {
				ct.css('overflowY',opt.overflowY);
			}		
		},
		setContainerEvent : function(){
			var self = this;
			var opt = self;
			var container = self.getContainer();
			//事件绑定
			if( opt.denyEvents === true ) {
				return false;
			} else if( Nex.isFunction(opt.denyEvents) ) {
				opt.denyEvents.call(self);	
				return false;
			}
			
			var callBack = function(type,e){
				var r = self.fireEvent(type, e );
				if( r === false ) {
					e.stopPropagation();
					e.preventDefault();
				}
			};
			var events = {
				'click.html' : function(e) {
					callBack.call(this,'onClick',e);
				},
				'dblclick.html' : function(e) {
					callBack.call(this,'onDblClick',e);
				},
				'keydown.html' : function(e) {
					callBack.call(this,'onKeyDown',e);
				},
				'keyup.html' : function(e) {
					callBack.call(this,'onKeyUp',e);
				},
				'keypress.html' : function(e){
					callBack.call(this,'onKeyPress',e);
				},
				'mousewheel.html' : function(e){
					callBack.call(this,'onMouseWheel',e);	
				},
				'mouseenter.html' : function(e){
					self.onMouseEnter();
					callBack.call(this,'onMouseEnter',e);
				},
				'mouseleave.html' : function(e){
					self.onMouseLeave();
					callBack.call(this,'onMouseLeave',e);
				},
				'mouseover.html' : function(e){
					callBack.call(this,'onMouseOver',e);
				},
				'mouseout.html' : function(e){
					callBack.call(this,'onMouseOut',e);
				},
				'mousedown.html' : function(e) {
					callBack.call(this,'onMouseDown',e);
				},
				'mouseup.html' : function(e) {
					callBack.call(this,'onMouseUp',e);
				},
				'contextmenu.html' : function(e){	
					callBack.call(this,'onContextMenu',e);
				}
			};
			
			if( Nex.isArray( opt.denyEvents ) ) {
				Nex.each( opt.denyEvents,function(e, i){
					delete events[e+'.html'];
				} );	
			}
			container.unbind('.html');
			container.bind(events);
			
			self.fireEvent("onSetContainerEvent",container, events);
			return true;
		},
		onMouseEnter: function(){},
		onMouseLeave: function(){},
		/**
		* 作用于scrollTo scrollLeft...
		*/
		getScrollView : function(){
			return this.getBody();	
		},
		onScroll : function(){},
		onScrollLeft : function(){},
		onScrollTop : function(){},
		setScrollEvent : function(){
			var self = this;
			var opt = self;
			var bd = self.getScrollView();	
			var callBack = function(type,e){
				var pos = {
					left : $(this).scrollLeft(),
					top : $(this).scrollTop()	
				}
				self.onScroll( pos,  e );
				self.onScrollLeft( pos.left,  e );
				self.onScrollTop( pos.top,  e );
				var r = self.fireEvent(type, pos,  e );
				if( r === false ) {
					e.stopPropagation();
					e.preventDefault();
				}
			};
		
			var events = {
				'scroll.html' : function(e){
					callBack.call(this,'onScroll', e);
					var $this = $(this);
					if( $this.scrollTop()<=0 ) {
						self.fireEvent('onScrollTopStart', e );		
					} else if( $this.scrollLeft()<=0 ) {
						self.fireEvent('onScrollLeftStart', e )
					}
					if( utils.isScrollEnd( this,'top' ) ) {
						self.fireEvent('onScrollTopEnd', e );	
					}
					if( utils.isScrollEnd( this,'left' ) ) {
						self.fireEvent('onScrollLeftEnd', e );	
					}
				}
			};
			bd.unbind('scroll.html');
			bd.bind(events);
		},
		scrollLeft : function( sLeft ){
			var self = this,
				undef;
			self.scrollBy( sLeft,undef );	
			return self;
		},
		scrollToLeftEnd : function(){
			var self = this;
			var bd = $(self.getScrollView())[0];
			if( !bd ) {
				return self;	
			}
			var ch = bd.clientWidth;
			var sh = bd.scrollWidth;
			if( sh <= ch ){
				return self;	
			}
			
			var sTop = sh - ch;
			self.scrollLeft( sTop );
			return self;
		},
		scrollTop : function( sTop ){
			var self = this,
				undef;
			self.scrollBy( undef,sTop );	
			return self;	
		},
		scrollToTopEnd : function(){
			var self = this;
			var bd = $(self.getScrollView())[0];
			if( !bd ) {
				return self;	
			}
			var ch = bd.clientHeight;
			var sh = bd.scrollHeight;
			
			if( sh <= ch ){
				return self;	
			}
			
			var sTop = sh - ch;
			self.scrollTop( sTop );
			return self;
		},
		scrollBy : function(x,y,ani,func){
			var self = this,
				opt = this,
				undef,
				func = func || $.noop,
				el = self.getScrollView();
			var pos = {};
			if( x !== undef ) {
				pos['scrollLeft'] = x;	
			}
			if( y !== undef ) {
				pos['scrollTop'] = y;	
			}
			
			if( !Nex.isEmptyObject( pos ) ) {
				if( ani === undef || ani <= 0 || !ani ) {
					/*el.animate( pos , 1 , function(){	
						func.call( self,el );
					});		*/
					for( var ac in pos ) {
						el[ac]( pos[ac] );
					}
					func.call( self,el );
				} else {
					el.animate( pos , Math.abs(ani) , function(){
						func.call( self,el );
					} );	
				}
			}
			return self;
		},
		setStyle : function( style ){
			this.el.css(style || {});
			return this;		
		},
		setBorder : function( str ){
			this.el.css('border',str);	
			return this;
		},
		addCls : function( s ){
			this.el.addClass( s );
			return this;	
		},
		addClass : function( s ){
			this.addCls( s );	
			return this;
		},
		removeCls : function( s ){
			this.el.removeClass( s );
			return this;		
		},
		removeClass : function( s ){
			this.removeCls( s );
			return this;		
		},
		setOverflowXY : function(x, y){
			var opt = this;
			var el = this.getScrollView();
			opt.overflowX = x || '';
			opt.overflowY = y || '';	
			el.css({
				overflowX : opt.overflowX,
				overflowY : opt.overflowY	
			});
			return this;
		},
		empty : function(){
			var opt = this;
			var bd = this.getBody();
			bd.empty();
			Nex.gc(opt.id);
			return this;	
		},
		setHtml : function( data ){
			this.empty();
			return this.add( data );
		},
		updateContent : function(data){
			this.empty();
			return this.add( data );	
		},
		//@html string
		append : function( html ){
			var bd = this.getBody();
			bd.append( html );
			return this;
		},
		//@html string
		prepend : function( html ){
			var bd = this.getBody();
			bd.prepend( html );
			return this;
		},
		_loaderCounter : 0,
		_loader : null,
		showLoading : function(msg){
			var self = this,
				opt = this;
			var msg = self._undef( msg, opt.loaderMsg );
			var render = opt.loaderTarget;
			if( Nex.isFunction(render) ) {
				render = opt.loaderTarget.call( self );	
			}
			
			render = render || self.getContainer();
			
			self._loaderCounter++;
			
			var loader = this._loader;
			
			if( loader ) {
				$("#"+opt.id+"-laoding-mask-msg").html( msg );
				self.resizeLoaderMask();
				return self;
			}
			var loader = $('<div id="'+opt.id+'-laoding-mask-wraper" class="nex-mask-wraper"><div id="'+opt.id+'-mask" class="nex-mask-bg"></div><div id="'+opt.id+'-laoding-mask-msg" class="nex-mask-msg">'+msg+'</div><div>');
			$(render).append(loader);
			
			this._loader = loader;
			
			loader.click(function(e){
				e.stopPropagation();
				e.preventDefault();											 
			});
			
			self.resizeLoaderMask();
			
			return self;
		},
		hideLoading : function(){
			var self = this,
				opt = self;
			self._loaderCounter--;
			self._loaderCounter = self._loaderCounter<0?0:self._loaderCounter;
			
			if( self._loaderCounter<=0 && self._loader ) {
				self._loader.remove();	
				self._loader = null;
			}
			return self;
		},
		resizeLoaderMask : function(){
			var self = this,
				opt = self;	
			var maskMsg = $("#"+opt.id+"-laoding-mask-msg");
			var w = maskMsg.outerWidth();
			var h = maskMsg.outerHeight();
			maskMsg.css("marginLeft",-w/2+"px");
			maskMsg.css("marginTop",-h/2+"px");
			return self;
		},
		//显示后是否需要resize
		isResizeOnShow :　function(){
			return true;	
		},
		
		_hidden : false, 
		isVisible : function(){
			return !this._hidden;	
		},
		isHidden : function(){
			return this._hidden;	
		},
		doShow : function(el, cb){
			el.show();
			cb();		
		},
		show : function(cb){
			var self = this;
			var opt = this;
			var container = self.el;
			
			if( self.isVisible() ) {
				return self;	
			}
			
			if( self.fireEvent('onBeforeShow', container) === false ) {
				return self;	
			}
			
			self._checkToRender();
			
			self._hidden = false;
			
			self.onStartShow(container);
			
			self.fireEvent('onStartShow', container);	
			
			var complete = function(){
				self.setAcceptResize( true );
				if( opt.autoResize && self.isResizeOnShow() ) {
					self.resize();
				}
				self.fireEvent('onShow', container);	
				Nex.isFunction(cb) && cb.call(self, container);
			};
			
			var showFn = opt.showFn && Nex.isFunction( opt.showFn ) ? opt.showFn : self.doShow;

			showFn.call( self, container, complete );	
			
			return self;	
		},
		onStartShow : function(){},
		doHide : function(el, cb){
			el.hide();
			cb();	
		},
		hide : function( cb ){
			var self = this;
			var opt = this;
			var container = self.el;
			
			if( !self.rendered ) return self;
			
			if( self.rendered && self.isHidden() ) {
				return self;	
			}
			
			if( self.fireEvent('onBeforeHide', container) === false ) {
				return self;	
			}
			
			self._hidden = true;
			
			self.setAcceptResize( false );
			
			self.onStartHide(container);
			
			self.fireEvent('onStartHide', container);
			
			var complete = function(){
				self.fireEvent('onHide', container);	
				Nex.isFunction(cb) && cb.call(self, container);	
			};
			
			var hideFn = opt.hideFn && Nex.isFunction( opt.hideFn ) ? opt.hideFn : self.doHide;
			
			hideFn.call( self, container, complete );	
				
			return self;		
		},
		onStartHide : function(){},
		
		destroy : function(){
			this.destroyVirtualScrollBar();	
			
			this._super(arguments);
		}
	});
	
	container.override(VirtualScrollBar);	
	
	return container;
});