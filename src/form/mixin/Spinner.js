/*
 author:nobo
*/
define(function(require, exports, module){

module.exports = {
	
	config : function(){
		return {
			triggerCls : 'nex-form-trigger-spinner',
			spinnerCls: '',
   			spinnerUpCls: '',
    		spinnerDownCls: '',
			spinnerTriggerToFocus : false,
			repeatClick : true,
			repeatInterval : 20,
			repeatDelay : 250,
			upHandler : null,
			downHandler : null
		};	
	},
	
	initSysTrigger : function(){
		var self = this;
		var wrap = this.getTriggerWrap();
		
		var trigger = $('<div id="'+this.id+'_trigger_spinner" class="nex-form-trigger '+  [this.triggerCls, this.spinnerCls].join(' ') +'"><div class="nex-form-spinner-icon nex-form-spinner-up '+this.spinnerUpCls+'"></div><div class="nex-form-spinner-icon nex-form-spinner-down '+this.spinnerDownCls+'"></div></div>');	
		
		wrap.append(trigger);
		
		this.triggerEl = trigger;
		this.triggerUpEl = $('>.nex-form-spinner-up', trigger);
		this.triggerDownEl = $('>.nex-form-spinner-down', trigger);
		
		this.initSpinnerTriggerEvents();
		
		self.fireEvent('onSpinnerTriggerCreate', trigger);
		
		this.initSysTrigger = function(){};
	},
	
	initSpinnerTriggerEvents : function(){
		var self = this;
		
		function _method(e, type, fn){
			if( self.readOnly || self.disabled ) return;
		
			var isUp = $(this).hasClass('nex-form-spinner-up');
	
			if( self.fireEvent('onSpinner'+type, e, isUp ? 'up' : 'down') === false ) {
				return false;	
			}
			
			if( self.fireEvent('onSpinner'+(isUp ? 'Up' : 'Down')+type, e) === false ) {
				return false;	
			}
			
			if( 'onSpinner'+type in self ) {
				self['onSpinner'+type](isUp);	
			}
			
			if( fn ) {
				fn.call(this, isUp);	
			}
		}
		
		this.triggerEl.on({
			'click' : function(e){
				return _method.call(this, e, 'Click');
			},
			'mouseenter' : function(e){
				return _method.call(this, e, 'MouseOver');
			},
			'mouseleave' : function(e){
				return _method.call(this, e, 'MouseOut');	
			},
			'mousedown' : function(e){
				return _method.call(this, e, 'MouseDown');		
			},
			'mouseup' : function(e){
				return _method.call(this, e, 'MouseUp');				
			}
		}, '.nex-form-spinner-up,.nex-form-spinner-down');
		
		this.initSpinnerTriggerEvents = function(){};
	},
	__timer1 : 0,
	__timer2 : 0,
	clearRepeatTimer : function(){
		if( this.__timer1 ) clearTimeout(this.__timer1);
		if( this.__timer2 ) clearTimeout(this.__timer2);
	},
	onSpinnerMouseDown : function(isUp){
		var self = this,
			input = this.getInput();
		
		self.clearRepeatTimer();
		
		fireEvent();
		
		if( self.repeatClick ) {
			self.__timer1 = setTimeout(function(){
				startRepeat();
			}, self.repeatDelay);	
		}
		
		function startRepeat(){
			self.__timer2 = setTimeout(startRepeat, self.repeatInterval);
			fireEvent();		
		}
		
		function fireEvent(){
			if( isUp ) {
				self.onSpinnerUp();
				if( self.upHandler ) {
					self.upHandler();	
				}
				self.fireEvent('onSpinnerUp');
			} else {
				self.onSpinnerDown();
				if( self.downHandler ) {
					self.downHandler();	
				}
				self.fireEvent('onSpinnerDown');	
			}
		}
	},
	onSpinnerMouseUp : function(isUp){
		this.clearRepeatTimer();
		if( this.spinnerTriggerToFocus && !this.readOnly && !this.disabled ) {
			this.focus();
		}
	},
	onSpinnerMouseOver : function(){},
	onSpinnerMouseOut : function(){
		this.clearRepeatTimer();	
	},
	onSpinnerMouseClick : function(){},
	onSpinnerUp : function(){},
	onSpinnerDown : function(){}
	
};
	
});	