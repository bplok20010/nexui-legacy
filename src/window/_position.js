/**
*
*/
define(function(require){
	var Nex = require('../Nex');	
	require('../jqueryui/position');	
	
	var defaultShowAt = {
		my : 'center center',
		at : 'center center',
		collision : 'fit fit'	
	};
	
	function config(){
		return {
			showAt : null,	
			/**
			 * 通过只要触发了resize位置就会重新计算
			 * 可能值:
			 * - auto 自动检测, 默认会reset 但是当用户drag后就不会
			 * - boolean 强制设定
			 */ 
			resetPosOnResize : 'auto',
			resetPosAnimate : true,
			resetPosDuration : 200,
			resetPosEasing  : 'linear'
		};	
	}
	
	var WindowPosition = {
		config : config,
		
		initShowAt : function(){
			var pos = Nex.extend({
				of : this.renderTo || window	
			}, defaultShowAt);
			var showAt = this.showAt || {};

			if( Nex.isjQuery(showAt) || 
				Nex.isElement(showAt)|| 
				Nex.isWindow(showAt) ) {
					
				pos.of = showAt;
						
			} else if( Nex.isObject(showAt) ) {
				Nex.extend( pos, showAt );	
			} else if( Nex.isArray( showAt ) ) {
				pos.of = {
					pageX : showAt[0],
					pageY : showAt[1]	
				}	
			} else {
				pos.of = showAt;	
			}
			
			this.showAt = pos;	
		},
		
		position : function(opts){
			var el = this.el,
				showAt = Nex.extend(this.showAt, opts || {});
			
			el.position( showAt );
		
			return this;
		},
		
		getPosition : function(){
			var el = this.el,
				showAt = Nex.extend({}, this.showAt),
				position;	
				
			showAt.using = function(pos){
				position = pos;	
			};
			
			$._save(el, ['display']);
			el.css('display', 'block');
			
			el.position(showAt);
			
			$._restore(el, ['display']);
			
			return position;			
		},
		
		getCurrentPosition : function(){
			return {
				left : parseInt(this.el.css('left')) || 0,
				top : parseInt(this.el.css('top')) || 0
			};	
		},
		
		/**
		* 位置复原
		*/
		resetPosition : function(){
			var pos = this.getPosition();
			
			if( !this.resetPosAnimate ) {
				this.el.css(pos);
			} else {
				var pos = this.getPosition();
				
				this.el.animate(pos, this.resetPosDuration, this.resetPosEasing);
			}
		},
		
		onStartShow : function(el){
			this._super(arguments);
			
			var pos = this.getPosition();
	
			this.el.css(pos);
			
			this.setzIndex();
			
			this.minimized = false;
			
			if( this.modal ) {
				this.showModal();	
			}
		},
		
		onStartHide : function(el){
			this._super(arguments);
			
			if( this.modal ) {
				this.hideModal();	
			}
		},
		
		resize : function(){
			this._super(arguments);
			
			if( this.isHidden() || this.maximized ) {
				return this;	
			}
			
			if( this.resetPosOnResize !== false ) {
				this.resetPosition();
			}
			
			return this;	
		},
		
		toggle : function(){
			return this[this.isHidden() ? 'show' : 'hide']();	
		}
	};
	
	return WindowPosition;
});	