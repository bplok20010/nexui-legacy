/*
 author:nobo
*/
define(function(require){
var Nex = require('../Nex');
var BaseField = require('./Base');
var Trigger = require('./mixin/Trigger');

var Display = Nex.define('Nex.form.Display', BaseField,[{
	
	$type: 'display',
	
	xtype : 'displayfield',
	
	config : function(){
		return {
			showSysTriggerBtn : false,
			/**
			*@property {Object<text, handler, align[left|right], cls>}
			*/
			triggers : [],
			//这个2各参数控制是否需要计算Input的宽高
			//如果不控制实际上是通过CSS来控制的 例如：
			// {width : 100%}
			//对于后续的开发这个参数可能比较有用
			enableSetInputHeight :　true,
			enableSetInputWidth :　false,
			//当enableSetInputHeight or enableSetInputWidth开启后
			//下面2各参数会设置值
			inputWrapHeight : null,
			inputWrapWidth : null
		};	
	},
	
	checkSizeChange : function(){
		
		if( this.isInit() ) {
			return this._super(arguments);	
		};
		
		var r, notAutoSize = !this.isAutoHeight() || !this.isAutoWidth(),
			hideInput = notAutoSize && (this.enableSetInputHeight || this.enableSetInputWidth);
		
		var input = this.getInput();
		
		if( hideInput ) {
			input.addClass('nex-hidden-display');
		}
		r = this._super(arguments);
		if( hideInput ) {
			input.removeClass('nex-hidden-display');
		}
		
		return r;
	},
	
	initFieldView : function(){
		this._super(arguments);
		
		if( this.showSysTriggerBtn ) {
			this.initSysTrigger();
		}
		
		this.initTriggersBtn();	
	},
	
	initTriggersBtn : function(){
		if( !this.triggers ) return;
		var self = this;
		
		if( !Nex.isArray( this.triggers ) ) {
			this.triggers = [ this.triggers ];	
		}		
		
		Nex.each( this.triggers, function(trigger){
			self.addTriggerBtn(trigger);	
		} );
	},
	
	onTriggerBtnClick : function(){},
	
	addTriggerBtn : function(trigger){
		var self = this;
		var $trigger = $('<div class="nex-form-trigger" />');
		var $wrap = this.getTriggerWrap();
		
		if( trigger.text ) {
			$trigger.html(trigger.text);
		}
		
		if( Nex.isFunction(trigger.text) ) {
			trigger.text.call(this, $trigger);		
		}
		
		if( trigger.cls ) {
			$trigger.addClass(trigger.cls);	
		}
		
		if( trigger.align == 'left' ) {
			$wrap.prepend($trigger);
		} else {
			$wrap.append($trigger);	
		}
		
		$trigger.on('click', function(e){
			if( trigger.handler ) {
				trigger.handler.call(self);
			}
			
			self.onTriggerBtnClick(trigger);
			self.fireEvent('onTriggerBtnClick', trigger);
		});
		
		$trigger.on('click dbclick mousedown mouseup', function(e){
			e.preventDefault();
		});
		
		return $trigger;
	},
	
	getFocusEl : function(){
		return this.getInput();	
	},
	
	inputTpl : function(){
		return ['<div id="',this.getInputId(),'" type="',this.inputType,'" value="" class="nex-form-field nex-form-field-',this.$type,'"></div>'].join('');	
	},
	
	getInput : function(){
		if( !this.views['input'] ) {
			this.views['input'] = $('#' + this.getInputId());
		}
		return this.views['input'];
	},
	
	getScrollView : function(){
		return this.getInput();
	},
	
	getTriggerWrap: function(){
		if( !this.views['triggerWrap'] ) {
			this.views['triggerWrap'] = $('#'+this.id+'_trigger_wrap');
		}
		return this.views['triggerWrap'];	
	},
	getInputWrap: function(){
		if( !this.views['inputWrap'] ) {
			this.views['inputWrap'] = $('#'+this.id+'_input_wrap');
		}
		return this.views['inputWrap'];	
	},
	getInputWrapTpl: function(){
		var self = this;
		var text = [];
		
		text.push('<div id="',this.id,'_trigger_wrap" class="nex-form-trigger-wrap">',
						'<div id="',this.id,'_input_wrap" class="nex-form-input-wrap">',
							this.inputTpl(),
						'</div>',
					'</div>');
		
		return text.join("");	
	},	
	
	setViewSize : function(){
		var notAutoSize = !this.isAutoHeight() || !this.isAutoWidth(),
			inputWrap = this.getInputWrap(),
			input = this.getInput();
		//this.isAutoHeight()
		this._super(arguments);
		
		//var bd = this.getTriggerWrap();
		var input = this.getInput();
		
		if( notAutoSize && (this.enableSetInputHeight || this.enableSetInputWidth) ) {
			//fix: 如果input内容高度过高，在设置一个比当前小的高度 会无效
			input.addClass('nex-hidden-display');	
			
			if( this.enableSetInputHeight ) {
				this.inputWrapHeight = inputWrap.height();
			}
			
			if( this.enableSetInputWidth ) {
				this.inputWrapWidth = inputWrap.width();
			}
			
			input.removeClass('nex-hidden-display');
			
			if( !this.isAutoWidth() && this.inputWrapWidth ) {
				input.css( 'width', this.inputWrapWidth );	
			}
			
			if( !this.isAutoHeight() && this.inputWrapHeight ) {
				input.css( 'height', this.inputWrapHeight );	
			}	
		}
		
	},
	
	onMouseOver: function(){
		this._super(arguments);	
		var triggerWrap = this.getTriggerWrap();
		triggerWrap.addClass('nex-form-trigger-wrap-over');
	},
	onMouseOut: function(){
		this._super(arguments);	
		var triggerWrap = this.getTriggerWrap();
		triggerWrap.removeClass('nex-form-trigger-wrap-over');	
	},
	onFocus: function(){
		this._super(arguments);
		
		var triggerWrap = this.getTriggerWrap();
		var inputWrap = this.getInputWrap();
		var input = this.getInput();
		triggerWrap.addClass('nex-form-trigger-wrap-focus');
		inputWrap.addClass('nex-form-input-wrap-focus');
		input.addClass('nex-form-field-focus');
	},
	onBlur: function(){
		this._super(arguments);
		
		var triggerWrap = this.getTriggerWrap();
		var inputWrap = this.getInputWrap();
		var input = this.getInput();
		triggerWrap.removeClass('nex-form-trigger-wrap-focus');
		inputWrap.removeClass('nex-form-input-wrap-focus');
		input.removeClass('nex-form-field-focus');
	}
},
Trigger
]);
	
return Display;
});	