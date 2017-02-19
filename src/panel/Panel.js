define(function(require){
	var Nex = require('../Nex');
	var Container = require('../container/Container');
	
	var PanelHeader = require('./_header');
	var PanelToolBar = require('./_toolbar');
	var PanelFooter = require('./_footer');

	var panel = Nex.define('Nex.panel.Panel', [Container, PanelHeader, PanelToolBar, PanelFooter], {
		alias : 'Nex.Panel',
		xtype : 'panel',
		prefix : 'nexpanel-',
		componentCls : 'nex-panel',
		config : function(opt, t){
			return {
				borderCls : 'nex-panel-border',
				autoScroll : false,
				showShadow : false,
				shadowCls : 'nex-panel-shadow',
				closable 	: false,
				closeToRemove : true,//关闭销毁
				collapsed : false,
				animCollapse : true,//动画形式折叠
				animCollapseDuration : 200,//动画形式折叠
				animCollapseEasing : 'linear',// linear easeOutQuad
				//折叠/展开时会隐藏动画方式隐藏body toolbar等 否则直接hide
				collapseFadeOut : true,
				collapseFadeOutDuration : 200,
				bodySelectionable : true,
				items : [],
				views : {},
				bodyPadding : null,
				bodyCls : '',
				bodyStyle : null,
				virtualScrollWrapper : false,
				//hideToRemove
			};
		}		
	});
	panel.override({
		initComponent : function(){
			this._vviews = {};//竖
			this._hviews = {};//横
			this._super(arguments);
		},
		
		initVirtualScrollBar : function(){
			var df = {
				hideToRemove : true	
			};	
			
			Nex.extendIf(this.virtualScrollOptions, df);
			
			this._super(arguments);
		},
		
		onRender : function(){
			this._super(arguments);
			
			this.initPanel();
		}, 

		initPanel : function(){
			this.setHeader();
			
			this.setBody();
			
			this.setToolbars();
			
			this.setFooter();
			
			this.initPanel = Nex.noop;
		},
		//call after onCreate
		onInitComplete : function(){
			this._super(arguments);
			
			if( this.collapsed ) {
				this.doCollapse( false );
			}	
		},
		
		setBody : function(){
			var self = this,
				id = this.id,
				container = this.el,
				bd = $( '<div class="nex-panel-body '+this.bodyCls+'" id="'+id+'_body" />' );
			
			this.views['body'] = bd;
			
			if( this.bodyStyle ) {
				bd.css(this.bodyStyle);
			}
			
			bd.css('padding',this.bodyPadding);
		
			if( !this.bodySelectionable ) {
				bd.disableSelection();
			}
			
			container.append(bd);
			
			this.onBodyCreate( bd );
			
			this.fireEvent("onBodyCreate", bd);
			
			this.setBody = Nex.noop;
		},
		onBodyCreate : function(){},
		
		addHorizontalView : function( a,b ){
			this._hviews[ a ] = b;
			this.resetViewSize();
			return this;
		},
		addVerticalView : function( a,b ){
			this._vviews[ a ] = b;
			this.resetViewSize();
			return this;
		},
		removeHorizontalView : function( a ){
			this._hviews[ a ] = null;
			delete this._hviews[ a ];
			this.resetViewSize();
			return this;
		},
		removeVerticalView : function( a ){
			this._vviews[ a ] = null;
			delete this._vviews[ a ];
			this.resetViewSize();
			return this;
		},
		
		setViewSize : function(){
			this._super(arguments);
			
			var self = this,
				undef;
			var container = self.el;	
			var bd = self.getBody();
			var bdEl = bd[0];	
		
			if( !self.isAutoWidth() ) {
				var w = 0;
				Nex.each( self._hviews,function(el, k){
					if( !el ) return;	
					w += el.outerWidth();
				} );
				
				bd.outerWidth( container.width() - w );
			} else {
				bd.css('width', '');
			}
			if( !self.isAutoHeight() ) {
				var h = 0;
				Nex.each( self._vviews, function(el, k){
					if( !el ) return;	
					h += el.outerHeight();
					
				} );
				bd.outerHeight( container.height() - h );
			} else {
				bd.css('height', '');	
			}
			/*设置 左右工具栏位置*/
			//var offset = bd._position();
			
			if( self.views['lbar'] ) {
				var tb = self.views['lbar'];
				bd.css('marginLeft', tb.outerWidth());	
				tb.css( 'height', bd.outerHeight() );
				tb.css({
					left : parseFloat(container.css('paddingLeft')) || 0,
					top : bdEl.offsetTop
				});
			}
			if( self.views['rbar'] ) {
				var tb = self.views['rbar'];
				tb.css( 'height', bd.outerHeight() );
				tb.css({
					right : parseFloat(container.css('paddingRight')) || 0,
					top : bdEl.offsetTop	
				});	
			}
		},
		
		getBody : function(){
			return this.views['body'];
		},
		
		doClose : function( cb ){
			this.hide( cb );
		},
		
		"close" : function(cb){
			var self = this,
				complete = function(){
					if( self.closeToRemove ) {
						self.destroy();	
					}	
					self.fireEvent('onClose');	
					Nex.isFunction(cb) && cb();
				};	
			
			if( self.fireEvent('onBeforeClose') !== false ) {
				self.doClose(complete);
			}	
			return self;
		},
		/*移除*/
		remove : function(){
			this.closeToRemove = true;
			return this.close();
		},
		//override
		isResizeOnShow : function(){
			return !this.collapsed;	
		},
		
		doExpand : function(anim){
			var self = this,
				deferred = $.Deferred(),
				container = self.el,
				header = self.getHeader(),
				child = $('> *:not(.nex-panel-header)', container),
				anim = self._undef( anim, self.animCollapse );
				
			self.unbind(self._collapseEid);	
			
			container.stop(true,true);
			
			self.collapsed = false;
			
			var fn = function(){
				self.resize();
				deferred.resolveWith(self);
				container.removeClass( 'nex-panel-collapsed '+self.collapsedCls );
				if( header ) {
					var $tools = $('>.nex-panel-tools', header);
					$('>.tools-collapse-icon', $tools).removeClass('tools-expand-icon');	
				}
			};
			
			function fadeInOhters(animate){
				if( animate && self.collapseFadeOutDuration > 0 ) {
					child.stop(true,true).fadeIn(self.collapseFadeOutDuration);	
				} else {
					child.show();		
				}	
			}
			//显示内容
			fadeInOhters(self.collapseFadeOut);
			
			if( anim ) {			
				container.animate({
					height : container.data('__resetHeight__')
				}, self.animCollapseDuration, self.animCollapseEasing, function(){
					fn();
				});
			} else {
				container.css( 'height', container.data('__resetHeight__') );
				fn();
			}
			
			return deferred.promise();
		},
		_collapseEid : null,
		doCollapse : function(anim){
			var self = this,
				deferred = $.Deferred(),
				container = self.el,
				header = self.getHeader(),
				child = $('> *:not(.nex-panel-header)', container),
				hh = self._headerHasShow && header ? header.outerHeight() : 0,
				anim = self._undef( anim, self.animCollapse );
				
			hh += (parseInt(container.css('paddingTop')) || 0) 
			   + (parseInt(container.css('paddingBottom')) || 0)
			   + (parseInt(container.css('borderTopWidth')) || 0)
			   + (parseInt(container.css('borderBottomWidth')) || 0);	
			
			//折叠状态下, 拦截onResize的处理
			self._collapseEid = self.bind('onBeforeResize', function(){
				self.initMaxAndMinSize();	
				self.setContainerSize();
				
				container.data('__resetHeight__', container.css('height'));
				container.css( 'height', hh );
				
				return false;
			});		
			
			container.stop(true,true);
			
			self.collapsed = true;	
			//记录恢复高度
			var resetHeight = container.css('height');
			container.data('__resetHeight__', resetHeight);
			
			var fn = function(){
				deferred.resolveWith(self);
			};
			
			function fadeOutOhters(animate){
				if( animate && self.collapseFadeOutDuration > 0 ) {
					child.stop(true,true).fadeOut(self.collapseFadeOutDuration);	
				} else {
					child.hide();		
				}	
			}
			
			container.addClass( 'nex-panel-collapsed ' + self.collapsedCls );
			
			if( header ) {
				var $tools = $('>.nex-panel-tools', header);
				$('>.tools-collapse-icon', $tools).addClass('tools-expand-icon');	
			}
			
			if( anim ) {	
				container.animate({
					height : hh
				}, self.animCollapseDuration, self.animCollapseEasing, function(){
					fn();
				});
				
				fadeOutOhters(self.collapseFadeOut);
			} else {
				container.css( 'height', hh );
				fn();
				fadeOutOhters(false);
			}
			
			return deferred.promise();
		},
		
		/*
		*展开
		*/
		expand : function( anim ){
			var self = this;
			
			if( !self.collapsed ) {
				return false;	
			}
			
			if( self.fireEvent('onBeforeExpand') === false ) {
				return false;	
			}
			
			var defer = self.doExpand(anim);
			
			defer.done(function(){
				self.onExpand();
				self.fireEvent('onExpand');		
			});
			
			return defer;
		},
		
		/*
		*折叠
		*/
		collapse : function( anim ){
			var self = this;
			
			if( self.collapsed ) {
				return false;	
			}
			
			if( self.fireEvent('onBeforeCollapse') === false ) {
				return false;	
			}
			
			var defer = self.doCollapse(anim);
			
			defer.done(function(){
				self.onCollapse();
				self.fireEvent('onCollapse');		
			});
			
			return defer;
		},
		
		onExpand : function(){},
		onCollapse : function(){},
		
		toggleCollapse: function( anim ) {
			return this[ this.collapsed ? 'expand' : 'collapse' ](anim);
		}
	});
	
	//panel.override(PanelHeader);
	
	//panel.override(PanelFooter);
	
	//panel.override(PanelToolBar);
	
	return panel;
});