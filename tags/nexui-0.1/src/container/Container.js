define(function(require, exports, module){
	
	require('Nex/Component');
	
	var utils = require('Nex/utils/Utils');
	
	return Nex.Class('Nex.container.Container',{
		extend : 'Nex.Component',
		alias : 'Nex.Container',
		xtype : 'container',
		configs : function( opts ){
			return {
				prefix : 'container-',
				containerCls : opts.containerCls + ' nex-container',
				borderCls    : 'nex-container-border',
				autoScroll : true,
				defaultType : 'container',
				initSetContainerSize : false,//初始时就设置容器宽度
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
			}	
		},
		//容器创建后设置相应属性
		onContainerCreate : function(){
			var self = this;	
			var opt = this.configs;
			
			self._setBorder();
			self._setPadding();
			self._setMargin();
			self._setAutoScrollCls();
			self._setOverflow();
			
			if( opt.initSetContainerSize ) {
				self._initSetContainerSize();
			}	
		},
		
		onCreate : function(){
			this.setComponentEvent();	
		},
		
		setComponentEvent : function(){
			this.setContainerEvent();	
			this._setScrollEvent();		
		},
		
		_setBorder : function(){
			var opt = this.configs;
			var el = this.el;
			if( opt.border && Nex.type( opt.border ) === 'string' ) {
				el.css('border', opt.border);	
			}
		},
		_setPadding : function(){
			var self = this,
				opt = self.configs;
			var ct = self.el;
			if( opt.padding !== null ) {
				ct.css('padding',opt.padding);
			}
		},
		_setMargin : function(){
			var self = this,
				opt = self.configs;
			var ct = self.el;
			if( opt.margin !== null ) {
				ct.css('margin',opt.margin);
			}
		},
		_setAutoScrollCls : function(){
			var self = this,
				opt = self.configs;
			var ct = self.getBody();
			if( opt.autoScroll ) {
				ct.addClass('nex-body-scroll');
			}
		},
		_setOverflow : function(){
			var self = this,
				opt = self.configs;
			var ct = self.getScrollView();
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
		__containerCreate : false,
		//容器创建时就应该立刻设置宽度
		_initSetContainerSize : function(){
			var self = this;
			var opt = self.configs;	
			
			self.__containerCreate = true;
			
			self.setContainerSize();
			
			self.__containerCreate = false;
		},
		setContainerEvent : function(){
			var self = this;
			var opt = self.configs;
			var container = self.getContainer();
			//事件绑定
			if( opt.denyEvents === true ) {
				return false;
			} else if( Nex.isFunction(opt.denyEvents) ) {
				opt.denyEvents.call(self);	
				return false;
			}
			
			var callBack = function(type,e){
				var r = self.fireEvent(type, this,e,opt );
				if( r === false ) {
					e.stopPropagation();
					e.preventDefault();
				}
			};
			var events = {
				'focusin.html' : function(e) {
					callBack.call(this,'onFocusIn',e);
				},
				'focusout.html' : function(e) {
					callBack.call(this,'onFocusOut',e);
				},
				'focus.html' : function(e) {
					callBack.call(this,'onFocus',e);
				},
				'blur.html' : function(e) {
					callBack.call(this,'onBlur',e);
				},
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
					callBack.call(this,'onMouseEnter',e);
				},
				'mouseleave.html' : function(e){
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
				$.each( opt.denyEvents,function(i,e){
					delete events[e+'.html'];
				} );	
			}
			container.unbind('.html');
			container.bind(events);
			
			self.fireEvent("onSetContainerEvent",container, events);
			return true;
		},
		/**
		* 作用于scrollTo scrollLeft...
		*/
		getScrollView : function(){
			return this.getBody();	
		},
		onScroll : function(){},
		onScrollLeft : function(){},
		onScrollTop : function(){},
		_setScrollEvent : function(){
			var self = this;
			var opt = self.configs;
			var bd = self.getScrollView();	
			var callBack = function(type,e){
				var pos = {
					left : $(this).scrollLeft(),
					top : $(this).scrollTop()	
				}
				self.onScroll( pos, this, e, opt );
				self.onScrollLeft( pos.left, this, e, opt );
				self.onScrollTop( pos.top, this, e, opt );
				var r = self.fireEvent(type, pos, this, e, opt );
				if( r === false ) {
					e.stopPropagation();
					e.preventDefault();
				}
			};
		
			var events = {
				'scroll.html' : function(e){
					callBack.call(this,'onScroll',e);
					var $this = $(this);
					if( $this.scrollTop()<=0 ) {
						self.fireEvent('onScrollTopStart', this,e,opt );		
					} else if( $this.scrollLeft()<=0 ) {
						self.fireEvent('onScrollLeftStart', this,e,opt )
					}
					if( utils.isScrollEnd( this,'top' ) ) {
						self.fireEvent('onScrollTopEnd', this,e,opt );	
					}
					if( utils.isScrollEnd( this,'left' ) ) {
						self.fireEvent('onScrollLeftEnd', this,e,opt );	
					}
				}
			};
			bd.unbind('scroll.html');
			bd.bind(events);
		},
		focus : function(){
			var self = this,
				opt = this.configs,
				el;
			if( el = self.getBody() ) {
				if( opt.tabIndex === false || opt.tabIndex===null ) {
					el.attr({
						tabIndex : -1   
					});	
				}	
				el.focus();
			}	
			return self;
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
				opt = this.configs,
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
			var opt = this.configs;
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
			var opt = this.configs;
			var bd = this.getBody();
			bd.empty();
			this.gc(opt.id);
			return this;	
		},
		html : function( data ){
			this.empty();
			return this.add( data );
		},
		update : function(data){
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
		hidden : false, 
		isVisible : function(){
			return !this.hidden;	
		},
		isHidden : function(){
			return this.hidden;	
		},
		doShow : function(el, cb){
			el.show();
			cb();		
		},
		_loaderCounter : 0,
		_loader : null,
		showLoading : function(msg){
			var self = this,
				opt = this.configs;
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
				opt = self.configs;
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
				opt = self.configs;	
			var maskMsg = $("#"+opt.id+"-laoding-mask-msg");
			var w = maskMsg.outerWidth();
			var h = maskMsg.outerHeight();
			maskMsg.css("marginLeft",-w/2+"px");
			maskMsg.css("marginTop",-h/2+"px");
			return self;
		},
		show : function(cb){
			var self = this;
			var opt = this.configs;
			var container = self.el;
			
			if( self.isVisible() ) {
				return self;	
			}
			
			if( self.fireEvent('onBeforeShow', container) === false ) {
				return self;	
			}
			
			self._checkToRender();
			
			self.fireEvent('onStartShow', container);
			
			self.hidden = false;
			
			var complete = function(){
				self.setAcceptResize( true );
				if( opt.autoResize ) {
					self.resize();
				}
				self.fireEvent('onShow', container);	
				Nex.isFunction(cb) && cb.call(self, container);
			};
			
			var showFn = opt.showFn && Nex.isFunction( opt.showFn ) ? opt.showFn : self.doShow;

			showFn.call( self, container, complete );		
			
			return self;	
		},
		doHide : function(el, cb){
			el.hide();
			cb();	
		},
		hide : function( cb ){
			var self = this;
			var opt = this.configs;
			var container = self.el;
			
			if( !self.rendered ) return self;
			
			if( self.rendered && self.isHidden() ) {
				return self;	
			}
			
			if( self.fireEvent('onBeforeHide', container) === false ) {
				return self;	
			}
			
			self.fireEvent('onStartHide', container);
			
			self.hidden = true;
			
			self.setAcceptResize( false );
			
			var complete = function(){
				self.fireEvent('onHide', container);	
				Nex.isFunction(cb) && cb.call(self, container);	
			};
			
			var hideFn = opt.hideFn && Nex.isFunction( opt.hideFn ) ? opt.hideFn : self.doHide;
			
			hideFn.call( self, container, complete );	
				
			return self;		
		}
	});	
});