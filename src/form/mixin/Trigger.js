/*
 author:nobo
*/
define(function(require, exports, module){

module.exports = {
	
	config : function(){
		return {
			triggerCls : 'nex-form-trigger-default'
		};	
	},
	
	onTriggerClick: function(){},
	
	initSysTrigger : function(){
		var self = this;
		var wrap = this.getTriggerWrap();
		
		var trigger = $('<div id="'+this.id+'_trigger_trigger" class="nex-form-trigger '+  this.triggerCls +'"></div>');	
		
		wrap.append(trigger);
		
		trigger.on('click', function(e){
			self.onTriggerClick(trigger);
			self.fireEvent('onTriggerClick', trigger);
		});
		
		trigger.on('click dbclick mousedown mouseup', function(e){
			e.preventDefault();
		});
		
		this.initTriggerTrigger = Nex.noop;
		
		self.fireEvent('onTriggerCreate', trigger);
	}
	
};
	
});	