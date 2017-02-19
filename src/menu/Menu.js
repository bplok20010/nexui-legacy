/*
jquery.nexMenu.js
http://www.extgrid.com/menu
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱
*/
/*
* 注： IE6下有时append 都会触发resize...
*/
define(function(require){
	var Nex = require('../Nex');	
	var EventObject = require('../ComponentBase');
 	require('../jqueryui/position');

	var menu = Nex.Class('Nex.menu.Menu', EventObject, {
		alias : 'Nex.Menu',
		xtype : 'menu',
		config : function(){
			return {
				prefix : 'nexmenu-',
				renderTo : document.body,
				denyManager : true,
				disabledItems : true,
				width : 0,
				height : 0,
				maxWidth : 0,
				minWidth : 0,
				minHeight : 0,
				maxHeight : 0,
				parent : null,//设置menu绑定的父组件，如果父组件释放，则当前menu也会销毁
				items : [],
				//item可能出现的值
				_item : {
					cls : '',
					icon : '',
					iconCls: '',
					arrow : '',//arrow 图片地址
					arrowCls : '',
					id :　'',
					text : '',
					'open' : '',
					_level : '',
					pid : '',
					items : '',
					disabled : '',
					width : '',
					height : '',
					callBack:null,//return false会阻止事件冒泡
					callback : null,
					hideOnClick:true, //点击后会关闭菜单列表
					subCls : '',//subMenu样式
					isCmp : false// 如果设为 true 则会把items当作组件来创建
				},
				itemDefault : {},
				itemTpl : '<div id="<%=menuId%>_<%=itemId%>_item" <%=tips%> menuid="<%=itemId%>" class="nex-menu-item <%=cls%>">'
						+ '<%'
						+ '    if( showMenuIcon ) {'
						+ '        if( icon ) {'
						+ '            icon = "background-image:url("+icon+")";'
						+ '        }'
						+ '%>'
						+ '    <span class="nex-menu-icon <%=iconCls%>" style="<%=icon%>"></span>'
						+ '<%'
						+ '    }'
						+ '%>'
						+ '    <span class="nex-menu-title"><%=text%></span>'
						+ '<%'
						+ '    if( !isLeaf ) {'
						+ '        if( arrow ) {'
						+ '            arrow = "background-image:url("+arrow+")";'
						+ '        }'
						+ '%>    '
						+ '    <span class="nex-menu-arrow <%=arrowCls%>" style="<%=arrow%>"></span>'
						+ '<%'
						+ '    }'
						+ '%>    '
						+ '</div>',
				splitLineTpl : '<div class="nex-menu-item-separator"><div class="nex-menu-line-h"></div></div>',
				itemTips : false,//下拉列表是否这种tips字段
				itemTipsTag : 'title',
				itemTipsFilter : null,//function	
				itemFilter : null,	
				itemFormat : null,
				splitChr : ['-',',',';','|'],
				cls : '',//所有menu的样式
				style : {},//同上
				padding : null,//同上
				delay : 0,//延迟毫秒数 ms
				//IEVer : Nex.IEVer,
				border :　false,
				borderCls : 'nex-menu-border',
				showShadow : true,
				shadowWidth : 5,
				hideToRemove : true,
				showMenuVLine : true,//显示节点线条
				showMenuIcon : true,//显示节点图标
				showMenuMore : true,//如果列表过多 显示上下 btn
				upBtnCls : '',
				downBtnCls : '',
				_speedTime : 10,
				_speedNum : 5,
				_data : {},
				_childrens : {},
				_levelData : {},//level=>[]
				_firstNodes : {},// 0:node1,1:node2 k=>v k表示第几级
				_lastNodes : {},// 0:node1,1:node2 k=>v k表示第几级
				hideOnClick : true,
				hideOnBlur  : true, //点击其他区域时 关闭menu
				expandOnEvent : 0,//0 mousover 1 click  -1 不显示子菜单
				simpleData : false,
				root : '0',//simpleData下可不用设置且只在初始化时有效，初始化后会用showRowId代替
				showRootId : '0',//请设置对应的顶层ID 非simpleData下可不用设置
				iconField : 'icon',//图标字段 样式
				iconClsField : 'iconCls',//图标字段 样式
				idField : 'id',
				textField : 'text',
				openField : 'open',
				levelField : '_level',
				parentField : 'pid',
				sortField : 'order',
				childField : 'items',
				disabledField : 'disabled',
				groupNode : false,//开启后会对叶子和节点进行分类
				autoShow  : false,
				showAt : {},//根菜单显示配置
				subShowAt : {},//子菜单显示配置
				_showAt : {
					my : 'right top',
					at : 'right top',
					collision : 'flipfit flipfit'	
				}
			};	
		}		
	});
	
	menu.override({
		constructor : function() {
			var self = this;
			
			this._super(arguments);
			
			var opt = this;
			
			//var cls = opt.cls.split(/\s+/);
			
			/*Nex.array_splice( function(i,v){
				if( v == 'nex-component-item' ) {
					return true;	
				}
			},cls );*/
			//opt.cls = cls.join(' ');
			//_mapTree
			opt.items = Nex.isArray( opt.items ) ? [].concat(opt.items) : [opt.items];
			
			self._parseMenuData(opt.items);
			
			self._bindDestroyOnParent();
			if( opt.autoShow ) {
				self.show();
			}
		},
		_bindDestroyOnParent : function(){
			var self = this;
			var opt = self.configs;
			if( !opt.parent ) return;
			var p = opt.parent;
			if( !Nex.isInstance( p ) ) {
				p = Nex.get( p );
			} else {
				opt.parent = p.configs.id;	
			}	
			if( !p ) return;
			p.one('onDestroy._'+opt.id,function(){
				self.destroyMenu();	
				self.destroy();
			});
		},
	/*	sysEvents : function(){
			var self = this;
			var opt = self.configs;
			self.callParent(arguments);
			return self;
		},*/
		_clickItem : function(li,tid,node,e){
			var self = this,
				opt=this.configs;
			
			if( node[opt.disabledField] ) {
				return;
			}
			var r;
			if( $.isFunction( node['callBack'] ) ) {
				r = node['callBack'].apply(opt.context || self,[li,tid,node,e,opt]);
				if( r === false ) return false;
			}
			if( $.isFunction( node['callback'] ) ) {
				r = node['callback'].apply(opt.context || self,[li,tid,node,e,opt]);
				if( r === false ) return false;
			}
			var hide = Nex.unDefined( node['hideOnClick'], opt.hideOnClick );
			if( !hide ) {
				return;	
			}
			if( self.isLeaf( tid ) && opt.hideOnClick ) {
				self.hideRoot();
			}
		},
		_setOverCls : function(li,tid,node,e){
			var self = this,
				opt=this.configs;
			if( node[opt.disabledField] ) {
				return;	
			}
			$(li).addClass("nex-menu-item-over");
		},
		_unsetOverCls : function(li,tid,node,e){
			var self = this,
				opt=this.configs,
				undef;
			if( node[opt.disabledField] ) {
				return;	
			}
			$(li).removeClass("nex-menu-item-over");	
		},
		_t_delay : 0,
		_displayMenu : function(el,tid,node,e){
			var self = this,
				opt=this.configs,
				undef;
				
			if( self._t_delay ) {
				clearTimeout( self._t_delay );
				self._t_delay = 0;
			}	
			
			if( $(el).hasClass('nex-menu-item-active') ) {
				return;	
			}
			
			if( opt.delay>0 ) {
				self._t_delay = setTimeout(function(){
					self.showSubMenu( tid );
				},opt.delay);	
			} else {
				self.showSubMenu( tid );
			}
		},
		_getNode : function(tid,pro){
			var self = this,
				opt=this.configs,
				undef;	
			//var node = opt._data[ opt._tfix+tid ];
			var node = opt._data[ tid ];
			
			if( node === undef ) {
				return false;	
			}
	
			return pro===undef ? node : node[pro];
		},
		getNode : function(){
			return this._getNode.apply( this,arguments );	
		},
		_getParentID : function(tid){
			var self = this,
				opt=this.configs,
				undef;	
			var pid = 	self._getNode(tid,opt.parentField);
			return pid === opt.root ? opt.root : 	pid;
		},
		_parseSimpleData : function(data,pid){
			var self = this,
				opt=this.configs;	
			var undef;
			var _ids = {};
			for( var i=0;i<data.length;i++ ) {
				var node = data[i];
				
				if( Nex.inArray( node,opt.splitChr ) !== -1 ) {
					node = {
						splitLine : true
					};	
				}
				
				node = $.extend({},opt.itemDefault,node);
				
				if( node[opt.parentField] === undef ) {
					node[opt.parentField] = pid === undef ? opt.root : pid;
					node[opt.levelField] = pid === undef ? 0 : self._getNode(pid,opt.levelField)+1;
				} else {
					node[opt.levelField] = 	self._getNode(node[opt.parentField],opt.levelField)+1;
				}
				if( !(opt.idField in node) ) {
					node[opt.idField] = 'menu_'+Nex.uuid();	
				} else{
					if(node[opt.idField].toString().length<=0) {
						node[opt.idField] = 'menu_'+Nex.uuid();		
					}
				}
				
				opt._data[ node[opt.idField] ] = node; 
				
				var _pid = node[opt.parentField];
				opt._childrens[ _pid ] = opt._childrens[ _pid ] === undef ? [] : opt._childrens[ _pid ];
				var childs = opt._childrens[ _pid ];
				childs.push(node);
				//levelData
				var _lv = node[opt.levelField];
				opt._levelData[ _lv ] = opt._levelData[ _lv ] === undef ? [] : opt._levelData[ _lv ];
				var levels = opt._levelData[ _lv ];
				levels.push(node);
				
				_ids[_pid] = true;
				
			}	

			for( var nid in _ids ) {
				//self.groupNodes( nid );
				self.updateLastNodes( nid );
			}
		},
		//解析数据 _mapTree
		_parseMenuData : function(data,pid){
			var self = this,
				opt=this.configs;	
			var undef;
			if( opt.simpleData ) {
				self._parseSimpleData(data,pid);
				return self;
			}
			for( var i=0;i<data.length;i++ ) {
				var node = data[i];
				
				if( Nex.inArray( node,opt.splitChr ) !== -1 ) {
					node = {
						splitLine : true
					};	
				}
				
				node = $.extend({},opt.itemDefault,node);
				
				node[opt.levelField] = pid === undef ? 0 : self._getNode(pid,opt.levelField)+1;
				node[opt.parentField] = pid === undef ? opt.root : pid;
				
				if( !(opt.idField in node) ) {
					node[opt.idField] = 'menu_'+Nex.uuid();	
				}
				
				opt._data[ node[opt.idField] ] = node; 
				
				var _pid = node[opt.parentField];
				opt._childrens[ _pid ] = opt._childrens[ _pid ] === undef ? [] : opt._childrens[ _pid ];
				var childs = opt._childrens[ _pid ];
				childs.push(node);
				//levelData
				var _lv = node[opt.levelField];
				opt._levelData[ _lv ] = opt._levelData[ _lv ] === undef ? [] : opt._levelData[ _lv ];
				var levels = opt._levelData[ _lv ];
				levels.push(node);
				
				if( ( opt.childField in node ) && $.isArray( node[opt.childField] ) && node[opt.childField].length ) {
					self._parseMenuData(node[opt.childField],node[opt.idField]);
				}
				
				if( (i+1) === data.length ) {
					self.updateLastNodes( _pid );
				}
				
			}	
			return self;
		},
		/*
		*更新 第一个节点和最后一个节点的索引
		*/
		updateLastNodes : function(pid){
			var self = this,
				opt=this.configs,
				undef;
			var pid = pid === undef ? opt.root : pid;	
			var chlids = opt._childrens[pid];
			if( chlids.length ) {
				opt._firstNodes[pid] = chlids[0];
				opt._lastNodes[pid] = chlids[chlids.length-1];
			}
		},
		_clearParseCache : function(){
			var self = this,
				opt=this.configs;	
			opt._childrens = {};	
			opt._data = {};
			opt._childrens = {};
			opt._levelData = {};
			opt._firstNodes = {};
			opt._lastNodes = {};
			return this;
		},
		//重新设置items
		setItems : function( items ){
			this.destroyMenu();
			this._clearParseCache();
			this._parseMenuData( items );
			return this;	
		},
		addChildren : function(tid,data){
			var self = this,
				opt=this.configs,
				undef;	
			var d = !$.isArray( data ) ? [data] : data;	
			self._parseMenuData(d,tid);
			return this;
		},
		addItems : function(){
			return this.addChildren.apply(this,arguments)	
		},
		resetMenuList : function( tid ){
			var menu = this.getMenuItem( tid );
			if( menu.length ) {
				menu.remove();	
			}	
			return this;
		},
		isSplitLine : function( node ){
			var self = this
				,opt=this.configs
				,undef;	
			if( node.splitLine ) return true;
			return false;
		},
		isLeaf : function(node){
			var self = this
				,opt=this.configs
				,undef;
			if( node === opt.root ) return false;
			var tnode = $.isPlainObject(node) ? node : self._getNode(node);
			if( tnode === false && !self._isRoot(node) ) return true;
			if( self._isRoot(node) ) return false;
			if( tnode.leaf === undef ) {
				//判断isCmp
				if( tnode['isCmp'] && tnode[opt.childField] ) {
					return false;	
				}
				var tid = tnode[opt.idField];
				var childrens = self.getChildrens(tid);
				if( childrens.length ) {
					return false;	
				}
				if( (opt.childField in tnode) && tnode[opt.childField].length ) {
					return false;	
				}
				return true;	
			} else {
				return !!tnode.leaf;	
			}
		},
		getAllChildrens : function(pid) {
			var self = this
				,opt=this.configs
				,undef;
			var childs = [];
			var pid = Nex.unDefined(pid,opt.root);
			var getChilds = function(pid){
				var _childs = self.getChildrens(pid);
				if( _childs.length ) {
					childs = childs.concat(_childs);
					for( var i=0;i<_childs.length;i++ ) {
						getChilds(_childs[i][opt.idField]);
					}
				}
			}
			getChilds(pid);
			return childs;
		},
		/*
		*获取子级
		*/
		getChildrens : function(pid){
			var self = this
				,opt=this.configs
				,undef;
			
			var pid = pid === undef ? opt.root : pid;
			
			return opt._childrens[pid] === undef ? [] : opt._childrens[pid];
		},
		//没有用到
		_getParentsList : function(tid){
			var self = this
				,opt=this.configs
				,root=opt.root
				,pids = [];
			var node = $.isPlainObject(tid) ? tid : self._getNode(tid);	
			if( node===false ) return [];
			var id = node[opt.idField];
			var pid = self._getParentID(id);
			while( 1 ) {
				if( !(pid in opt._data) ) break;
				pids.push( pid );	
				pid = self._getParentID(pid);
				if( pid === opt.root ) break;
			}
			return pids.reverse();
		},
		//没有用到
		_isFirstNode : function(tid){
			var self = this
				,opt=this.configs;
			var _pid = self._getParentID(tid);
			return opt._firstNodes[_pid][opt.idField] === tid ? true : false;
		},
		//没有用到
		_isLastNode : function(tid){
			var self = this
				,opt=this.configs;
			var _pid = self._getParentID(tid);
			return opt._lastNodes[_pid][opt.idField] === tid ? true : false;
		},
		_getMenuItemTpl : function(tnode){
			var self = this
				,opt=this.configs
				,spacers = [];
				
			var node = $.isPlainObject(tnode) ? tnode : self._getNode(tnode);
			if( node===false ) return '';
			/*
			if( self.isSplitLine( node ) ) {
				return '<div class="nex-menu-item-separator"><div class="nex-menu-line-h"></div></div>';	
			}
			*/
			var tid = node[opt.idField];
				
			var menuID = [opt.id,'_',node[opt.idField]].join("");
			
			var _pid = self._getParentID(tid);
			var liCls='';
			if( opt._firstNodes[_pid][opt.idField] === tid ) {
				liCls = 'nex-menu-first';	
				if( opt._firstNodes[opt.root][opt.idField] === tid ) {
					liCls+=' nex-menu-first-all';
				}
			}
			if( opt._lastNodes[_pid][opt.idField] === tid ) {
				liCls = 'nex-menu-last';	
			}
			
			if( node[opt.disabledField] ) {
				liCls += ' nex-menu-item-disabled';		
			}
			
			if( node['cls'] ) {
				liCls += ' '+node['cls'];			
			}
			
			var d = {
				splitLine : node['splitLine'],
				menuId : opt.id,
				itemId : tid,
				showMenuIcon : opt.showMenuIcon,
				cls : liCls,
				iconCls : node[opt.iconClsField],
				icon : node[opt.iconField],
				arrow : node['arrow'],
				arrowCls : node['arrowCls'],
				text : node[opt.textField],
				isLeaf : self.isLeaf(tid),
				showTips : opt.itemTips,
				tips : ''
			};
			
			if( opt.itemTips ) {
				var attr_tips = [opt.itemTipsTag,'="',];
				var tips = Nex.unDefined( node['tips'], node[opt.textField] );
				if( $.isFunction( opt.itemTipsFilter ) ) {
					tips = 	opt.itemTipsFilter.call( self,tips,d );
				}
				if( tips ) {
					tips = Nex.htmlEncode( tips );	
				}
				d.tipsMsg = tips;
				d.tipsTag = opt.itemTipsTag;
				attr_tips.push(tips);
				attr_tips.push('"');
				d.tips = attr_tips.join('');
			}
			
			if( opt.itemFilter && $.isFunction( opt.itemFilter ) ) {
				var r = opt.itemFilter.call( self,d );
				if( r === false ) return '';
				if( r !== undef ) {
					d = r;//$.extend(d,r);	
				}
			}
			
			if( opt.itemFormat && $.isFunction( opt.itemFormat ) ) {
				d.text = opt.itemFormat.call( self,d.text,d ) || d.text;
			}
			
			var r = self.fireEvent('onBeforeCreateItem',[ tid,d,opt ]);
			if( r === false ) return '';
			
			var _itemTpl = '';
			if( self.isSplitLine( d ) ) {
				_itemTpl = self.tpl(opt.splitLineTpl,d);	
			} else {
				_itemTpl = self.tpl(opt.itemTpl,d);
			}
			
			var et = {
				itemId : tid,
				itemTpl : _itemTpl,
				itemData : d
			};
			
			self.fireEvent('onCreateItem',[ et,opt ]);
			
			return et.itemTpl;
		},
		_isRoot : function(tid){
			var opt=this.configs;	
			return (tid === opt.root) ? true : false;
		},
		_bindUpBtnEvent : function( up,menu ){ 
			var self = this
				,opt=this.configs;	
			var menu = menu || down.parent();	
			var wraper = $('>.nex-menu-items-wraper',menu);
			var down = $('>.nex-menu-down',menu);
			
			up.bind({
				mouseenter : function(){
					var i = parseInt(wraper.css( 'margin-top' )) || 0;
					var tid = $(this).attr('menuid');
					self.hideAllSubSubMenu( tid );
					down.show();
					if( opt._t_down ) {
						clearInterval( opt._t_down );		
					}
					opt._t_down = setInterval(function(){
													   
						i = i+opt._speedNum;
						i = Math.min(i,0);
						wraper.css({
							'margin-top' : i								  
						});		
						
						if( i>=0 ) {
							up.hide();
							clearInterval( opt._t_down );	
						}
						
					},opt._speedTime);	
				},
				mouseleave : function(){
					clearInterval( opt._t_down );	
				}		  
			});
			
			
		},
		_bindDownBtnEvent : function( down,menu ){ 
			var self = this
				,opt=this.configs;	
			var menu = menu || down.parent();	
			var up = $('>.nex-menu-up',menu);
			var wraper = $('>.nex-menu-items-wraper',menu);
			var h1 = $(menu).height(),
				h2 = wraper.outerHeight();
			var diff = h2 - h1;
			down.bind({
				mouseenter : function(){
					var i = -(parseInt(wraper.css( 'margin-top' )) || 0);
					var tid = $(this).attr('menuid');
					self.hideAllSubSubMenu( tid );
					up.show();
					if( opt._t_down ) {
						clearInterval( opt._t_down );		
					}
					opt._t_down = setInterval(function(){
													   
						i = i+opt._speedNum;
						i = Math.min(i,diff);
						wraper.css({
							'margin-top' : -i								  
						});		
						
						if( i>=diff ) {
							down.hide();
							clearInterval( opt._t_down );	
						}
						
					},opt._speedTime);	
				},
				mouseleave : function(){
					clearInterval( opt._t_down );	
				}		  
			});
			
			
		},
		_checkMenuHeight : function( tid,menu ){
			var self = this
				,opt=this.configs;	
			if( !menu ) return false;
			var h1 = $(menu).height(),
				wraper = $('>.nex-menu-items-wraper',menu),
				h2 = wraper.outerHeight();
				
			$('>.nex-menu-up,>.nex-menu-down',menu).remove();
			
			if( h2 <= h1 ) return false;
			var diff = h2 - h1;
			var sTop = parseInt(wraper.css('marginTop')) || 0;
			
			var up = $('<div class="nex-menu-up '+opt.upBtnCls+'" menuid="'+tid+'"></div>'),
				down = $('<div class="nex-menu-down '+opt.downBtnCls+'" menuid="'+tid+'"></div>');
			
			menu.append( up );	
			menu.append( down );
			
			wraper.css('marginTop',0);
			up.hide();
			down.show();
			
			self._bindUpBtnEvent(up,menu);
			self._bindDownBtnEvent(down,menu);
			
			self.fireEvent('onMenuScrollBtnCreate',[tid,up,down,opt]);
			
		},
		/*
		*事件绑定 注：并没有阻止事件冒泡
		*/
		_bindMenuEvent : function(menu){
			var self = this
				,opt=this.configs;	
			var menus = opt._data;
			var callBack = function(type,e,fn,def){
				var tid = $(this).attr('menuid');
				var node = self._getNode(tid);
				var r = true;
				if( (type in node) && $.isFunction(node[type]) ) {
					r = node[type].apply(self,[this,tid,menus[tid],e]);
				}
				if( r!==false ) {
					r = self.fireEvent(type,[ this,tid,menus[tid],e,opt ]);
				}
				if( r === false ) {
					e.stopPropagation();
					e.preventDefault();
				} else {
					if( fn ) {
						$.isFunction( fn ) ? fn.apply( self,[ this,tid,menus[tid],e ] ) : null;
					}
				}
				if( def ) {
					$.isFunction( def ) ? def.apply( self,[ this,tid,menus[tid],e ] ) : null;
				}
				return r;
			};
			var events = {
				'click._meun' : function(e) {
					callBack.call(this,'onClick',e,function(){
						if( opt.expandOnEvent == 1 ) {
							self._displayMenu.apply( self,arguments );	
						}		
					},self._clickItem);
				},
				'dblclick._meun' : function(e) {
					callBack.call(this,'onDblClick',e);
				},
				'keydown._meun' : function(e) {
					callBack.call(this,'onKeyDown',e);
				},
				'keyup._meun' : function(e) {
					callBack.call(this,'onKeyUp',e);
				},
				'keypress._meun' : function(e){
					callBack.call(this,'onKeyPress',e);
				},
				'mouseenter._meun' : function(e){
					callBack.call(this,'onMouseOver',e,function(){
						self._setOverCls.apply( self,arguments );	
						if( opt.expandOnEvent == 0 ) {
							self._displayMenu.apply( self,arguments );	
						}		
					});
				},
				'mouseleave._meun' : function(e){
					callBack.call(this,'onMouseOut',e,function(){
						self._unsetOverCls.apply( self,arguments );		
					});
				},
				'mousedown._meun' : function(e) {
					callBack.call(this,'onMouseDown',e);
				},
				'mouseup._meun' : function(e) {
					callBack.call(this,'onMouseUp',e);
				},
				'contextmenu._meun' : function(e){	
					callBack.call(this,'onContextMenu',e);
				}
			};
			
			menu.undelegate('>.nex-menu-item')
				.delegate('>.nex-menu-item',events);
			
			return self;
		},
		bindMenuEvent : function(menu){
			var opt=this.configs;	
			var returnfalse = function(e){
					return false;
				};
			$(menu).parent().bind({
				//'mousedown' : returnfalse,
				//'mouseover' : returnfalse,
				'contextmenu._menu' : returnfalse
				//click : returnfalse
			});
			//这里可以采用 事件委托的方式...
			this._bindMenuEvent(menu);	
			this.fireEvent('onBindMenuEvents',[ menu,opt ]);
			return this;
		},
		getRootMenu : function(){
			var opt=this.configs;	
			var id = [opt.id,'_',opt.root].join("");
			return $('#'+id);
		},
		getMenu : function( tid ){
			var opt=this.configs;	
			var id = [opt.id,'_',tid].join("");
			return $('#'+id);
		},
		getMenuShadow : function( tid ){
			var opt=this.configs;	
			var id = [opt.id,'_',tid,'_shadow'].join("");
			return $('#'+id);
		},
		getMenuWraper : function( tid ){
			var opt=this.configs;	
			var id = [opt.id,'_',tid,'_items_wraper'].join("");
			return $('#'+id);
		},
		getMenuBody : function( tid ){
			return this.getMenuWraper( tid );	
		},
		getMenuItem : function( tid ){
			var opt=this.configs;	
			var id = [opt.id,'_',tid,'_item'].join("");
			return $('#'+id);
		},
		/*
		*创建Menu
		*/
		_bulidMenu : function(tid){
			var self = this
				,opt=this.configs;	
			var tid = Nex.unDefined(tid,opt.root);
	
			var node = self._getNode(tid);
			
			var menuID = [opt.id,'_',tid].join("");
			var menu = $("#"+menuID);
			//var menu_wraper = $('#'+menuID+'_items_wraper');
			
			var _createMenu = function(){
				var childrens = Nex.unDefined(opt._childrens[ tid ],[]);;
				var menuCls = ['nex-menu'];
				if( opt.border ) {
					menuCls.push( opt.borderCls );	
				}
				menuCls.push( opt.cls );
				menuCls.push( node['subCls'] );
				
				Nex.topzIndex = Nex.topzIndex + 2;
				
				var menu = ['<div id="',menuID,'" menu-cmpid="'+opt.id+'" style="z-index:',Nex.topzIndex,'" class="',menuCls.join(' '),'">'];
				menu.push('<div class="nex-menu-items-wraper" id="'+menuID+'_items_wraper">')
				if( !node['isCmp'] ) {
					menu.push(opt.showMenuVLine ? '<div class="nex-menu-line-v"></div>' : '');
					for( var i=0;i<childrens.length;i++ ) {
						menu.push( self._getMenuItemTpl(childrens[i]) );
					}
				}
				menu.push('</div></div>');
				menu = $(menu.join(""));
				
				var render = $(opt.renderTo);
				render.append(menu);
				
				if( opt.padding ) {
					menu.css('padding',opt.padding);	
				}
				menu.css(opt.style);
				
				//isCmp
				if( node['isCmp'] && node[opt.childField] ) {
					var wraper = $('#'+menuID+'_items_wraper');	
					//wraper.empty();
					self.parseItems( wraper,node[opt.childField] );
				}
				
				return menu;
			};
			
			var _setMenuSize = function( menu ){
				var render = $(opt.renderTo);
				menu.css({width : '', height : ''});
				//menu_wraper._removeStyle('width height');
				var w = node['width'] || opt.width;
				var h = node['height'] || opt.height;
				w = $.isFunction( w ) ? w.call( self,tid ) : w;
				h = $.isFunction( h ) ? h.call( self,tid ) : h;
				
				w = w == 'auto' ? 0 : w;
				h = h == 'auto' ? 0 : h;
				
				//var _w = w,_h = h;
				
				var mh = render.is('body') ? $(window) : render;
				var maxWidth = $.isFunction(opt.maxWidth) ? opt.maxWidth.call( self,tid ) : opt.maxWidth,
					maxHeight = $.isFunction(opt.maxHeight) ? opt.maxHeight.call( self,tid ) : opt.maxHeight;
				var minWidth = $.isFunction(opt.minWidth) ? opt.minWidth.call( self,tid ) : opt.minWidth,
					minHeight = $.isFunction(opt.minHeight) ? opt.minHeight.call( self,tid ) : opt.minHeight;	
				//先设置宽度
				var width = w > 0 ? w : menu.outerWidth();
				var _w = width;
				if(!opt.maxWidth) {
					maxWidth = mh.width() - opt.shadowWidth;	
				}
				if( minWidth>0 ) {
					width = Math.max(width,minWidth);
				}
				if( maxWidth>0 ) {
					width = Math.min(width,maxWidth);
				}
				
				if( w>0 || _w != width ) {
					menu.outerWidth(width);
				}
				
				//在设置高度
				var height = h > 0 ? h : menu.outerHeight();
				var _h = height;
				if(!opt.maxHeight) {
					maxHeight = mh.height() - opt.shadowWidth;	
				}
				if( minHeight>0 ) {
					height = Math.max(height,minHeight);
				}
				if( maxHeight>0 ) {
					height = Math.min(height,maxHeight);
				}
			
				if( h>0 || _h != height ) {
					menu.outerHeight(height);
				}
					
			}
			
			if( !menu.length ) {
				menu = _createMenu();
				
				//menu_wraper = $('#'+menuID+'_items_wraper');
				
				menu.disableSelection();
				
				self.bindMenuEvent($('>.nex-menu-items-wraper',menu));
				
				self.fireEvent('onCreateMenu',[ menu,tid,opt ]);
				
			}
			menu.css( {
				left : -99999,
				top : -99999	
			} ).show();
			
			_setMenuSize( menu );
			
			if( !node['isCmp'] ) {
				if( opt.showMenuMore ) {
					self._checkMenuHeight( tid,menu );	
				}
			}
			
			return menu;
		},
		//hideOnBlur
		_createMenu : function(tid){
			var self = this
				,opt=this.configs
				,undef
				,pids = [];	
			if( tid === undef ) return false;
			
			var node = self._getNode(tid);
			if( node === false && !self._isRoot(tid) ) return false ;
			
			var menu = self._bulidMenu(tid);
			
			return menu;
		},
		_showMenu : function( tid ){
			var self = this
				,opt=this.configs
				,undef;	
			var tid = Nex.unDefined(tid, opt.root);		
			
			var r = self.fireEvent('onBeforeShowMenu',[tid,opt]);//CreateMenu
			if( r === false ) return false;
			
			//创建SubMenu
			var menu = self._createMenu(tid);
			
			if( menu ) {
				
				$("#"+opt.id+"_"+tid+"_item").addClass("nex-menu-item-active");
			
				self.fireEvent('onShowMenu',[tid,menu,opt]);
				
			}
			return menu;
		},
		_showRootMenu : function( pos, opts ){
			var self = this;
			var opt = this.configs;
			var menu = this._showMenu();	
			
			if( !menu ) return false;
			
			var pos = Nex.unDefined( pos,null );
			var showAtConf = Nex.unDefined( opts,{} );
			
			if( Nex.isArray( pos ) ) {
				pos = {
					left : pos[0],
					top  : pos[1]	
				}
			}
			
			var dpos = pos ? { of : pos } :　{};
			
			showAtConf = $.extend( {},$.isPlainObject(opt.showAt) ? opt.showAt : { of : opt.showAt }, dpos ,showAtConf );
			
			this._showMenuAt( menu,null,showAtConf,0 );
			//setTimeout(function(){
			self.bindCloseEvents();	
			//},0);
			return true;	
		},
		showRootMenu : function( pos,opts ){
			var self = this,
				opt=this.configs;
				
			var r = self.fireEvent('onBeforeShowRootMenu',[ pos,opts,opt]);
			
			if( r === false ) return self;
			
			self._showRootMenu.apply( this,arguments );
			
			self.fireEvent('onShowRootMenu',[opt]);
			
			return self;
		},
		showRoot : function(){
			return this.showRootMenu.apply( this,arguments );
		},
		_showSubMenu : function( tid,opts ){//div,tid,node,e
			var self = this,
				opt=this.configs,
				undef;
			var isRoot = self._isRoot( tid );	
			var mitem = $('#'+opt.id+'_'+tid+'_item');	
			if( !isRoot && !mitem.length ) {
				return false;	
			}
			
			var showAtConf = Nex.unDefined( opts,{} );
			
			var menu = self._showMenu(tid);
			
			var pos = isRoot ? null : mitem;
			var _showAt = isRoot ? 
							$.isPlainObject(opt.showAt) ? opt.showAt : { of : opt.showAt }
							: $.isPlainObject(opt.subShowAt) ? opt.subShowAt : { of : opt.subShowAt };
			
			var dpos = pos ? { of : pos } : {};				
							
			showAtConf = $.extend( {},_showAt, dpos ,showAtConf );
			
			if( menu ) {
				self._showMenuAt( menu,null,showAtConf,isRoot ? 0 : 1 );	
			} else {
				return false;	
			}
			return true;
		},
		showSubMenu : function( tid ){
			var self = this,
				opt=this.configs,
				node = this._getNode( tid );
			
			self.hideAllSubMenu(tid);	
			
			if( node ) {
				if( node[opt.disabledField] ) {
				  return self;	
			  	}
			}
				
			var r = self.fireEvent('onBeforeShowSubMenu',[tid,opt]);
			
			if( r === false ) return self;
			
			if( self.isLeaf(tid) ) {
				return self;	
			}
			
			self._showSubMenu( tid );
			
			self.fireEvent('onShowSubMenu',[tid,opt]);
			
			return self;
		},
		_hide : function(menu,fn){
			var self = this;
			menu.css( {
				left : -99999,
				top : -99999	
			} ).hide();	
			if( fn && $.isFunction( fn ) ) {
				fn();	
			}
		},
		hideMenu : function(menuid){
			var self = this,
				opt=this.configs,	
				undef;		
			if( menuid === undef ) return self;
			var treeID = [opt.id,'_',menuid].join("");
			
			var menu = $("#"+treeID);
			if( !menu.length ) {
				return self;	
			}
			var menuShadow = $("#"+treeID+'_shadow');
			
			var r = self.fireEvent('onBeforeHideMenu',[menuid,opt]);
			if( r === false ) return self;
			
			var cb = function(){
				self.fireEvent('onHideMenu',[menuid,opt]);	
			};
			
			if( opt.hideToRemove ) {
				var node = self._getNode( menuid );
				self._hide( menu,function(){
					menu.remove();
					if( node['isCmp'] ) {
						Nex.gc();	
					}
					if( menuShadow.length ) {
						menuShadow.remove();
					}	
				} );
			} else {
				self._hide( menu,function(){
					if( menuShadow.length ) {
						menuShadow.hide();
					}	
				} );
			}
			
			$("#"+opt.id+"_"+menuid+"_item").removeClass("nex-menu-item-active");	
			
			return self;
		},
		hideAllSubSubMenu : function(pid){
			var self = this,
				opt=this.configs;	
			var pid = Nex.unDefined(pid,opt.root);

			var allChilds = self.getAllChildrens(pid);
			
			for( var i=0;i<allChilds.length;i++ ) {
				var tid = allChilds[i][opt.idField];
				var isLeaf = self.isLeaf(tid);
				if( !isLeaf ) {
					self.hideMenu(tid);
				}	
			}
		},
		/*
		* 隐藏当前同级item列表下所有的
		*/
		hideAllMenu : function(){
			this.hideAllSubMenu( this.configs.root , 1 );
			return this;
		},
		hideAllSubMenu : function( pid,m ){
			var self = this,
				opt=this.configs;	
			var pid = Nex.unDefined(pid,opt.root);
			pid = self._isRoot( pid ) ? pid : self._getParentID(pid);
			var allChilds = self.getAllChildrens(pid);
			if( m ) {
				self.hideMenu(pid);
			}
			for( var i=0;i<allChilds.length;i++ ) {
				var tid = allChilds[i][opt.idField];
				var isLeaf = self.isLeaf(tid);
				if( !isLeaf ) {
					self.hideMenu(tid);
				}	
			}
			return self;
		},
		hideRoot : function(){
			this.hideAllMenu();
			this.unbindCloseEvents();
			return this;
		},
		hideRootMenu : function(){
			return this.hideRoot.apply( this,arguments );	
		},
		//销毁所有的菜单
		destroyMenu : function(){
			var opt = this.configs;
			var _status = opt.hideToRemove;
			opt.hideToRemove = true;
			this.hideAllMenu();	
			opt.hideToRemove = _status;
			return this;
		},
		hideLeveMenu : function(level){
			var self = this,
				opt=this.configs,
				undef;	
			if( level === undef ) return true;
			var menus = opt._levelData[ level ];
			for( var i=0;i<menus.length;i++ ) {
				self.hideMenu( menus[i][opt.idField] );	
			}
			return true;
		},
		/*
		*IE9以下版本不支持shadow 属性 所以用其他方法实现
		*/
		_setShadow : function(source){
			var self = this,
				opt=this.configs,
				undef;	
			
			var shadowid = $(source).attr('id') + '_shadow';
			var shadow = $("#"+shadowid);
			if( shadow.length ) {
				shadow.show();
				shadow.width( $(source).outerWidth() );
				shadow.height( $(source).outerHeight() );
				shadow.css( {
					left : $(source).css('left'),	
					top : $(source).css('top')
				} );
				shadow.css( "zIndex",$(source).css('z-index') - 1 );	
				return true;	
			}
			var shadow = $('<div class="nex-menu-shadow" id="'+shadowid+'">'+(Nex.IEVer<=8?'<iframe frameborder="0" class="nex-menu-shadow-iframe" style="width:99%;height:99%;"></iframe>':'')+'</div>');
			shadow.appendTo(opt.renderTo);
			shadow.width( $(source).outerWidth() );
			shadow.height( $(source).outerHeight() );
			shadow.css( {
				left : $(source).css('left'),	
				top : $(source).css('top')
			} );
			shadow.css( "zIndex",$(source).css('z-index') - 1 );	
			return true;
		},
		//animate 不要去设置
		_showMenuAt : function(source,target,conf){//el,at,conf
			var self = this,
				opt=this.configs,
				undef;	
			var confs = {};
			var conf = Nex.unDefined( conf,{} );
		
			var dc = {visibleEdge : opt.shadowWidth};
			if( target ) {
				dc.of = target;	
			}
			$.extend( confs,opt._showAt,conf,dc );
			if( !confs.of ) {
				confs.of = window
			}
			if( !source ) {
				return false;
			}
			
			var r = self.fireEvent('onBeforeShowAt',[ menu,confs,opt ]);
			if( r === false ) {
				return;	
			}
			
			var fn = function(){
				if( opt.showShadow ) {
					self._setShadow( source );
				}		
				self.fireEvent('onShowAt',[ menu,confs,opt ]);
			};
			
			self._show( source,confs,fn );
			
			return true;
		},
		_show : function( menu,confs,fn ){
			var self = this;
			
			var sc = $.extend( {},confs || {} );
			
			$(menu).position(sc);
			
			fn();
		},
		unbindCloseEvents : function(){
			var opt = this.configs;
			$(document).unbind('.menu_'+opt.id);	
			$(window).unbind('.menu_'+opt.id);	//$(window).
			return this;
		},
		bindCloseEvents : function(){
			var self = this;
			var opt = this.configs;
			if( !opt.hideOnBlur ) return self;
			self.unbindCloseEvents();	
			$(document).one('contextmenu.menu_'+opt.id+' mousedown.menu_'+opt.id,function(e){//mousewheel.menu_'+opt.id+' 
				var target = e.target || e.srcElement;
				//closest parents
				if( 
					$(target).closest('[menu-cmpid="'+opt.id+'"]').length
				) {
					self.bindCloseEvents();
				} else {
					self.hideRoot();
					self.unbindCloseEvents();		
				} 
			});
			/*
			* 注： IE6下有时append 都会触发resize...
			*/
			$(window).one('resize.menu_'+opt.id,function(){//$(window)
				self.hideRoot();	
				self.unbindCloseEvents();		
			});	
			return self;
		},
		//显示根节点的时候 调用 -- 不建议使用了
		showAt : function(){
			return this.show.apply(this,arguments);	
		},
		//显示menu
		show : function( pos,opts ){
			this.showRootMenu.apply( this,arguments );
			return this;
		},
		hide : function(){
			this.hideRootMenu();	
			return this;
		}
	});
	
	return menu;
});