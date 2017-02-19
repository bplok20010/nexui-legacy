/*
 author:nobo
*/
define(function(require, exports, module){

var TextField = require('./Text');
var SpinnerTrigger = require('./mixin/Spinner');

var Spinner = Nex.define('Nex.form.Spinner', TextField,[{
	$type: 'spinner',
	
	xtype : 'spinnerfield',
	
	config : function(){
		return {
			
			showSysTriggerBtn : true
		};	
	}
},
SpinnerTrigger
]);
	
module.exports = Spinner;
});	