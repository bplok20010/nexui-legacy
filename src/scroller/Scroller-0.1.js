define(function(require){
	
	var Nex = require('../Nex');
	
	var EventObject = require('../EventObject');
	
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
				//可选值 hidden auto
				hScroll : true,
				vScroll : true,
				vScrollCls : '',
				vScrollBarCls : '',
				hScrollCls : '',
				hScrollBarCls : '',
				//如果大于0 则 滚动按钮不自动计算
				vScrollBarHeight : 0,
				hScrollBarWidth : 0,
				
				//垂直/水平滚动条的最小/大高度
				vScrollBarMinHeight : 6,
				vScrollBarMaxHeight : 99999,
				hScrollBarMinWidth : 6,
				hScrollBarMaxWidth : 99999,
				
				//默认滚动wheel时 滚动垂直滚动条 可选值 v h
				wheelDir : 'v',
				
				//水平滚动条
				hBarEl : null,
				//垂直滚动条
				vBarEl : null,
				//滚动条大小
				barSize : 7,
				//是否自动生成一个wrapper
				autoWrapper : false,
				wrapperCls : '',
				//滚动一次时内容滚动的距离
				wheelStep : 20,
				//是否允许末端相互覆盖
				enableOverlay : false
			};
		},
		
		onStart : function(){},
		
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
			
			this._el = this.el[0];
			
			this.onStart();
			
			this.fireEvent("onStart");
			
			this.initScroller();
			
		},
		
		initScroller: function(){
			var el = this.el,
				hasVerticalScrollBar = this.hasVerticalScrollBar(),
				hasHorizontalScrollBar = this.hasHorizontalScrollBar();
				
			if( this.autoWrapper ) {
				var wrapper = this.createWrapper();
				this.el.wrap(wrapper);
				this.fireEvent('onWrapperCreate', wrapper);
			}	
			
			if (hasVerticalScrollBar) {
				Nex.map(this.createVerticalScroller(), function(s){
					$(el).after(s);	
				});	
			}
			
			if (hasHorizontalScrollBar) {
				Nex.map(this.createHorizontalScroller(), function(s){
					$(el).after(s);	
				});	
			}
			
			if (hasVerticalScrollBar) {
				this.setVerticalScrollBarPos();
				this.setVerticalScrollBarSize();
				this.setVerticalScrollStep();
			}
			
			if (hasHorizontalScrollBar) {
				this.setHorizontalScrollBarPos();	
				this.setHorizontalScrollBarSize();
				this.setHorizontalScrollStep();
			}
			
			this.initScrollEvents();
			
		},
		
		initScrollEvents : function(){
			var el = this.el;
			var self = this;
			var step = this.wheelStep;
			var wheelDir = this.wheelDir;
			
			el.bind('mousewheel.' + this.id, function(e, delta, deltaX, deltaY){
				if( wheelDir == 'v' ) {
					self.scrollToY( deltaY > 0 ? (el.scrollTop() - step) : (el.scrollTop() + step) );
				} else {
					self.scrollToX( deltaY > 0 ? (el.scrollLeft() - step) : (el.scrollLeft() + step) );	
				}
				
			});
		},
		
		createWrapper : function(){
			return $('<div class="nex-scroller-wrapper">');	
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
		
		scrollToElement : function(){
				
		},
		
		scrollToX : function(destX){
			var el = this.el;
			var hStep = this.curHBarStep;
			var hBar = this.views['hScrollBar'];
			var wheelDir = this.wheelDir;
			
			el.scrollLeft(destX);
			
			hBar.css('left', this. hBarStart + hStep * el.scrollLeft());	
			
			return this;	
		},
		
		scrollToY : function(destY){
			var el = this.el;
			var vStep = this.curVBarStep;
			var vBar = this.views['vScrollBar'];
			var wheelDir = this.wheelDir;
			
			el.scrollTop(destY);
			
			vBar.css('top', this.vBarStart + vStep * el.scrollTop());
			
			return this;		
		},
		
		scrollBy : function(x, y){
			var el = this.el;
			var vStep = this.curVBarStep;
			var hStep = this.curHBarStep;
			var vBar = this.views['vScrollBar'];
			var hBar = this.views['hScrollBar'];
			var wheelDir = this.wheelDir;
			
			el.scrollTop(y);
			el.scrollLeft(x);
			
			if( wheelDir == 'h' ) {
				vBar.css('top', vStep * el.scrollTop());
			} else {
				hBar.css('left', hStep * el.scrollLeft());	
			}
			return this;	
		},
		/*
		scrollableX : function(){
			return this.getScrollWidth() > this.getClientWidth();			
		},
		
		scrollableY : function(){
			return this.getScrollHeight() > this.getClientHeight();	
		},
		*/
		hasVerticalScrollBar : function(){
			return this.vScroll	&& this.getScrollHeight() > this.getClientHeight();
		},
		
		hasHorizontalScrollBar : function(){
			return this.hScroll	&& this.getScrollWidth() > this.getClientWidth();
		},
		
		curVBarSize : null,
		curVBarStep : null,
		vBarStart : 0,
		vScrollHeight : 0,
		setVerticalScrollBarPos : function(){
			var top = this._el.offsetTop + (parseInt(this.el.css('borderTopWidth')) || 0);
			var left = this._el.offsetLeft
						+ this.el.outerWidth()  
						- this.barSize
						- (parseInt(this.el.css('borderRightWidth')) || 0);
		
			this.views['vScroll'].css({
				top: top,
				left : left
			});
			this.views['vScrollBar'].css({
				top: top,
				left : left
			});
			//记录当前滚动条的初始位置
			this.vBarStart = top;
		},
		setVerticalScrollBarSize : function(){
			var vScroll = this.views['vScroll'];
			var vScrollBar = this.views['vScrollBar'];
			var height = this.getClientHeight() - ( !this.enableOverlay && this.hasHorizontalScrollBar() ? this.barSize : 0 );
			var scrollHeight = this.getScrollHeight();
			
			vScroll.css('height', height);
			
			var size = this.vScrollBarHeight > 0 ? this.vScrollBarHeight  : 
				Math.min(Math.max(this.vScrollBarMinHeight, height/scrollHeight * height), this.vScrollBarMaxHeight);
			
			vScrollBar.css('height', size);
			//记录当前滚动按钮的高度
			this.curVBarSize = size;
			//记录当前滚动条的高度
			this.vScrollHeight = height;
			
			return size;	
		},
		setVerticalScrollStep : function(){
			var el = this._el;
			var height = this.vScrollHeight - this.curVBarSize;
			var sh = el.scrollHeight - el.clientHeight;
			
			this.curVBarStep = height/sh;
			
			return this.curVBarStep;	
		},
		
		curHBarSize : null,
		curHBarStep : null,
		hBarStart : 0,
		hScrollWidth : 0,
		setHorizontalScrollBarPos : function(){
			var left = this._el.offsetLeft + (parseInt(this.el.css('borderLeftWidth')) || 0);	
			var top = this._el.offsetTop
						+ this.el.outerHeight()  
						- this.barSize
						- (parseInt(this.el.css('borderBottomWidth')) || 0);;
			this.views['hScroll'].css({
				left : left,
				top : top	
			});
			this.views['hScrollBar'].css({
				left : left,
				top : top	
			});
			
			//记录当前滚动条的初始位置
			this.hBarStart = left;
		},
		setHorizontalScrollBarSize : function(){
			var hScroll = this.views['hScroll'];
			var hScrollBar = this.views['hScrollBar'];
			var width = this.getClientWidth() - ( !this.enableOverlay && this.hasVerticalScrollBar() ? this.barSize : 0 );
			var scrollWidth = this.getScrollWidth();
			
			hScroll.css('width', width);
			
			var size = this.hScrollBarWidth > 0 ? this.hScrollBarWidth : 
				Math.min(Math.max(this.hScrollBarMinWidth, width/scrollWidth * width), this.hScrollBarMaxWidth);
				
			hScrollBar.css('width', size);
			
			this.curHBarSize = size;
			
			this.hScrollWidth = width;
			
			return size;	
		},
		setHorizontalScrollStep : function(){
			var el = this._el;
			var width = this.hScrollWidth - this.curHBarSize;
			var sw = el.scrollWidth - el.clientWidth;
			
			this.curHBarStep = width/sw;
			
			return this.curHBarStep;	
		},
		
		_hasSetV : false,
		createVerticalScroller : function(){
			if( this._hasSetV ) {
				return [this.views['vScroll'], this.views['vScrollBar']];	
			}
			
			var $vScroll = $('<div class="nex-scroller nex-vscroll-wrap '+ this.vScrollCls +'" />');
			var $vScrollBar	= $('<div class="nex-scroller nex-vscroll-bar '+ this.vScrollBarCls +'" />');
			
			$vScroll.css('width', this.barSize);
			$vScrollBar.css('width', this.barSize);
			
			this.views['vScroll'] = $vScroll;
			this.views['vScrollBar'] = $vScrollBar;
			
			this.fireEvent('onVerticalScrollerCreate', $vScroll, $vScrollBar);
			
			this._hasSetV = true;
			
			return [$vScroll, $vScrollBar];
		},
		_hasSetH : false,
		createHorizontalScroller : function(){
			if( this._hasSetH ) {
				return [this.views['hScroll'], this.views['hScrollBar']];	
			}
			
			var $hScroll = $('<div class="nex-scroller nex-hscroll-wrap  '+ this.hScrollCls +'" />');
			var $hScrollBar	= $('<div class="nex-scroller nex-hscroll-bar  '+ this.hScrollBarCls +'" />');
			
			$hScroll.css('height', this.barSize);
			$hScrollBar.css('height', this.barSize);
			
			this.views['hScroll'] = $hScroll;
			this.views['hScrollBar'] = $hScrollBar;
			
			this.fireEvent('onHorizontalScrollerCreate', $hScroll, $hScrollBar);
			
			this._hasSetH = true;
			
			return [$hScroll, $hScrollBar];
		},
		
		reset : function(){
				
		},
		
		/**
		* @Overview
		*/
		destroy : function(){
			
			this.onDestroy();
			
			this.fireEvent('onDestroy');
			
			return this;
		},
		
		onDestroy: function(){}
		
	});
	
	return scroller;
});