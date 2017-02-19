/*
 author:nobo
*/
define(function(require){
	
	var DsiplayField = require('./Display');
	var ListBox = require('./ListBox');
	var Store = require('../data/Store');
	var ListBoxDropDown = require('../mixin/ListBoxDropDown');
	

	var Select = Nex.define('Nex.form.Select', [DsiplayField, ListBoxDropDown],{
		$type: 'select',
		
		xtype : 'selectfield',
		
		config : function(){
			return {
				//select 无法用tab切换
				tabIndex : -1,
				
				showSysTriggerBtn : true,
				
				triggerCls : 'nex-form-trigger-select',
				
				enableLabelFor : false,
				
				items : null,
				
				multiSelect : false,
				
				enableSetInputWidth : false,
				
				enableSetInputHeight : false,
				
				valueField: 'value',
				
				textField: 'text',
				
				textFormatter : null
			};	
		},
		
		setStore : function(items){
			var self = this,
				store;
				
			this.items = items;	
			
			if( Nex.isStore(items) ) {
				store = items;	
			} else {
				store = new Store({
					pageSize : 0,//获取所有数据
					request : Nex.isFunction(items) ? items : null,
					data : Nex.isArray(items) ? items : [items]	
				});
			}
			
			if( this.dropdown ) {
				this.dropdown.setItems(store);	
			}
			
			return this;
		},
		
		setItems : function(items){
			return this.setStore(items);	
		},
		
		normalizeItem: function(item){
			var text = this.textField,
				value = this.valueField,
				data = {};
				
			if( Nex.isArray( item ) ) {
				data[value] = Nex.unDefined(item[0], '');
				data[text] = Nex.unDefined(item[1], data[value]);
			} else if( !Nex.isObject(item) ) {
				data[text] = item;
				data[value] = item;	
			} else {
				data[value] = Nex.unDefined(item[value], item[text]);
				data[text] = Nex.unDefined(item[text], item[value]);
				item[value] = Nex.unDefined(data[value], '');
				item[text] = Nex.unDefined(data[text], '');	
				data = item;
			}	
			
			return data;
		},
		
		getItemData : function(value){
			var i = 0,
				items = this.items || [],
				multiSplit = this.multiSplit,
				valueField = this.valueField,
				item, v, data = [];
				
			value = (value + '').split(multiSplit);
			
			if( Nex.isStore(items) ) {
				items = items.unWrapAll(items.getData());
			}
			
			for(; i < items.length; i++) {
				item = this.normalizeItem(items[i]);
				v = item[valueField] + '';
				
				if( Nex.inArray(v, value) !== -1 ) {
					data.push(item);
				}
				
			}
				
			return data;
		},
		
		getTextByValue : function(value){
			var i = 0,
				text = [],
				textField = this.textField,
				data = this.getItemData(value);
		
			for(;i < data.length; i++) {
				text.push(data[i][textField]);	
			}
			
			return text.join(this.multiSplit);
		},
		
		getText : function(){
				
		},
		
		setText : function(){
				
		},
		
		inputTpl : function(){
			return [this._super(arguments), '<input id="',this.getInputId(),'_real" name="',this.name,'" type="hidden" />'].join('');	
		},
		
		getInputReal : function(){
			if( !this.views['inputReal'] ) {
				this.views['inputReal'] = $('#'+this.getInputId()+'_real');	
			}
			
			return this.views['inputReal'];	
		},
		
		setInputValue : function( value ){
			var input = this.getInput(),
				inputReal = this.getInputReal(),
				valueText;
			
			value = this.valueForm(value, '');
			
			inputReal.val(value);	
			
			valueText = this.getTextByValue(value);
	
			if( this.textFormatter && Nex.isFunction(this.textFormatter) ) {
				var data = this.getItemData(value);
				
				if( data.length && !this.multiSelect ) {
					data = data[0];	
				}
				
				valueText = this.textFormatter( valueText, value, data,this.items )	
			}
			
			input.html(valueText);
			
			if( this.dropdown ) {
				//防止死循环
				this.dropdown.lockEvent('onChange');
				this.dropdown.setValue(value);	
				this.dropdown.unLockEvent('onChange');
			}
			
			return this;
		},
		
		initEvents : function(){
			this._super(arguments);
			
			this.initSelectEvents();
		},
		
		onTriggerBtnClick : function(){
			if( this.isDropDownShow() ) {
				this.hideDropDown();	
			}
		},
		
		onTriggerClick : function(){
			this.toggleDropDown();	
		},
		
		initSelectEvents : function(){
			var self = this,
				el = this.el;
			
			var events = {
				'click._dp' : function(e){
					if( e.isDefaultPrevented() ) {
						return;
					};
					self.toggleDropDown();
				}	
			};
			
			el.bind(events);
					
		}
		
	});
	
	return Select;
});	