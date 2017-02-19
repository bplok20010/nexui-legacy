define(function(require){
	
	var Nex = require('../Nex');
	
	var Container = require('../container/Container');
	var utils = require('../util/Utils');
	
	var PanelHeader = require('./PanelHeader');
	var PanelFooter = require('./PanelFooter');

	var panel = Nex.define('Nex.panel.Panel', Container, {
		alias : 'Nex.Panel',
		xtype : 'panel',
		config : function(opt, t){
			return {
				prefix : 'nexpanel-',
				autoDestroy : true,
				autoResize : true,
				componentCls : 'nex-panel',
				borderCls : 'nex-panel-border',
				autoScroll : false,
				showShadow : false,
				shadowCls : 'nex-panel-shadow',
				toolbarCls : '',
				tbar : null,//top bar
				bbar : null,//bottom bar
				rbar : null,//未实现
				lbar : null,//未实现
				tools: [],//小工具 { icon:'',iconCls:'',tips:'',disabled:false,handler:null,attrs:null }
				toolItems : null,//更自由的自定义tools组件
				toolTipsTag : 'title',
				closable 	: false,
				closeToRemove : true,//关闭销毁 使用closeAction来代替 true=destroy  false=hide
				//closeFn : null,//自定义关闭函数
				animCollapse : true,//动画形式折叠
				durationCollapse : 200,//动画形式折叠
				easingCollapse : 'easeOutQuad',
				collapsible : false,//折叠icon
				collapsed   : false,//默认显示是是否折叠
				collapsedCls: '',
				title : '',
				
				showHeader : 'auto', //自动判断 如果title内容为空 则不显示
				
				headerSelectionable : true,
				bodySelectionable : true,
				footerCls : '',
				footerItems : null,
				
				items : [],
				renderTo : document.body,//window
			
				views : {},
				
				headerCls : '',
				icon : '',
				iconCls : '',
		
				iconTag : 'span',
				
				minWidth : function(){
					var header = this.getHeader();
					if( !header ) return 0;
					var w = 0;
					$('.nex-window-tools,.nex-panel-title-icon,.nex-panel-title-text',header).each( function(){
						w += $(this).width() || 0;
					} );
					return w;
				},
				
				bodyPadding : null,
				bodyCls : '',
				bodyStyle : null,
				//autoSize : false,
				//width : 'auto',
				///height : 'auto'
				//denyEvents : ['scroll'],
				//events : {}
			};
		}		
	});
	panel.override({
		initComponent : function(){
			this._vviews = {};//竖
			this._hviews = {};//横
			this._super(arguments);
		},
		onRender : function(){
		
			this._super();
			
			this.initPanel();
			
		}, 
		initPanel : function(){
			var self = this,
				opt=this.config;
				
			/*初始化样式表*/
			//self.initStyleSheet();	
		
			//self.initCss();	
				
			self.setHeader();
			
			self.setBody();
			
			self.setToolbars();
			
			self.setFooter();
			
			return self;
		},
		setComponentEvent : function(){
			this._super(arguments);
			
			this.bindBodyEvents();	 
		},
		onCreate2 : function(){
			this._super(arguments);
			this._afterCreate();	
		},
		_afterCreate : function(){
			var self = this;
			var opt = self.config;
			if( opt.collapsed ) {
				self.collapse( false );
			}	
		},
		_getIconTpl : function(_icon){
			var opt = this.config;
			return '<'+opt.iconTag+' class="nex-panel-icon nex-panel-title-icon '+opt.iconCls+'" style="'+_icon+'"></'+opt.iconTag+'>';		
		},
		/*initStyleSheet : function(){
			var self = this;
			var el = self.el;
			var opt = this.config;	
			if( self.views['stylesheet'] ) return self;
			var $sheet = $('<style id="'+opt.id+'_stylesheet" type="text/css"></style>');
			self.views['stylesheet'] = $sheet;
			el.append($sheet);
			return self;	
		},
		getStyleSheet : function(){
			return this.config.views['stylesheet'];	
		},
		addCssRules : function(selector,cssText){
			var self = this;
			var opt = this.config;
			var style = self.getStyleSheet().get(0);
			var args = [].slice.apply(arguments);
			var noSelector = args.length == 1;
			var cssText = noSelector ? selector : cssText;
			if( style ) {
				if( noSelector ) {
					selector = ['#'+opt.id];
				} else {
					selector = selector.split(',');
					Nex.each(selector, function(s, i){
						selector[i] = '#'+opt.id+' '+s;	
					});
				}
				Nex.addCssRules(
					style,
					selector.join(','),
					cssText
				);
			}	
			return self;	
		},*/
		//initCss : function(){},
		resetViewSize : function(){
			//todo	
			this.setViewSize();
		},
		renderedHeader : false,
		setHeader : function(){
			var self = this,
				opt=this.config;
			var container = self.views['container'];
			
			var showHeader = opt.showHeader;
			
			opt.tools = Nex.isArray(opt.tools) ? opt.tools : [ opt.tools ];
			
			if( showHeader == 'auto' || showHeader == '' ) {
				if( opt.toolItems || 
					opt.tools.length ||
					opt.title ||
					opt.icon || 
					opt.iconCls ) {
					showHeader = true;
				} else {
					showHeader = false;	
				}
			}
			
			if( showHeader === false ) return self;
			
			if( this.renderedHeader ) return self;
			
			var icon = '';
			
			if( opt.icon || opt.iconCls ) {
				var _icon = '';
				if( opt.icon ) {
					_icon = 'background-image:url('+opt.icon+')';	
				}
				icon = self._getIconTpl(_icon);	
			}
			
			var header = $('<div class="nex-panel-header '+opt.headerCls+'" id="'+opt.id+'_header"><div class="nex-panel-tools"></div><div class="nex-panel-header-title">'+icon+'<span class="nex-panel-title-text"></span></div></div>');
			
		
			self.views['header'] = header;
			self._vviews['header'] = header;
			
			container.prepend(header);
			
			this.renderedHeader = true;
			
			if( !opt.headerSelectionable ) {
				header.disableSelection();
			}
			if( opt.title ) {
				self.addComponent( opt.title, null, $('.nex-panel-title-text',header), true );
			}
			
			var hasTools = self._setTools();
			
			self.onHeaderCreate(header);
			
			self.fireEvent("onHeaderCreate",header);
			
			self.setHeaderEvent();	
			
			return self;
		},
		onHeaderCreate : function(){},
		setHeaderEvent : function(){
			var self = this;
			var opt = this.config;
			var header = self.views['header'];
		
			var callBack = function(type,e){
				var r = self.fireEvent(type, this,e,opt );
				if( r === false ) {
					e.stopPropagation();
					e.preventDefault();
				}
			};
			
			header.unbind('.ph');
			header.bind({
				'click.ph' : function(e){
					callBack.call(this, 'onHeaderClick', e);	
				},	
				'dblclick.ph' : function(e){
					callBack.call(this, 'onHeaderDblClick', e);	
				},
				'mouseover.html' : function(e){
					callBack.call(this,'onHeaderMouseOver',e);
				},
				'mouseout.html' : function(e){
					callBack.call(this,'onHeaderMouseOut',e);
				},
				'mousedown.html' : function(e) {
					callBack.call(this,'onHeaderMouseDown',e);
				},
				'mouseup.html' : function(e) {
					callBack.call(this,'onHeaderMouseUp',e);
				},
				'contextmenu.ph' : function(e){
					callBack.call(this, 'onHeaderContextMenu', e);		
				}
			});	
			
			$('>.nex-panel-tools', header).bind({
				click : function(e){
					e.stopPropagation();
					e.preventDefault();
					$(document).trigger('click', [e]);
				}	
			});
			
			self.fireEvent('onSetHeaderEvent', header);
			
		},
		_setSysTools : function( tools ){
			var self = this,
				opt=this.config;
			var header = self.views['header'];			
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
		/*
		*private
		*/
		_setTools : function(){
			var self = this,
				opt=this.config;
			var header = self.views['header'];	
			var tools = $('>.nex-panel-tools',header);
			//var hasTools = false;
			//更自由的设置tools
			if( opt.toolItems ) {
				//hasTools = true;
				self.addComponent( opt.toolItems, null, tools, true );
			}
			var _tools = opt.tools;
			_tools = self._setSysTools(_tools);
			//tools图标按钮  toolTipsTag
			for( var i=0;i<_tools.length;i++ ) {
				var _d = {
					icon : '',
					iconCls : '',
					tips : '',
					attrs : null,
					disabled : false,
					handler : null,
					callback : null,//兼容
					callBack : null //兼容
				};
				var iconData = 	opt.tools[i];
				
				if( typeof iconData !== 'object' ) {
					continue;	
				}
				
				//hasTools = true;
				
				iconData = $.extend( _d,iconData );
				
				var _icon = '';
				if( iconData.icon ) {
					_icon = 'background-image:url('+iconData.icon+')';	
				}
			
				var $icon = $('<a class="nex-panel-icon '+iconData.iconCls+'" hideFocus=true href="javascript:void(0)" style="'+_icon+'"></a>');
				
				tools.append( $icon );
				
				if( iconData.disabled ) {
					$icon.addClass('nex-panel-icon-disabled');	
				}
				
				if( iconData.tips ) {
					$icon.attr( opt.toolTipsTag, utils.htmlEncode(iconData.tips) );	
				}
				if( iconData.attrs ) {
					$icon.attr( iconData.attrs );
				}
				
				(function(icd,el){
					el.click(function(e){
						if( el.hasClass('nex-panel-icon-disabled') ) return;
						var _r;
						if( Nex.isFunction( icd.handler ) ) {
							var r = icd.handler.call( self,el,e );
							if( r === false ) _r = r; 	
						}	
						if( Nex.isFunction( icd.callBack ) ) {
							var r = icd.callBack.call( self,el,e );
							if( r === false ) _r = r;
						}	
						if( Nex.isFunction( icd.callback ) ) {
							var r = icd.callback.call( self,el,e );
							if( r === false ) _r = r;
						}
						if( _r === false ) {
							e.stopPropagation();
							e.preventDefault();	
						}					 
					});	
				})(iconData,$icon);
			}
			return self;
		},
		_headerHasShow : true,
		_showHeader : function(){//renderedHeader
			var self = this,
				opt=this.config,
				header = self.views['header'];
				
			if( !self.rendered ) {
				opt.showHeader = true;	
				return self;	
			}	
			
			if( !self.renderedHeader ) {
				opt.showHeader = true;	
				self.setHeader();
				return self;
			}
				
			header.show();
			this._headerHasShow = true;	  
			self._vviews['header'] = header;
			return this;	  
		},
		_hideHeader : function(){
			var self = this,
				opt = this.config,
				header = self.views['header'];	
			if( !self.renderedHeader ) {
				return self;
			}	
			header.hide();
			this._headerHasShow = false;	 	  
			self._vviews['header'] = null;	
			return this; 
		},
		showHeader : function(){
			this._showHeader();
			
			this.resetViewSize();
			
			return this;	
		},
		hideHeader : function(){
			this._hideHeader();
			
			this.resetViewSize();
			
			return this;	
		},
		renderedBody : false,
		setBody : function(){
			var self = this;
			var opt = self.config;	
			
			if( this.renderedBody ) {
				return self;	
			}
			
			var container = self.views['container'];
			var bd = $( '<div class="nex-panel-body '+opt.bodyCls+'" id="'+opt.id+'_body"></div>' );
			self.views['body'] = bd;
			container.append(bd);
			
			this.renderedBody = true;
			
			if( opt.bodyStyle ) {
				bd.css(opt.bodyStyle);
			}
			bd.css('padding',opt.bodyPadding);
			//bodySelectionable
			if( !opt.bodySelectionable ) {
				bd.disableSelection();
			}
			
			self.onBodyCreate( bd,opt );
			self.fireEvent("onBodyCreate", bd);
			return self;
		},
		onBodyCreate : function(){},
		renderedToolbars : false,
		setToolbars : function(){
			var self = this;
			var opt = self.config;	
			
			if( this.renderedToolbars ) {
				return self;	
			}
			
			if( opt.tbar ) {
				var tbar = Nex.isArray( opt.tbar ) ? opt.tbar : [opt.tbar];
				self._setToolbar(tbar,'top');
			}
			if( opt.bbar ) {
				var bbar = Nex.isArray( opt.bbar ) ? opt.bbar : [opt.bbar];
				self._setToolbar(bbar,'bottom');
			}
			if( opt.lbar ) {
				var lbar = Nex.isArray( opt.lbar ) ? opt.lbar : [opt.lbar];
				self._setToolbar(lbar,'left');
			}
			if( opt.rbar ) {
				var rbar = Nex.isArray( opt.rbar ) ? opt.rbar : [opt.rbar];
				self._setToolbar(rbar,'right');
			}
			
			this.renderedToolbars = true;
			
			self.fireEvent("onToolbarCreate",[opt]);
			
			return self;	
		},
		//pos=top bottom left right
		_setToolbar : function( items,pos ){
			var self = this;
			var opt = self.config;	
			var in_pos = ['top','bottom','left','right'];
			var bd = self.views['body'];
			pos = !Nex.contains( in_pos, pos ) ? 'top' : pos;
			var tid = opt.id+'_toolbar_'+pos;
			var  tb = $('#'+tid);
			if( !tb.length ) {
				tb = $( '<div class="nex-panel-toolbar nex-panel-toolbar-'+pos+' '+opt.toolbarCls+'" id="'+tid+'"></div>' );
				if( pos === 'top' ) {
					bd.before( tb );	
				} else {
					bd.after( tb );	
				}
				switch( pos ) {
					case 'top' :
						self.views['tbar'] = tb;
						self._vviews['tbar'] = tb;
						break;	
					case 'bottom' :
						self.views['bbar'] = tb;
						self._vviews['bbar'] = tb;
						break;	
					case 'left' :
						self.views['lbar'] = tb;
						self._hviews['lbar'] = tb;
						break;	
					case 'right' :
						self.views['rbar'] = tb;
						self._hviews['rbar'] = tb;
						break;		
				}
			}
			var cmps = self.addComponent( items, null, tb, true );
			/*$.each( cmps,function(i,cmp){
				if( Nex.isInstance( cmp ) ) {
					cmp.C('parent',opt.id);	
				}	
			} );*/
			return self;
		},
		/*
		*设置一个基于横向的视图 
		*/
		_setHorizontalView : function( name, el ){
			var opt=this.config;
			//self.views[ name ] = el;
			self._hviews[ name ] = el;
			return self;
		},
		/*
		*设置一个基于竖向的视图
		*/
		_setVerticalView : function( name, el ){
			var opt=this.config;
			//self.views[ name ] = el;
			self._vviews[ name ] = el;
			return self;	
		},
		_removeHorizontalView : function( name ){
			var opt=this.config;
			//self.views[ name ] = null;
			self._hviews[ name ] = null;
			//delete self.views[ name ];
			delete self._hviews[ name ];
			return self;
		},
		_removeVerticalView : function( name ){
			var opt=this.config;
			//self.views[ name ] = null;
			self._vviews[ name ] = null;
			//delete self.views[ name ];
			delete self._vviews[ name ];
			return self;	
		},
		setHorizontalView : function( a,b ){
			this._setHorizontalView( a,b );	
			this.resetViewSize();
			return this;
		},
		setVerticalView : function( a,b ){
			this._setHorizontalView( a,b );	
			this.resetViewSize();
			return this;
		},
		removeHorizontalView : function( a ){
			this._removeHorizontalView( a );	
			this.resetViewSize();
			return this;
		},
		removeVerticalView : function( a ){
			this._removeVerticalView( a );	
			this.resetViewSize();
			return this;
		},
		setViewSize : function(){
			var self = this,
				opt=this.config,
				undef;
			var container = self.el;	
			var bd = self.getBody();	
		
			self._super(arguments);
			
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
				bd.outerHeight( container.height()-h );
			} else {
				bd.css('height', '');	
			}
			/*设置 左右工具栏位置*/
			var offset = bd._position();
			
			if( self.views['lbar'] ) {
				var tb = self.views['lbar'];
				bd.css('marginLeft',tb.outerWidth());	
				tb.outerHeight( bd.outerHeight() );
				tb.css({
					left : parseFloat(container.css('paddingLeft')) || 0,
					top : offset.top	
				});
			}
			if( self.views['rbar'] ) {
				var tb = self.views['rbar'];
				tb.outerHeight( bd.outerHeight() );
				tb.css({
					right : parseFloat(container.css('paddingRight')) || 0,
					top : offset.top	
				});	
			}
		},
		bindBodyEvents : function(){
		},
		renderedFooter : false,
		setFooter : function(){
			var self = this,undef;
			var opt = self.C();	
			var container = self.views['container'];
			
			if( this.renderedFooter ) return self;
			
			if( !opt.footerItems ) return self;
			
			var footerItems = opt.footerItems;
			
			var footer = $('<div class="nex-panel-footer '+opt.footerCls+'" id="'+opt.id+'_footer"></div>');
			self.views['footer'] = footer;
			self._vviews['footer'] = footer;
			container.append(footer);	
			
			this.renderedFooter = true;
			
			self.addComponent( footerItems, null, footer, true  );
			
			self.onFooterCreate(footer);
			
			self.fireEvent("onFooterCreate",footer);
			
			return self;
		},
		onFooterCreate : function(){},
		setTitle : function( s,m ){
			var self = this;
			var opt = this.config;
			var o = opt.title;
			if( !self.rendered || !self.renderedHeader ) {
				opt.title = s;
				return self;	
			}
			var header = self.getHeader();	
			var inner = $('.nex-panel-title-text',header);
			
			opt.title = s;
			
			inner.empty();
			if( m ) {
				Nex.gc();
			}
			
			self.addComponent( s, null, inner, true );
			
			self.fireEvent('onTitleChange',[ s,o,opt ]);
			
			return self;
		},
		setIcon : function( s ){
			var self = this;
			var opt = this.config;
			var o = opt.icon;
			if( !self.rendered || !self.renderedHeader ) {
				opt.icon = s;
				return self;	
			}
			var header = self.getHeader();	//nex-panel-title-icon
			var inner = $('.nex-panel-title-icon',header);
			if( !inner.length ) {
				inner = $( self._getIconTpl() );	
				$('.nex-panel-header-title',header).prepend( inner );
			}
			
			opt.icon = s;
			
			inner.css('backgroundImage','url('+s+')');
			
			self.fireEvent('onIconChange',[ s,o,opt ]);
			
			return self;
		},
		setIconCls : function( s ){
			var self = this;
			var opt = this.config;
			var o = opt.iconCls;
			if( !self.rendered || !self.renderedHeader ) {
				opt.iconCls = s;
				return self;	
			}
			var header = self.getHeader();	//nex-panel-title-icon
			var inner = $('.nex-panel-title-icon',header);
			if( !inner.length ) {
				inner = $( self._getIconTpl() );	
				$('.nex-panel-header-title',header).prepend( inner );
			}
			
			inner.removeClass( o );
			
			opt.iconCls = s;
			
			inner.addClass(s);
			
			self.fireEvent('onIconClsChange',[ s,o,opt ]);
			
			return self;
		},
		getHeader : function(){
			var opt = this.config;
			return this.views['header'] || null;	
		},
		getBody : function(){
			var opt = this.config;
			return this.views['body'];
		},
		getFooter : function(){
			var opt = this.config;
			return this.views['footer'];	
		},
		getToolbar : function( pos ){
			var opt = this.config;
			var maps = {
				'top' 	 : 'tbar',
				'bottom' : 'bbar',
				'left'	 : 'lbar',
				'right'  : 'rbar'
			};
			return self.views[maps[ pos ]];		
		},
		doClose : function( cb ){
			this.hide( cb );
		},
		"close" : function(cb){
			var self = this;
			var opt = this.config;
				
			var complete = function(){
				if( opt.closeToRemove ) {
					self.destroy();	
				}	
				self.fireEvent('onClose',[ opt ]);	
				Nex.isFunction(cb) && cb();
			};	
			
			if( self.fireEvent('onBeforeClose',[ opt ]) !== false ) {
				self.doClose(complete);
			}	
			return self;
		},
		/*移除*/
		remove : function(){
			this.config.closeToRemove = true;
			return this.close();
		},
		onSizeChange : function(){
			this._super(arguments);
			var container = this.el;	
			if( this.collapsed/* || this.isCollapsingOrExpanding*/ ) {
				var resetHeight = container.height();
				container.data('__resetHeight__',resetHeight);	
			}
			if( this.collapsed ) {
				this.collapsed = false;
				this.collapse(false);	
			}
		},
		//无效。。。
		isCollapsingOrExpanding : false,
		collapsed : false,
		/*
		*展开
		*/
		expand : function( anim ){
			var self = this;
			var opt = this.config;
			
			if( !self.collapsed/* || self.isCollapsingOrExpanding*/ ) {
				return self;	
			}
			
			if( self.fireEvent('onBeforeExpand',[ opt ]) === false ) {
				return self;	
			}
			
			self.fireEvent('onExpanding',[ opt ]);
			
			anim = self._undef( anim,opt.animCollapse );
			
			var container = self.el;	
			var header = self.getHeader();	
			
			container.stop(true,true);
			
			self.collapsed = false;
			
			//self.isCollapsingOrExpanding = true;
			
			var hh = self._headerHasShow && header ? header.outerHeight() : 0;
			
			var fn = function(){
				//self.isCollapsingOrExpanding = false;
				self.resize();
				self.setAcceptResize( true );	
				container.removeClass( 'nex-panel-collapsed '+opt.collapsedCls );
				self.fireEvent('onExpand',[ opt ]);	
			};
			if( anim ) {			
				container.animate({
					height : container.data('__resetHeight__') || hh
				},opt.durationCollapse,function(){
					fn();
				});
			} else {
				container.height( container.data('__resetHeight__') || hh );
				fn();
			}
			return self;
		},
		/*
		*折叠
		*/
		collapse : function( anim ){
			var self = this;
			var opt = this.config;
			
			if( self.collapsed/* || self.isCollapsingOrExpanding*/ ) {
				return self;	
			}
			
			if( self.fireEvent('onBeforeCollapse') === false ) {
				return self;	
			}
			
			self.fireEvent('onCollapsing');
			
			anim = self._undef( anim,opt.animCollapse );
			
			var container = self.el;	
			var header = self.getHeader();	
			
			container.stop(true,true);
			
			self.collapsed = true;	
			
			var resetHeight = container.height();
			container.data('__resetHeight__',resetHeight);
			
			self.setAcceptResize( false );
			
			var hh = self._headerHasShow && header ? header.outerHeight() : 0;
			
			//self.isCollapsingOrExpanding = true;
			
			var fn = function(){
				//self.collapsed = true;	
				//self.isCollapsingOrExpanding = false;
				self.fireEvent('onCollapse',[ opt ]);	
			};
			container.addClass( 'nex-panel-collapsed '+opt.collapsedCls );
			if( anim ) {	
				container.animate({
					height : hh
				},opt.durationCollapse,function(){
					fn();
				});
			} else {
				container.height( hh );
				fn();
			}
			return self;
		},
		toggleCollapse: function( anim ) {
			var self = this;
			var opt = this.config;
			/*if (self.isCollapsingOrExpanding) {
				return self;
			}*/
			if (self.collapsed) {
				self.expand(anim);
			} else {
				self.collapse(anim);
			}
			return self;
		}
	});
	
	return panel;
});