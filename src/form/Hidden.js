/*
 author:nobo
*/
define(function(require){
	var BaseField = require('./Base');

	var Hidden = Nex.define('Nex.form.Hidden', BaseField,{
		$type: 'hidden',
		
		config : function(){
			return {
				autoResize : false,
				
				xtype : 'hiddenfield',
				
				showLabel : false,
				
				tabIndex : -1
			};	
		},
		
		getInput : function(){
			if( !this.views['input'] ) {
				this.views['input'] = $('#' + this.getInputId());
			}
			return this.views['input'];
		},
		
		inputTpl : function(){
			return [
				'<input id="',this.getInputId(),'" name="',this.name,'" type="hidden" autocomplete=',this.autocomplete,' class="nex-form-field nex-form-field-',this.$type,'">'
				].join('');	
		},
		
		getInputWrapTpl : function(){
			return this.inputTpl();	
		},
		
		initBaseEvents : function(){}
		
	});
	
	return Hidden;
});	