/*
 author:nobo
*/
define(function(require, exports, module){

var SpinnerField = require('./Spinner');

var NumberField = Nex.define('Nex.form.Number', SpinnerField, {
	xtype : 'numberfield',
	
	config : function(){
		return {
			//小数点分隔符 默认是 "."
			decimalSeparator : null,
			//允许小数
			allowDecimals : true,
			//默认精度是2位
			decimalPrecision : 2,
			step : 1,
			maxValue : Number.POSITIVE_INFINITY,
			minValue : Number.NEGATIVE_INFINITY
		};	
	},
	
	formatValue : function(){
		var value = this._super(arguments);
		
		if( this.decimalSeparator ) {
			value = String(value).replace(this.decimalSeparator, ".");	
		}
		
		value = parseFloat(value);
		
		if( isNaN(value) ) return '';
		
		return this.fixPrecision(value);
	},
	
	fixPrecision : function(value){
		var self = this,
			precision = self.decimalPrecision;

        if (!self.allowDecimals || precision <= 0) {
            precision = 0;
        }

        return parseFloat(parseFloat(value).toFixed(precision));	
	},
	
	onSpinnerUp : function(){
		var self = this,
			step = parseFloat(self.step),
			value = parseFloat(self.getValue()),
			maxValue = self.maxValue;
			
		if( isNaN(step) ) return;
		
		value = isNaN(value) ? 0 : value;
		
		value += step;
		
		if( Nex.isFinite(maxValue) ) {
			value = Math.min( value, maxValue )
		}
		
		self.setValue( value ); 
	},
	onSpinnerDown : function(){
		var self = this,
			step = parseFloat(self.step),
			value = parseFloat(self.getValue()),
			minValue = self.minValue,
			maxValue = self.maxValue;
			
		if( isNaN(step) ) return;
		
		value = isNaN(value) ? 0 : value;
		
		value -= step;
		
		if( Nex.isFinite(minValue) ) {
			value = Math.min(Math.max( value, minValue ), maxValue);
		}
		
		self.setValue( value ); 	
	}
});
	
module.exports = NumberField;
});	