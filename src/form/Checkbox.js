define(function(require, exports, module){
	var Nex = require('../Nex');
	var ListBoxField = require('./ListBox');
	var FormManager = require('./Manager');
	
	var checkboxfield = Nex.define('Nex.form.Checkbox', ListBoxField,{
		xtype : 'checkboxfield',
		$type: 'checkbox',
		
		$itemCls : 'nex-form-checkbox-item',		
		$itemSelectedCls : 'nex-form-checkbox-item-selected',
		$itemOverCls : 'nex-form-checkbox-item-over',
		
		$itemTpl : '<div \
				id="<%=$$id%>" \
				<%=tips%> \
				data-index="<%=index%>"\
				class="<%=cls%>"\
				<%=_setWidthStyle%>\
				>\
					<span class="nex-iconfont nex-form-checkbox-item-icon"></span>\
					<span class="nex-form-checkbox-item-text"><%=text%></span>\
				</div>',
		
		config : function(){
			return {
				height : '',
				selectionable : true,
				multiSelect: true,
				autoScroll : false,
				enableFixWidth : false
			};	
		},
		
		_createItemHtml : function(data){
			data._setWidthStyle = '';
			
			if( 'width' in data ) {
				data.width = Nex.isNumeric(data) ? data.width + 'px' : data.width;	
				data._setWidthStyle = 'style="width:'+ data.width +'"';
			}
			
			if( data.display == 'block' ) {
				data.cls = 'nex-display ' + (data.cls || '');	
			} else {
				data.cls = 'nex-inline-block ' + (data.cls || '');		
			}
			
			return this._super([data]);
		},
		
		checkItem : function(v){
			return this.select(v);
		},
		
		uncheckItem : function(v){
			return this.deselect(v);	
		},
		
		setItemDisabled : function(value){
			var index = this.indexOfValue(value),
				data = this.getItemData(value),
				itemEl = this.getItemEl(index);
				
			if( data.disabled ) return this;
			
			data.disabled = true;
			
			itemEl.addClass(this.$itemDisabledCls);	
		},
		
		setItemEnable : function(value){
			var index = this.indexOfValue(value),
				data = this.getItemData(value),
				itemEl = this.getItemEl(index);
				
			if( !data.disabled ) return this;
			
			data.disabled = false;
			
			itemEl.removeClass(this.$itemDisabledCls);		
		},
		 
		onSelect : function(){
			if( this.multiSelect ) return;
			
			var self = this,
				ls = FormManager.get(this.name, this.group);
		
			Nex.each(ls, function(radio){
				if( radio.id == self.id ) return;
				radio.clearSelect();
			});
				
		}
		
	});	
	
	module.exports = checkboxfield;
});