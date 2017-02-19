define(function(require, exports, module){
	
	require('Nex/AbstractComponent');
	
	require('Nex/utils/jqExtend');
	
	return Nex.Class('Nex.Component',{
		extend : 'Nex.AbstractComponent',
		xtype : 'component',
		configs : function(){
			return {
				prefix : 'nex-',
				renderTo : null,
				tag : 'div',
				renderTo : '',
				renderAfter : true, // append 
				autoDestroy : true,//自动回收 ，如果el 不存在时会触发
				autoResize : true,// 如果组件大小采取的是自适应，则应该设置为false, Component 组件采取的是只适应，不需要JS再做任何计算
				selectionable : true, 
				width : '', 
				height : '',
				maxWidth : '',
				maxHeight : '',
				minHeight : '',
				minWidth : '',
				initSizeAble : true,//初始时设置宽高
				initRenderDataAble : true,//初始时就设置内容 否则需要自己设置
				autoRenderData : true,// 默认自动渲染 html,items的内容
				focusable : false,
				tabIndex : -1,
				attrs : {},
				style : {},
				'class' : '',
				containerEl : null,
				containerCls : 'nex-component nex-border-box',
				border : false,
				borderCls    : '',
				cls : '',
				cssText : '',
				defaultType : 'component',
				defaults : {},
				renderTpl : '',//初始渲染模板
				html : '',
				items : []
			}	
		},
		views : {},
		
		isAtuoRender : function(){
			var opt = this.configs;		
			if( !opt.renderTo ) return false;
			return this._super();
		},
		initComponent : function(){
			var self = this;
			var opt = self.configs;	
			
			self.views = {};
			//self._super(arguments);
			self.onBeforeRender();
			self.fireEvent('onBeforeRender');
			
			self.initContainer();
			
			self.initLayout();
			
			if( opt.initSizeAble ) {	
				self.initComponentSize();
			}
			
			if( opt.initRenderDataAble ) {
				self.initRenderContent();
			}
				
		},
		
		initLayout : function(){},
		
		onBeforeRender : function(){},
		
		render : function( el ){
			
			if( this.rendered ) {
				
				this.renderTo.apply( this,arguments );
				
			} else {
				this.configs.renderTo = el;
				
				this.initialize();	
			
			}
			
			return this;	
		},
		
		renderedContainer : false,
		initContainer : function(){
			var self = this;
			var opt = self.configs;	
		
			if( self.renderedContainer ) {
				return self;	
			}
			
			var container;
			
			var cls = [
				opt.containerCls
			];
			
			if( opt.border === true ) {
				cls.push( opt.borderCls );	
			}
			
			if( opt['cls'] ) {
				cls.push( opt['cls'] );	
			}
			if( opt['class'] ) {
				cls.push( opt['class'] );	
			}
			
			var tag = opt.tag || 'div';
			
			container = opt.containerEl ? $(opt.containerEl) : $( document.createElement( tag ) );
			
			var attrs = {};
			
			Nex.apply( attrs, opt.attrs );
			
			if( opt.focusable && opt.tabIndex !== false ) {
				attrs.tabIndex = opt.tabIndex;
			}
			
			Nex.apply( attrs, {
				id : opt.id,
				'_nex_instance_' : opt.id,
				"class" : cls.join(' ')	
			} );
			
			container.attr( attrs );
			
			self.views['container'] = container;
			
			self.el = container;
			
			if( opt.cssText ) {
				container[0].style.cssText = opt.cssText;
			}
			
			if( !Nex.isEmptyObject(opt.style) ) {
				container.css( opt.style );
			}
					 
			if( !opt.selectionable ) {
				self._disableSelection();	
			}
			
			//renderTpl
			if( !Nex.isEmpty(opt.renderTpl) ) {
				var renderTpl = self.tpl(Nex.isArray(opt.renderTpl) ? opt.renderTpl.join('') : opt.renderTpl, opt);
				container.html( renderTpl );
			}
			
			self._renderContainer();
			
			self.onContainerCreate();
			
			self.fireEvent("onContainerCreate");
			
			self.renderedContainer = true;
						
			return self;
		},
		onContainerCreate : function(){},
		
		//初始化 组件的大小
		initComponentSize : function(){
			this.setComponentSize();
			this.onInitSize();
			this.fireEvent('onInitSize');
			return this;	
		},
		onInitSize : function(){},
		
		//在组件大小设置后 初始化内容
		initRenderContent : function(){
			this.doRenderContent();
			//渲染完成
			this.onAfterRender();
			this.fireEvent('onAfterRender');
			return this;		
		},
		onAfterRender : function(){},
		
		//渲染容器
		_renderContainer : function( el ){
			
			var opt = this.configs;
			
			if( el ) {
				opt.renderTo = el;	
			}
			
			var render = $(opt.renderTo);
			
			if( opt.renderAfter ) {
				render.append( this.el );	
			} else {
				render.prepend( this.el );		
			}
			
			this.refreshParent();
			
			return this;	
		},
		
		renderTo : function(el){
			this._renderContainer(el);
			if( !this.isInit() ) {
				this.resize();
			}
			return this;	
		},
		
		refreshParent : function(){
			
			var parent = $(this.configs.renderTo).closest('[_nex_instance_]');//this.el.parent()
			
			this.$parent = (parent.length ? parent : null) ? Nex.get( parent.attr('_nex_instance_') ) : null;	
			
		},
		
		doRenderContent : function(){
			var self = this;
			var opt = self.configs;	
			var bd = self.getBody();
			
			if( opt.autoRenderData ) {
				
				var items = opt['html'];
				self.addComponent( bd, items, opt.defaults );
				var items = opt['items'];
				self.addComponent( bd, items, opt.defaults );
			
			}
			
			self.onRender();
			
			self.fireEvent("onRender");
			
			return bd;
		},
		onRender : function(){},
		__frt : 0,
		// true 强制刷新
		resize : function(m){
			var self = this,
				opt = self.configs;
			
			//设置max-* min-*	
			self.initMaxAndMinSize();	
				
			//设置组件大小	
			self.setContainerSize();
			//因为 getWidth getHeight 开销会比较大 默认初始时 不立刻执行 使用setTimeout推后
			//检测组件大小是否已经改变	
			//var isResize = self._isSizeChange(true);
			var isResize = self.isInit() ? true : self._isSizeChange(true);	
			
			//self.isInit() ? true :  
			//这一步可以取消
			if( self.isInit() && !self.__frt ) {
				self.__frt = setTimeout(function(){
					self._isSizeChange(true);
					self.__frt = 0;	
				},0);	
			}
			
			if( isResize || m ){
				//设置组件视图内容大小
				self.setViewSize(m);	
			}
			
			if( (isResize || m) && !self.isInit() ){
				
				self.onResize();
				
				self.fireEvent('onResize');
				
				setTimeout(function(){
					self.resizeChildren(m);		
				},0);
				
			}	
			
			return self;	
		},
		onResize : function(){},
		//如果浏览器窗口改变或自动触发改变事件, 组件管理器会自动调用_autoResize
		//@param m boolean true 强制更新 false(默认)根据_isParentSizeChange检测结果更新
		_autoResize : function(m){
			var self = this;
			
			if( !this.isAcceptResize() ) {
				return this;	
			}
			
			var isParentChange = this._isParentSizeChange();
			
			//这里最好做检查元素是否为display:none
			//如果浏览器大小改变，但是组件容器大小尚未改变则不做处理
			if( isParentChange || m ) {
				this.resize(m);
			} 
			
			return this;
			
		},
		/*
		 关于 resize 和 _autoResize 命名问题，是否还需要斟酌，
		 resize ：刷新组件大小
		 _autoResize：兼容浏览器大小或者组件容器大小是否改变，是则调用resize
		*/
		
		setComponentSize : function(){
			this.initMaxAndMinSize();
			this.resize();	
			return this;
		},
		
		resizeChildren : function(m){
			var self = this;
			
			var childs = self.getChildren();
			
			$.each( childs, function(i, cmp){
				cmp._autoResize && cmp._autoResize(m);	
			} );
			
			return self;
		},
		
		__lastParentWidth : null,
		__lastParentHeight : null,
		//检测父组件容器大小是否改变
		_isParentSizeChange : function(){
			
			var self = this;
			
			var $parent = self.el.parent();
			
			var width = $parent.width();
			var height = $parent.height();
			
			if( width !== self.__lastParentWidth
				|| height !== self.__lastParentHeight
			  ) {
				
				self.__lastParentWidth = width; 
				
				self.__lastParentHeight = height;  
				
				return true;	  
			}	
			
			return false;
		},
		
		__lastWidth : null,
		__lastHeight : null,
		//检测当前组件宽度大小是否已经改变了
		//@param save boolean true记录当前大小 false(默认)只检测 不记录
		_isSizeChange : function(save){
			var self = this,
				opt = self.configs;
				
			var width = self.el.width();
			
			var height = self.el.height();
			
			if( width !== self.__lastWidth
				|| height !== self.__lastHeight
			  ) {
				if( save ) {
					self.__lastWidth = width; 
				
					self.__lastHeight = height;  
				}
				
				return true;	  
			}
			
			return false;		
		},
		
		isAutoWidth : function(){
			var opt = this.configs;
			var width = Nex.isFunction( opt.width ) ? opt.width.call(this) : opt.width;
			return width === '' || width == 'auto';
		},
		
		isAutoHeight : function(){
			var opt = this.configs;
			var height = Nex.isFunction( opt.height ) ? opt.height.call(this) : opt.height;
			return height === '' || width == 'auto';	
		},
		
		setContainerSize : function(){
			var self = this,
				opt = self.configs;
				
			var width = Nex.isFunction( opt.width ) ? opt.width.call(self) : opt.width;
			
			var height = Nex.isFunction( opt.height ) ? opt.height.call(self) : opt.height;
			
			self.el.css({
				width : width,
				height : height	
			});	
			
			return self;
		},
		
		setViewSize : function(){},
		
		__lastMaxWidth : null,
		__lastMaxHeight : null,
		__lastMinWidth : null,
		__lastMinHeight : null,
		initMaxAndMinSize : function(){
			var self = this,
				opt = self.configs;
			
			var maxWidth = Nex.isFunction(opt.maxWidth) ? opt.maxWidth.call(self) : opt.maxWidth;	
			var maxHeight = Nex.isFunction(opt.maxHeight) ? opt.maxHeight.call(self) : opt.maxHeight;
			var minWidth = Nex.isFunction(opt.minWidth) ? opt.minWidth.call(self) : opt.minWidth;
			var minHeight = Nex.isFunction(opt.minHeight) ? opt.minHeight.call(self) : opt.minHeight;	
			
			var style = {};
			
			if( maxWidth !== self.__lastMaxWidth ) {
				self.__lastMaxWidth = maxWidth;
				style.maxWidth = maxWidth;
			}
			
			if( maxHeight !== self.__lastMaxHeight ) {
				self.__lastMaxHeight = maxHeight;
				style.maxHeight = maxHeight;
			}
			
			if( minWidth !== self.__lastMinWidth ) {
				self.__lastMinWidth = minWidth;
				style.minWidth = minWidth;
			}
			
			if( minHeight !== self.__lastMinHeight ) {
				self.__lastMinHeight = minHeight;
				style.minHeight = minHeight;
			}
			
			if( self.isInit() ) {
				if( maxWidth === ''
					&&  maxHeight === ''
					&&  minWidth === ''
					&&  minHeight === '' ) {
					//...
					return this;		
				}
			}
			
			if( !Nex.isEmptyObject( style ) ) {
				if( Nex.isIE7 || Nex.isIE8 ) {
					$.each( style, function(method, value){
						self.el[method](value);	
					} );
				} else {
					self.el.css(style);
				}
			}
			
			return this;
		},
		
		setWidth : function(w){
			var self = this,
				opt = self.configs;
			if( opt.width === w ) return this;
			opt.width = w;	
			self.resize();	
			return this;
		},
		
		setHeight : function(h){
			var self = this,
				opt = self.configs;
			if( opt.height === h ) return this;	
			opt.height = h;		
			self.resize();	
			return this;
		},
		
		getWidth : function(){
			//如果this.__lastWidth 还没初始化 则初始化它
			if( this.__lastWidth === null ) {
				//注：此处可以用outerWidth ,因为我们用的是border-box 所以直接用css获取
				this.__lastWidth = parseFloat(this.el.css('width'));	
			}
			return this.__lastWidth;	
		},
		
		getHeight : function(){
			//如果this.__lastHeight 还没初始化 则初始化它
			if( this.__lastHeight === null ) {
				//注：此处可以用outerHeight ,因为我们用的是border-box 所以直接用css获取
				this.__lastHeight = parseFloat(this.el.css('height'));	
			}
			return this.__lastHeight;	
		},
		
		width : function(){
			if( arguments.length ) {
				return this.setWidth.apply(this, arguments);	
			} else {
				return this.getWidth();	
			}
		},
		
		height : function(){
			if( arguments.length ) {
				return this.setHeight.apply(this, arguments);	
			} else {
				return this.getHeight();	
			}
		},
		
		maxWidth : function(w){
			var opt = this.configs;
			
			if( opt.maxWidth === w ) return this;	
			
			opt.maxWidth = w;
			
			this.resize();	
			
			return this;
		},
		
		maxHeight : function(w){
			var opt = this.configs;
			
			if( opt.maxHeight === w ) return this;	
			
			opt.maxHeight = w;
			
			this.resize();	
			
			return this;	
		},
		
		minWidth : function(w){
			var opt = this.configs;
			
			if( opt.minWidth === w ) return this;	
			
			opt.minWidth = w;
			
			this.resize();	
			
			return this;		
		},
		
		minHeight : function(w){
			var opt = this.configs;
			
			if( opt.minHeight === w ) return this;	
			
			opt.minHeight = w;
			
			this.resize();	
			
			return this;		
		},
		
		getContainer : function(){
			var self = this,
				opt = self.configs;
			return this.views['container'];	
		},
		
		getBody : function(){
			var self = this,
				opt = self.configs;
			return this.views['container'];
		},
		_disableSelection : function(){
			this.el.disableSelection();	
		},
		//判断当前对象是否还存在
		isExists : function(){
			var self = this,
				opt = self.configs,
				dom = self.getDom();
				
			if( dom.length ) {
				return true;	
			} else {
				if( opt.autoDestroy ) {
					self.destroy();	
				}	
			}
			return false;
		},
		/**
		*解析xtype 到容器
		*@param {String,Dom} 容器
		*@param {Array,Nex,Xtype} 组件列表 
		*@param {Object} defaults
		*/
		addComponent : function(renderTo, items, def){
			var self = this,
				opt = self.configs,
				undef;
			
			var def = $.extend({ xtype : opt.defaultType }, def || {});
			
			if( Nex.isFunction( items ) 
				&& !Nex.isClass( items ) 
				&& !Nex.isCreator( items ) ) {
				items = items.call( self,renderTo );
			}
			
			var components = [];
			
			var items = Nex.isArray( items ) ? items : [items];
			
			$.each( items, function(i, d){
				if( Nex.isEmpty(d) || Nex.isBoolean(d) ) {
					d = null;
					return;
				}	
				if( Nex.isFunction( d ) 
					&& !Nex.isClass( d ) 
					&& !Nex.isCreator( d ) ) {
					d = d.call(self,renderTo,opt);	
					if( Nex.isEmpty(d) || Nex.isBoolean(d) ) {
						d = null;
					}
				}
				
				if( d === null ) return;
				
				if( Nex.isPlainObject( d ) && !Nex.isInstance( d ) ) {
					d = $.extend( {}, def, d );	
				}
				
				if( Nex.isInstance( d ) ) {
					
					d.render( renderTo );
					
					components.push( d );
					
				} else if( Nex.isClass( d ) ){
					components.push(d.create({
						renderTo : renderTo	
					}));	
				} else if( Nex.isXType( d ) ){
					var cmp = Nex.Create( $.extend({}, d, { renderTo : renderTo, autoRender:true }) );
					if( cmp ) {
						components.push( cmp );	
					}
				} else if( Nex.isCreator( d ) ) {
					var cmp = d( $.extend({}, d, { renderTo : renderTo, autoRender:true }) );
					if( cmp ) {
						components.push( cmp );	
					}	
				} else if( Nex.isFunction(d) ) {
					var cmp = d();	
					if( cmp ) {
						components.push( cmp );	
					}
				} else {//String Number Html...
					renderTo.append( d );
				}
				
			} );
			
			return components;
		},
		add :　function(){
			var opt = this.configs;
			var items = [].slice.apply(arguments)
			if( this.rendered ) {
				var bd = this.getBody();
				this.addComponent( bd , items, opt.defaults );
			} else {
				opt.items = Nex.isArray( opt.items ) ? opt.items : [ opt.items ];
				opt.items.concat( items );	
			}
			return this;
		},
		addChild : function(){
			return this.add.apply(this, arguments);	
		},
		getDom : function(){
			var opt = this.configs;
			return $('#'+opt.id);
		},
		getEl : function(){
			return this.el;	
		},
		getWrapper : function(){
			return this.el;	
		},
		getChildren : function(){
			var opt = this.configs;
			return Nex.Manager.getChildren( opt.id );
		},
		getAllChildren : function(){
			var opt = this.configs;
			return Nex.Manager.getAllChildren( opt.id );
		},
		//获取组件的父级组件
		getParent : function(){
			return this.$parent;
		},
		/*
		* 把自己从管理从删除 会触发onDestroy 
		*/
		destroy : function(){
			
			this.el.remove();
			
			this._super();
			
			return this;
		}
	});	
});