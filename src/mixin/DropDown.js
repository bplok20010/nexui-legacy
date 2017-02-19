define(function(require){
	require('../util/position');
	var Nex = require('../Nex');
	var Container = require('../container/Container');
	
	var dropdown = Nex.Class('Nex.mixin.DropDown', {
		config : function(){
			return {
				dropdownClass : Container,
				dropdown : null,
				//开启组件宽高检测...例如：
				autoCheckSize : false,
				//autoCheckSize 开启时生效
				dropdownEdge : 5,
				dropdownHeight : '',
				dropdownWidth : '',
				//showfn hidefn 最好要同时设置 ，因为他们是相对的操作
				dropdownShowFn : null,
				dropdownHideFn : null,
				dropdownHideToRemove : false,
				
				dropdownHideOnBlur : true,
				dropdownHideOnScroll : true,
				
				/**
				 * 设置dropdown组件的参数
				 * Object, Function
				 */
				dropdownConfig : null,
				
				dropdownPosition : null
			};	
		},
		
		getDropDownData : function(){
			return this.items;	
		},
		
		getDropDownShowAt : function(){
			return this.el;	
		},
		
		getDropDown : function(){
			
			if( !this.dropdown ) {
				this.dropdown = this.createDropDown();
				this.fireEvent('onDropDownCreate', this.dropdown);
			}
			
			return this.dropdown;
		},
		
		//获取周围可显示空间
		getAroundSpace : function(el){
			var self = this,
				el = Nex.unDefined(el, self.getDropDownShowAt());
			
			//获取窗口显示区域大小
			var cw = $(window).width();
			var ch = $(window).height();
			
			var offset = el.offset();
			
			//获取滚位置
			var sLeft = $(window).scrollLeft();
			var sTop = $(window).scrollTop();
			
			var space = {
				top : offset.top - sTop,
				left : offset.left - sLeft
			};
			space.bottom = ch - space.top - el.outerHeight();
			space.right = cw - space.left - el.outerWidth();
			
			return space;
		},
		
		setDropDownSize : function(){
			var dp = this.dropdown;
			
			if(!dp) return this;
			
			return this;
		},
		
		unsetDropDownEvents : function(){
			var ext = 'dropdown_'+this.id;
			
			if( this.dropdownHideOnBlur ) {
				$(document).unbind('.'+ext);
			}
			
			if( this.dropdownHideOnScroll ) {
				$(window).unbind('.'+ext);
			}		
		},
		
		setDropDownEvents : function(){
			var self = this,
				id = this.id,
				ext = 'dropdown_'+id;	
			
			if( this.dropdownHideOnBlur ) {
				$(document).bind('mousewheel.'+ext+' contextmenu.'+ext+' mousedown.'+ext,function(e){
					var target = e.target || e.srcElement;
					//closest parents
					if( $(target).is( '#'+id ) 
						|| $(target).is( '#'+id+'_dropdown' ) 
						|| $(target).parents('#'+id+'_dropdown,#'+id).length
					) {
						//
					} else {
						self.hideDropDown();		
					} 
				});
			}	
			
			if( this.dropdownHideOnScroll ) {
				$(window).bind('resize.'+ext,function(){
					self.hideDropDown();			
				});
			}
		},
		
		getDropDownConfig : function(){
			var opt;
			
			if( Nex.isFunction(this.dropdownConfig) ) {
				opt = this.dropdownConfig() || {};	
			} else {
				opt = this.dropdownConfig || {};	
			}
			
			var opt = Nex.extend({}, opt, {
					id : this.id+'_dropdown',
					denyManager : true,
					autoResize : false,
					renderTo : document.body
				});
				
				opt.cls = 'nex-dropdown-ct ' + (opt.cls || '');
				
			return opt;
		},
		
		/**
		 * return @object
		 */
		createDropDown : function(){
			var self = this,
				ctr = this.dropdownClass;
				
			this.one('onDestroy._dp_' + this.id, function(){
				if( self.dropdown ) {
					self.removeDropDown();
				}
			});	
			
			return new ctr(this.getDropDownConfig());
		},
		
		setDropDownPos : function(){
			var dp = this.dropdown,
				of = this.getDropDownShowAt(),
				dpEl = dp.el,
				pos = Nex.extend({
					at : 'left bottom',
					my : 'left top',
					collision : 'flipfit flipfit'
				}, this.dropdownPosition || {}, {
					of : of	
				});
				
			if( !dp ) return this;
			
			dpEl.position(pos);
			
			return this;	
		},
		
		onDropDownShow : function(){},
		
		_dpShow : false,
	
		showDropDown : function(fn){
			var self = this,
				dp = this.getDropDown(),
				dpEl = dp.el,
				zIndex = Nex.dropdownzIndex = ++Nex.dropdownzIndex;
			
			if(self.fireEvent('onBeforeDropDownShow') === false) return this;
			
			dpEl.css('zIndex', zIndex);
			
			self.fireEvent('onStartResetDropDownSize', dpEl);
			
			this.setDropDownSize();
		
			self.fireEvent('onResetDropDownSize', dpEl);
				
			var cb = function(){
				if( fn ) {
					fn.call(self);	
				}
				
				self.setDropDownEvents();
				
				self.onDropDownShow(dp.el);
				
				self.fireEvent('onDropDownShow', dp.el);	
			};
			
			if( Nex.isFunction(this.dropdownShowFn) ) {
				this.dropdownShowFn(dpEl, function(){
					cb();
				});	
			} else {
				dpEl.show();
				this.setDropDownPos();
				cb();
			}
			
			this._dpShow = true;
		
			return this;
		},
		
		onDropDownHide : function(){},
		
		hideDropDown : function(fn){
			var self = this, dp = this.dropdown;
			
			if( !dp ) return this;
			
			if(self.fireEvent('onBeforeDropDownHide') === false) return this;
						
			this.unsetDropDownEvents();
			
			var cb = function(){
				if( fn ) {
					fn.call(self);	
				}	
				
				if( self.dropdownHideToRemove ) {
					dp.el.remove();
					self.dropdown = null;	
				}
				
				self.onDropDownHide(dp.el);
				
				self.fireEvent('onDropDownHide', dp.el);
			};
			
			if( Nex.isFunction(this.dropdownHideFn) ) {
				this.dropdownHideFn(dp.el, function(){
					cb();
				});		
			} else {
				dp.el.hide();	
				cb();
			}
			
			this._dpShow = false;
			
			return this;
		},
		
		onDropDownRemove : function(){},
		
		removeDropDown : function(){
			var dp = this.dropdown;
			
			if( !dp ) return this;
			
			dp.el.remove();
			
			this.dropdown = null;	
			
			this._dpShow = false;	
			
			this.unsetDropDownEvents();
			
			this.off('._dp_' + this.id);
			
			this.onDropDownRemove();
			
			this.fireEvent('onDropDownRemove');
			
			return this;
		},
		
		//判断dropdown是显示中
		isDropDownShow : function(){
			return this._dpShow;	
		},
		
		toggleDropDown : function( func ){
			if( this._dpShow ) {
				this.hideDropDown( func );	
			} else {
				this.showDropDown( func );	
			}
		
			return this;
		}
	});
	
	return dropdown;
});