define(function(require){
var Form = {
	//数据设置时改变数据的值
	formatter : null,
	//数据获取是可改变数据的值
	getFormatter : null,
	//数据设置最终控制
	setFormatter : null,
	
	value : void 0,
	
	lastValue : void 0,
	
	isEqual: function(value1, value2) {
		return String(value1) === String(value2);
	},
	getInput : function(){
		return this.getBody();
	},
	isInput : function( el ){
		return $(el).is(':input');	
	},
	/**
	 *获取输入框的值
	 */
	getInputValue : function(){
		var self = this;
		var input = self.getInput();
		
		var value = self.isInput( input ) ? input.val() : input.html();
		
		return value;	
	},
	//input 绑定了input事件, 当我们通过setValue来改变输入框的值时实际已经检查了onChange
	//设置enableInputChange的状态，禁止input再次触发setValue
	enableInputChange : true,
	
	setInputValue : function( value ){
		var input = this.getInput();
		
		value = this.valueForm(value, '');
		
		var lastInputValue = this.getInputValue();
		
		if( this.isEqual(lastInputValue, value) ) return this;
	
		var _save = this.enableInputChange;
		
		this.enableInputChange = false;
		
		this.isInput( input ) ? input.val( value ) : input.html( value );
		
		this.enableInputChange = _save;
		
		return this;
	},
	/*
	*获取当前组件值
	*/
	getValue : function(){
		var value,
			self = this;
		
		if( Nex.isFunction( this.getFormatter ) ) {
			value = this.getFormatter( this.value );
		} else {
			value = this.value;	
		}	
		
		return Nex.unDefined(value, '');
	},
	formatValue : function(v){
		return Nex.isFunction( this.formatter ) ? this.formatter(v) : v;
	},
	valueForm: function(value, defaultValue, allowBlank){
		return Nex.isEmpty(value, allowBlank) ? defaultValue : value;	
	},
	
	getLastValue : function(){
		return this.lastValue;
	},
	
	setLastValue : function(v){
		this.lastValue = v;
		
		return this;
	},
	
	setValue : function(v){
		var args = [].slice.apply(arguments);
		
		if( !arguments.length ) {
			return this;	
		}
		
		//记录表单改变之前的值
		var lastValue = this.getLastValue();
		
		if( Nex.isFunction( this.setFormatter ) ) {
			v = this.setFormatter( v );
		}
		
		v = this.formatValue( v );
		
		if( this.isEqual(v, lastValue) ) {
			return this;	
		}
		
		args[0] = v;
		
		this.setInputValue.apply( this, args );
		
		this.value = v;
		
		if( !this.isInit() ) {
			
			this.onChange(v, lastValue);
		
			this.fireEvent('onChange', v, lastValue);
		}
		
		this.setLastValue(v);
		
		return this;
	},
	val : function(){
		if( arguments.length ) {
			return this.setValue.apply( this, arguments );	
		} else {
			return this.getValue();	
		};
	},
	
	onChange: function(){},	
};

return Form;	
});