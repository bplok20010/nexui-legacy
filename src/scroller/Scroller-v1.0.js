/**
待完成事项：
 - scrollbar 自动检测机制
 - scrollbar 事件比如mousewheel目前没实现 以及click...
 - 是否需要实现scrollbar icon up down
 - updateScrollBar 目前的根据获取容器scrollLeft scrollTop来定位位置，是否需要提供额外参数来区别是使用之前的位置还是容器的位置
 - 是否需要绑定容器的scroll事件来同步，否则当用户直接调用容器的scroll api时会不同步
*/

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
				
				hideToRemove : false,
				
				//可选值 hidden auto
				hScrollBar : true,
				vScrollBar : true,
				//滚动条样式
				vScrollBarCls : '',
				vScrollBarTrackCls : '',
				vScrollBarFaceCls : '',
				hScrollBarCls : '',
				hScrollBarTrackCls : '',
				hScrollBarFaceCls : '',
				//如果大于0 则 滚动按钮不自动计算
				vScrollBarFaceHeight : 0,
				hScrollBarFaceWidth : 0,
				
				//垂直/水平滚动条的最小/大高度
				vScrollBarFaceMinHeight : 16,
				vScrollBarFaceMaxHeight : 99999,
				hScrollBarFaceMinWidth : 16,
				hScrollBarFaceMaxWidth : 99999,
				//隐藏ScrollBarTrack
				hideScrollBarTrack : false,
				//滚动条距离右侧或者下侧边缘的距离
				vScrollBarTopEdge : 0,
				vScrollBarRightEdge : 0,
				hScrollBarLeftEdge : 0,
				hScrollBarBottomEdge : 0,
				
				showScrollBarFn : null,
				hideScrollBarFn : null,
				
				//动画效果
				animateScroll	: false,
				animateDuration	: 300,
				animateEase		: 'linear',
				//默认滚动wheel时 滚动垂直滚动条 可选值 v h
				wheelDir : 'v',
				//滚动一次时内容滚动的距离
				wheelStep : 20,
				//滚动条大小
				barSize : 7,
				//是否自动生成一个wrapper
				autoWrapper : false,
				wrapperCls : '',
				//是否允许末端相互覆盖
				enableOverlay : false,
				//滚到到底部时不阻止默认事件
				enablePreventDefaultOnEnd : true
			};
		},
		
		curZIndex : 'auto',
		
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
			
			$._save( this.el, ['overflow'] );
			
			this.el.css('overflow', 'hidden');
			
			this._el = this.el[0];
			
			this.curZIndex = this.el.css('zIndex');
			
			this.onStart();
			
			this.fireEvent("onStart");
			
			this.initScrollBar();
			
			this.initScrollBarFacePos();
			
			this.fireEvent('onCreate');
		},
		
		initScrollBar: function(){
			var el = this.el,
				hasVerticalScrollBar = this.hasVerticalScrollBar(),
				hasHorizontalScrollBar = this.hasHorizontalScrollBar();
				
			if( this.autoWrapper ) {
				var wrapper = this.createWrapper();
				this.el.wrap(wrapper);
				this.fireEvent('onWrapperCreate', wrapper);
			}	
			
			if (hasVerticalScrollBar) {
				this.createVerticalScrollBar();	
			}
			
			if (hasHorizontalScrollBar) {
				this.createHorizontalScrollBar();	
			}
			
			if (hasVerticalScrollBar) {
				//this.setVerticalScrollBarPos();
				//this.setVerticalScrollBarSize();
				this.initVerticalScrollBar();
			}
			
			if (hasHorizontalScrollBar) {
				
				this.initHorizontalScrollBar();
				//this.setHorizontalScrollBarPos();	
				//this.setHorizontalScrollBarSize();
			}
			
			this.initScrollEvents();
			
		},
		
		initScrollEvents : function(){
			var el = this.el;
			var self = this;
			var step = this.wheelStep;
			var wheelDir = this.wheelDir;
			var defNoop = function(e){
				e.preventDefault();		
			};
			var noop = function(){};
			//滚到到尽头后 下一次滚动不需要禁用默认行为
			var nextEnd = defNoop;
			var lastDir = 1;
			
			el.bind('mousewheel.' + this.id, function(e, delta, deltaX, deltaY){
				var curDir = deltaY > 0 ? 1 : -1;
				if( lastDir != curDir ) {
					lastDir = curDir;
					nextEnd = defNoop;	
				}
				
				if( wheelDir == 'v' ) {
					self.scrollToY( deltaY > 0 ? (self.scrollTop() - step) : (self.scrollTop() + step) );
				} else {
					self.scrollToX( deltaY > 0 ? (self.scrollLeft() - step) : (self.scrollLeft() + step) );	
				}
				
				if( self.enablePreventDefaultOnEnd ) {
					var isEnd = wheelDir == 'v' ? 
						(deltaY > 0 ? self.scrollTop() <= 0 : self.isScrollTopEnd() ) : 
						(deltaY > 0 ? self.scrollLeft() <= 0: self.isScrollLeftEnd() );
						
					if( !isEnd ) {
						e.preventDefault();
						nextEnd = defNoop;
					} else {
						nextEnd(e);
						
						nextEnd = noop;	
					}
				} else {
					e.preventDefault();
				}
			});
		},
		
		initScrollBarFacePos : function(){
			var sLeft = this.el.scrollLeft();
			var sTop = this.el.scrollTop();
	
			if( sLeft > 0 || sTop > 0 ) {
				this.scrollBy( sLeft > 0 ? sLeft : null, sTop > 0 ? sTop : null )	
			}
		},
		
		createWrapper : function(){
			return $('<div class="nex-scroller-wrapper">');	
		},
		
		_sHeight : null,
		getScrollHeight : function(){
			if( this._sHeight !== null ) return this._sHeight;
			return this._sHeight = this._el.scrollHeight;	
		},
		_cHeight : null,
		getClientHeight : function(){
			if( this._cHeight !== null ) return this._cHeight;
			return this._cHeight = this._el.clientHeight;	
		},
		_sWidth : null,
		getScrollWidth : function(){
			if( this._sWidth !== null ) return this._sWidth;
			return this._sWidth = this._el.scrollWidth;	
		},
		_cWidth : null,
		getClientWidth : function(){
			if( this._cWidth !== null ) return this._cWidth;
			return this._cWidth = this._el.clientWidth;	
		},
		
		scrollToElement : function(){
				
		},
		
		_lockScroll : false,
		_lastX : 0,
		scrollToX : function(destX, animate){
			var el = this.el;
			var hStep = this.curHBarFaceStep;
			var hBar = this.views['hScrollBarFace'];
			var destX = Math.min(Math.max(0, destX), this.getScrollWidth() - this.getClientWidth());
			
			var sLeft = this.scrollContentX(destX, animate);
			
			if( sLeft === this._lastX ) return this;
			 
			this._lastX = sLeft;
	
			this.setHorizontalScrollBarFacePos(this._lastX);
			
			if( this.isScrollLeftEnd() ) {
				this.fireEvent('onScrollLeftEnd', this.scrollLeft(), this.scrollTop());		
			}
			
			if( !this._lockScroll ) {
				this.fireEvent('onScroll', this.scrollLeft(), this.scrollTop());	
			}
			
			return this;	
		},
		
		scrollLeft : function(destX, animate){
			if( destX !== void 0 ) {
				return this.scrollToX(destX, animate);	
			}	
			
			return this._lastX;
		},
		
		isScrollLeftEnd : function(){
			var end = this.getScrollWidth() - this.getClientWidth();
			
			return this.scrollLeft() >= end;	
		},
		
		_lastY : 0,
		scrollToY : function(destY, animate){
			var el = this.el;
			var vStep = this.curVBarFaceStep;
			var vBar = this.views['vScrollBarFace'];
			var destY = Math.min(Math.max(0, destY), this.getScrollHeight() - this.getClientHeight());
			
			var sTop = this.scrollContentY(destY, animate);
			
			if( sTop === this._lastY ) return this;
			
			this._lastY = sTop;
			
			this.setVerticalScrollBarFacePos(this._lastY, animate);
			
			if( this.isScrollTopEnd() ) {
				this.fireEvent('onScrollTopEnd', this.scrollLeft(), this.scrollTop());		
			}
			
			if( !this._lockScroll ) {
				this.fireEvent('onScroll', this.scrollLeft(), this.scrollTop());	
			}
			
			return this;		
		},
		
		scrollTop : function(destY, animate){
			if( destY !== void 0 ) {
				return this.scrollToY(destY, animate);	
			}	
			
			return this._lastY;
		},
		
		isScrollTopEnd : function(){
			var end = this.getScrollHeight() - this.getClientHeight();
			
			return this.scrollTop() >= end;	
		},
		
		scrollBy : function(x, y, animate){
			var emitEvent = false;
			
			this._lockScroll = true;
			
			if( (x !== null || x !== void 0) && x !== this.scrollLeft() ) {
				this.scrollLeft(x, animate);	
				emitEvent = true;
			}
			if( (y !== null || y !== void 0) && y !== this.scrollTop() ) {
				this.scrollTop(y, animate);
				emitEvent = true;	
			}
			
			this._lockScroll = false;
			
			if( emitEvent ) {
				this.fireEvent('onScroll', this.scrollLeft(), this.scrollTop());
			}
			
			return this;	
		},
	
		hasVerticalScrollBar : function(){
			return this.vScrollBar	&& this.getScrollHeight() > this.getClientHeight();
		},
		
		hasHorizontalScrollBar : function(){
			return this.hScrollBar && this.getScrollWidth() > this.getClientWidth();
		},
		
		scrollContentX : function(x, animate){
			var animate = animate === void 0 ? this.animateScroll : animate;
			
			if( animate ) {
				this.el.stop(true, true).animate({
					scrollLeft : x	
				}, this.animateDuration, this.animateEase);
				
				return x;	
			}
			
			this.el.scrollLeft(x);
			
			return this.getContentScrollLeft();
		},
		
		getContentScrollLeft : function(){
			return this.el.scrollLeft();
		},
		
		scrollContentY : function(y, animate){
			var animate = animate === void 0 ? this.animateScroll : animate;
			
			if( animate ) {
				this.el.stop(true, true).animate({
					scrollTop : y	
				}, this.animateDuration, this.animateEase);
				
				return y;	
			}
			
			this.el.scrollTop(y);
			
			return this.getContentScrollTop();
		},
		
		getContentScrollTop : function(){
			return this.el.scrollTop();
		},
		
		
		clearScrollBar : function(bar){
			if( bar == 'v' ) {
				this._isVBarShow = true;
				this._hasSetV = false;
				if( this.views['vScrollBar'] ) {
					this.views['vScrollBar'].remove();	
				}
			} else {
				this._isHBarShow = true;
				this._hasSetH = false;
				if( this.views['hScrollBar'] ) {
					this.views['hScrollBar'].remove();	
				}	
			}
		},
		
		curVBarFaceHeight : null,
		curVBarFaceStep : null,
		vBarStart : 0,
		curVBarTrackHeight : 0,
		
		/**
		* 设置垂直滚动条的位置以及滚动条比例
		*/
		initVerticalScrollBar : function(){
			this.setVerticalScrollBarPos();
			this.setVerticalScrollBarSize();
			
			return this;	
		},
		/**
		* 更新当前滚动条比例
		*/
		updateVerticalScrollBar : function(){
			
			if( !this._hasSetV ) {
				return this;	
			}
			
			var hasVerticalScrollBar = this.hasVerticalScrollBar();
			
			if( !hasVerticalScrollBar ) {
				if( this._isVBarShow ) {
					this.hideVerticalScrollBar();	
				}
			} else {
				if( !this._isVBarShow ) {
					this.showVerticalScrollBar();		
				}
				this.initVerticalScrollBar();
				//this.setVerticalScrollBarFacePos( this.scrollTop() );
				this.scrollTop( this.getContentScrollTop() );
			}
			
			return this;
		},
		
		_isVBarShow : true,
		showVerticalScrollBar : function(){
			var self = this;
			var vScrollBar = this.views['vScrollBar'];	
			
			this._isVBarShow = true;
			
			function cb(){
				self.fireEvent('onScrollBarShow', 'v');	
			}
			
			if( this.showScrollBarFn ) {
				this.showScrollBarFn(vScrollBar, cb);	
			} else {
				vScrollBar.show();	
				cb();
			}
		},
		
		hideVerticalScrollBar : function(){
			var self = this;
			var vScrollBar = this.views['vScrollBar'];
			
			function cb(){
				self.fireEvent('onScrollBarHide', 'v');	
				
				if( self.hideToRemove ) {
					self.clearScrollBar('v');
				}
			}
			
			this._isVBarShow = false;
				
			if( this.hideScrollBarFn ) {
				this.hideScrollBarFn(vScrollBar, cb);	
			} else {
				vScrollBar.hide();
				cb();
			}	
			
		},
		
		setVerticalScrollBarFacePos : function(y, animate){
			var animate = animate === void 0 ? this.animateScroll : animate;
			var y = y || 0;
			var vStep = this.curVBarFaceStep;
			var vScrollBarFace = this.views['vScrollBarFace'];
			
			y = Math.max(Math.min( this.getScrollHeight() - this.getClientHeight(), y ), 0);
			
			if( animate ) {
				vScrollBarFace.stop(true, true)
							  .animate({
								 top : this.vBarStart + vStep * y 	 
							   }, this.animateDuration, this.animateEasing);	
			} else {
				vScrollBarFace.css('top', this.vBarStart + vStep * y);
			}
			
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
						
			this.fireEvent('onBeforeSetVerticalScrollBarPos', pos);			
		
			this.views['vScrollBar'].css(pos);
			
			this.fireEvent('onSetVerticalScrollBarPos', pos, this.views['vScrollBar']);
			//记录当前滚动条的初始位置
			//this.vBarStart = top;
		},
		setVerticalScrollBarSize : function(){
			var vScrollBar = this.views['vScrollBar'];
			var vScrollBarTrack = this.views['vScrollBarTrack'];
			var vScrollBarFace = this.views['vScrollBarFace'];
			
			var clientHeight = this.getClientHeight();
			var scrollHeight = this.getScrollHeight();
			var barHeight = clientHeight - ( !this.enableOverlay && this.hasHorizontalScrollBar() ? this.barSize : 0 ) - this.vScrollBarTopEdge * 2;
			var barFaceHeight = this.vScrollBarFaceHeight > 0 ? this.vScrollBarFaceHeight  : 
				Math.min(Math.max(this.vScrollBarFaceMinHeight, clientHeight/scrollHeight * barHeight), this.vScrollBarFaceMaxHeight);
			var size = {
				barHeight   : barHeight,
				barTrackHeight : barHeight,
				barFaceHeight  : barFaceHeight	
			};	
			
			this.fireEvent('onBeforeSetVerticalScrollBarSize', size, vScrollBar, vScrollBarTrack, vScrollBarFace);
			
			vScrollBar.css('height', size.barHeight);
			vScrollBarTrack.css('height', size.barTrackHeight);
			vScrollBarFace.css('height', size.barFaceHeight);
			//记录当前滚动按钮的高度
			this.curVBarFaceHeight = size.barFaceHeight;
			//记录当前滚动条的高度
			this.curVBarTrackHeight = size.barTrackHeight;
			
			this.fireEvent('onSetVerticalScrollBarSize', size, vScrollBar, vScrollBarTrack, vScrollBarFace);
			
			//计算barFace滚动率
			this.curVBarFaceStep = ((this.curVBarTrackHeight - this.curVBarFaceHeight) / (scrollHeight - clientHeight)) || 0;
			
			return size.barFaceHeight;	
		},
		
		curHBarFaceWidth : null,
		curHBarFaceStep : null,
		hBarStart : 0,
		curHBarTrackWidth : 0,
		/**
		* 设置垂直滚动条的位置以及滚动条比例
		*/
		initHorizontalScrollBar : function(){
			this.setHorizontalScrollBarPos();
			this.setHorizontalScrollBarSize();
			
			return this;	
		},
		/**
		* 更新当前滚动条比例
		*/
		updateHorizontalScrollBar : function(){
			if( !this._hasSetH ) {
				return this;	
			}
			
			var hasHorizontalScrollBar = this.hasHorizontalScrollBar();
			
			if( !hasHorizontalScrollBar ) {
				if( this._isHBarShow ) {
					this.hideHorizontalScrollBar();	
				}
			} else {
				if( !this._isHBarShow ) {
					this.showHorizontalScrollBar();		
				}
				this.initHorizontalScrollBar();
				//this.setHorizontalScrollBarFacePos( this.scrollLeft() );
				this.scrollLeft( this.getContentScrollLeft() );
			}
			
			return this;
		},
		
		_isHBarShow : true,
		showHorizontalScrollBar : function(){
			var self = this;
			var hScrollBar = this.views['hScrollBar'];
			
			function cb(){
				self.fireEvent('onScrollBarShow', 'h');	
			}
			
			this._isHBarShow = true;	
			
			if( this.showScrollBarFn ) {
				this.showScrollBarFn(hScrollBar, cb);	
			} else {
				hScrollBar.show();	
				cb();
			}
		},
		
		hideHorizontalScrollBar : function(){
			var self = this;
			var hScrollBar = this.views['hScrollBar'];	
			
			function cb(){
				self.fireEvent('onScrollBarHide', 'h');	
				
				if( self.hideToRemove ) {
					self.clearScrollBar('h');
				}
			}
			
			this._isHBarShow = false;
			
			if( this.hideScrollBarFn ) {
				this.hideScrollBarFn(hScrollBar, cb);	
			} else {
				hScrollBar.hide();	
				cb();
			}
		},
		
		setHorizontalScrollBarFacePos : function(x, animate){
			var animate = animate === void 0 ? this.animateScroll : animate;
			var x = x || 0;
			var hStep = this.curHBarFaceStep;
			var hScrollBarFace = this.views['hScrollBarFace'];
	
			x = Math.max(Math.min( this.getScrollWidth() - this.getClientWidth(), x ), 0);
			
			if( animate ) {
				hScrollBarFace.stop(true, true)
							  .animate({
								 left : this.hBarStart + hStep * x	 
							   }, this.animateDuration, this.animateEasing);	
			} else {
				hScrollBarFace.css('left', this.hBarStart + hStep * x);
			}
			
			return this;	
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
			
			this.fireEvent('onBeforeSetHorizontalScrollBarPos', pos);				
		
			this.views['hScrollBar'].css(pos);
			
			this.fireEvent('onSetHorizontalScrollBarPos', pos, this.views['hScrollBar']);
			
			//记录当前滚动条的初始位置
			//this.hBarStart = left;
		},
		setHorizontalScrollBarSize : function(){
			var hScrollBar = this.views['hScrollBar'];
			var hScrollBarTrack = this.views['hScrollBarTrack'];
			var hScrollBarFace = this.views['hScrollBarFace'];
			
			var clientWidth = this.getClientWidth();
			var scrollWidth = this.getScrollWidth();
			var barWidth = clientWidth - ( !this.enableOverlay && this.hasVerticalScrollBar() ? this.barSize : 0 ) - this.hScrollBarLeftEdge * 2;
			var barFaceWidth = this.hScrollBarFaceWidth > 0 ? this.hScrollBarFaceWidth : 
				Math.min(Math.max(this.hScrollBarFaceMinWidth, clientWidth/scrollWidth * barWidth), this.hScrollBarFaceMaxWidth);
			var size = {
				barWidth   : barWidth,
				barTrackWidth : barWidth,
				barFaceWidth  : barFaceWidth	
			};	
			
			this.fireEvent('onBeforeSetHorizontalScrollBarSize', size, hScrollBar, hScrollBarTrack, hScrollBarFace);
				
			hScrollBar.css('width', size.barWidth);
			hScrollBarTrack.css('width', size.barTrackWidth);
			hScrollBarFace.css('width', size.barFaceWidth);
			
			this.curHBarFaceWidth = size.barFaceWidth;
			
			this.curHBarTrackWidth = size.barTrackWidth;
			
			this.fireEvent('onSetHorizontalScrollBarSize', size, hScrollBar, hScrollBarTrack, hScrollBarFace);
			
			//计算barFace滚动率
			this.curHBarFaceStep = ((this.curHBarTrackWidth - this.curHBarFaceWidth) / (scrollWidth - clientWidth)) || 0;
			
			return size.barFaceWidth;	
		},
		/*setHorizontalScrollStep : function(){
			var el = this._el;
			var width = this.curHBarTrackWidth - this.curHBarFaceWidth;
			var sw = this.getScrollWidth() - this.getClientWidth();
			
			this.curHBarFaceStep = width/sw;
			
			return this.curHBarFaceStep;	
		},*/
		
		_hasSetV : false,
		createVerticalScrollBar : function(){
			if( this._hasSetV ) {
				return this.views['vScroll']['bar'];	
			}
			
			var vScroll = this.views['vScroll'] = {};
		
			var $vScrollBar      = $('<div class="nex-scrollbar nex-vscrollbar '+ this.vScrollBarCls +'" />');
			var $vScrollBarTrack = $('<div class="nex-scrollbar-track nex-vscrollbar-track '+ this.vScrollBarTrackCls +'" />');
			var $vScrollBarFace  = $('<div class="nex-scrollbar-face nex-vscrollbar-face '+ this.vScrollBarFaceCls +'" />');
			
			vScroll.bar = $vScrollBar;
			vScroll.barTrack = $vScrollBarTrack;
			vScroll.barFace = $vScrollBarFace;
			
			$vScrollBar.append($vScrollBarTrack);
			$vScrollBar.append($vScrollBarFace);
			
			if( this.hideScrollBarTrack ) {
				$vScrollBarTrack.hide();	
			}
			
			$vScrollBar.css('width', this.barSize);
			if( this.curZIndex != 'auto' ) {
				$vScrollBar.css('zIndex', parseInt(this.curZIndex) + 1);	
			}
			//(◎_◎;)！！
			this.views['vScrollBar'] = $vScrollBar;
			this.views['vScrollBarTrack'] = $vScrollBarTrack;
			this.views['vScrollBarFace'] = $vScrollBarFace;
			
			this.fireEvent('onVerticalScrollBarCreate', $vScrollBar, $vScrollBarTrack, $vScrollBarFace);
			
			this._hasSetV = true;
			
			this.initVerticalScrollBarFaceEvents();
			
			this.el.after($vScrollBar);
			
			return $vScrollBar;
		},
		initVerticalScrollBarFaceEvents : function(){
			var vScrollBarFace = this.views['vScroll']['barFace'];
			var prefix = Nex.uuid();
			var self = this;
			
			vScrollBarFace.bind({
				'mousedown.scroll' : function(e){
					var $doc = $(document);
					var $body = $(document.body);
					var startY = e.pageY;
					var startTop = self.scrollTop();
					var curVBarFaceStep = self.curVBarFaceStep;
					
					$._save( $body, ['cursor'] );
					
					$body.css('cursor', 'default');
					
					$(document.body).disableSelection(prefix);
					
					$doc.bind('mouseup.'+prefix, function(e){
						$._restore( $body, ['cursor'] );
						$(document.body).enableSelection(prefix);	
						$doc.unbind('.'+prefix);	
					});
					
					$doc.bind('mousemove.'+prefix, function(e){
						var moveDist = e.pageY - startY;
						var sTop = startTop + moveDist/curVBarFaceStep;
						
						self.scrollTop( sTop, false );
					});
				}
			});	
		},
		
		_hasSetH : false,
		createHorizontalScrollBar : function(){
			if( this._hasSetH ) {
				return this.views['hScrollBar'];	
			}
			
			var $hScrollBar      = $('<div class="nex-scrollbar nex-hscrollbar '+ this.hScrollBarCls +'" />');
			var $hScrollBarTrack = $('<div class="nex-scrollbar-track nex-hscrollbar-track '+ this.hScrollBarTrackCls +'" />');
			var $hScrollBarFace  = $('<div class="nex-scrollbar-face nex-hscrollbar-face '+ this.hScrollBarFaceCls +'" />');
			
			$hScrollBar.append($hScrollBarTrack);
			$hScrollBar.append($hScrollBarFace);
			
			if( this.hideScrollBarTrack ) {
				$hScrollBarTrack.hide();	
			}
			
			$hScrollBar.css('height', this.barSize);
			
			if( this.curZIndex != 'auto' ) {
				$hScrollBar.css('zIndex', parseInt(this.curZIndex) + 1);	
			}
			
			this.views['hScrollBar'] = $hScrollBar;
			this.views['hScrollBarTrack'] = $hScrollBarTrack;
			this.views['hScrollBarFace'] = $hScrollBarFace;
			
			this.fireEvent('onHorizontalScrollBarCreate', $hScrollBar, $hScrollBarTrack, $hScrollBarFace);
			
			this._hasSetH = true;
			
			this.initHorizontalScrollBarFaceEvents();
			
			this.el.after($hScrollBar);
			
			return $hScrollBar;
		},
		initHorizontalScrollBarFaceEvents : function(){
			var hScrollBarFace = this.views['hScrollBarFace'];
			var prefix = Nex.uuid();
			var self = this;
			
			hScrollBarFace.bind({
				'mousedown.scroll' : function(e){
					var $doc = $(document);
					var $body = $(document.body);
					var startX = e.pageX;
					var startLeft = self.scrollLeft();
					var curHBarFaceStep = self.curHBarFaceStep;
					
					$._save( $body, ['cursor'] );
					
					$body.css('cursor', 'default');
					
					$(document.body).disableSelection(prefix);
					
					$doc.bind('mouseup.'+prefix, function(e){
						$._restore( $body, ['cursor'] );
						$(document.body).enableSelection(prefix);	
						$doc.unbind('.'+prefix);	
					});
					
					$doc.bind('mousemove.'+prefix, function(e){
						var moveDist = e.pageX - startX;
						var sLeft = startLeft + moveDist/curHBarFaceStep;
						
						self.scrollLeft( sLeft, false );
					});
				}
			});	
		},
		
		clearCahche : function(){
			this._cHeight = this._sHeight = null;
			this._cWidth = this._sWidth = null;	
		},
		
		updateScrollBar : function(){
			if( this.hScrollBar && !this._hasSetH ) {
				this.createHorizontalScrollBar();	
			}
			if( this.vScrollBar && !this._hasSetV ) {
				this.createVerticalScrollBar();	
			}
			
			this.clearCahche();
			
			this.updateVerticalScrollBar();
			this.updateHorizontalScrollBar();	
			
			return this;	
		},
		
		refresh : function(){
			return this.updateScrollBar();	
		},
		
		/**
		* @Overview
		*/
		destroy : function(){
			
			if( this.views['hScrollBar'] ) {
 				this.views['hScrollBar'].remove();
			}
			
			if( this.views['vScrollBar'] ) {
 				this.views['vScrollBar'].remove();
			}
			
			$._restore( this.el, ['overflow'] );
			
			this.views = {};
			
			if( this.autoWrapper ) {
				this.el.unwrap();
			}	
			
			this.onDestroy();
			
			this.fireEvent('onDestroy');
			
			return this;
		},
		
		onDestroy: function(){}
		
	});
	
	return scroller;
});