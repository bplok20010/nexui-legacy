define(function(require, exports, module){
	var Nex = require('../Nex');
	var CheckboxField = require('./Checkbox');
	
	var radiofield = Nex.define('Nex.form.Radio', CheckboxField,{
		xtype : 'radiofield',
		$type: 'radio',
		
		$itemCls : 'nex-form-radio-item',		
		$itemSelectedCls : 'nex-form-radio-item-selected',
		$itemOverCls : 'nex-form-radio-item-over',
		
		$itemTpl : '<div \
				id="<%=$$id%>" \
				<%=tips%> \
				data-index="<%=index%>"\
				class="<%=cls%>"\
				<%=_setWidthStyle%>\
				>\
					<span class="nex-iconfont nex-form-radio-item-icon"></span>\
					<span class="nex-form-radio-item-text"><%=text%></span>\
				</div>',
		config : function(){
			return {
				multiSelect: false
			};	
		}
	});	
	
	module.exports = radiofield;
});