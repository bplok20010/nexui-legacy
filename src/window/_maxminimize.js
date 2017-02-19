/*
Window.js
http://www.extgrid.com/window
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱

*/
define(function(require){
	
	function noop(){}
	
	function config(){
		return {
			maximizable : false,
			maximized   : false,
			maximizedCls : '',	
			minimizable : false,
			minimized   : false
		}	
	}
	
	var WindowMaxMinimize = {
		config : config,
		_maxSaveData : null,
		maximize : function(){
			var self = this,
				el = self.el,
				opt = self;
				
			if( !self.isVisible() || self.maximized || self.collapsed ) {
				return self;	
			}	
			
			if( self.fireEvent('onBeforeMaximize') === false ) {
				return self;	
			}
			
			var saves = {
				width : opt.width,
				height : opt.height,
				left : parseInt(el.css('left')) || 0,
				top : parseInt(el.css('top')) || 0	
			};
			
			this._maxSaveData = saves;
			
			self.maximized = true;	
			
			//maximizedCls
			el.addClass( 'nex-window-maximized '+opt.maximizedCls );
			
			el.stop(true,true);
			self.setSize('100%','100%');
			
			var left = 0;
			var top = 0;
			//IE 下 window document 获取paddingLeft报错
			try{
				 left = $(opt.renderTo).css('paddingTop') || 0;	
				 top = $(opt.renderTo).css('paddingLeft') || 0;	
			}catch(e){}
			
			el.css( {
				left : left,
				top : top
			} );
			
			self.onMaximize();
			
			self.fireEvent('onMaximize');
			
			return self;
		},
		
		onMaximize : function(){
			var header = this.getHeader();
			
			this.disableDrag();
				
			if( !header ) return;
					
			var $tools = $('>.nex-panel-tools', header);
			
			$('>.tools-maximize-icon',$tools).addClass('tools-restore-icon');		
		},
		
		restore : function(){
			var self = this,
				el = self.el,
				opt = self;
			if( !self.isVisible() || !self.maximized || self.collapsed ) {
				return self;	
			}	
			
			if( self.fireEvent('onBeforeRestore') === false ) {
				return self;	
			}
			
			var d = self._maxSaveData || {};
			self._maxSaveData = null;
			
			this.maximized = false;
			//maximizedCls
			el.removeClass( 'nex-window-maximized '+opt.maximizedCls );
			
			var _resetPosAnimate = self.resetPosAnimate;
			
			self.resetPosAnimate = false;
			
			self.setSize(d.width, d.height);	
			
			self.resetPosAnimate = _resetPosAnimate;
			
			if( self.resetPosOnResize === false ) {
				el.css( {
					left : d.left,
					top : d.top	
				} );
			}
			
			self.onRestore();
			
			self.fireEvent('onRestore');
			
			return self;	
		},
		
		onRestore : function(){
			var header = this.getHeader();	
			
			this.enableDrag();
			
			if( !header ) return;
					
			var $tools = $('>.nex-panel-tools', header);
			
			$('>.tools-maximize-icon',$tools).removeClass('tools-restore-icon');		
		},
		
		toggleMaximize : function(){
			return this[ this.maximized ? 'restore' : 'maximize' ]();	
		}, 
		
		minimize : function(){
			if( this.minimized ) {
				return this;	
			}
			
			this.minimized = true;
			
			return this.hide.apply(this,arguments);	
		},
		
		toggleMinimize : function(){
			return this.toggle.apply(this,arguments);	
		}
	};
	
	return WindowMaxMinimize;
});	