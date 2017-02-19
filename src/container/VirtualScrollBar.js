define(function(require, exports, module){
	var Nex = require('../Nex');
	var Scroller = require('../scroller/Scroller');
	
	var config = function(opt){
		return {
			//虚拟滚动条设置
			virtualScroll : true,
			//由于container 只有一层所以最好设置为true
			virtualScrollWrapper : false,
			deferUpdateScrollBar : true,
			virtualScrollOptions : {} 	
		};	
	};
	
	var VirtualScrollBar = {
		config : config,
		scroller : null,
		initVirtualScrollBar : function(){
			if( this.scroller ) return this.scroller;
			
			var self = this;
			var autoWrapper = this.virtualScrollWrapper;
			var scrollView = this.getScrollView();
			var hScrollBar = false;
			var vScrollBar = false;
			
			if( this.overflow == 'auto' ) {
				hScrollBar = true;	
				vScrollBar = true;	
			}
			
			if( this.overflowX == 'hidden' ) {
				hScrollBar = false;	
			}
			
			if( this.overflowY == 'hidden' ) {
				vScrollBar = false;	
			}
			
			if( !hScrollBar && !vScrollBar ) return null;
			
			this.scroller = Scroller.create(Nex.extend( {
				hScroll : hScrollBar,
				vScroll : vScrollBar,
				autoWrapper : autoWrapper
			}, self.virtualScrollOptions,{
				el : scrollView	
			}));	
			
			return this.scroller;
		},
		updateScrollBar : function(){
			if( this.scroller ) {
				this.scroller.updateScrollBar();	
			}	
			
			return this;
		},
		refreshScrollBar : function(){
			return this.updateScrollBar()	
		},
		
		destroyVirtualScrollBar : function(){
			if( this.scroller ) {
				this.scroller.destroy();	
			}	
		}
	};
	
	return VirtualScrollBar;	
});