define(function(require){
	var Nex = require('../Nex');
	var DropDown = require('./DropDown');
	var ListBox = require('../form/ListBox');
	
	var dropdown = Nex.Class('Nex.mixin.ListBoxDropDown', DropDown, {
		
		config : function(){
			return {
				dropdownClass : ListBox,
		
				multiSplit : ',',
				
				multiSelect : false,
				
				dropdownEdge : 5,
				
				dropdownHideToRemove : true
			};	
		},
		
		setValue : function(){},
		
		getDropDownConfig : function(){
			var self = this,
				opt = this._super(arguments),
				tWrap = this.getDropDownShowAt();
			
			var width = function(){
					var minWidth = tWrap.outerWidth();
					//IE8下初始显示有BUG
					if( this.isInit() ) return Nex.isIE8 ? '' : minWidth;// or return 'auto'
				
					var dpEl =  this.el;
					var maxWidth = $(window).width() - self.dropdownEdge;
					var dpWidth = Math.min(dpEl.outerWidth(), maxWidth);
					
					if( dpWidth < minWidth ) {
						dpWidth = minWidth;
					} else {
						dpWidth = '';		
					}
					
					return dpWidth;
				},
				height = function(){
					if( this.isInit() ) return '';
					
					var dpEl =  this.el;
					var space = self.getAroundSpace();
					var dpHeight = dpEl.outerHeight();
					
					if( dpHeight > (maxHeight = Math.max( space.bottom, space.top ) - self.dropdownEdge) ) {
						dpHeight = maxHeight;	
					} else {
						dpHeight = '';	
					}	
					
					return dpHeight;
				};
			
			opt.cls += ' nex-dropdown-listbox';	
			opt.showLabel = false;
			opt.height = Nex.unDefined( opt.height, height );
			opt.width = Nex.unDefined( opt.width, width );
			opt.items = this.getDropDownData();//Nex.unDefined( opt.items, this.getDropDownData() );
			
			opt['onChange._sys'+this.id] = function(v){
				self.setValue( v, this.getSelectedText() );
			};
			opt['onItemAfterClick._sys'+this.id] = function(e){
				if( !this.multiSelect ) {
					self.hideDropDown();
				}
			};
			opt['onRefreshList._sys'+this.id] = function(){
				if( self.dropdown && self.isDropDownShow() ) {
					console.log('---')
					self.resizeDropDown();	
				}
			};
			opt['onBeforeLoad._sys'+this.id] = function(params){
				self.fireEvent('onBeforeLoad', params);
			};
			opt['onLoadSuccess._sys'+this.id] = function(data){
				self.fireEvent('onLoadSuccess', data);
			};
			opt['onLoadError._sys'+this.id] = function(m, t, x){
				self.fireEvent('onLoadError', m, t, x);
			};
			opt['onLoadComplete._sys'+this.id] = function(){
				self.fireEvent('onLoadComplete');
			};
			
			opt.multiSplit =  this.multiSplit;
			
			opt.multiSelect = this.multiSelect;
			
			opt.value = this.value;
			
			return opt;
		},
		
		getDropDownShowAt : function(){
			if( this.getTriggerWrap ) {
				return this.getTriggerWrap();		
			} else {
				return this._super(arguments);	
			}
		},
		
		//_diffW : null,
		//_diffH : null,
		
		_resetDropDownSize : function(dpEl, input){
			
			dpEl.css({
				left : '',
				top : ''
			});	
			
			input.css({
				width : '',
				height : ''	
			});
			
			dpEl.css({
				width : '',
				height : ''	
			});
			
		},
		
		/**
		 * 每次dropdown显示之前计算和设置dropdown的大小和高度
		 */
		setDropDownSize : function(){
			var dp = this.dropdown;
			
			if(!dp) return this;
			
			var dpEl = dp.el,
				input = dp.getInput(),
				isHidden = dpEl.is(':hidden');
			
			///
			if( isHidden ) {
				dpEl.show();		
			}	
			
			this._resetDropDownSize(dpEl, input);
			//必须强制刷新大小，因为计算后大小没有发生改变，
			//那么就不会执行setSize...而此时_resetDropDownSize已经把宽高给重置了
			dp.resize(true);
			
			if( isHidden ) {
				dpEl.hide();
			}
			
			return this;
		},
		
		resizeDropDown : function(){
			
			this.setDropDownSize();
			this.setDropDownPos();
			
			return;
		}, 
		
		refreshDropDown : function(){
			if( this.dropdown ) {
				this.dropdown.refresh();	
			}
			
			return this;
		},
		
		//onDropDownHide : function(){},
		
		onDropDownShow : function(){
			this._super(arguments);
			
			var dp = this.dropdown;
			
			if( dp ) {
				//多选情况
				var value = (dp.getValue() + '').split( this.multiSplit );
				dp.scrollToIndex( dp.indexOfValue( value[0] ) );
				
			}
			
			return this;	
		}
	});
	
	return dropdown;
});