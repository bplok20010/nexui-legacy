define(function(require){
	var Nex = require('../Nex');
	
	function config(opt){
		return {
			/**
			* 是否显示header 可选值: auto true false
			* auto会自动判断
			*/
			displayHeader : 'auto',
			title : '',
			headerSelectionable : true,
			headerCls : '',
			//图标路径
			icon : '',
			//图标样式
			iconCls : '',
			iconTag : 'span',
			collapsible : false,//折叠icon
			collapsed   : false,//默认显示是是否折叠
			collapsedCls: '',
			tools: [],//小工具 { icon:'',iconCls:'',tips:'',disabled:false,handler:null,attrs:null }
			toolItems : null,//更自由的自定义tools组件
			toolTipsTag : 'title'
		};
	};
	
	var PanelHeader = {
		config : config,
		getHeader : function(){
			var opt = this.config;
			return this.views['header'] || null;	
		},
		renderedHeader : false,
		setHeader : function(){
			var self = this,
				opt=this;
			var container = self.el;
			
			var showHeader = opt.displayHeader;
			
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
			
			header.css('paddingRight', (parseInt(header.css('paddingRight')) || 0) + $('>.nex-panel-tools', header).width());
			
			return self;
		},
		_getIconTpl : function(_icon){
			var opt = this;
			return '<'+opt.iconTag+' class="nex-panel-icon nex-panel-title-icon '+opt.iconCls+'" style="'+_icon+'"></'+opt.iconTag+'>';		
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
				
				iconData = Nex.extend( _d, iconData );
				
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
					$icon.attr( opt.toolTipsTag, Nex.htmlEncode(iconData.tips) );	
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
				opt=this,
				header = self.views['header'];
				
			if( !self.rendered ) {
				opt.displayHeader = true;	
				return self;	
			}	
			
			if( !self.renderedHeader ) {
				opt.displayHeader = true;	
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
				opt = this,
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
			
			self.fireEvent('onTitleChange',s,o);
			
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
			
			self.fireEvent('onIconChange',s,o);
			
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
			
			self.fireEvent('onIconClsChange',s,o);
			
			return self;
		}
	};
	
	return PanelHeader;
});