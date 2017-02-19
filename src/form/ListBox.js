/*
 author:nobo
*/
define(function(require){
	
	var util = require('../util/Utils');
	
	var Store = require('../data/Store');
	
	var BaseField = require('./Base');

	var ListBox = Nex.define('Nex.form.ListBox', BaseField,{
		$type: 'listbox',
		
		xtype : 'listboxfield',
		
		$itemCls : 'nex-form-listbox-item',		
		$itemSelectedCls : 'nex-form-listbox-item-selected',
		$itemOverCls : 'nex-form-listbox-item-over',
		$itemDisabledCls : 'nex-form-listbox-item-disabled',
		$itemTpl : '<div id="<%=$$id%>" <%=tips%> data-index="<%=index%>" class="<%=cls%>"><%=text%></div>',
		$itemSplitLineTpl : '<div class="nex-form-item-separator"><div class="nex-form-line-h"></div></div>',
		
		config : function(){
			return {
				selectionable : false,
		
				enableLabelFor : false,
				
				enableFixWidth : false,
				
				store : null,
				
				labelvAlign : 'top',
				
				height: 90,
				
				items: null,
				
				itemSplitChr : ['-',',',';','|'],
				
				itemFormatter: null,
				
				itemFilter: null,
				
				itemNoWrap: true,
				
				itemDefaults : {},
				
				//这里需要优化 
				itemTooltip: {
					enable: false,
					tag: 'title',
					tipsField: 'tips',
					formatter: null
				},
				
				valueField: 'value',
				textField: 'text',
				disabledField: 'disabled',
				clsField: 'cls',
				//点击时，是否多选
				//对于接口不受限制
				multiSelect: false,
				autoScroll : true,
				overflowX : 'hidden'
			};	
		},
		
		_enableSelectItem : true,
		
		checkSizeChange : function(){
			
			if( this.isInit() ) {
				return this._super(arguments);	
			};
			//由于table 会撑大容器，这里要先隐藏
			var input = this.getInput();
			var r;
			input.addClass('nex-hidden-display');
			r = this._super(arguments);
			input.removeClass('nex-hidden-display');
			
			return r;
		},
		
		inputTpl : function(){
			return [
				'<div id="',this.getInputId(),'" class="nex-form-field nex-form-field-listCt nex-form-field-',this.$type,'"></div><input id="',this.getInputId(),'_real" type="hidden" name="',this.name,'" />'
				].join('');	
		},
		
		getInputWrapTpl: function(){
			return this.inputTpl();	
		},
		
		formTpl : function(d){
			var self = this;
			var text = [];
			
			text.push('<div id="',this.id,'_body" class="nex-form-body nex-form-list-wrap nex-form-',this.$type,'-body">',this.getInputWrapTpl(),'</div>');
			
			return text.join("");	
		},
		
		initComponent: function(){
			this.items = this.items || [];
			
			this._super(arguments);
			
			this.setStore(this.items);
		},
		
		scroller : null,
		/*initFieldView : function(){
			this._super(arguments);
		},*/
		
		initEvents: function(){
			this._super( arguments );
			
			this.initListBoxEvents();
		},
		
		setStore : function(items){
			var self = this,
				isStoreChange = false;
			
			if( this.store ) {
				this.store.off('.'+this.id);	
				isStoreChange = true;
			}
			
			if( Nex.isStore(items) ) {
				this.store = items;	
			} else {
				this.store = new Store({
					pageSize : 0,//获取所有数据
					request : Nex.isFunction(items) ? items : null,
					data : Nex.isArray(items) ? items : [items]	
				});
			}
			
			this.store.bind('onChange.'+this.id, function(e){
				self.createListHTML();	
				
				self.fireEvent('onDataChange');
			});
			
			this.store.bind('onBeforeLoad.'+this.id, function(params){
				self.fireEvent('onBeforeLoad', params);
			});	
			
			this.store.bind('onLoadSuccess.'+this.id, function(data){
				self.fireEvent('onLoadSuccess', self.store.unWrapAll(data));
			});	
			
			this.store.bind('onLoadError.'+this.id, function(msg, ts, xhr){
				self.fireEvent('onLoadError', msg, ts, xhr);
			});	
			
			this.store.bind('onLoadComplete.'+this.id, function(){
				self.fireEvent('onLoadComplete');
			});	
			
			if( isStoreChange ) {
				self.fireEvent('onDataChange');	
			}
		},
		
		doRenderData: function(){
			
			this.createListBox();
			
		},
		
		getOhterHeight : function(){
			return 0;	
		},
		
		setViewSize: function(){
			this._super(arguments);
			
			//var isAutoWidth = this.isAutoWidth();
			var isAutoHeight = this.isAutoHeight();
			
			var bd = this.getBody();
			var input = this.getInput();
			
			/** 
			 * 由于table一旦被内容撑高后，无法再通过100%来设置,这里的高度计算必须要先隐藏input内容，然后再计算
			 */
			if( !isAutoHeight ) {
				input.addClass('nex-hidden-display');
				var bdHeight = bd.height();
				input.removeClass('nex-hidden-display');
				input.css('height', bdHeight - this.getOhterHeight());	
			} else {
				input.css('height', '');	
			}
			
			if( !this.isInit() ) {
				this.updateScrollBar();
			}
			
			
		},
		
		/**
		* 修正自适应时滚动条占位置问题
		*/
		fixAutoWidth: function(){
			var isAutoWidth = this.isAutoWidth();
			var input = this.getInput();
			var bd = this.getBody();
	
			if( isAutoWidth && this.enableFixWidth ) {
				//重置之前设置并重新计算
				input.css('width', '');
				if( util.hasScroll( input[0], 'top' ) ) {
					var scrollSize = util.getScrollbarSize();
					//IE 有点问题。。。
					input.css('width', input.outerWidth() + scrollSize.width + (Nex.isIE ? 1 : 0));	
				}
			} else {
				input.css('width', '');			
			}
		},
		
		getInput : function(){
			if( !this.views['input'] ) {
				this.views['input'] = $('#' + this.getInputId());
			}
			
			return this.views['input'];
		},
		
		getItemEl : function(index){
			return $('#' + this.id + '_index_' + index);	
		},
		
		getSelectedData : function(){
			var self =  this,
				valueField = this.valueField,
				input = this.getInput(),
				values = [];
			
			$('>.'+this.$itemSelectedCls, input).each(function(){
				var $this = $(this);
				var index = $this.data('index');
				var data = self.getAt(index, true);//self.normalizeItem(store.unWrap(store.getAt(index)));	
				
				values.push(data);
			});	
			
			return values;
		},
		
		getSelectedValue : function(){
			var i,
				multiSplit = this.multiSplit,
				valueField = this.valueField,
				selData = this.getSelectedData(),
				values = [];
			
			for( i = 0; i < selData.length; i++ ) {
				values.push( selData[i][valueField] );		
			}
			
			return values.join(multiSplit);
		},
		
		getSelectedText : function(){
			var i,
				multiSplit = this.multiSplit,
				textField = this.textField,
				selData = this.getSelectedData(),
				values = [];
			
			for( i = 0; i < selData.length; i++ ) {
				values.push( selData[i][textField] );		
			}
			
			return values.join(multiSplit);
		},
		
		_clearSelected : function(){
			var input = this.getInput();
			
			$('>.'+this.$itemCls, input).removeClass(this.$itemSelectedCls);
		},
		
		_selectIndex : function(index){
			var itemEl = this.getItemEl(index);
			
			itemEl.addClass(this.$itemSelectedCls);
		},
		
		isSelected : function(index){
			var itemEl = this.getItemEl(index);
			
			return itemEl.hasClass(this.$itemSelectedCls);	
		},
		
		clearSelect : function(){
			this._clearSelected();
			this._enableSelectItem = false;
			this.setValue('');
			this._enableSelectItem = true;
			
			this.fireEvent('onDeselectAll');
			
			return this;	
		},
		
		getInputText : function(){
			return this.getSelectedText();
		},
		
		getInputValue : function(){
			return this.getSelectedValue();
		},
		
		getInputReal : function(){
			if( !this.views['inputReal'] ) {
				this.views['inputReal'] = $('#'+this.getInputId()+'_real');	
			}
			
			return this.views['inputReal'];	
		},
		
		setInputValue : function(value){
			
			if( !this._enableSelectItem ) {
				return this;	
			}
						
			var i,
				index,
				_save,
				splitStr = this.multiSplit,
				input = this.getInput(),
				value = this.valueForm(value, ''),
				valueArr = [];
					
				
			this._clearSelected();
			
			valueArr = Nex.isArray(value) ? value : (value + '').split(splitStr);
			
			if( !valueArr.length ) return this;
			/*
			if( !this.multiSelect ) {
				valueArr = [valueArr.pop()];	
			}
			*/
			for( i = 0; i < valueArr.length; i++ ) {
				index = this.indexOfValue(valueArr[i]);	
				
				if( index === -1 ) continue;
				
				if( i == 0 ) {
					//这里应该用Nex.delay 执行 不然数据刷新时无法更新
					this.scrollToIndex(index);		
				}
				
				this._selectIndex(index);
			}
			
			return this;
		},
		
		getText : function(){
			return this.getSelectedText();	
		},
		
		setValue : function(value){
			var splitStr = this.multiSplit,
				valueArr = [],
				inputReal = this.getInputReal(),
				args = [].slice.apply(arguments);
			
			if( !arguments.length ) {
				return this;	
			}
			
			valueArr = Nex.isArray(value) ? value : (value + '').split(splitStr);
			
			if( !this.multiSelect && valueArr.length ) {
				valueArr = [valueArr.pop()];	
			}
			
			args[0] = valueArr.join(splitStr);
			
			inputReal.val(args[0]);
			
			return this._super(args);	
		},
		
		selectItem : function(value){
			return this.select(value);
		},
		
		select : function(value){
			var index = this.indexOfValue(value),
				itemEl = this.getItemEl(index);
			
			if( index != -1 && !this.isSelected(index) ) {
				itemEl.trigger('click');
			}	
			
			return this;
		},
		
		deselect : function(value){
			var index = this.indexOfValue(value),
				itemEl = this.getItemEl(index);
				
			if( index != -1 && this.isSelected(index) ) {
				itemEl.removeClass(this.$itemSelectedCls);
				this.setValue(this.getSelectedValue());
			}
			
			return this;	
		},
		
		deselectAll : function(){
			return this.clearSelect();	
		},
		
		/**
		* 全选 单选时无效
		*/
		selectAll : function(){
			
			var i,
				multiSelect = this.multiSelect,
				self = this,
				input = this.getInput(),
				valueField = this.valueField,
				multiSplit = this.multiSplit,
				selected = [];
				
			$('>.'+this.$itemCls, input).each(function(){
				var index, data, $this = $(this);
				
				if( !$this.hasClass(self.$itemDisabledCls) ) {
					index = $(this).data('index');	
					data = self.getAt(index, true);
					selected.push( data[valueField] );
					$this.addClass(self.$itemSelectedCls);
				}
				
				if( !multiSelect ) {
					return false;	
				}
				
			});
			
			self._enableSelectItem = false;
			self.setValue( selected.join(multiSplit) );
			self._enableSelectItem = true;
					
			self.fireEvent('onSelectAll');
			
			return this;
		},
		
		onSelect : function(){},
		onDeselect : function(){},
		
		initListBoxEvents: function(){
			var self = this,
				list = this.getInput(),
				valueField = this.valueField,
				callback = function(ev, e, call){
					var r,
						$this = $(this),
						index = $this.data('index'),
						data = self.getAt(index, true);
					
					if( data[self.disabledField] || $this.hasClass(self.$itemDisabledCls) ) {
						return false;	
					}
					
					r = self.fireEvent(ev, data, index, this, e);
					
					if( r !== false && Nex.isFunction(call) ) {
						call($this, index, data);	
					}
					
					if( ev == 'onItemClick' ) {
						self.fireEvent('onItemAfterClick', data, index, this, e);	
					}
					
					return r;
				};
				
			var selectedCall = function($this, index, data){
					var def = [],
						multiSplit = self.multiSplit,
						isChange = true,
						values = [];
					
					self.scrollToIndex(index);
					
					if( self.readOnly || self.disabled ) return;
						
					if( self.multiSelect ) {
						
						if( $this.hasClass(self.$itemSelectedCls) ) {
							$this.removeClass(self.$itemSelectedCls);
							self.onSelect(data[valueField], data, index);
							self.fireEvent('onDeselect', data[valueField], data, index);
						} else {
							$this.addClass(self.$itemSelectedCls);	
							self.onSelect(data[valueField], data, index);
							self.fireEvent('onSelect', data[valueField], data, index);
						}
						
					} else {
						
						if( !$this.hasClass(self.$itemSelectedCls) ) {
							self._clearSelected();
							$this.addClass(self.$itemSelectedCls);
							self.onSelect(data[valueField], data, index);
							self.fireEvent('onSelect', data[valueField], data, index);
						} else {
							isChange = false;	
						}
						
					}
					
					if( !isChange ) return;
					
					values = self.getSelectedData();
					
					for( var i = 0; i < values.length; i++ ) {
						def.push( values[i][valueField] );
					}
					//触发onChange
					self._enableSelectItem = false;
					self.setValue( def.join(multiSplit) );		
					self._enableSelectItem = true;
					
				};
				
			list.delegate('>.'+this.$itemCls,{
				"mouseenter" : function(e){
					var r = callback.call(this, 'onItemOver', e, function(el, index, data){
						self.onItemOver(el, index, data);	
					});
				},
				"mouseleave" : function(e){
					var r = callback.call(this, 'onItemOut', e, function(el, index, data){
						self.onItemOut(el, index, data);	
					});
				},
				"click" : function(e){
					var r = callback.call(this, 'onItemClick', e, selectedCall);
				},
				"dblclick" : function(e){
					var r = callback.call(this, 'onItemDblClick', e);
				},
				"contextmenu" : function(e){
					var r = callback.call(this, 'onItemContextMenu', e);
					
				},
				"mousedown" : function(e){
					var r = callback.call(this, 'onItemMouseDown', e);
					
				},
				"mouseup" : function(e){
					var r = callback.call(this, 'onItemMouseUp', e);
					
				}
				
			});	
		},
		
		_createItemHtml : function(data){
			var cls = [this.$itemCls];
			if( data.nowrap ) {
				cls.push('nex-nowrap');	
			}
			if( data.disabled ) {
				cls.push( this.$itemDisabledCls );	
			}
			cls.push(data.cls || '');
			
			data.cls = cls.join(' ');
			
			return this.tpl(this.$itemTpl, data);	
		},
		
		generateItemHTML: function(index, data){
			var rawData = data,
				tooltip = Nex.extend({
					enable: false,
					tag: 'title',
					tipsField: 'text',
					formatter: null	
				}, this.itemTooltip || null),
				value = this.valueField,
				text = this.textField;
			
			data = Nex.extend( {
				'$$id' : '',
				tips : '',
				text : '',
				value : '',
				cls : '',
				nowrap: this.itemNoWrap,
				index: index,
				disabled: false,
				'$$rawData': rawData
			}, data );
			
			if( tooltip.enable ) {
				var attr_tips = [tooltip.tag,'="',];
				var tips = data[tooltip.tipsField];
				if( Nex.isFunction( tooltip.formatter ) ) {
					tips = 	tooltip.formatter.call( self, tips, data );
				}
				if( tips && Nex.htmlEncode ) {
					tips = Nex.htmlEncode( tips );	
				}
				attr_tips.push(tips);
				attr_tips.push('"');
				data.tips = attr_tips.join('');
			}
			
			data = this.normalizeItem(data);
			
			data['$$id'] = this.id + '_index_' + index;
			data.text = data[text];
			data.value = data[value];
			data.disabled = data[this.disabledField];
			data.nowrap = this.itemNoWrap;
			data.index = index;
			data.$itemDisabledCls = this.$itemDisabledCls;
			
			if( this.itemDefaults ) {
				Nex.extendIf( data, this.itemDefaults );
			}
			
			if( Nex.isFunction( this.itemFormatter ) ) {
				data.text = this.itemFormatter(data.text, data);	
			}
			
			return this._createItemHtml(Nex.extend({}, data));
			
		},
		
		createListHTML : function(){
			var self = this,
				input = this.getInput(),
				store = this.store,	
				items = store.getData(),
				filter = Nex.isFunction(this.itemFilter) ? this.itemFilter : null,
				list = [];
			
			for( var i = 0; i < items.length; i++ ) {
				var item = items[i].data;
				
				if( filter && filter(item, i, items) !== true ) {
					continue;	
				}
				
				if( Nex.isString(item) && Nex.inArray( item, self.itemSplitChr ) !== -1 ) {
					list.push(self.$itemSplitLineTpl);	
				} else {
					list.push(self.generateItemHTML( i, item ));//self.normalizeItem(item)		
				}	
			}
			
			input.html( list.join('') );
			
			//if( this.isInit() ) {
				//list内容发生变化 就必须做检测
				///////////self.fixAutoWidth();
			//}
			self.fireEvent('onCreateList', input);
			
			if( !this.isInit() ) {
				
				self.resetSelectedItems();
				
				self.fireEvent('onRefreshList', input);	
				
			}
			
			this.updateScrollBar();	
		}, 
		
		refresh : function(){
			this.createListBox();
			
			return this;	
		},
		
		updateScrollBar : function(){
			if( this.scroller ) {
				this.scroller.updateScrollBar();	
			}	
		},
		
		createListBox: function(){
			var self = this,
				store = this.store,	
				afterFetch = function(){
					self.createListHTML();
				};	
				
			return store.fetch().always(afterFetch);
		},
		
		/**
		* 滚动到指定索引位置
		*/
		scrollToIndex: function(index){
			var self = this;
			var item = self.getAt(index);
			
			var $item = $('#'+this.id+'_index_'+index);
			
			if( !$item.length ) {
				return this;	
			}
			
			var body = this.getInput();
			
			var offset = body.offset();
			var h = body.outerHeight();
			
			var fo = $item.offset();
			var fh = $item.outerHeight();
			
			var outerHeight = 0;
			if( offset.top > fo.top ) {
				outerHeight = offset.top - fo.top;
			} else if( (offset.top+h) < (fo.top+fh) ) {
				outerHeight = (offset.top+h) - (fo.top+fh);
			}
			
			var sTop = 0;
			
			sTop = body.scrollTop() - outerHeight;
			
			body.scrollTop( sTop );
			
			return self;
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
		/**
		* @param {boolean} [false] orig false:返回Store.Item对象 true:返回value text的对象
		*/
		getAt: function(index, orig){
			var data = this.store.getAt(index);	
		
			orig = Nex.unDefined(orig, false);
			
			return !orig ? data : this.normalizeItem(this.store.unWrap(data));	
		},
		
		indexOfValue : function(value){
			var v,
				index = -1,
				i = 0,
				item = null,
				valueField = this.valueField,
				data = this.store.unWrapAll(this.store.getData());
			
			for(; i < data.length; i++) {
				item = this.normalizeItem(data[i]); 
				
				if( item[valueField] + '' === value + '' ) {
					index = i;
					break;	
				}
				
			}
			
			return index;
		},
		
		getItemData : function(value){
			var index = this.indexOfValue(value);
			
			if( index === -1 ) {
				return null;				
			}
			
			return this.getAt(index, true);
		},
		
		/*
		* 重设Items
		*/
		setItems: function(items){
			this.setStore(items);
			this.createListBox();
			return this;	
		},
		
		resetSelectedItems : function(){
			this.setInputValue( this.getValue() );	
		},
		
		getItems : function(){
			return this.store.unWrapAll(this.store.getData());
		},
		
		setData : function(items){
			return this.setItems(items);	
		},
		
		getData : function(){
			return this.getItems();		
		},
		
		onMouseOver: function(){
			this._super(arguments);	
			var triggerWrap = this.getBody();
			triggerWrap.addClass('nex-form-list-wrap-over');
		},
		onMouseOut: function(){
			this._super(arguments);	
			var triggerWrap = this.getBody();
			triggerWrap.removeClass('nex-form-list-wrap-over');	
		},
		onFocus: function(){
			this._super(arguments);
			
			var triggerWrap = this.getBody();
			var input = this.getInput();
			triggerWrap.addClass('nex-form-list-wrap-focus');
			input.addClass('nex-form-field-focus');
		},
		onBlur: function(){
			this._super(arguments);
			
			var triggerWrap = this.getBody();
			var input = this.getInput();
			triggerWrap.removeClass('nex-form-list-wrap-focus');
			input.removeClass('nex-form-field-focus');
		},
		
		onItemOver : function($item){
			if( this.disabled ) return;
			$item.addClass(this.$itemOverCls);	
		},
		
		onItemOut : function($item){
			if( this.disabled ) return;
			$item.removeClass(this.$itemOverCls);		
		}
		
	});
	
	return ListBox;
});	