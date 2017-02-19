define(function(require, exports, module){
	
	var Nex = require('./Nex');
	var ComponentBase = require('./ComponentBase');
	
	var sizePattern = /(.+)\s*([\+\-\*\/])\s*(.+)/;
	
	return Nex.Class('Nex.Component', ComponentBase, {
		xtype : 'component',
		prefix : 'nex-',
		baseCls : 'nex-component nex-border-box',
		componentCls : '',
		el : null,
		config : function(){
			return {
				renderTo : null,
				tag : 'div',
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
				autoRenderData : true,// 默认自动渲染 html,items的内容
				focusable : false,
				tabIndex : null,
				attrs : null,
				style : null,
				'class' : '',
				//containerEl : null,
				containerCls : '',
				border : false,
				borderCls    : '',
				cls : '',
				cssText : '',
				defaultType : 'component',
				defaults : null,
				html : '',
				items : null,
				views : null,
				needRenderTpl : true,
				// string function
				templateString : null,
				deferUpdateSubLayout : true
			};	
		},
		
		isAtuoRender : function(){	
			if( !this.renderTo ) return false;
			return this._super();
		},
		
		initComponent : function(){
			this.views = {};
			this._super(arguments);
		},
		
		setupRendder : function(){
			this._super(arguments);
			
			if( this.fireEvent('onBeforeRender') !== false ) {
				this.onBeforeRender();
				this.initContainer();
				
				this.initStyles( this.el );	
			}
			
			if( !this.el ) {
				throw new Error('setupRendder error el is not exists.');
			}
			
			this.onContainerCreate(this.el);
			
			this.fireEvent("onContainerCreate", this.el);
			
			this.setSize();
			
			this.initLayout();
			
			this.onLayout();
			
			this.fireEvent('onLayout');
			
			this.setViewSize();
			
			this.finishRender();
			
			this.initEvents();	
			
		},
		
		initStyles : function(){},
		
		onLayout : function(){
			this._setTabIndex();	
		},
		
		initEvents : function(){
			this._setTabIndexEvent();
		},
		
		initLayout : function(){
			var self = this;
			
			if( self.needRenderTpl && self.templateString ) {
				this.initRenderTpl();	
			}
			
			self.onRender(self.el);
			
			self.fireEvent('onRender', self.el);
			
			self.onAfterRender();
			
        	self.fireEvent('onAfterRender');
			
		},
		
		finishRender: function(){
			
			this.doRenderData();
			
			this.onRenderData();
			
			this.fireEvent('onRenderData');	
			
		},
		
		onRenderData : function(){},
		
		initRenderTpl : function(){
			if( !this.templateString ) {
				return '';	
			}
			var tpl = this.tpl( Nex.isFunction(this.templateString) ? this.templateString.call(this) : this.templateString, this );	
			
			this.el.html( tpl );
				
		},
		
		onBeforeRender : function(){},
		onRender : function(el){},
		onAfterRender : function(){},
		
		renderedContainer : false,
		initContainer : function(){
			var self = this;
		
			if( self.renderedContainer ) {
				return self;	
			}
			
			var container;
			
			var cls = [
				self.baseCls,
				self.componentCls,
				self.containerCls
			];
			
			if( self.border === true ) {
				cls.push( self.borderCls );	
			}
			
			if( self['cls'] ) {
				cls.push( self['cls'] );	
			}
			if( self['class'] ) {
				cls.push( self['class'] );	
			}
			
			var tag = self.tag || 'div';
			
			container = self.el ? $(self.el) : $( document.createElement( tag ) );
			
			var attrs = {};
			
			Nex.extend( attrs, self.attrs );
			
			Nex.extend( attrs, {
				id : self.id,
				'_nex_instance_' : self.id,
				"class" : cls.join(' ')	
			} );
			
			container.attr( attrs );
			
			self.views['container'] = container;
			
			self.el = container;
			
			if( self.cssText ) {
				container[0].style.cssText = self.cssText;
			}
			
			if( self.style ) {
				container.css( self.style );
			}
					 
			if( !self.selectionable ) {
				self._disableSelection();	
			}
			
			self._renderContainer();
			
			self.renderedContainer = true;
						
			return self;
		},
		onContainerCreate : function(){},
		
		
		//渲染容器
		_renderContainer : function( el ){
			
			if( el ) {
				this.renderTo = el;	
			}
			
			var render = $(this.renderTo);
			
			if( Nex.isWindow(render[0]) || render[0] === document ) {
				render = $(document.body);	
			}
			
			if( this.renderAfter ) {
				render.append( this.el );	
			} else {
				render.prepend( this.el );		
			}
			
			this.refreshParent();
			
			return this;	
		},
		
		appendTo : function(el){
			this._renderContainer(el);
			if( !this.isInit() ) {
				this.resize();
			}
			return this;	
		},
		
		refreshParent : function(){
			
			var parent = $(this.renderTo).closest('[_nex_instance_]');//this.el.parent()
			
			this.$parent = (parent.length ? parent : null) ? Nex.get( parent.attr('_nex_instance_') ) : null;	
			
		},
		
		_setTabIndex: function(){
			var focusEl = this.getFocusEl();
			if( focusEl && this.tabIndex !== null ) {
				focusEl.attr('tabIndex', this.tabIndex);
			}	
		},
		
		doRenderData : function(){
			var self = this;
			var opt = self;	
			var bd = self.getBody();
			
			if( opt.autoRenderData ) {
				
				var items = opt['html'];
				items && self.addComponent( items, opt.defaults, bd );
				var items = opt['items'];
				items && self.addComponent( items, opt.defaults, bd );
			
			}
		},
		
		setSize : function(width, height){
			
			if( width !== void 0 ) {
				this.width = width;	
			}
			if( height !== void 0 ) {
				this.height = height;	
			}
			
			if( this.isInit() ) {
				//设置max-* min-*	
				this.initMaxAndMinSize();	
				this.setContainerSize();
				//记录当前组件大小，设置lastWidth lastHeight
				this.checkSizeChange(true);
			} else {
				this.resize();	
			}
			
		},
		
		// true 强制刷新
		resize : function(m){
			var self = this,
				opt = self;
			
			//设置max-* min-*	
			this.initMaxAndMinSize();	

			this.setContainerSize();
			
			//因为 getWidth getHeight 开销会比较大 默认初始时 不立刻执行 使用setTimeout推后
			//检测组件大小是否已经改变	
			//var isResize = self.checkSizeChange(true);
			var isResize = self.checkSizeChange(true);	
			
			if( isResize || m ){
				//设置组件视图内容大小
				self.setViewSize(m);	
			}
			
			if( (isResize || m) && !self.isInit() ){
				
				self.onResize();
				
				self.fireEvent('onResize');
			
				setTimeout(function(){
					self.updateSubLayout(m);		
				},0);
				
			}	
			
			return self;	
		},
		onResize : function(){},
		//如果浏览器窗口改变或自动触发改变事件, 
		//@param m boolean true 强制更新 false(默认)根据checkParentSizeChange检测结果更新
		updateLayout : function(m){
			var self = this;
			
			if( !this.isAcceptResize() ) {
				return this;	
			}
			
			var isParentChange = this.checkParentSizeChange();
			
			//这里最好做检查元素是否为display:none
			//如果浏览器大小改变，但是组件容器大小尚未改变则不做处理
			if( isParentChange || m ) {
				
				if( this.fireEvent('onBeforeResize') === false ) {
					return this;	
				}
				
				this.resize(m);
			} 
			
			return this;
			
		},
		
		updateSubLayout : function(m){
			var self = this;
			
			var childs = self.getChildren();
			
			Nex.each( childs, function(cmp, i){
				cmp.updateLayout && cmp.updateLayout(m);	
			} );
			
			return self;
		},
		
		getElParent : function(){
			return this.el.parent();	
		},
		
		lastParentWidth : null,
		lastParentHeight : null,
		//检测父组件容器大小是否改变
		checkParentSizeChange : function(){
			
			var self = this;
			
			var $parent = this.getElParent();
			
			var width = $parent.width();
			var height = $parent.height();
			
			if( width !== self.lastParentWidth
				|| height !== self.lastParentHeight
			  ) {
				
				self.lastParentWidth = width; 
				
				self.lastParentHeight = height;  
				
				return true;	  
			}	
			
			return false;
		},
		
		lastWidth : null,
		lastHeight : null,
		//检测当前组件宽度大小是否已经改变了
		//@param save boolean true记录当前大小 false(默认)只检测 不记录
		checkSizeChange : function(save){
			var self = this;
				
			var width = self.el.width();
			var height = self.el.height();
			
			//解决如果当前容器是display:table，被撑大后无法还原问题
			if( this.calcWidth && String(this.calcWidth).indexOf('%') !== -1 ) {
				//重新设置lastWith 好触发SizeChange
				self.lastWidth = null;	
			}
			if( this.calcHeight && String(this.calcHeight).indexOf('%') !== -1 ) {
				//重新设置lastHeight 好触发SizeChange
				self.lastHeight = null;
			}
		
			if( width !== self.lastWidth
				|| height !== self.lastHeight
			  ) {
				if( save ) {
					self.lastWidth = width; 
				
					self.lastHeight = height;  
				}
				
				return true;	  
			}
			
			return false;		
		},
		
		isAutoWidth : function(){
			var opt = this;
			var width = this.calcWidth;//Nex.isFunction( opt.width ) ? opt.width.call(this) : opt.width;
			return width === '' || width == 'auto';
		},
		
		isAutoHeight : function(){
			var opt = this;
			var height = this.calcHeight;//Nex.isFunction( opt.height ) ? opt.height.call(this) : opt.height;
			return height === '' || height == 'auto';	
		},
		/**
		* 计算size
		* @param {string} 
		* - number|百分比 +-x/ number
		* @param {string} dir - w or h 
		* - 
		*/
		_parseSize : function( size, $parent, dir ){
			var opt = this;
			
			if( !size ) {
				return size;	
			}
			
			if( Nex.isFunction( size ) ) {
				return size.call( this, $parent );	
			}
			
			if( /^\s*calc/.test( size ) ) {
				return size;	
			}
			
			var ret = sizePattern.exec( size );
			
			function isPec( size ){
				return /%\s*$/.test(size);// /^\d+(\.\d+)?\s*%\s*$/
			}
			
			if( ret ) {
				var a = ret[1];
				var b = ret[2];
				var c = ret[3];
				var pSize = dir == 'h' ? $parent.height() : $parent.width();
					
				var isPa = isPec(a);
				var isPc = isPec(c);
				
				var ext = 0;
				
				if( isPa && isPc ) {
					a = parseFloat(a);
					c = parseFloat(c);
					ext = '%';	
				} else if( !isPa && !isPc ) {
					a = parseFloat(a);
					c = parseFloat(c);
				} else {
					a = isPa ? (parseFloat(a)/ 100) * parseFloat(pSize) : parseFloat(a);
				
					c = isPc ? (parseFloat(c)/ 100) * parseFloat(pSize) : parseFloat(c);
				}
				if( b == '+' ) {
					return parseFloat(a + c) + ext;	
				}
				if( b == '-' ) {
					return parseFloat(a - c) + ext;	
				}
				if( b == '*' ) {
					return parseFloat(a * c) + ext;	
				}
				if( b == '/' ) {
					return parseFloat(a / c) + ext;	
				}
			}
			
			return size;
				
		},
		
		calcHeight : null,
		calcWidth : null,
		
		setContainerSize : function(){
			var self = this,
				opt = self;
			
			var $parent = $(opt.renderTo);
				
			var width = self._parseSize( opt.width, $parent, 'w');
			
			var height = self._parseSize( opt.height, $parent, 'h');
			
			this.calcWidth = width;
			this.calcHeight = height;
			
			self.el.css({
				width : width,
				height : height	
			});	
			
			return self;
		},
		
		setViewSize : function(){},
		/**
		* 更新组建视图区域布局设置
		* @param {boolean} allowSubLayout 是否也同事重置子组件容器大小
		* 	- false则不重置，其他参数都会重置
		*/
		resetViewSize : function(allowSubLayout){
			var self = this;
				
			self.setViewSize();	
		
			if( allowSubLayout === false ) return this;
			
			if( this.deferUpdateSubLayout ) {
				Nex.defer(function(){
					self.updateSubLayout();		
				});
			} else {
				self.updateSubLayout();		
			}
			
			return this;
		},
		
		__lastMaxWidth : null,
		__lastMaxHeight : null,
		__lastMinWidth : null,
		__lastMinHeight : null,
		initMaxAndMinSize : function(){
			var self = this,
				opt = self;
				
			var $parent = $(opt.renderTo);	
			
			var maxWidth = self._parseSize( opt.maxWidth, $parent, 'w');
			var maxHeight = self._parseSize( opt.maxHeight, $parent, 'h');
			var minWidth = self._parseSize( opt.minWidth, $parent, 'w');
			var minHeight = self._parseSize( opt.minHeight, $parent, 'h');
		
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
					Nex.each( style, function(value, method){
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
				opt = self;
			if( opt.width === w ) return this;
			opt.width = w;	
			self.resize();	
			return this;
		},
		
		setHeight : function(h){
			var self = this,
				opt = self;
			if( opt.height === h ) return this;	
			opt.height = h;		
			self.resize();	
			return this;
		},
		
		getWidth : function(){
			var width = parseFloat(this.el.css('width'));	
			//如果this.lastWidth 还没初始化 则初始化它
			if( this.lastWidth === null ) {
				//注：此处可以用outerWidth ,因为我们用的是border-box 所以直接用css获取
				this.lastWidth = width;	
			}
			return width;	
		},
		
		getHeight : function(){
			var height = parseFloat(this.el.css('height'));	
			//如果this.lastHeight 还没初始化 则初始化它
			if( this.lastHeight === null ) {
				//注：此处可以用outerHeight ,因为我们用的是border-box 所以直接用css获取
				this.lastHeight = height;	
			}
			return height;	
		},
		
		getFocusEl: function(){
			return this.el;	
		},
		
		triggerFocus: function(){
			if( this.isFocusable() && !this.$isFocus ) {	
				this.onFocus();
				this.fireEvent('onFocus');
				this.$isFocus = true;
			}	
		},
		
		triggerBlur: function(){
			if( this.$isFocus ) {	
				this.onBlur();
				this.fireEvent('onBlur');
				this.$isFocus = false;
			}		
		},
		
		setFocus: function(){
			Nex.Manager.focusEl( document.getElementById(this.id) );		
		},
		setBlur: function(){
			Nex.Manager.blurEl( document.getElementById(this.id) );
		},
		focus : function(){
			this.setFocus();
			
			var focusEl = this.getFocusEl();
			
			focusEl.trigger('focus', [true]);
			
			return this;
		},
		
		blur : function(){
			this.setBlur();
			
			var focusEl = this.getFocusEl();
			
			focusEl.trigger('blur', [true]);
			
			return this;		
		},
		
		_setTabIndexEvent: function(){
			var self = this;
			//监听tab触发的focus
			if( this.tabIndex !== null && this.tabIndex >= 0 ) {
				var focusEl = this.getFocusEl();
				
				focusEl.focus(function(e, isTrigger){
					//调用self.focus时会触发 trigger('focus', [ true ])
					//isTrigger 存在则说明是自定义触发的的 此时self.focus 否则会出现死循环
					if( !isTrigger ) {// Tab or mousedown
						self.setFocus();
					} else {// call focus()
						//不需要做处理
					}
				});	
			}		
		},
		
		onFocus: function(){},
		onBlur: function(){},
		
		setMaxWidth : function(w){
			var opt = this;
			
			if( opt.maxWidth === w ) return this;	
			
			opt.maxWidth = w;
			
			this.resize();	
			
			return this;
		},
		
		setMaxHeight : function(w){
			var opt = this;
			
			if( opt.maxHeight === w ) return this;	
			
			opt.maxHeight = w;
			
			this.resize();	
			
			return this;	
		},
		
		setMinWidth : function(w){
			var opt = this;
			
			if( opt.minWidth === w ) return this;	
			
			opt.minWidth = w;
			
			this.resize();	
			
			return this;		
		},
		
		setMinHeight : function(w){
			var opt = this;
			
			if( opt.minHeight === w ) return this;	
			
			opt.minHeight = w;
			
			this.resize();	
			
			return this;		
		},
		
		getContainer : function(){
			var self = this,
				opt = self;
			return this.views['container'];	
		},
		
		getBody : function(){
			var self = this,
				opt = self;
			return this.views['container'];
		},
		_disableSelection : function(){
			this.el.disableSelection();	
		},
		//判断当前对象是否还存在
		isExists : function(){
			var self = this,
				dom = self.getDom();
				
			if( dom && dom.length ) {
				return true;	
			} else {
				if( self.autoDestroy ) {
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
		addComponent : function(items, def, renderTo, noDef){
			var self = this,
				opt = self,
				undef;
				
			var renderTo = renderTo || self.getBody();	
			
			var def = noDef ? {} : Nex.extend({ xtype : opt.defaultType }, def || {});
			
			if( Nex.isFunction( items ) 
				&& !Nex.isClass( items ) 
				&& !Nex.isCreator( items ) ) {
				items = items.call( self,renderTo );
			}
			
			var components = [];
			
			var items = Nex.isArray( items ) ? items : [items];
			
			Nex.each( items, function(d, i){
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
					d = Nex.extend( {}, def, d );	
				}
				
				if( Nex.isInstance( d ) ) {
					if( !d.isRendered() ) {
						d.render( renderTo );
					} else {
						if( d.el ) {
							renderTo.append( d.el );
							d.refreshParent();
						}
					}
					
					components.push( d );
					
				} else if( Nex.isClass( d ) ){
					components.push(d.create({
						renderTo : renderTo	
					}));	
				} else if( Nex.isXType( d ) ){
					var cmp = Nex.Create( Nex.extend({}, d, { renderTo : renderTo, autoRender:true }) );
					if( cmp ) {
						components.push( cmp );	
					}
				} else if( Nex.isCreator( d ) ) {
					var cmp = d( Nex.extend({}, d, { renderTo : renderTo, autoRender:true }) );
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
			var opt = this;
			var items = [].slice.apply(arguments)
			if( this.rendered ) {
				var bd = this.getBody();
				this.addComponent( items, opt.defaults, bd  );
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
			var opt = this;
			var el = this.el;
			if( !el ) {
				el = $('#'+opt.id);
				el = el.length ? el : null;	
			}
			
			if( !el ) return null;
			
			var node = el[0];
			var containedByNode = node.ownerDocument.documentElement;
			
            while (node && node != containedByNode) {
                node = node.parentNode;
            }
			
			return node ? el : null;
		},
		getEl : function(){
			return this.el;	
		},
		getWrapper : function(){
			return this.el;	
		},
		getChildren : function(){
			var opt = this;
			return Nex.Manager.getChildren( opt.id );
		},
		getAllChildren : function(){
			var opt = this;
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