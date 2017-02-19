/**

*/

define(function(require){
	var Nex = require('../Nex');
	var EventObject = require('../EventObject');
	var ScrollBar = require('./ScrollBar');
	
	var scroller = Nex.Class('Nex.scroller.Scroller', EventObject, {
		$service : true,
		/**
		* @private
		*/
		xtype : 'scroller',
		
		/**
		* @config
		*/
		config : function(){
			return {
				//需要添加滚动条的元素
				el : null,
				
				hScroll : true,
				vScroll : true,
				
				scrollCls : '',
				
				vScrollBarOptions : {},
				hScrollBarOptions : {},
				
				//滚动条距离右侧或者下侧边缘的距离
				vScrollBarTopEdge : 0,
				vScrollBarRightEdge : 0,
				hScrollBarLeftEdge : 0,
				hScrollBarBottomEdge : 0,
				
				//默认滚动wheel时 滚动垂直滚动条 可选值 v h
				wheelDir : 'v',
				//滚动一次时内容滚动的距离
				wheelStep : 20,
				//滚动条大小
				barSize : 7,
				//是否自动生成一个wrapper
				autoWrapper : false,
				wrapperCls : ''
			};
		},
		
		curZIndex : 'auto',
		
		onStart : function(){},
		
		vScrollBar : null,
		hScrollBar : null,
		
		constructor : function(){
			this.views = {};
			
			this._super( arguments );
			
			this.id = Nex.uuid();
			
			if( !this.el ) {
				throw new Error("Invalid parameter el");	
			}
			
			this.el = $(this.el);
			
			if( !this.el.length ) {
				throw new Error("Invalid parameter el");		
			}
			
			$._save( this.el, ['overflow'] );
			
			this.el.css('overflow', 'hidden');
			
			this._el = this.el[0];
			
			this.curZIndex = this.el.css('zIndex');
			
			this.onStart();
			
			this.fireEvent("onStart");
			
			this.initScrollBar();
			
			this.initScrollEvents();
			
			this.fireEvent('onCreate');
		},
		
		initScrollBar: function(){
			var el = this.el, self = this,
				hasVerticalScrollBar = this.hasVerticalScrollBar(),
				hasHorizontalScrollBar = this.hasHorizontalScrollBar();
				
			if( this.autoWrapper ) {
				var wrapper = this.createWrapper();
				this.el.wrap(wrapper);
				this.fireEvent('onWrapperCreate', wrapper);
			}	
			
			if (hasVerticalScrollBar) {
				this.createScrollBar('v');	
				this.initVerticalScrollBar();
				this.createVScrollBar();
			}
			
			if (hasHorizontalScrollBar) {
				this.createScrollBar('h');	
				this.initHorizontalScrollBar();
				this.createHScrollBar();
			}
			
		},
		
		createVScrollBar : function(){
			var self = this;
			if( self.vScrollBar ) return self.vScrollBar;
			
			self.vScrollBar = ScrollBar.create(Nex.extend({
				enableWheel : self.wheelDir == 'v',
				wheelStep : this.wheelStep
			}, self.vScrollBarOptions, {
				el : self.el,
				scrollType : 'v',
				renderTo : self.$vScrollBar,
				'onScrollEnd._scr_' : function(){
					self.fireEvent('onVerticalScrollEnd');	
				}
			}));
			
			return self.vScrollBar;	
		},
		createHScrollBar : function(){
			var self = this;
			if( self.hScrollBar ) return self.hScrollBar;
			
			self.hScrollBar = ScrollBar.create(Nex.extend({
				enableWheel : self.wheelDir == 'h',
				wheelStep : self.wheelStep
			}, this.vScrollBarOptions, {
				el : self.el,
				scrollType : 'h',
				renderTo : self.$hScrollBar,
				'onScrollEnd._scr_' : function(){
					self.fireEvent('onHorizontalScrollEnd');	
				}
			}));	
			
			return self.hScrollBar;	
		},
		
		initScrollEvents : function(){
			var self = this;
			
			self.el.on('scroll.'+ self.id, function(e){
				
				self.fireEvent('onScroll');
				
			});		
		},
		
		getScrollHeight : function(){
			return this._el.scrollHeight;	
		},
		getClientHeight : function(){
			return this._el.clientHeight;	
		},
		getScrollWidth : function(){
			return this._el.scrollWidth;	
		},
		getClientWidth : function(){
			return this._el.clientWidth;	
		},
		
		hasVerticalScrollBar : function(){
			return this.vScroll	&& this.getScrollHeight() > this.getClientHeight();
		},
		
		hasHorizontalScrollBar : function(){
			return this.hScroll && this.getScrollWidth() > this.getClientWidth();
		},
		
		createWrapper : function(){
			return $('<div class="nex-scroller-wrapper">');	
		},
		
		// v or h
		createScrollBar : function(type){
			var isVert = type == 'v';
			var var_el = '$'+type+'ScrollBar';
			
			if( this[var_el] ) {
				return this[var_el];	
			}
			
			var $scrollBar = $('<div class="nex-scroller nex-scroller-'+(isVert ?　'vertical'　: 'horizontal')+' '+ this.scrollCls +'" />');
			
			$scrollBar.css(isVert ? 'width' : 'height', this.barSize);
			
			if( this.curZIndex != 'auto' ) {
				$scrollBar.css('zIndex', parseInt(this.curZIndex) + 1);	
			}
			
			this.fireEvent('onCreateScrollBarWrap', type, $scrollBar);
			
			this[var_el] = $scrollBar;
			
			this.el.after($scrollBar);
			
			return $scrollBar;
		},
		
		/**
		* 设置垂直滚动条的位置以及滚动条比例
		*/
		initVerticalScrollBar : function(){
			this.setVerticalScrollBarPos();
			this.setVerticalScrollBarSize();
			return this;	
		},
		/**
		* 设置垂直滚动条的位置以及滚动条比例
		*/
		initHorizontalScrollBar : function(){
			this.setHorizontalScrollBarPos();
			this.setHorizontalScrollBarSize();
			
			return this;	
		},
		setVerticalScrollBarPos : function(){
			var top = this._el.offsetTop + (parseInt(this.el.css('borderTopWidth')) || 0);
			var left = this._el.offsetLeft
						+ this.el.outerWidth()  
						- this.barSize
						- (parseInt(this.el.css('borderRightWidth')) || 0);
			var pos = {
				top: top + this.vScrollBarTopEdge,
				left : left	- this.vScrollBarRightEdge
			};				
		
			this.$vScrollBar.css(pos);
		},
		setVerticalScrollBarSize : function(){
			var $vScrollBar = this.$vScrollBar;
			
			var clientHeight = this.getClientHeight();
			
			var barHeight = clientHeight - ( this.hasHorizontalScrollBar() ? this.barSize : 0 ) - this.vScrollBarTopEdge * 2;
			
			$vScrollBar.css('height', barHeight);
			
		},
		setHorizontalScrollBarPos : function(){
			var left = this._el.offsetLeft + (parseInt(this.el.css('borderLeftWidth')) || 0);	
			var top = this._el.offsetTop
						+ this.el.outerHeight()  
						- this.barSize
						- (parseInt(this.el.css('borderBottomWidth')) || 0);
						
			var pos = {
				top: top - this.hScrollBarBottomEdge,
				left : left	+ this.hScrollBarLeftEdge
			};	
		
			this.$hScrollBar.css(pos);
			
		},
		setHorizontalScrollBarSize : function(){
			var $hScrollBar = this.$hScrollBar;
			
			var clientWidth = this.getClientWidth();
			var barWidth = clientWidth - ( this.hasVerticalScrollBar() ? this.barSize : 0 ) - this.hScrollBarLeftEdge * 2;
			
			$hScrollBar.css('width', barWidth);
		},
		
		updateScrollBar : function(){
			if( this.vScrollBar ) {
				this.$vScrollBar[this.hasVerticalScrollBar() ? 'show' : 'hide']();
				this.initVerticalScrollBar();
				this.vScrollBar.refresh();	
			} else {
				if( this.hasVerticalScrollBar() ) {
					this.createScrollBar('v');	
					this.initVerticalScrollBar();
					this.createVScrollBar();
				}	
			}
			if( this.hScrollBar ) {
				this.$hScrollBar[this.hasHorizontalScrollBar() ? 'show' : 'hide']();
				this.initHorizontalScrollBar();
				this.hScrollBar.refresh();		
			} else {
				if( this.hasHorizontalScrollBar() ) {
					this.createScrollBar('h');	
					this.initHorizontalScrollBar();
					this.createHScrollBar();	
				}	
			}
			
			return this;
		},
		
		refresh : function(){
			return this.updateScrollBar();
		},
		
		scrollLeft : function(){
			var $el = $(this.el);
			return $el.scrollLeft.apply($el, arguments);	
		},
		
		scrollTop : function(){
			var $el = $(this.el);
			return $el.scrollTop.apply($el, arguments);
		},
		
		/**
		* @Overview
		*/
		destroy : function(){
			if( this.vScrollBar ) {
				this.$vScrollBar.remove();
				this.vScrollBar.destroy();	
			}
			if( this.hScrollBar ) {
				this.$hScrollBar.remove();
				this.hScrollBar.destroy();	
			}
			
			this.onDestroy();
			
			this.fireEvent('onDestroy');
			
			return this;
		},
		
		onDestroy: function(){}
		
	});
	
	return scroller;
});