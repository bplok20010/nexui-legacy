/*
 author:nobo
*/
define(function(require){
	var TextField = require('./Text');

	var Password = Nex.define('Nex.form.Password', TextField,{
		$type: 'password',
		
		xtype : 'passwordfield',
		
		config : function(){
			return {
				inputType : 'password'
			};	
		}
		
	});
	
	return Password;
});	