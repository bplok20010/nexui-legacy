/**
ScrollBar
*/

define(function(require){
	var Nex = require('../Nex');
	var EventObject = require('../EventObject');
	
	var ScrollBar = Nex.Class('Nex.scroller.ScrollBar', EventObject, {
		$service : true,
		/**
		* @private
		*/
		xtype : 'scrollbar',
		
		/**
		* @config
		*/
		config : function(){
			return {
				//内容元素
				el : null,
				//渲染位置， 如果不填写则放在el后面
				renderTo : null,
				//用于指定哪一种滚动条 vertical(v) horizontal(h)
				scrollType : 'v',
				//设置滚动条大小
				//注意区分vertical/horizontal时的大小
				width : '',
				height : '',
				
				scrollButtons : {},
				_scrollButtons : {
					enable : false	
				},
				
				cls : '',
				thumbCls : '',
				trackCls : '',
				//默认为0时则自动计算
				thumbSize : 0,
				//设置滚动条拖动部分最大，最小设置
				//thumbSize 为0时才有效
				thumbMinSize : 10,
				thumbMaxSize : 99999,
				//是否显示track
				showTrack : true,
				//开启滑动轮滚动
				enableWheel : null, 
				wheelStep : 20,
				enablePreventDefaultOnEnd : true,
				repeatTrackInterval : 80,
				repeatButtonInterval : 50,
				repeatDelay : 250
			};
		},
		
		onStart : function(){},
				
		constructor : function(){
			
			this._super( arguments );
			
			this.id = Nex.uuid();
			
			if( !this.el ) {
				throw new Error("Invalid parameter el");	
			}
			
			if( !this.renderTo ) {
				throw new Error("Invalid parameter renderTo");	
			}
			
			this.el = $(this.el);
			
			if( !this.el.length ) {
				throw new Error("Invalid parameter el");		
			}
			
			this._el = this.el[0];
			
			this.onStart();
			
			this.fireEvent("onStart");
			
			if( this.enableWheel === null ) {
				this.enableWheel = this.isVertical() ? true : false;
			}
			
			this.initScrollBar();
			
			this.resetThumbPos();
			
			this.lastScrollPos = this.getScrollPos();
			
			this.fireEvent('onCreate');
		},
		
		isVertical : function(){
			return this.scrollType === 'v';	
		},
		
		isHorizontal : function(){
			return !this.isVertical();	
		},
		
		initScrollBar: function(){
			
			if( this.hasScroll() ) {	
				
				this.createScrollBar();
				
				this.initScrollBarLayout();
				
			}
			
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
		getClientRect : function(){
			return this.scrollType == 'h' ? 
					this.getClientWidth() : 
					this.getClientHeight(); 	
		},
		getScrollRect : function(){
			return this.scrollType == 'h' ? 
					this.getScrollWidth() : 
					this.getScrollHeight(); 	
		},
		/**
		 * 判断是否出现滚动条
		 */
		hasScroll : function(){
			return this.isVertical() ? 
					this.hasVerticalScrollBar() : 
					this.hasHorizontalScrollBar();
		},
	
		hasVerticalScrollBar : function(){
			return this.getScrollHeight() > this.getClientHeight();
		},
		
		hasHorizontalScrollBar : function(){
			return this.getScrollWidth() > this.getClientWidth();
		},
		/*
		scrollToElement : function(){
				
		},
		*/
		trackToScroll : function(pos){
			return this.calcScrollStep * pos;	
		},
		scrollToTrack : function(pos){
			return pos / this.calcScrollStep;		
		},
		
		getScrollTrackSize : function(){
			return this.isVertical() ? 
					this.$scrollBarCt.height() : 
					this.$scrollBarCt.width(); 	
		},
		
		getScrollButtonsOptions : function(){
			return Nex.extend( this._scrollButtons, this.scrollButtons );	
		},
		
		$scrollBar : null,
		$scrollBarCt : null,
		$scrollBarTrack : null,
		$scrollBarThumb : null,
		createScrollBar : function(){
			if( this.$scrollBar ) {
				return this.$scrollBar;	
			}
		
			var $scrollBar      = $('<div class="nex-scrollbar nex-scrollbar-'+ (this.isVertical() ?　'vertical' : 'horizontal') + ' ' + this.cls +'" />');
			var $scrollBarCt = $('<div class="nex-scrollbar-ct" />');
			var $scrollBarTrack = $('<div class="nex-scrollbar-track '+ this.trackCls +'" />');
			var $scrollBarThumb  = $('<div class="nex-scrollbar-thumb '+ this.thumbCls +'" />');
			
			var scrollButtons = this.getScrollButtonsOptions();
			if( scrollButtons.enable ) {
				var $scrollButtonUp = $('<div class="nex-scrollbar-button nex-scrollbar-button-up" />');	
				var $scrollButtonDown = $('<div class="nex-scrollbar-button nex-scrollbar-button-down" />');
				
				this.$scrollButtonUp = $scrollButtonUp;
				this.$scrollButtonDown = $scrollButtonDown;
				
				$scrollBar.append($scrollButtonUp);
				$scrollBar.append($scrollButtonDown)
			}
			
			$scrollBarCt.append($scrollBarTrack);
			$scrollBarCt.append($scrollBarThumb);
			$scrollBar.append($scrollBarCt);
			
			if( !this.showTrack ) {
				$scrollBarTrack.hide();	
			}
	
			this.$scrollBar = $scrollBar;
			this.$scrollBarCt = $scrollBarCt;
			this.$scrollBarTrack = $scrollBarTrack;
			this.$scrollBarThumb = $scrollBarThumb;
			
			this.updateScrollBarSize();
			
			this.fireEvent('onScrollBarCreate', $scrollBar, $scrollBarTrack, $scrollBarThumb);
			
			this.initScrollBarEvents();
			
			$(this.renderTo).append($scrollBar);
			
			return $scrollBar;
		},
		
		clearRepeatTimer : function(){
			if( this.__timer1 ) clearTimeout(this.__timer1);
			if( this.__timer2 ) clearTimeout(this.__timer2);	
		},
		
		initScrollBarEvents : function(){
			var self = this;
			
			self.initScrollEvents();
			
			self.initSyncScrollEvent();
			
			self.initScrollBarMouseWheelEvent();
			
			self.initScrollBarTrackEvent();
			
			self.initScrollBarButtonEvent();
			
			self.initScrollBarThumbEvent();
		},
		
		initSyncScrollEvent : function(){
			var self = this;
			
			self.el.on('scroll.'+ self.id, function(e){
				var pos = self.getScrollPos();
				if( self.lastScrollPos == pos ) return;
				
				self.lastScrollPos = pos;
				
				self.resetThumbPos();
				
				self.fireEvent('onScroll', pos);
				
				if( self.isScrollEnd() ) {
					self.fireEvent('onScrollEnd', pos);	
				}
			});	
		},
		
		initScrollBarMouseWheelEvent : function(){
			var $scrollBar = this.$scrollBar;
			$scrollBar.bind('mousewheel.scroll', Nex.bind(this._onMouseWheel, this));
		},
		
		initScrollBarButtonEvent : function(){
			var self = this;
			var $scrollBar = self.$scrollBar;
			
			$scrollBar.on('mousedown.scroll', '.nex-scrollbar-button', function(e){
				if( e.which != 1 ) return;
				var step = self.wheelStep;
				var isUp = $(this).hasClass('nex-scrollbar-button-up');
				
				self.clearRepeatTimer();
				
				function start(){
					var last = self.getScrollPos();
					self.scrollTo( last + step * (isUp ? -1 : 1) );
					if( self.isScrollEnd() ) {
						self.clearRepeatTimer();	
					}
				}
				
				start();
				
				function startRepeat(){
					self.__timer2 = setTimeout(startRepeat, self.repeatButtonInterval);	
					start();
				}
				
				self.__timer1 = setTimeout(function(){
					startRepeat();
				}, self.repeatDelay);	
			});
			
			$scrollBar.bind('mouseup.scroll mouseout.scroll', '.nex-scrollbar-button', function(){
				self.clearRepeatTimer();	
			});
		},
		
		initScrollBarTrackEvent : function(){
			var self = this;
			var $scrollBarThumb = self.$scrollBarThumb;
			var $scrollBarTrack = self.$scrollBarTrack;
			
			$scrollBarTrack.bind('mousedown.scroll', function(e){
				if( e.which != 1 ) return;
				var client = self.getClientRect();
				var isVert = self.isVertical();
				var thumbSize = self.calcThumbSize;
				//判断是否点击的上面部分或者左边部分
				var isTop = isVert ? $scrollBarThumb.offset().top > e.pageY
									: $scrollBarThumb.offset().left > e.pageX;
			
				self.clearRepeatTimer();
				
				function start(){
					var last = self.getScrollPos();
					var offset = $scrollBarThumb.offset();
					var isCts = false;
					
					var isChange = isVert ? offset.top > e.pageY
											: offset.left > e.pageX;	
					
					if( isTop == isChange ) {
						isCts = isVert ? (offset.top <= e.pageY && (offset.top + thumbSize) >= e.pageY)
										: (offset.left <= e.pageX && (offset.left + thumbSize) >= e.pageX);
										
						if( isCts ) isChange = !isTop;			
					}					
					
					if( isTop != isChange ) {
						self.clearRepeatTimer();
						return;	
					}					
					
					self.scrollTo( last + client * (isTop ? -1 : 1) );			
								
				}
				
				start();
				
				function startRepeat(){
					self.__timer2 = setTimeout(startRepeat, self.repeatTrackInterval);	
					start();
				}
				
				self.__timer1 = setTimeout(function(){
					startRepeat();
				}, self.repeatDelay);	
				
			});
			
			$scrollBarTrack.bind('mouseup.scroll mouseout.scroll', function(){
				self.clearRepeatTimer();	
			});
		},
		
		initScrollBarThumbEvent : function(){
			var self = this;
			var $scrollBarThumb = self.$scrollBarThumb;
			var prefix = Nex.uuid();
			
			$scrollBarThumb.bind({
				'mousedown.scroll' : function(e){
					if( e.which != 1 ) return;
					var $doc = $(document);
					var $body = $(document.body);
					var startY = e.pageY;
					var startX = e.pageX;
					var start = self.getScrollPos();
					var calcScrollStep = self.calcScrollStep;
					
					$._save( $body, ['cursor'] );
					$body.css('cursor', 'default');
					$(document.body).disableSelection(prefix);	
					
					$doc.bind('mouseup.'+prefix, function(e){
						$._restore( $body, ['cursor'] );
						$(document.body).enableSelection(prefix);	
						
						$doc.unbind('.'+prefix);	
					});
					
					$doc.bind('mousemove.'+prefix, function(e){
						var moveDist = self.isVertical() ? (e.pageY - startY) : (e.pageX - startX);
						var sPos = start + moveDist * calcScrollStep;
						
						self.scrollTo(sPos);
					});
				}
			});	
		},
		
		_onMouseWheel : (function(){
			var defNoop = function(e){
				e.preventDefault();		
			};
			var noop = function(){};
			//滚动到底部时下一次滚动不需要禁用默认行为
			var nextEnd = defNoop;
			var lastDir = 1;	
			
			return function(e, delta, deltaX, deltaY){
				var self = this;
				var step = this.wheelStep;
				var curDir = deltaY > 0 ? 1 : -1;
				if( lastDir != curDir ) {
					lastDir = curDir;
					nextEnd = defNoop;	
				}
				
				self.scrollTo( deltaY > 0 ? (self.getScrollPos() - step) : (self.getScrollPos() + step) );
				
				if( self.enablePreventDefaultOnEnd ) {
					var isEnd = deltaY > 0 ? self.getScrollPos() <= 0 : self.isScrollEnd();
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
			};	
		})(),
		
		initScrollEvents : function(){
			var el = this.el;
			var self = this;
			var enableWheel = this.enableWheel;
			
			if( !enableWheel ) return;
			
			el.bind('mousewheel.' + this.id, Nex.bind(self._onMouseWheel, self));
		},
		
		initScrollBarLayout : function(){
			
			this.updateScrollBarLayout();
					
		},
		
		updateScrollBarSize : function(){
			var $scrollBar = this.$scrollBar;
			
			if( this.width ) {
				$scrollBar.css('width', this.width);
			}
			if( this.height ) {
				$scrollBar.css('height', this.height);
			}
			
			return this;	
		},
		
		updateScrollBarLayout : function(){
			var $scrollBarCt = this.$scrollBarCt;
			var $scrollButtonUp = this.$scrollButtonUp;
			var $scrollButtonDown = this.$scrollButtonDown;
			var $scrollBarTrack = this.$scrollBarTrack;
			var $scrollBarThumb = this.$scrollBarThumb;
			var isVert = this.isVertical();
			
			if( this.$scrollButtonUp ) {
				$scrollBarCt.css(isVert?'top':'left', isVert?$scrollButtonUp.outerHeight():$scrollButtonUp.outerWidth());	
			}
			if( this.$scrollButtonDown ) {
				$scrollBarCt.css(isVert?'bottom':'right', isVert?$scrollButtonDown.outerHeight():$scrollButtonDown.outerWidth());	
			}	
			
			var client = this.getClientRect(),
				scroll = this.getScrollRect(),
				trackSize = this.getScrollTrackSize();
				
			var thumbSize = this.thumbSize > 0 ? this.thumbSize  : 
				Math.min(Math.max(this.thumbMinSize, client/scroll * trackSize), this.thumbMaxSize);
			
			$scrollBarThumb.css(isVert?'height':'width', thumbSize);	
			
			//记录当前滚动按钮的高度
			this.calcThumbSize = thumbSize;
			//记录当前滚动条的高度
			this.calcTrackSize = trackSize;
			
			//计算滚动率
			this.calcScrollStep = (scroll - client) / (this.calcTrackSize - this.calcThumbSize);
			
			this.fireEvent('onUpdateScrollBarLayout');
			
			return this;
		},
		
		_getScrollPosMethod : function(){
			return this.scrollType === 'h' ? 'scrollLeft' : 'scrollTop';	
		},
		
		scrollTo : function(dest){
			var dest = Math.min(Math.max(0, dest), this.getScrollRect() - this.getClientRect());
			
			this.el[this._getScrollPosMethod()](dest);
			
			return this;
		},
		
		getScrollPos : function(){
			return this.el[this._getScrollPosMethod()]();	
		},
		
		isScrollEnd : function(){
			return this.getScrollPos() >= (this.getScrollRect() - this.getClientRect());		
		},
		
		resetThumbPos : function(){
			var sPos = this.getScrollPos();
			var step = this.calcScrollStep;
			
			this.$scrollBarThumb.css(this.isVertical()? 'top' : 'left', sPos/step);
			
			return this;
		},
		
		updateScrollBar : function(){
			if( !this.hasScroll() ) {
				this.removeScrollBar();	
			} else {
				this.createScrollBar();
				this.updateScrollBarLayout();
				this.resetThumbPos();
			}
			return this;
		},
		
		refresh : function(){
			return this.updateScrollBar();	
		},
		//清空scrollbar
		removeScrollBar : function(){
			if( !this.$scrollBar ) return;
			
			this.$scrollBar.remove();
			
			this.$scrollBar = null;
			this.$scrollBarCt = null;
			this.$scrollBarTrack = null;
			this.$scrollBarThumb = null;
			
			this.el.off('.'+this.id);
		},
		
		destroy : function(){
			
			if( this.$scrollBar ) this.$scrollBar.remove();
			
			this.el.off('.'+this.id);
			
			this.onDestroy();
			
			this.fireEvent('onDestroy');
			
			return this;
		},
		
		onDestroy: function(){}
		
	});
	
	return ScrollBar;
});