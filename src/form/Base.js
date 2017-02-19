/*
 author:nobo
*/
define(function(require){
	var Nex = require('../Nex');
	var FormManager = require('./Manager');
	var validator = require('../util/validator');
	var container = require('../container/Container');

	var Base = Nex.define('Nex.form.Base', container,{
		$type: 'base',
		xtype : 'basefield',
		prefix : 'form-',
		componentCls : 'nex-form',
		config : function(){
			return {
				autoRenderData : false,
				//不需要容器的事件
				denyEvents : true,
				borderCls : 'nex-form-border',
				autoScroll : false,
				tabIndex : null,
				//inline|block|box 对应的css属性： table-inine|table|block
				display : 'inline',
				//当出现字段拥有多选时
				multiSplit : ',',
				/*private*/
				inputType : 'text',
				inputAttrs : null,
				inputStyle : null,
				//width=auto时 有效
				bodyStyle : null,
				//是否创建后获得焦点
				autoFocus : false,
				//是否开启Label显示 atuo:如果存在labelText==''则不显示 否则显示， true:显示 false：不显示  
				showLabel : 'auto',
				labelCls : '',
				labelStyle : null,
				labelPosition : 'left',//left top bottom right
				labelAlign : 'left',
				labelvAlign : 'middle',
				labelText : '',
				//如果labelWidth没设置时
				//自动设置autoLabelWidth
				autoLabelWidth : true,
				labelWidth : '',
				//showPlaceholder : true,
				//placeholder : '',
				//emptyText
				autocomplete : 'off',
				//设置分组
				group : 'default',//分组
				//表单name
				name : '',
				//表单默认值
				value : void 0,
				lastValue : void 0,
				origValue : void 0,
				//inputTextChangeEvent : 'onChange',// onInputChange
				//inner或者outer
				//triggerBtnsPosition : 'inner',
				//triggerBtnsTakeSpace : false,//触发按钮会占用input空间
				//triggerBtns : [],
				//triggerBtnSelection : false,
				//点击triggerBtn输入框也会获得焦点 默认关闭
				//triggerToFocus : false,
				//
				enableLabelFor : false,
				
				//数据设置时改变数据的值
				formatter : null,
				//数据获取是可改变数据的值
				getFormatter : null,
				//数据设置最终控制
				setFormatter : null,
				
				validateOnBlur : true,
				validateOnChange : true,
				validator : validator,
				rules : [],
				validCls : 'nex-form-valid-success',
				invalidCls : 'nex-form-valid-error',
				invalidMsg : validator.invalidMsg,
				validText : '',
				invalidText : '',
				//autoValidDelay : 50,
				//autoValidEvents : ['onChange','onBlur','onPaste'],
				disabled : false,
				readOnly : false,
				cls : '',
				overCls : '',
				focusCls : '',
				disabledCls : '',
				readOnlyCls : '',
				virtualScrollWrapper : false
			};
		},
			
		initComponent : function() {
			this._super( arguments );
			
			this.validMsgs = {};
			
			this.componentCls += ' nex-form-type-' + this.$type + ' nex-form-display-' + this.display;
			
			this.name = Nex.isEmpty( this.name ) ? Nex.uuid() : this.name;
			
			FormManager.set(this);
		},
		
		onRender : function(){
			this._super( arguments );
			
			this.initFieldView();	
		},
		getInputId: function(){
			return this.id + '_input';	
		},
		labelTpl : function(){
			var labelFor = this.enableLabelFor ? ('for="'+this.getInputId()+'"') : '';
			return ['<label id="',this.id,'_label" ', labelFor,' class="nex-form-label nex-form-label-',this.labelPosition,' label-text-valing-', this.labelvAlign,' label-text-',this.labelAlign,' ', this.labelCls,'"><span id="',
				this.id, '_label_text'
			,'" class="nex-form-label-text">',this.labelText,'</span></label>'].join('');		
		},
		inputTpl : function(){
			return ['<div id="',this.getInputId(),'" type="',this.inputType,'" name="',this.name,'" autocomplete="',this.autocomplete,'" tabindex=',this.tabIndex,' value="" class="nex-form-field nex-form-field-',this.inputType,'"></div>'].join('');	
		},
		getInputWrapTpl: function(){
			return '';	
		},
		formTpl : function(d){
			var text = [];
			
			text.push('<div id="',this.id,'_body" class="nex-form-body nex-form-',this.$type,'-body">',this.getInputWrapTpl(),'</div>');
			
			return text.join("");	
		},
		/*
		*获取表单模版
		*/
		getFormTpl : function(){
			
			var showLabel = this.showLabel;
			if( showLabel === 'auto' ) {
				showLabel = this.labelText === '' ? false : true;
			}	
			
			var labelTpl = showLabel ? this.labelTpl() : '';
			
			var formTpl = this.formTpl();
			
			return [labelTpl, formTpl].join('');
		},
		
		getLabel : function(){
			if( !this.views['label'] ) {
				this.views['label'] = $('#'+this.id+'_label');
				this.views['label'] = this.views['label'].length ? this.views['label'] : null;
			}
			return this.views['label'];
		},
		
		getLabelText : function(){
			if( !this.views['labelText'] ) {
				this.views['labelText'] = $('#'+this.id+'_label_text');
				this.views['labelText'] = this.views['labelText'].length ? this.views['labelText'] : null;
			}
			return this.views['labelText'];
		},
		
		setLabel: function(){
			var label = this.getLabel();
			if( !label ) {
				this.el.append( $(this.labelTpl()) );
				this.setLabelPosition(this.labelPosition || 'left');	
			}	
			return this;
		},
		
		initFieldView : function(){
			var bd, 
				input,
				el = this.el;
			
			el.html( this.getFormTpl() );
			
			bd = this.getBody();
			
			input = this.getInput();
			
			var label = this.getLabel();
			
			this.setLabelPosition(this.labelPosition || 'left');
			
			if( this.bodyStyle ) {
				bd.css(this.bodyStyle);	
			}
			
			if( this.labelStyle ) {
				label.css(this.labelStyle);	
			}
			
			if( this.inputAttrs ) {
				input.css(this.inputAttrs);	
			}
			
			if( this.inputStyle ) {
				input.css(this.inputStyle);	
			}
			
		},
		
		//重写覆盖父类的初始事件
		initEvents: function(){
			this._super( arguments );
			this.initBaseEvents();	
		},
		
		getBody : function(){
			if( !this.views['body'] ) {
				this.views['body'] = $('#'+this.id+'_body');	
			}
			return this.views['body'];
		},
		
		getScrollView : function(){
			return this.getInput();	
		},
		
		initBaseEvents: function(){
			var self = this;
			var label = this.getLabel();
			var input = this.getInput();
			var wrap = this.getTriggerWrap();
			
			if( label ) {
				label.bind({
					'click.base': function(e){
						if(self.fireEvent('onLabelClick', e) === false) {
							e.stopPropagation();
							e.preventDefault();
						}
					},
					'dblclick.base': function(e){
						if(self.fireEvent('onLabelDbClick', e) === false) {
							e.stopPropagation();
							e.preventDefault();
						}
					}	
				});
			}
			
			wrap.bind({
				'mouseenter.base' : function(e){
					if( self.disabled || self.readOnly ) {
						return;	
					}
					self.onMouseOver();
					var r = self.fireEvent('onMouseOver', e);	
					if( r === false ) return false;
				},
				'mouseleave.base' : function(e){
					if( self.disabled || self.readOnly ) {
						return;	
					}
					self.onMouseOut();
					var r = self.fireEvent('onMouseOut', e);	
					if( r === false ) return false;
				}
			});
			
			var events = {
				'click.base' : function(e) {
					if( self.disabled || self.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onClick', e);	
					if( r === false ) return false;
				},
				'keydown.base' : function(e) {
					if( self.disabled || self.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onKeyDown', e);	
					if( r === false ) return false;
					
				},
				'keyup.base' : function(e) {
					if( self.disabled || self.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onKeyUp', e);	
					if( r === false ) return false;
				},
				'keypress.base' : function(e){
					if( self.disabled || self.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onKeyPress', e);	
					if( r === false ) return false;
				},
				'paste.base' : function(e){
					if( self.disabled || self.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onPaste', e);	
					if( r === false ) return false;
				},
				'mousedown.base' : function(e) {
					if( self.disabled || self.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onMouseDown', e);	
					if( r === false ) return false;
				},
				'mouseup.base' : function(e) {
					if( self.disabled || self.readOnly ) {
						return;	
					}
					var r = self.fireEvent('onMouseUp', e);	
					if( r === false ) return false;
				}
			};
			
			input.bind(events);
		},
		
		setViewSize : function(){
			var self = this;
			this._super(arguments);
			
			var label = this.getLabel();
			
			if( label && label.length ) {
				switch( this.labelPosition ) {
					case 'left' : 
					case 'right' : 
						if( !Nex.isEmpty(self.labelWidth) ) {
							label.css( 'width', self.labelWidth );
						} else if( self.autoLabelWidth/* && !self.isAutoWidth()*/ ){//isAutoWidth检测会导致max min 设置问题
							var labelText = self.getLabelText();
							labelText && label.width(labelText.outerWidth());	
						}
						break;
					case 'top' :
						label.width('');
						break;
				}
			}
			
		},
		
		setLabelPosition : function(pos){
			var label = this.getLabel();
			var bd = this.getBody();
			if( label && label.length ) {
				if( pos == 'left' || pos == 'top' ) {
					bd.before( label );
				}
				if( pos == 'right' ) {
					bd.after( label );
				}
			}
			
			if( !this.isInit() ) {
				this.setViewSize();	
			}
			return this;
		},
		
		setLabelText : function( text ){
			var label = this.getLabelText();
			label.html(text);
			this.labelText = text;
			
			this.setViewSize();
			
			return this;	
		},
		
		setLabelWidth : function( w ){
			var label = this.getLabel();
			
			if( !label || !label.length ) return this;
			
			this.labelWidth = w;
			
			this.setViewSize();
			
			return this;	
		},
		
		onAfterCreate : function(){
			this._super(arguments);	
				
			if( this.disabled ) {
				this.disable();
			}
			if( this.readOnly ) {
				this.setReadOnly( true );
			}
			
			if( this.autoFocus ) {
				this.focus();	
			}
			
			this.origValue = this.value;
			if( this.value !== void 0 ) {
				this.setDefaultValue();
			}
		},
		
		setDefaultValue : function(){
			this.setValue( this.value );		
		},
		
		getTriggerWrap : function(){
			return this.getBody();	
		},
		
		getInput : function(){
			return this.getBody();
		},
		//判断元素是否属于input, textarea, select 和 button 元素
		isInput : function( el ){
			return $(el).is(':input');	
		},
		isEqual: function(value1, value2) {
			return String(value1) === String(value2);
		},
		/*
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
			//设置input不触发onChange
			this.enableInputChange = false;
			
			this.isInput( input ) ? input.val( value ) : input.html( value );
			
			this.enableInputChange = _save;
			
			return this;
		},
		/*
		*private
		*/
		getInputWidth : function(){
			return this.getInput().outerWidth();		
		},
		valueToRaw : function(v){
			return v;	
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
			
			value = this.valueToRaw(value);
			
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
		
		rawToValue : function(v){
			return v;	
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
			
			v = this.rawToValue(v);
			
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
		
		onChange: function(){
			if( this.validateOnChange ) {
				this.validateValue();
			}	
		},
		
		onMouseOver: function(){
			this._super(arguments);	
			this.el.addClass('nex-form-over '+ this.overCls);
		},
		
		onMouseOut: function(){
			this._super(arguments);	
			this.el.removeClass('nex-form-over '+ this.overCls);	
		},
		/*
		onFocus: function(){
			this._super(arguments);	
			this.el.addClass('nex-form-focus '+ this.focusCls);	
		},
		
		onBlur: function(){
			this._super(arguments);	
			this.el.removeClass('nex-form-focus '+ this.focusCls);	
		},
		*/
		disable: function(){
			var input = this.getInput();
			this.disabled = true;
			this.el.addClass( ['nex-form-disabled',this.disabledCls].join(' ') );
			
			if( this.isInput(input) ) {
				input.prop('disabled', true);	
			}
			
			if( !this.isInit() ) {
				this.fireEvent('onDisabled');
			}
			return this;		
		},
		enable: function(){
			var input = this.getInput();
			this.disabled = false;
			this.el.removeClass( ['nex-form-disabled',this.disabledCls].join(' ') );	
			
			if( this.isInput(input) ) {
				input.prop('disabled', false);	
			}
			
			if( !this.isInit() ) {
				this.fireEvent('onEnable');
			}
			return this;
		},
		setDisabled : function( disabled ){
			return this[disabled ? 'disable' : 'enable']();
		},
		setReadOnly : function( flag ){
			var input = this.getInput();
			var flag = !!flag;
			
			this.readOnly = flag;
			
			this.el[flag ? 'addClass' : 'removeClass']( ['nex-form-readonly',this.readOnlyCls].join(' ') );	
			
			if( this.isInput(input) ) {
				input.prop('readonly', flag);	
			}
		
			return this;
		},
		
		isFocusable : function(){
			if( this.disabled || this.readOnly ) {
				return false;	
			}
			return this._super(arguments);	
		},
		onFocus : function(){
			if( this.disabled || this.readOnly ) {
				return;	
			}
			var el = this.el;
			el.addClass('nex-form-focus');
			if( this.focusCls ) {
				el.addClass(this.focusCls);	
			}	
		},
		onBlur : function(){
			var el = this.el;
			el.removeClass('nex-form-focus');
			if( this.focusCls ) {
				el.removeClass(this.focusCls);	
			}
			
			if( this.validateOnBlur ) {
				this.validateValue();
			}
		},
		/*
		hidden : function(){
			return this.hide();
		},
		*/
		select : function(){
			var self = this;
			try{
				self.getInput().select();
			}catch(e){};
		},
		selectText : function(start, end){
			var v = this.val(),
				undef,
				el = this.getInput().get(0),
				range;
	
			if (v.length > 0) {
				start = start === undef ? 0 : start;
				end = end === undef ? v.length : end;
				if (el.setSelectionRange) {
					el.setSelectionRange(start, end);
				}
				else if(el.createTextRange) {
					range = el.createTextRange();
					range.moveStart('character', start);
					range.moveEnd('character', end - v.length);
					range.select();
				}
			}
			this.focus();
			return this;
		},
		/*
		 * 用于validateValue
		 */
		getValidValue : function(){
			return this.getValue();	
		},
		/**
		* 获取所有验证列表
		*/
		getValidList : function(){
			var self = this,
				vaildList = [],
				validator = self.validator,
				rules = Nex.isArray(self.rules) ? self.rules : [ self.rules ];
				
			function parseValid(method, vtype, params){
				var _method = method;
				
				if( Nex.isRegExp(method) ) {
					method = function(value){
						return _method.test(value);
					}	
				}
				
				return {
					method : method,
					vtype : vtype,
					params : params
				};
			}	
			
			for( var i=0;i<rules.length;i++ ) {
				rule = rules[i];
				if( Nex.isFunction(rule) || Nex.isRegExp(rule) ) {
					vaildList.push( parseValid(rule, null, null) );
				} else if( Nex.isPlainObject(rule) ){
					for(var vtype in rule ) {
						if( Nex.isFunction(rule[vtype]) || Nex.isRegExp(rule[vtype]) ) {
							vaildList.push( parseValid(rule[vtype], vtype, null) );
						} else if( (vtype in validator) 
									&& (Nex.isFunction( validator[vtype] ) || Nex.isRegExp( validator[vtype]) ) ){
							vaildList.push( parseValid(validator[vtype], vtype, rule[vtype]) );
						}
					}
				} else if( typeof rule === 'string' 
							&& ( rule in validator ) 
							&& (Nex.isFunction( validator[rule] ) || Nex.isRegExp( validator[rule] )) 
				) {
					vaildList.push( parseValid(validator[rule], rule, null) );
				}
			}	
			
			return vaildList;
		},
		/**
			rules : 'required'
			rules : [ function(value){ return true/false }, 
					'required',  {
						gender : function( value ){
								return true/false
							},
						max : 98
					}  ]
		*/
		validateValue : function(value){
			var self = this,
				value = Nex.unDefined(value, self.getValidValue()),
				validList = self.getValidList();
			
			var invalid = false;
			
			Nex.each(validList, function(validator){
				if( !invalid && validator.method.call(self, value, validator.params) === false ) {
					invalid = validator;
					return false;
				}	
			});		
			
			if( invalid ) {
				
				var invalidText = invalid.vtype ?　(self.invalidMsg[invalid.vtype] || self.invalidText) : self.invalidText;
				
				self.onValidError(invalidText, invalid.vtype);
				
				self.fireEvent("onValidError", invalidText, invalid.vtype);	
			} else {
				self.onValidSuccess(self.validText);
				self.fireEvent("onValidSuccess", self.validText);		
			}
			
			return !invalid;
		},
		setValidError : function(){
			var el = this.el;
			this.resetVaildCss();
			el.addClass('nex-form-valid-error '+this.invalidCls);
		},
		setValidSuccess : function(){
			var el = this.el;
			this.resetVaildCss();
			el.addClass('nex-form-valid-success '+this.validCls);
		},
		resetVaildCss : function(){
			var el = this.el;
			el.removeClass('nex-form-valid-error '+this.invalidCls);	
			el.removeClass('nex-form-valid-success '+this.validCls);	
			return this;
		},
		onValidError: function(msg, vtype){
			this.setValidError(msg, vtype);	
		},
		onValidSuccess: function(msg){
			this.setValidSuccess(msg);	
		},
		isValid : function(){
			return this.validateValue();	
		},
		valid : function(){
			return this.validateValue();		
		},
		"reset" : function(){
			//var self = this;
			this.value = this.origValue;
			
			//初始值设置
			this.setValue( this.value );	
			
			this.blur();
			//clearTimeout( this._ct );//取消验证 clearInvalid
			this.resetVaildCss();	
		}
	});
	
	return Base;
});	