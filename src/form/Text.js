/*
 author:nobo
*/
define(function(require){
	var Nex = require('../Nex');
	var DisplayField = require('./Display');

	var Text = Nex.define('Nex.form.Text', DisplayField,{
		$type: 'text',
		
		xtype : 'textfield',
		
		config : function(){
			return {
				enableLabelFor : true,
				
				enableSetInputHeight : false,
				enableSetInputWidth : false,
				
				tabIndex : 0,
				
				inputTextChangeEvent : 'onChange',
				
				checkChangeEvents: Nex.isIE && (!document.documentMode || document.documentMode < 9) ?
								['change', 'propertychange'] :
								['change', 'input', 'textInput', 'keyup', 'dragdrop'],
				
				checkChangeDelay: 50,	
				
				checkChangeRe : /value/,
				
				//开启placeholder支持
				//对于非input 不要开启
				enablePlaceholder : true,
				placeholder: '',
				emptyText: ''
			};	
		},
		
		inputTpl : function(){
			return [
				'<input id="',this.getInputId(),'" name="',this.name,'" type="',this.inputType,'" autocomplete=',this.autocomplete,' class="nex-form-field nex-form-field-',this.$type,'">'
				].join('');	
		},
		
		getPlaceholderTpl: function(){
			//', this.valueForm( this.placeholder || this.emptyText, '' ) ,'
			return ['<label for="', this.getInputId() ,'" id="',this.id,'_placeholder" class="nex-form-placeholder"></label>'].join('');
		},
		
		initEvents: function(){
			this._super(arguments);
			this.initInputChange();	
		},
		usesPropertychange : false,
		initInputChange: function(){
			var self = this,
				input = self.getInput(),
				events = self.checkChangeEvents,
				len = events.length,
				i, event;

			if (input) {
				for (i = 0; i < len; ++i) {
					event = events[i];
					if (event === 'propertychange') {
						self.usesPropertychange = true;
					}
					input.bind(event, function(e){
						self.checkInputChange(e);
					});
				}
			}
		},
		__timerChange: 0,
		checkInputChange: function(e){
			var self = this;
			if( this.isInit() 
				|| e.type == 'propertychange' && !self.checkChangeRe.test(e.originalEvent.propertyName.toLowerCase()) ) {
				return;	
			}
			
			var v = self.getInputValue();
			
			this.onInputChange(v);
			
			if( this.enablePlaceholder ) {
				this.togglePlaceholder();
			}
			
			if( this.__timerChange ) {
				clearTimeout( this.__timerChange );	
			}
			
			this.__timerChange = setTimeout(function(){
				self.__timerChange = 0;
				
				if( self.inputTextChangeEvent == 'onChange' ) {
					if( self.enableInputChange  ) {
						self.setValue( v );
					}
				} else {
					self.fireEvent( self.inputTextChangeEvent, v );
				}
					
			}, self.checkChangeDelay);
			
		},
		onInputChange: function(){},
		
		onAfterCreate: function(){
			
			this._super(arguments);
			
			if( this.enablePlaceholder ) {
			
				this.initPlaceholder();
			
				this.togglePlaceholder();
			}
		},
		/*
		* placeholder 只支持input标签
		*/
		initPlaceholder: function(){
			
			var input = this.getInput();
			
			var placeholder = this.valueForm( this.placeholder || this.emptyText, '' );
			if( Nex.support.placeholder ) {
				input.prop('placeholder', placeholder);
			} else {
				var inputWrap = this.getInputWrap();
				var $placeholder = $(this.getPlaceholderTpl());
				$placeholder.html(placeholder);
				inputWrap.append($placeholder);
			}
		},
		getPlaceholder: function(){
			if( !this.views['placeholder'] ) {
				this.views['placeholder'] = $('#'+this.id+'_placeholder');	
				this.views['placeholder'] = this.views['placeholder'].length ? this.views['placeholder'] : null;
			}
			return this.views['placeholder'];
		},
		togglePlaceholder: function(){
			
			if( Nex.support.placeholder ) return this;
			
			var value = this.getInputValue();
			
			var placeholder = this.getPlaceholder();
			
			if( !placeholder ) return this;
			
			if( Nex.isEmpty( value ) ) {
				placeholder.addClass('nex-form-placeholder-show');
			} else {
				placeholder.removeClass('nex-form-placeholder-show');	
			}	
			
			return this;
		}
	});
	
	return Text;
});	