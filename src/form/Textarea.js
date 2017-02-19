/*
 author:nobo
*/
define(function(require){
	var TextField = require('./Text');

	var Textarea = Nex.define('Nex.form.TextArea', TextField,{
		$type: 'textarea',
		
		xtype : 'textareafield',
		
		config : function(){
			return {
				enableSetInputHeight : true,
				labelvAlign : 'top',
				autoScroll : true,
				virtualScroll : false
			};	
		},
		
		
		inputTpl : function(){
			return [
				'<textarea id="',this.getInputId(),'" name="',this.name,'" autocomplete=',this.autocomplete,' class="nex-form-field nex-form-field-',this.$type,'"></textarea>'
				].join('');	
		},
		
		setViewSize: function(){
			
			this._super(arguments);
			
			var input = this.getInput();
			
			if( !this.isAutoHeight() ) {
				input.css( 'height', this.inputWrapHeight );
			} else {
				input.css( 'height', '100%' );	
			}
			
		}
		
	});
	
	return Textarea;
});	