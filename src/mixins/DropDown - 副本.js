/*
*
*Nex.mixins.DropDown
*下拉列表框 或者 自定义下拉框 
*/
Nex.addMixins('DropDown',{
	dropdownzIndex : 999999+Nex.zIndex,
	configs : {
		multiSplit : ',',
		textKey : 'text',
		valueKey : 'value',
		splitChr : ['-',',',';','|'],
		dropdownHideToRemove : false,//dropdown 关闭后销毁下拉框  --未实现
		dropdownItems : [],
		dropdownItemDefault : {},
		dropdownLoadMsg : '数据加载中...',
		//默认和Input一样长
		dropdownLoadWidth : 0,
		//加载提示显示参数设置
		dropdownLoadShowAt : {},
		//dropdown 结构 wrap(可能只有做动画效果才能用到)->body(内容)
		//dropdownMode = 1|2 如果是2 则items的内容都会当作组件来创建 如果是1 则会自动判断：如果是数组则创建下拉列表，其他（如xtype function..） 则当作组件创建
		dropdownAnim : false,//dropdownAnimate
		dropdownDuration : 200,
		dropdownEasing : 'easeOutQuad',//easeOutCirc linear easeOutSine
		dropdownMode : 1, // 1:列表下拉框 2:组件下拉框 
		dropdownBorder : true,//dropdown 是否有边框 
		dropdownPadding : 0,
		dropdownAutoScroll : false,//如果创建的是 组件下拉框（mode=2） 则该参数生效
		//'<div style="text-align:center;">暂无数据</div>'
		dropdownEmptyMsg : '',//&&dropdownMode=1 下拉列表为空时的提示内容
		dropdownCls : '',
		dropdownShowAt : {},
		//dropdown的宽高可以设置func 动态返回一个数字
		dropdownHeight : 'auto',//
		dropdownWidth : 'auto',//auto 表示自适应 组件下拉框中 0=inputWidth或者container.width
		dropdownMaxHeight : 0,//(不适应mode=2)0 代表auto 最大不能超过屏幕高度
		dropdownMinHeight : 0,//(不适应mode=2)0 代表auto
		dropdownMaxWidth : 0, // (不适应mode=2)0 标识最大不能超过屏幕宽
		dropdownMinWidth : 0,//(不适应mode=2)如果dropdownMinWidth=0 且是下拉列表(dropdownMode=1)时，dropdownMinWidth实际是和组件的大小宽度一致的，所以如果想控制下拉列表的宽度，应该控制dropdownMinWidth
		dropdownSelectionable : true,
		dropdownEdge : 5,//下拉框right bottom距离边缘的宽度 默认是5[px]
		dropdownItemsFilter : null,//下拉数据过滤器
		dropdownItemFilter : null,//下拉列表的数据过滤器
		dropdownItemFormat : null,//下拉列表参数
		dropdownItemNoWrap : true,//下拉列表不换行
		dropdownItemTips : false,//下拉列表是否这种tips字段
		dropdownItemTipsTag : 'title',
		dropdownItemTipsFilter : null,//function
		dropdownOtherHeight : 0,
		dropdownOtherWidth : 0,
		//下拉列表单选模式
		dropdownSingleSelect : true,
		//单击item或者其他区域后会关闭dropdown 默认true 如果为false则需要手动调用hideDropDown
		dropdownHideOnClick : true,
		//鼠标点击其他区域后隐藏dropdown
		dropdownHideOnBlur : true,
		dropdownShadowShow : true,
		dropdownResetPosDuration : 200,
		dropdownItemTpl : '<div id="<%=id%>" <%=tips%> value="<%=value%>" class="nex-form-dropdown-item <%=selected?"nex-form-dropdown-item-selected":""%> <%=disabled?"nex-form-dropdown-item-disabled":""%> <%=nowrap?"nex-form-dropdown-item-nowrap":""%> <%=cls%>"><%=text%></div>',
		dropdownItemSplitLineTpl : '<div class="nex-form-item-separator"><div class="nex-form-line-h"></div></div>',
		//绑定事件
		'@onDestroy._sysdp' : function(){
			this.destroyDropDown();	
		}
	},
	_getElOffset : function(el){
		var self = this;
		var opt = self.configs;	
		var offset = $(el).offset();
		var sLeft = $(window).scrollLeft();
		var sTop = $(window).scrollTop();
		return !offset ? {left:sLeft,top:sTop} : offset;
	},
	//获取周围可显示空间
	_getShowAtSpace : function(el){
		var self = this;
		var opt = self.configs;
		var el = self._undef(el,self.getDropDownShowAt());
		//需要获取的对象
		var obj = $(el);
		
		//获取窗口显示区域大小
		var cw = $(window).width();
		var ch = $(window).height();
		
		var offset = $._isPlainObject(el) ? el : self._getElOffset(obj);
		
		//获取滚位置
		var sLeft = $(window).scrollLeft();
		var sTop = $(window).scrollTop();
		
		var space = {
			top : offset.top - sTop,
			left : offset.left - sLeft
		};
		space.bottom = ch - space.top - ( $._isPlainObject(el) ? 0 : obj._outerHeight() );
		space.right = cw - space.left - ( $._isPlainObject(el) ? 0 : obj._outerWidth() );
		return space;
	},
	getDropDownItems : function(){
		var opt = this.configs;
		return opt.dropdownItems || [];	
	},
	getDropDownItemDefault : function(){
		var opt = this.configs;
		return opt.dropdownItemDefault;	
	},
	/*
	*检测当前itemData是否包含__id text value 
	*/
	__itemId : 1,
	_parseItemData : function( data ){
		var self = this,
			undef,
			opt = self.configs;
		var value = opt.valueKey,
			text = opt.textKey;
		//如果data.__id已经存在说明已经处理过了，不需要重复处理
		if( $.isPlainObject( data ) && data.__id ) {
			return data;	
		}		
		var d = {};	
		if( $.isArray( data ) && data.length ) {
			d[ value ] = data[0];
			d[ text ] = self._undef(data[1],data[0]);	
		} else if( $.isPlainObject( data ) ) {
			d[value] = self._undef(data[value],data[text]);
			d[text] = self._undef(data[text],d[value]);
			d[value] = self._undef(d[value],'');
			d[text] = self._undef(d[text],'');
			//d = data;
		} else {//string
			d[ value ] = data+'';
			d[ text ] = d[ value ];	
			if( $.inArray( d[ value ],opt.splitChr ) !== -1 ) {
				d[ '__splitLine' ] = true;	
			}
		}
		if( !('__id' in d) ) {
			d.__id = opt.id+'_item_'+self.__itemId++;	
		}
		//getDropDownItemDefault
		$.extend( d,self.getDropDownItemDefault(),d );//opt.itemDefault
		return d;
	},
	isSplitLine : function( data ){
		var data = data || {};
		if( data.__splitLine ) {
			return true;	
		}
		return false;
	},
	setDropDownItems : function( items ){
		var opt = this.configs;
		if( items ) {//dropdownItems
			opt.dropdownItems = $.isArray(items) ? items.concat([]) : items;
		}
		if( opt.dropdownMode == 1 && $.isArray(opt.dropdownItems) ) {
			$.each( opt.dropdownItems,function( i,d ){
				opt.dropdownItems[i] = self._parseItemData( d );	
			} );
		}
		//判断dropdown是否已经创建 如果创建则刷新内容
		var dropdown = self.getDropDown();
		if( dropdown.length && items ) {
			this.resetDropDownList( opt.dropdownItems );
		}
		
		return opt.dropdownItems;	
	},
	/*
	*获取DropDownItems数据
	*@param {String,Array}单个字符是返回当前对象，如果是数组或者以','分割的字符串时返回的是数组
	*@param {Boolean} true 默认 返回数据  false返回索引
	*return {Array,Object}
	*/
	getDropDownItemData : function( value,m ){
		var self = this,
			undef,
			opt = self.configs,
			m = m === undef ? true : m,
			items = self.getDropDownItems();	
		var _v = value;	
		if( value === undef ) return null;
		if( $.type( value ) === 'string' ) {
			value = value.split( opt.multiSplit );	
			if( value.length>1 ) {
				_v = value;	
			}
		} else if( $.type( value ) !== 'array' ) {
			value = [ value ];	
		}
		var d = {};
		$.each( value,function(i,v){
			d[v] = true;					   
		} );
		var list = [];
		$.each( items , function(i,v){
			if( !$.isPlainObject( v ) ) return;
			var value = v['value'];
			if( value in d ) {
				list.push( m?v:i );	
			}
		} );
		
		if( list.length === 1 && $.type( _v ) !== 'array' ) {
			return list[0];	
		} else {
			return list;	
		}
	},
	getDropDownItemIndex : function( value ){
		return this.getDropDownItemData( value,false );
	},
	getDropDownItemDataById : function(id){
		var self = this,
			undef,
			opt = self.configs;
		var d = {};
		var items = self.getDropDownItems();	
		if( id === undef ) {
			return d;	
		}
		$.each( items , function(i,v){
			if( !$.isPlainObject( v ) ) return;
			var value = v['__id'];
			if( value === id ) {
				d = v;
				return false;
			}
		} );	
		return d;
	},
	getDropDownShowAt : function(){
		return this.getContainer();	
	},
	showDropDownLoading : function( msg,callback ){
		var self = this,
			undef,
			opt = self.configs;
		var msg = msg || opt.dropdownLoadMsg;
		var at = self.getDropDownShowAt();
		var loader = $('#'+opt.id+'_dropdown_loading');	
		if( self.__ddt ) {
			clearTimeout( self.__ddt );	
		}
		if( loader.length ) {
			loader.html( opt.dropdownLoadMsg );
		} else {
			//创建dropdown
			loader = $('<div id="'+opt.id+'_dropdown_loading" class="nex-form-dropdown-loading">'+msg+'</div>');	
			$(document.body).append( loader );
			var w = at._outerWidth();
			var w1 = loader._outerWidth();
			var ldpw = $.isFunction(opt.dropdownLoadWidth) ? opt.dropdownLoadWidth.call( self,opt ) : opt.dropdownLoadWidth;
			if( ldpw>0 ) {
				loader._outerWidth( ldpw );		
			} else {
				if( w1<w ) {
					loader._outerWidth( w );	
				}
			}
		}
		loader.showAt(
			$.extend(
				{
					at:at
					,xAlign:'left'
					,yAlign:'bottom'
					,offsetY:-1 
				}
			,opt.dropdownLoadShowAt
			) 
		);
		
		if( $.isFunction( callback ) ) {
			callback.call( self,loader );
		}
		
		return loader;
	},
	__ddt : 0,
	hideDropDownLoading : function( callback ){
		var self = this,
			undef,
			opt = self.configs;	
		var loader = $('#'+opt.id+'_dropdown_loading');	
		if( loader.length ) {
			self.__ddt = setTimeout( function(){
				loader.hide(callback);
				self.__ddt = 0;
			},0 );
		}	
		return self;
	},
	getDropDown : function(){
		var self = this,
			opt = self.configs;	
		return $('#'+opt.id+'_dropdown');
	},
	getDropDownBody : function(){
		var self = this,
			opt = self.configs;	
		return $('#'+opt.id+'_dropdown_body');
	},
	getDropDownListItems : function(){
		var dpb = this.getDropDownBody();
		return $('>.nex-form-dropdown-item',dpb);	
	},
	getDropDownListSelectedItems : function(){
		var dpb = this.getDropDownBody();
		return $('>.nex-form-dropdown-item-selected',dpb);	
	},
	getDropDownListDisabledItems : function(){
		var dpb = this.getDropDownBody();
		return $('>.nex-form-dropdown-item-disabled',dpb);	
	},
	/*
	*创建下拉框 默认一个输入框只能同时存在一个下拉框
	*/
	createDropDown : function(){
		var self = this,
			undef,
			opt = self.configs;
		
		var r = self.fireEvent('onBeforeCreateDropDwon',[ opt ]);	
		if( r === false ) {
			return self;	
		}
		
		var dropdown = $('#'+opt.id+'_dropdown');
		if( dropdown.length ) {
			return dropdown;	
		}
		
		var html = [];	
		//创建dropdown
		html.push('<div id="'+opt.id+'_dropdown" class="nex-form-dropdown '+( opt.dropdownBorder ? "nex-form-dropdown-border" : "" )+' '+opt.dropdownCls+'" tabindex="-1">');
			html.push('<div id="'+opt.id+'_dropdown_body" class="nex-form-dropdown-body " tabindex="-1" >');
			html.push('</div>');
		html.push('</div>');
		
		dropdown = $( html.join('') ).appendTo( document.body );
		
		if( !opt.dropdownSelectionable ) {
			dropdown.disableSelection();		
		}
		
		if( opt.dropdownPadding>0 ) {
			$('#'+opt.id+'_dropdown_body').css('padding',opt.dropdownPadding);	
		}
		
		self._setDropDownEvent();
		
		self.fireEvent('onCreateDropDwon',[ dropdown,opt ]);
		
		return dropdown;
	},
	getDropDownSelectedValue : function(){
		return null;	
	},
	/*
	*创建dropdown内容
	*param {Array} 指定创建下拉框的显示内容 可选 不指定默认获取opt.items
	*/
	// __dropdownMode=1|2  1:列表下拉框 2:组件下拉框 
	__dropdownMode : 1,
	createDropDownList : function( list ){
		var self = this,
			undef,
			value = this.getDropDownSelectedValue(),
			opt = self.configs;
		var html = [];
		var valueKey = opt.valueKey,
			textKey = opt.textKey;
		var list = self._undef( list,self.getDropDownItems() );//opt.items
		/*if( !$.isArray( list ) ) {
			return self;
		}*/
		
		var dlist = {
			items : list	
		};
		var r = self.fireEvent('onBeforeCreateDropDwonList',[ dlist,opt ]);
		if( r === false ) {
			return self;
		}
		list = dlist.items;
		
		var dropdown = $('#'+opt.id+'_dropdown');
		if( !dropdown.length ) {
			dropdown = self.createDropDown();	
		}
		
		//如果items 不是数组 则使用addCompanet 创建自定义组件
		var dp = dropdown;
		var dpb = $('#'+opt.id+'_dropdown_body');
		
		dpb.removeClass('nex-form-dropdown-m1 nex-form-dropdown-m2 nex-form-dropdown-auto-scroll');
		
		if( $.isArray( list ) && opt.dropdownMode == 1 ) {
			self.__dropdownMode = 1;
			dpb.addClass('nex-form-dropdown-m1');
			var v_maps = {};
			if( value !== null ) {
				$.each( String(value).split( opt.multiSplit ),function(i,v){
					v_maps[v] = true;	
				} );
			}
			var len = list.length;
			for( var i=0;i<len;i++ ) {
				var _d = self._parseItemData( list[i] );
				if( v_maps[ _d[valueKey] ] ) {
					_d.selected = true;	
				} else {
					_d.selected = false;		
				}
				list[i] = _d;
				var d = $.extend( {
					id : list[i]['__id'],
					cls : '',
					selected : false,
					disabled : false,
					nowrap : opt.dropdownItemNoWrap,
					tips 	 : ''	
				},_d );
				//设置title
				//dropdownItemTips : false,//下拉列表是否这种tips字段
				//dropdownItemTipsTag : 'title',
				//dropdownItemTipsFilter : null,//function
				if( opt.dropdownItemTips ) {
					var attr_tips = [opt.dropdownItemTipsTag,'="',];
					var tips = self._undef(d['tips'],d[textKey]);
					if( $.isFunction( opt.dropdownItemTipsFilter ) ) {
						tips = 	opt.dropdownItemTipsFilter.call( self,tips,d );
					}
					if( tips ) {
						tips = Nex.htmlEncode( tips );	
					}
					d.tipsMsg = tips;
					d.tipsTag = opt.dropdownItemTipsTag;
					attr_tips.push(tips);
					attr_tips.push('"');
					
					d.tips = attr_tips.join('');
				}
				
				d.text = d[ textKey ];
				d.value = Nex.htmlEncode( d[ valueKey ] );
				
				if( opt.dropdownItemFilter && $.isFunction( opt.dropdownItemFilter ) ) {
					var r = opt.dropdownItemFilter.call( self,d );
					if( r === false ) continue;
					if( r !== undef ) {
						d = r;//$.extend(d,r);	
					}
				}
				
				if( opt.dropdownItemFormat && $.isFunction( opt.dropdownItemFormat ) ) {
					d.text = opt.dropdownItemFormat.call( self,d.text,d ) || d.text;
				}
				
				var r = self.fireEvent("onBeforeDropDownItemCreate",[d,opt]);
				if( r === false ) continue;
				
				var _itemTpl = '';
				if( self.isSplitLine( d ) ) {
					_itemTpl = self.tpl(opt.dropdownItemSplitLineTpl,d);	
				} else {
					_itemTpl = self.tpl(opt.dropdownItemTpl,d);
				}
				var et = {
					itemTpl : _itemTpl,
					itemData : d
				};
				self.fireEvent("onDropDownItemCreate",[et,opt]);
				html.push( et.itemTpl );	
			}	
			if( !len && opt.dropdownEmptyMsg != '' ) {
				html.push( opt.dropdownEmptyMsg );	
			}
			dpb.html( html.join('') );
		} else {
			self.__dropdownMode = 2;
			dpb.addClass('nex-form-dropdown-m2');
			if( opt.dropdownAutoScroll ) {
				dpb.addClass('nex-form-dropdown-auto-scroll');	
			}
			dpb.html( '' );
			Nex.gc();
			self.addComponent( dpb,list );
		}
		
		self.fireEvent('onCreateDropDwonList',[ dropdown,self.__dropdownMode,opt ]);
		
		return dropdown;
	},
	resetDropDownList : function(list){
		var self = this;
		var opt = this.configs;
		var list = this._undef( list,this.getDropDownItems() );
		
		if( $.isFunction( opt.dropdownItemsFilter ) ) {
			var _l = opt.dropdownItemsFilter.call( self,list );	
			if( _l === false ) return self;
			if( _l !== undef ) {
				list = _l;	
			}
		}
		
		var d = {
			items : list	
		};
		
		var r = self.fireEvent('onResetDropDownList',[ d,opt ]);
		if( r === false ) {
			return self;	
		}
		
		list = d.items;
		
		if( $.isArray( list ) ){
			self.__CItems = list;		
		} else {
			self.__CItems.length = 0;	
		}
		
		var dropdown = self.createDropDownList( list );
		
		self.setDropDownSize();
		
		//滚动到默认选中的列表
		//var dsel = $('#'+opt.id+'_dropdown_body').find('>.nex-form-dropdown-item-selected:last');
		//if( dsel.length ) {
		//	self.scrollToItemById( dsel.attr('id') );
		//}
		//刷新位置
		if( self.__DP_isShow ) {
			self.resetDropDownPos();
		}
		return self;	
	},
	__CItems : [],
	_bindCloseDropDownEvents : function(){
		var self = this,
			items = this.getDropDownItems(),//this.configs.items,
			opt = self.configs;		
		self.__unbindDropDown();
		if( opt.dropdownHideOnBlur ) {
			//移除下拉框事件
			$(document).bind('mousewheel.dropdown_'+opt.id+' contextmenu.dropdown_'+opt.id+' mousedown.dropdown_'+opt.id,function(e){
				var target = e.target || e.srcElement;
				//closest parents
				if( $(target).is( '#'+opt.id ) 
					|| $(target).is( '#'+opt.id+'_dropdown' ) 
					|| $(target).parents('#'+opt.id+'_dropdown,#'+opt.id).length
				) {
					//
				} else {
					self.hideDropDown();		
				} 
			});
			$(window).bind('resize.dropdown_'+opt.id,function(){
				self.hideDropDown();			
			});
		}
			//支持上下键选择
		$(document).bind("keydown.dropdown_"+opt.id,function(e){
			var sbody = $("#"+opt.id+"_dropdown_body");
			var cur = sbody.find(">.nex-form-dropdown-item-over:last");
			var isFirst = false;
			if( !cur.length ) {
				cur = sbody.find(">.nex-form-dropdown-item-selected:last");
				if( !cur.length ) {
					cur = sbody.find(">.nex-form-dropdown-item:first");	
					isFirst = true;
				}
			}
			
			if( !cur.length ) return;
			var it = cur;
			var _cur = cur;
			switch( e.keyCode ) {
				case 38 : //up
					sbody.find(">.nex-form-dropdown-item").removeClass("nex-form-dropdown-item-over");
					do {
						var prev = isFirst ? cur : cur.prev();
						if( prev.length ) {
							if( !prev.hasClass('nex-form-dropdown-item') ) {
								cur = prev;
								continue;	
							}
							if( prev.hasClass('nex-form-dropdown-item-disabled') ) {
								cur = prev;
								if( isFirst ) break;
								isFirst = false;
								continue;	
							} else {
								cur = prev;
								_cur = prev;	
							}
						} else {
							prev = _cur;
							if( !prev.hasClass('nex-form-dropdown-item') ) {
								cur = prev;
								isFirst = false;
								break;	
							}	
						}
						isFirst = false;
						
						var oitem = prev.length ? prev : _cur;
						var id = oitem.attr('id');
						var data = self.__getItemData(id);
						
						var r = self.fireEvent("onDropDownItemForward",[data,oitem[0],e,opt]);	
						if( r !== false ) {
							oitem.addClass('nex-form-dropdown-item-over');
						}
						//oitem.addClass("nex-form-dropdown-item-over");		
						if( data ) {
							self.scrollToItem( data );
						}
						break;
					} while(1);
					
					break;
				case 40 : //down
					sbody.find(">.nex-form-dropdown-item").removeClass("nex-form-dropdown-item-over");
					do {
						var next = isFirst ? cur : cur.next();
						isFirst = false;
						if( next.length ) {
							if( !next.hasClass('nex-form-dropdown-item') ) {
								cur = next;
								continue;	
							}
							if( next.hasClass('nex-form-dropdown-item-disabled') ) {
								cur = next;
								//如果需要滚动到disabled的话 需要在这里添加scrollToItem
								continue;	
							} else {
								cur = next;
								_cur = next;	
							}
						} else {
							next = _cur;
							if( !next.hasClass('nex-form-dropdown-item') ) {
								cur = next;
								isFirst = false;
								break;	
							}		
						}
						
						var oitem = next.length ? next : _cur;
						var id = oitem.attr('id');
						var data = self.__getItemData(id);
						
						var r = self.fireEvent("onDropDownItemForward",[data,oitem[0],e,opt]);	
						if( r !== false ) {
							oitem.addClass("nex-form-dropdown-item-over");	
						}
						if( data ) {
							self.scrollToItem( data );
						}
						break;
					} while(1);
					
					break;
				case 13:
					//sbody.find(">.nex-form-dropdown-item-over").trigger('click',[e]);//因为使用的是委托 模拟触发会出现问题
					self.__dp_click(sbody.find(">.nex-form-dropdown-item-over"),e);
					//键盘触发 并不会触发是输入框失去焦点
					//self.blur();
					break;
			}
			
		});	
	},
	setDropDownList : function( list ){
		this.__DP_isShow ? this.resetDropDownList( list ) : 0;	
		return this;	
	},
	resetDropDownSizeAndPos : function(){
		if( this.__DP_isShow ) {
			this.resetDropDownSize();		
			this.resetDropDownPos();
		}
	},
	/*
	*显示下拉框
	*/
	__DP_isShow : false,
	//重复调用showDropDown 并且传参 则会调用resetDropDownList
	showDropDown : function( list,callback ){//list = Nex xtype array func , callback 显示后的回调 
		var self = this,
			undef,
			_func,
			opt = self.configs;
		var _setList = list ? true : false;
		var list = this._undef( list,this.getDropDownItems() );
		
		//如果dropdown 已经是显示状态 则调用reset
		if( self.__DP_isShow && _setList ) {
			self.resetDropDownList( list );	
			return self;
		}
		//开始处理list数据
		
		if( $.isFunction( opt.dropdownItemsFilter ) ) {
			var _l = opt.dropdownItemsFilter.call( self,list );	
			if( _l === false ) return self;
			if( _l !== undef ) {
				list = _l;	
			}
		}
		
		var d = {
			items : list	
		};
		
		var r = self.fireEvent('onBeforeDropDownShow',[ d,opt ]);
		if( r === false ) {
			return self;	
		}
		
		if( !opt.dropdownHideToRemove ) {
			var dropdown = self.getDropDown();
			if( dropdown.length ) {
				//显示之前设置选择状态
				if( self.__dropdownMode == 1 ) {
					var ds = self.getDropDownSelectedValue();
					if( ds !== null ) {
						self.dropdownSelectItems( ds );
					}
				}
				self.setDropDownSize();	
				self._showDropDown(null,dropdown);
				return self;
			}	
		}
		
		list = d.items;
		
		self.__CItems = [];
		
		if( $.isArray( list ) ){//&& opt.dropdownMode == 1
			self.__CItems = list;		
		} else {
			self.__CItems.length = 0;	
		}
		//创建dropdown 容器
		var dropdown = $('#'+opt.id+'_dropdown');
		if( !dropdown.length ) {
			dropdown = self.createDropDown();	
		}
		
		//预判__dropdownMode
		if( $.isArray( list ) && opt.dropdownMode == 1 ) {
			self.__dropdownMode = 1;
		} else {
			self.__dropdownMode = 2;	
			//创建下拉组建时 先设置好宽高
			self._setDropDownSize2();
		}
		//创建下拉框内容
		var dropdown = self.createDropDownList( list );
		//设置下拉框大小
		if( self.__dropdownMode == 1 ) {
			self._setDropDownSize1();
		}
		
		self._showDropDown( callback,dropdown );
		
		return self;
	},
	_showDropDown : function(func,dp){
		var self = this,
			opt = self.configs;		
		var fn = function(){
			self.fireEvent("onDropDownShow",[opt]);
			if( $.isFunction( func ) ) {
				func.call( self );
			}
			if( opt.dropdownShadowShow ) {
				self.dropdownShadowShow();	
			}
			self.__DP_isShow = true;
			self._bindCloseDropDownEvents();
		}	
		//显示之前。。。
		if( self.__dropdownMode == 1 ) {
			//滚动到选中的列表
			var dsel = $('#'+opt.id+'_dropdown_body').find('>.nex-form-dropdown-item-selected:last');
			if( dsel.length ) {
				self.scrollToItemById( dsel.attr('id') );
			}
		}
		
		var dropdown = dp || self.getDropDown();
		self.__DP_isShow = true;
		//显示下拉框 
		var zIndex = Nex.mixins.DropDown.dropdownzIndex+2;
		self.dropdownzIndex = zIndex;
		dropdown.css('zIndex',zIndex);
		if( opt.dropdownAnim ) {
			self._animateDropDownShow(fn);	
		} else {
			self._defaultDropDownShow(fn);		
		}
		return self;
	},
	/*移除下拉框*/
	removeDropDown : function(){
		return this.hideDropDown.apply(this,arguments);	
	},
	hideDropDown : function( callback ){
		var self = this,
			undef,
			func,
			opt = self.configs;	
			
		var func = function(){
			if( opt.dropdownShadowShow ) {
				self.hideDropDownShadow();	
			}
			self.fireEvent("onDropDownHide",[opt]);
			if( $.isFunction( callback ) ) {
				callback.call( self );
			}
			self.__DP_isShow = false;
		}
		var r = self.fireEvent('onBeforeDropDownHide',[ opt ]);
		if( r === false ) {
			return self;	
		}
		self.__DP_isShow = false;
		self.unsetDropDownEvent();
		
		if( opt.dropdownAnim ) {
			self._animateDropDownHide(func);	
		} else {
			self._defaultDropDownHide(func);		
		}
		return self;
	},
	__unbindDropDown : function(){
		var opt = this.configs;
		$(document).unbind('.dropdown_'+opt.id);	
		$(window).unbind('.dropdown_'+opt.id);	
	},
	isDropDownCreate : function(){
		var opt = this.configs;
		var dp = $('#'+opt.id+'_dropdown');	
		return dp.length ? true : false;
	},
	//判断dropdown是显示中
	isDropDownShow : function(){
		return this.__DP_isShow;	
	},
	toggleDropDown : function( func ){
		var self = this,
			opt = self.configs;		
		if( self.__DP_isShow ) {
			self.hideDropDown( func );	
		} else {
			self.showDropDown( func );	
		}
		return self;
	},
	_getDropDownOtherHeight : function(){
		return this.configs.dropdownOtherHeight;	
	},
	_getDropDownOtherWidth : function(){
		return this.configs.dropdownOtherWidth;	
	},
	/*计算组件下拉框的大小*/
	__DP_autoWidth : false,
	__DP_autoHeight : false,
	_setDropDownSize1 : function(){
		var self = this,
			opt = self.configs;	
			
		var input = self.getDropDownShowAt();
		var space = self._getShowAtSpace( input );
		space.bottom -= opt.dropdownEdge;
		space.top 	 -= opt.dropdownEdge;
		space.left	 -= opt.dropdownEdge;
		space.right  -= opt.dropdownEdge;
		
		var dp = $('#'+opt.id+'_dropdown');
		var bd = $('#'+opt.id+'_dropdown_body');
		
		//移除之前 我们先获取dropdown的border padding占用空间
		var dph_s = (parseInt(dp.css('paddingTop')) || 0)
					+ (parseInt(dp.css('paddingBottomWidth')) || 0)
					+ (parseInt(dp.css('borderTop')) || 0 )
					+ (parseInt(dp.css('borderBottomWidth')) || 0);
		var dpw_s = (parseInt(dp.css('paddingLeft')) || 0)
					+ (parseInt(dp.css('paddingRight')) || 0)
					+ (parseInt(dp.css('borderLeftWidth')) || 0)
					+ (parseInt(dp.css('borderRightWidth')) || 0);
		
		//注意此处不应该移除dp的width height 因为移除后如果数据太多会突然撑大导致闪屏
		//dp._removeStyle('width height');
		bd._removeStyle('width height');
		
		var win_w = $(window).width() - opt.dropdownEdge;
		//var win_h = $(window).height();
		
		var dw = $.isFunction(opt.dropdownWidth) ? opt.dropdownWidth.call( self,opt ) : opt.dropdownWidth;
		var dh = $.isFunction(opt.dropdownHeight) ? opt.dropdownHeight.call( self,opt ) : opt.dropdownHeight;
		
		if( dw == 'auto' ) {
			dp._removeStyle('width');	
		}
		if( dh == 'auto' ) {
			dp._removeStyle('height');	
		}
		
		dw = dw == 'auto' ? 0 : dw;
		dh = dh == 'auto' ? 0 : dh;
		
		var isAutoHeight = false;
		var isAutoWidth = false;
		
		/*
		*setp1:先计算dropdown的高度
		*/
		var sh = bd.outerHeight() + dph_s;//作用等同于 dp.outerHeight 但是我们不能直接用这个 
		var h = dh > 0 ? dh : sh;
		var max_h = $.isFunction(opt.dropdownMaxHeight) ? opt.dropdownMaxHeight.call( self,opt ) : opt.dropdownMaxHeight;
		var min_h = $.isFunction(opt.dropdownMinHeight) ? opt.dropdownMinHeight.call( self,opt ) : opt.dropdownMinHeight;
		//var min_space = Math.min( space.bottom,space.top );
		//if( h > min_space ) {//这个判断可不要
		h = Math.min( h,Math.max(space.bottom,space.top) );
		//}
		if( min_h>0 ) {
			h = Math.max( h,min_h );
		}
		if( max_h>0 ) {
			h = Math.min( h,max_h );
		}
		isAutoHeight = true;
		if( dh != 0 || h != sh ) {
			isAutoHeight = false;
			dp._outerHeight( h );
			bd._outerHeight( dp.height()-self._getDropDownOtherHeight() );	
		} else {
			dp._removeStyle('height');	
		}
		//step2:再计算宽度 注意：必须要先设置高度后在获取宽度
		var sw = bd.outerWidth() + dpw_s;//作用等同于 dp.outerWidth
		var w = dw > 0 ? dw : sw;
		var max_w = $.isFunction(opt.dropdownMaxWidth) ? opt.dropdownMaxWidth.call( self,opt ) : opt.dropdownMaxWidth;
		var min_w = $.isFunction(opt.dropdownMinWidth) ? opt.dropdownMinWidth.call( self,opt ) : opt.dropdownMinWidth;
		min_w = min_w>0?min_w:input._outerWidth();
		w = Math.max( w,min_w );
		w = Math.min( w,win_w );
		if( max_w>0 ) {
			w = Math.min( w,max_w );	
		}
		
		isAutoWidth = true;
		if( dw != 0 || w != sw ) {
			isAutoWidth = false;
			dp._outerWidth( w );
			bd._outerWidth( dp.width()-self._getDropDownOtherWidth() );	
		} else {
			dp._removeStyle('width');	
			//做些微调整 如果出现了滚动条 应该加上滚动条的宽度
			var hasScroll = Nex.hasScroll( bd,'top' );
			if( hasScroll ) {
				isAutoWidth = false;
				var sbar = self.getScrollbarSize();
			 	w += (sbar.y + self._getDropDownOtherWidth());
				w = Math.min( w,win_w );
				dp._outerWidth( w );
				bd._outerWidth( dp.width() );	
			}
		}
		//记录状态
		self.__DP_autoWidth = isAutoWidth;
		self.__DP_autoHeight = isAutoHeight;
		
		self.fireEvent( 'onSetDropDownSize',[dp,1,opt] );
		
		return self;
	},
	_setDropDownSize2 : function(){
		var self = this,
			opt = self.configs;		
	
		var input = self.getDropDownShowAt();	
		
		var dp = $('#'+opt.id+'_dropdown');
		var bd = $('#'+opt.id+'_dropdown_body');
		
		//dropdownAutoScroll
		var win_w = $(window).width() - opt.dropdownEdge;
		var win_h = $(window).height() - opt.dropdownEdge;
		
		var w = $.isFunction(opt.dropdownWidth) ? opt.dropdownWidth.call( self,opt ) : opt.dropdownWidth,
			h = $.isFunction(opt.dropdownHeight) ? opt.dropdownHeight.call( self,opt ) : opt.dropdownHeight
			inputW = input._outerWidth();
		
		if( w == 0 ) {
			w = inputW;
		}
		h = parseInt( h,10 );
		h = isNaN(h) ? 0 : h;
		
		var isAutoHeight = false;
		var isAutoWidth = false;
		
		if( h == 0 || h == 'auto' ) {
			dp._removeStyle( 'height' );	
			bd._removeStyle( 'height' );
			isAutoHeight = true;	
			if( dp.outerHeight() > win_h ) {
				dp._outerHeight( win_h );	
				bd._outerHeight( dp.height() - self._getDropDownOtherHeight() );	
				isAutoHeight = false;		
			}
		} else {
			isAutoHeight = false;		
			dp._outerHeight( h );	
			bd._outerHeight( dp.height() - self._getDropDownOtherHeight() );		
		}
		
		if( w == 'auto' ) {
			isAutoWidth = true;
			dp._removeStyle( 'width' );	
			bd._removeStyle( 'width' );	
			if( dp.outerWidth() > win_w ) {
				isAutoWidth = false;
				dp._outerHeight( win_w );	
				bd._outerHeight( dp.width() - self._getDropDownOtherWidth() );			
			}
		} else {
			isAutoWidth = false;
			w = parseInt( w,10 );
			w = isNaN(w) ? inputW : w;
			dp._outerWidth( w );	
			bd._outerWidth( dp.width() - self._getDropDownOtherWidth() );	
		}
		//记录状态
		self.__DP_autoWidth = isAutoWidth;
		self.__DP_autoHeight = isAutoHeight;
		//应该计算最大最小
		self.fireEvent( 'onSetDropDownSize',[dp,2,opt] );
		
		return self;
	},
	setDropDownSize : function(){
		var self = this,
			opt = self.configs;	
		
		if( self.__dropdownMode == 2 ) {
			return 	self._setDropDownSize2();
		} else {
			return 	self._setDropDownSize1();	
		}
	},
	resetDropDownSize : function(){
		return this.setDropDownSize();
	},
	//@private
	__dp_click : function($this,e){
		var self = this;
		var opt = this.configs;
		var $$this = $($this);
		var id = $$this.attr('id');
		var data = self.__getItemData(id);
		
		if( data.disabled || $$this.hasClass('nex-form-dropdown-item-disabled') ) {
			return;	
		}
		
		var r = self.fireEvent("onDropDownItemClick",[data,$this,e,opt]);	
		if( r !== false ) {
			self._dropdownItemsSelect( data,$this,e );
		}
	},
	//设置选择状态
	dropdownSelectItems : function( value ){
		var self = this;
		var opt = this.configs;	
		var sep = opt.multiSplit;
		var dpb = $('#'+opt.id+'_dropdown_body');
		//self.unselectDropDownAll();
		var selected = String(value).split( sep );
		var _s = {};
		$.each(selected,function(i,v){
			_s[v] = true;	
		});	
		$('>.nex-form-dropdown-item',dpb).each( function(){
			var v = $(this).attr('value');
			if( v in _s ) {
				$(this).addClass('nex-form-dropdown-item-selected');	
			} else {
				$(this).removeClass('nex-form-dropdown-item-selected');	
			}
		} );
		return self;
	},
	_dropdownItemsSelect : function(data,el,e){
		var self = this;
		var opt = this.configs;	
		var $el = $(el);
		var isSelected = $el.hasClass('nex-form-dropdown-item-selected');
		if( opt.dropdownSingleSelect ) {
			if( isSelected ) {
				return;	
			}
			self.unselectDropDownAll();	
			$el.addClass('nex-form-dropdown-item-selected');
			//data.selected = true;
			if( opt.dropdownHideOnClick ) {
				self.hideDropDown();	
			}	
			self.fireEvent("onDropDownItemSelected",[data,el,e,opt]);
			self.fireEvent("onDropDownItemSelectedChange",[data[opt.valueKey],data[opt.textKey],data,el,e,opt]);
		} else {
			var sep = opt.multiSplit;
			var dpb = $('#'+opt.id+'_dropdown_body');
			var value = [];
			var text = [];
			if( isSelected ) {
				$el.removeClass('nex-form-dropdown-item-selected');
				self.fireEvent("onDropDownItemUnSelected",[data,el,e,opt]);
				//data.selected = false;
			} else {
				$el.addClass('nex-form-dropdown-item-selected');	
				self.fireEvent("onDropDownItemSelected",[data,el,e,opt]);
				//data.selected = true;
			}
			$('>.nex-form-dropdown-item-selected',dpb).each( function(){
				value.push( $(this).attr('value') );	
			} );
			$.each( value,function(i,v){
				var d = self.__getItemData( v,false );	
				if( d ) {
					text.push( d[ opt.textKey ] );		
				} else {
					text.push( v );	
				}
			} );
			self.fireEvent("onDropDownItemSelectedChange",[value.join(sep),text.join(sep),data,el,e,opt]);
		}
	},
	//@private
	__getItemData : function( id,isId ){
		var self = this,
			items = this.getDropDownItems(),
			opt = self.configs;	
		var isId = self._undef( isId, true );	
		var d = null;
		$.each( items.concat(self.__CItems) , function(i,v){
			if( !$.isPlainObject( v ) ) return;
			var value = isId ? v['__id'] : v[ opt.valueKey ];
			if( String(value) === String(id) ) {
				d = v;
				return false;
			}
		} );	
		return d;		
	},
	/*下拉框事件*/
	_setDropDownEvent : function(){
		var self = this,
			opt = self.configs;	
			
		var list = $('#'+opt.id+'_dropdown_body');
		
		var getItemData = function( id ){
			return self.__getItemData( id );
		};
		var _click = function(e){
			self.__dp_click(this,e);	
		};
		//下拉框列表事件
		list.undelegate('>.nex-form-dropdown-item')
			.delegate('>.nex-form-dropdown-item',{
			"mouseenter" : function(e){
				var $this = $(this);
				var id = $this.attr('id');
				var data = getItemData(id);
				
				if( data.disabled || $this.hasClass('nex-form-dropdown-item-disabled') ) {
					return;	
				}
				
				var r = self.fireEvent("onDropDownItemOver",[data,this,e,opt]);	
				if( r !== false ) {
					$this.addClass('nex-form-dropdown-item-over');
				}
			},
			"mouseleave" : function(e){
				var $this = $(this);
				var id = $this.attr('id');
				var data = getItemData(id);
				if( data.disabled || $this.hasClass('nex-form-dropdown-item-disabled') ) {
					return;	
				}
				
				var r = self.fireEvent("onDropDownItemOut",[data,this,e,opt]);	
				if( r !== false ) {
					$this.removeClass('nex-form-dropdown-item-over');
				}
			},
			"click" : _click
		});
		
		self.unsetDropDownEvent();
		
		self.fireEvent( 'onSetDropDownEvent',[opt] );
		
		return self;
	},
	/*
	*滚动到指定item
	*param value
	*/
	scrollToItem : function(val){
		var self = this;
		var opt = self.configs;	
		var items = self.getDropDownItems();//opt.items;
		var id = '';
		
		if( typeof val === 'object' ) {
			val = val[opt.valueKey];	
		}
		
		for( var i=0;i<items.length;i++ ) {
			if( items[i]['value']+'' === val+'' ) {
				id = items[i]['__id'];
				break;
			}	
		}
		
		if( !id ) {
			return self;	
		}
		
		var body = $("#"+opt.id+"_dropdown_body");
		
		if( !body.length ) {
			return self;	
		}
		
		var offset = body.offset();
		var h = body._outerHeight();
		
		var f = $("#"+id);
		if( !f.length ) {
			return self;	
		}
		
		var fo = f.offset();
		var fh = f._outerHeight();
		
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
	scrollToItemById : function( id ){
		var self = this,
			opt = self.configs;	
		
		var d = self.__getItemData(id);
		if( d ) {
			self.scrollToItem( d );
		}
		return self;
	},
	unsetDropDownEvent : function(){
		var self = this,
			opt = self.configs;
		self.fireEvent('onUnsetDropDownEvent',[ opt ]);
		self.__unbindDropDown();
		return self;
	},
	//取消所有选中状态
	unselectDropDownAll : function(){
		var self = this,
			undef,
			opt = self.configs;
		var items = self.getDropDownItems();	
		$.each( items.concat(self.__CItems),function(i,d){
			if( typeof d === 'object' ) {
				d.selected = false;	
			}
		} );
		$('#'+opt.id+'_dropdown_body').find('>.nex-form-dropdown-item-selected').removeClass('nex-form-dropdown-item-selected');
		return self;
	},
	__DP_ShowAlign : 'bottom',
	/*默认动画显示下拉框*/
	_defaultDropDownShow : function( callback ){
		var self = this,
			undef,
			func,
			opt = self.configs;	
		var dropdown = $('#'+opt.id+'_dropdown');
		func = $.isFunction( callback ) ? callback : null;	
		
		dropdown._show();
		dropdown._visible(true);
		
		var at = self.getDropDownShowAt();
		dropdown.showAt(
			$.extend(
				{
					at:at
					,visibleEdge : opt.dropdownEdge
					,xAlign:'left'
					,yAlign:'bottom'
					,offsetY:0
					,autoShow : true
					,"onShow.dropdown" : function(pos,conf){
						self.__DP_ShowAlign = conf.yAlign;
						dropdown.removeClass('nex-form-dropdown-'+conf.yAlign);
						dropdown.addClass('nex-form-dropdown-'+conf.yAlign);
					} 
				}
			,opt.dropdownShowAt
			) 
		);
		
		if( $.isFunction( func ) ) {
			func.call( self,dropdown );
		}
		return self;
	},
	resetDropDownPos : function(){
		var self = this,
			undef,
			func,
			opt = self.configs;	
		var dropdown = $('#'+opt.id+'_dropdown');
		var at = self.getDropDownShowAt();
		
		var showat = Nex.Create('showAt',$.extend(
			  {
				  at:at
				  ,visibleEdge : opt.dropdownEdge
				  ,xAlign:'left'
				  ,yAlign:'bottom'
				  ,offsetY:0
			  }
			 ,opt.dropdownShowAt,{
				 el : dropdown
				 ,autoShow : false 
			 }
		  ));
		  
		  var pos = showat.getShowPos();
		  var yAlign = showat.C('yAlign');
		  
		  self.__DP_ShowAlign = yAlign;
		  
		  var shadow = null;
		  if( opt.dropdownShadowShow ) {
				shadow = self.getDropDownShadow();
				shadow.hide();
		  }
		  
		  dropdown.stop(true,true).animate(pos,opt.dropdownResetPosDuration,function(){
			  if( opt.dropdownShadowShow && shadow ) {
					shadow.show();
				}
			  self.resetDropDownShadow(); 
		  });
		
		return self;	
	},
	_defaultDropDownHide : function( callback ){
		var self = this,
			undef,
			opt = self.configs;	
		self.__DP_isShow = false;	
		var dp = $('#'+opt.id+'_dropdown');	
		//_visible(true|false)
		dp.stop(true,true)._visible( false )._hide();
		
		if( opt.dropdownHideToRemove ) {
			dp.remove();	
		}
		
		if( $.isFunction( callback ) ) {
			callback.call( self );
		}
		return self;
	},
	_animateDropDownShow : function( callback ){
		var self = this,
			undef,
			func,
			opt = self.configs;	
		var dropdown = $('#'+opt.id+'_dropdown');
		var db = $('#'+opt.id+'_dropdown_body');
		func = $.isFunction( callback ) ? callback : null;	
		
		//显示dropdown
		dropdown._show();
		dropdown._visible(true);
		
		var at = self.getDropDownShowAt();
		var showat = Nex.Create(
			'showAt',
			$.extend(
				{
					at:at
					,visibleEdge : opt.dropdownEdge
					,xAlign:'left'
					,yAlign:'bottom'
					,offsetY:0,
					"onShow.dropdown" : function(pos,conf){
						self.__DP_ShowAlign = conf.yAlign;
						dropdown.removeClass('nex-form-dropdown-'+conf.yAlign);
						dropdown.addClass('nex-form-dropdown-'+conf.yAlign);
					} 
				}
			,opt.dropdownShowAt
			,{ 
				el : dropdown
				,autoShow : false
			 }
			) 
		);
		
		var pos = showat.getShowPos();
		var yAlign = showat.C('yAlign');
		self.__DP_ShowAlign = yAlign;
		//----
		dropdown.removeClass('nex-form-dropdown-'+yAlign);
		dropdown.addClass('nex-form-dropdown-'+yAlign);
		var sh = dropdown.height();
		var _sh = dropdown.outerHeight();
		//如果dropdown是auto-width情况下设置宽度
		if( self.__DP_autoWidth ) {
			dropdown.width( dropdown.width() );
		}
		dropdown.height(0);
		
		db.addClass('nex-form-dropdown-anim-'+yAlign);
		
		var animBack = function(){
			self.__DP_ShowAlign = yAlign;
			dropdown.removeClass('nex-form-dropdown-'+yAlign);
			dropdown.addClass('nex-form-dropdown-'+yAlign);
			db.removeClass( 'nex-form-dropdown-anim-'+yAlign );
			if( self.__DP_autoWidth ) {
				dropdown._removeStyle( 'width' );
			}
			if( self.__DP_autoHeight ) {
				dropdown._removeStyle( 'height' );
			}
			//回调
			if( $.isFunction( func ) ) {
				func.call( self,dropdown );
			}		
		};
		
		if( yAlign === 'bottom' ) {
			dropdown.css( pos );
			dropdown.stop(true,true).animate({ height : sh },opt.dropdownDuration,opt.dropdownEasing,animBack);
		} else {
			var pos2 = {
					left : pos.left,
					top : pos.top+_sh
				}	
			dropdown.css( pos2 );	
			dropdown.stop(true,true).animate({ height : sh,top : pos.top },opt.dropdownDuration,opt.dropdownEasing,animBack);
		}
		return self;
	},
	_animateDropDownHide : function( callback ){
		return this._defaultDropDownHide.apply( this,arguments );
	},
	dropdownShadowShow : function(){
		var self = this,
			undef,
			opt = self.configs;
		var r = self.fireEvent('onBeforeDropDownShadowShow',[opt]);
		if( r === false ) {
			return self;	
		}	
		var shadow = $('#'+opt.id+'_dropdown_shadow');
		if( !shadow.length ) {
			shadow = $('<div id="'+opt.id+'_dropdown_shadow" class="nex-form-dropdown-shadow">'+(Nex.IEVer<=8?'<iframe style="width:99%;height:99%;"></iframe>':'')+'</div>').appendTo(document.body);
		}
		shadow.show();	
		var dropdown = self.getDropDown();
		shadow._width( dropdown.outerWidth() );
		shadow._height( dropdown.outerHeight() );
		shadow.css( dropdown.offset() )
			  .css( 'zIndex',self.dropdownzIndex-1 );
		self.fireEvent('onDropDownShadowShow',[opt]);
		shadow.removeClass('nex-form-dropdown-shadow-top nex-form-dropdown-shadow-bottom');
		shadow.addClass('nex-form-dropdown-shadow-'+self.__DP_ShowAlign);
		return self;
	},
	resetDropDownShadow : function(){
		var self = this,
			undef,
			opt = self.configs;
		var shadow = $('#'+opt.id+'_dropdown_shadow');
		var dropdown = self.getDropDown();
		shadow._width( dropdown.outerWidth() );
		shadow._height( dropdown.outerHeight() );
		
		shadow.css( dropdown.offset() );
		
		shadow.removeClass('nex-form-dropdown-shadow-top nex-form-dropdown-shadow-bottom');
		shadow.addClass('nex-form-dropdown-shadow-'+self.__DP_ShowAlign);
		return self;	
	},
	hideDropDownShadow : function(){
		var self = this,
			undef,
			opt = self.configs;
		var r = self.fireEvent('onBeforeDropDownShadowHide',[opt]);
		if( r === false ) {
			return self;	
		}		
		var shadow = $('#'+opt.id+'_dropdown_shadow');
		if( opt.dropdownHideToRemove ) {
			shadow.remove();
		} else {
			shadow.hide();	
		}
		self.fireEvent('onDropDownShadowHide',[opt]);
		return self;	
	},
	getDropDownShadow : function(){
		var self = this,
			opt = self.configs;	
		return $('#'+opt.id+'_dropdown_shadow');	
	},
	destroyDropDown : function(){
		if( this.isDropDownShow() ) {
			this.hideDropDown();
		}
		var dp = this.getDropDown();
		var dps = this.getDropDownShadow();
		dp.remove();
		dps.remove();
		this.__DP_isShow = false;
		this.__unbindDropDown();
		return this;
	}	
});