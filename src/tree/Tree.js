/*
jquery.nexTree.js
http://www.extgrid.com/tree
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱
v1.0
1.新增 nodesSort 参数  可控制叶子节点显示先后
2.新增一个sortField 可控制显示位置 为以后的可拖拽做下基础 待实现
*/

define(function(require){
	var Panel = require('../panel/Panel');	
	var Store = require('../data/Store');	
	
	require('Nex/mixins/DataLoader');
	
	var tree = Nex.define('Nex.tree.Tree', {
		extend : 'Nex.panel.Panel',
		alias  : 'Nex.Tree',
		xtype  : 'treepanel tree',	
		prefix : 'nextree-',
		componentCls : [Panel.fn.componentCls, 'nex-tree'].join(' '),
		mixins : ['Nex.mixins.DataLoader'],
		config: function( opt ){
			
			return {
				autoScroll : true,
				bodySelectionable : false,
				data : [],
				showExpanderIcon : true,//显示展开图标
				showTreeLines : true,//显示节点线条
				showTreeIcon : true,//显示节点图标
				animate : true,//展开 收缩节点时的动画效果
				animateTime : 100,
				singleExpand : false,//如果true 同一级只有一个节点能展开
				expandOnEvent : 2,//0 不开启 1单击展开 2双击展开
				expandOnLoad : false,//boolean:true false number:1 2 3 展开多少级
				simpleData : false,
				root : '0',//simpleData下可不用设置且只在初始化时有效，初始化后会用showRowId代替
				iconField : 'icon',//图标字段 样式
				iconClsField : 'iconCls',//图标字段 样式
				idField : 'id',
				textField : 'text',
				openField : 'open',
				levelField : '_level',
				parentField : 'pid',
				childrenField : 'children',
				leafField : 'leaf',
				sortable : true,
				sortField : 'order',//order field 默认会为 0 系统强制设置 1 2 3 4 ...
				sortOrder : 'asc',//asc desc
				groupNode : true,//开启后会对叶子和节点进行分类
				nodesSort : 1,//开启groupNode后 1 叶子节点放到最后， 2叶子节点放到最前
				singleSelect : true,
				enableSelected : true,//选择的行
				allowDrag : false,//是否允许拖拽节点
				allowDrop : false,//是否允许投放节点
				removeOnCollapse : true,//收缩节点被删除。极大提升性能。
				events : {}
			};	
		}
	});

	tree.override({
		onRender : function(opt) {
			var self = this;
			
			self._super( arguments );
			
			self.initTree();
			
			self.initTreeEvents();
			
		},
		/*
		* 数据源
		*/
		dataSource : [],
		/*
		* 节点ID对应的节点数据
		*/
		_dataHashMaps : {},
		/*
		* 各节点下的子节点
		* {
		*	2 : [2,3],
		*	4 : [5,6]
		* }
		*/
		_dataChildrens : {},
		/*
		* 各层级下的节点 格式同 _dataChildrens
		*/
		_dataLevels : {},
		/*
		* 缓存
		*/
		_firstNodes : {},
		_lastNodes : {},
		selection : {},
		/*
		* 树形组件初始化
		*/
		initTree : function(){
			this.initTreeData();
		},
		/*
		* 初始化数据
		*/
		initTreeData : function( data ){
			var self = this;
			var opt = self.configs;
			//初始化数据
			self.dataSource = [];
			self._dataHashMaps = {};
			self._dataChildrens = {};
			self._dataLevels = {};
			self._firstNodes = {};
			self._lastNodes = {};
			self.selection = {};
			
			self.dataToTree(data || opt.data);	
			if( data ) {
				opt.data = data;	
			}
			
			return self;
		},
		/*
		* 渲染树
		*/
		doRenderData : function(){
			var self = this;
			var opt = self.configs;	
			//self._super( arguments );
			var rootId = self.getRootId();
			var maps = self.getDataMaps();
			
			var bd = self.getBody();
			bd.empty();
			
			self.expandNode( rootId );
			
			if( opt.expandOnLoad === true ) {
				self.expandAll(rootId);	
			} else {
				for(var tid in maps) {
					if( maps[tid][opt.openField] ) {
						self.expandNode(tid);
					}	
				}
				//展开指定层级节点
				if( Nex.isNumeric(opt.expandOnLoad) ) {
					self.expandLevel( opt.expandOnLoad );
				}
			}
		},
		/*
		*初始化事件
		*/
		initTreeEvents : function(){
			var self = this
				,opt=this.configs;	
			var bd = self.getBody();
			var callEvent = function( evt, e ){
				var tid = $(this).attr("treeid");
				
				var node = self._getNode(tid);
				if( !node ) return;
				
				e.helper = $(this);
				
				if( self[ evt ] && Nex.isFunction( self[ evt ] ) ) {
					self[ evt ].call( self, tid, node, e );	
				}
				if( self.fireEvent(evt,[tid, node, e]) === false ) {
					return false;	
				}	
			};
			bd.undelegate('.tree')
			  .delegate(".nex-tree-expander-icon", 'click.tree dblclick.tree', function(e){
				  //nex-tree-loading
				  var p = $(this).parent();
				  if( p.hasClass('nex-tree-loading') ) {
						return;  
				  }
				  var ev = "";
				  switch( e.type ) {
					case 'click' : ev = 'onNodeExpanderClick'; break;
					case 'dblclick' : ev = 'onNodeExpanderDblClick'; break;
				  }
				  if( !ev ) return;
				  callEvent.call(p, ev, e);
				  e.stopPropagation();
				  e.preventDefault();
				  $(document).trigger(e.type);
			  })
			  .delegate(".nex-tree-item-wraper", [
			  	'click.tree',
				'dblclick.tree',
				'keydown.tree',
				'keyup.tree',
				'keypress.tree',
				'mouseenter.tree',
				'mouseleave.tree',
				'contextmenu.tree',
				'mousedown.tree',
				'mouseup.tree'
			  ].join(' '), function(e){
				    var ev = "";
					  switch( e.type ) {
						case 'click' : ev = 'onNodeClick'; break;
						case 'dblclick' : ev = 'onNodeDblClick'; break;
						case 'contextmenu' : ev = 'onNodeContextMenu'; break;
						case 'keydown' : ev = 'onNodeKeyDown'; break;
						case 'keyup' : ev = 'onNodeKeyUp'; break;
						case 'keypress' : ev = 'onNodeKeyPress'; break;
						case 'mousedown' : ev = 'onNodeMouseDown'; break;
						case 'mouseup' : ev = 'onNodeMouseUp'; break;
						case 'mouseenter' : ev = 'onNodeMouseOver'; break;
						case 'mouseleave' : ev = 'onNodeMouseOut'; break;
					  }
					  if( !ev ) return;
					  if( callEvent.call(this, ev, e) === false ) {
						 e.stopPropagation();
				 		 e.preventDefault();
					  } 
			  });
			//nex-tree-item-wraper
			//self.fireEvent('onBindTreeEvents',[ lis,events,opt ]);	
		},
		/*sysEvents : function(){
			var self = this;
			var opt = self.configs;
			self._super( arguments );
			//self.bind("onClick.select",self._selectNode,self);
			//self.bind("onNodeClick.expand",self.toExpandClick,self);
			//self.bind("onNodeDblClick.expand",self.toExpandDblClick,self);
			
			return self;
		},*/
		getDataMaps : function(){
			return this._dataHashMaps;
		},
		onNodeClick : function(tid, data, e){
			var self = this,
				opt=this.configs;
			var target = e.hepler;
			
			if( opt.expandOnEvent == 1 ) {
				self.toggleNode(tid);
			}
			if( opt.enableSelected ) {
				self.selectNode( tid );
			}
			
		},
		onNodeDblClick : function(tid, data, e){
			var self = this,
				opt=this.configs;
			if( opt.expandOnEvent == 2 ) {
				self.toggleNode(tid);
			}
		},
		onNodeMouseOver : function(tid, data, e){
			$(e.helper).addClass("nex-tree-item-over");
		},
		onNodeMouseOut : function(tid, data, e){
			$(e.helper).removeClass("nex-tree-item-over");	
		},
		onNodeExpanderClick : function(tid, data, e){
			var self = this,
				opt=this.configs;
			self.toggleNode(tid);	
		},
		_getNode : function(tid,pro){
			var self = this,
				opt=this.configs,
				undef;	
			//var node = opt._data[ opt._tfix+tid ];
			var node = self._dataHashMaps[ tid ];
			
			if( node === undef ) {
				return null;	
			}
	
			return pro===undef ? node : node[pro];
		},
		getNode : function(tid,pro){
			return this._getNode( tid,pro );	
		},
		getParentID : function(tid){
			var self = this,
				opt=this.configs,
				undef;	
			var rootId = self.getRootId();	
			var pid = self._getNode(tid, opt.parentField);
			return tid+'' === rootId+'' ? rootId : pid;
		},
		_parseSimpleData : function(data,pid){
			var self = this,
				opt=this.configs;	
			var undef;
			var _ids = {};
			for( var i=0;i<data.length;i++ ) {
				var node = data[i];
				
				if( node[opt.parentField] === undef ) {
					node[opt.parentField] = pid === undef ? self.getRootId() : pid;
					node[opt.levelField] = pid === undef ? 0 : self._getNode(pid,opt.levelField)+1;
				} else {
					node[opt.levelField] = 	self._getNode(node[opt.parentField],opt.levelField)+1;
				}
				if( !(opt.idField in node) || Nex.isEmpty( node[ opt.idField ] ) ) {
					node[opt.idField] = Nex.uuid();
				}
				
				self._dataHashMaps[ node[opt.idField] ] = node; 
				
				var _pid = node[opt.parentField];
				self._dataChildrens[ _pid ] = self._dataChildrens[ _pid ] === undef ? [] : self._dataChildrens[ _pid ];
				var childs = self._dataChildrens[ _pid ];
				childs.push(node);
				//levelData
				var _lv = node[opt.levelField];
				self._dataLevels[ _lv ] = self._dataLevels[ _lv ] === undef ? [] : self._dataLevels[ _lv ];
				var levels = self._dataLevels[ _lv ];
				levels.push(node);
				
				_ids[_pid] = true;
				
			}	
		},
		getRootId : function(){
			return this.configs.root;	
		},
		/*
		*获取组件树数据
		*/
		getData : function( simple ){
			var self = this,
				opt = this.configs;
			var isSimple = Nex.unDefined( simple, opt.simpleData );			
			function getTreeData( tid ){
				var nodes = self.getChildrens(tid);
				$.each( nodes, function(i, d){
					if( !self.isLeaf(d) ) {
						d[opt.childrenField] = getTreeData(d[opt.idField]);
					}
				} );	
				return nodes;
			}	
			var rootId = self.getRootId();
			return isSimple ? self.getAllChildrens( rootId ) : getTreeData( rootId );
		},
		setData : function( data ){
			this.initTreeData(data || [])
				.doRenderContent();
			return this;	
		},
		/*
		* 把数据解析成有关联的树形数组
		*/
		dataToTree : function(data,pid){
			var self = this,
				opt=this.configs;	
			var undef;
			if( opt.simpleData ) {
				self._parseSimpleData(data || [],pid);
				return self;
			}
			var childrenField = opt.childrenField;
			for( var i=0,len = data.length;i<len;i++ ) {
				var node = data[i];
				//设置当前节点的层次0为第一层 
				node[opt.levelField] = pid === undef ? 0 : self._getNode(pid,opt.levelField)+1;
				//设置当前节点的父节点
				node[opt.parentField] = pid === undef ? self.getRootId() : pid;
				//检查节点否设置了id 否则使用uuid随机生成一个
				if( !(opt.idField in node) ) { 
					node[opt.idField] = Nex.uuid();	
				}
				//把当前节点数据放到hashMaps里方便读取
				self._dataHashMaps[ node[opt.idField] ] = node; 
				//_dataChildrens
				var _pid = node[opt.parentField];
				self._dataChildrens[ _pid ] = self._dataChildrens[ _pid ] === undef ? [] : self._dataChildrens[ _pid ];
				var childs = self._dataChildrens[ _pid ];
				childs.push(node);
				//levelData
				var _lv = node[opt.levelField];
				self._dataLevels[ _lv ] = self._dataLevels[ _lv ] === undef ? [] : self._dataLevels[ _lv ];
				var levels = self._dataLevels[ _lv ];
				levels.push(node);
				
				if( ( childrenField in node ) && node[childrenField].length ) {
					self.dataToTree(node[childrenField],node[opt.idField]);
				}
			}	
			return self;
		},
		_updateChildrens : function( tid, datas ){
			this._dataChildrens[ tid ] = Nex.isArray( datas ) ? datas : [ datas ];
			return this;	
		},
		/*
		* 对指定list进行 分组
		*/
		_groupNodes : function(list){
			var self = this,
				opt=this.configs,
				undef;
			
			//var pid = pid === undef ? opt.root : pid;
			var _d = list || [];//opt._childrens[ pid ];
			
			if( !opt.groupNode ) return _d;
			
			var nodes=[],leafs=[];
			var len = _d.length;
			for( var i=0;i<len;i++ ) {
				if(self.isLeaf( _d[i] )) {
					leafs.push( _d[i] );	
				} else {
					nodes.push( _d[i] );		
				}
			}
			if( opt.nodesSort == 1 ) {
				_d = nodes.concat(leafs);
			} else if( opt.nodesSort == 2 ) {
				_d = leafs.concat(nodes);	
			}
			
			return _d;
		},
		/*
		*动态对item分组 或者 排序
		*/
		groupNodes : function(pid){
			var self = this,
				opt=this.configs,
				undef;
			var pid = pid === undef ? opt.root : pid;		
			var p = self.getNodeEl( pid );
			var isRoot = self._isRoot( pid );
			if( !p ) return false;
			if( !isRoot && !tree._getNode(pid,opt.openField) ) return false;
			var childrens = self._groupNodes( self.getDisplayNodes( pid ) );	
			
			$.each( childrens,function( i,node ){
				var id = node[opt.idField];
				var el = self.getNodeEl( id );
				if( el ) {
					p.append( el );		
				}
			} );
			return true;
		},
		sortNodes : function(pid){
			return this.groupNodes( pid );	
		},
		/*
		*更新 第一个节点和最后一个节点的索引
		*/
		_updateLastNodes : function(pid, list){
			var self = this,
				opt=this.configs,
				undef;
			var pid = pid === undef ? self.getRootId() : pid;	
			var chlids = list || [];
			
			if( chlids.length ) {
				self._firstNodes[pid] = chlids[0];
				self._lastNodes[pid] = chlids[chlids.length-1];//[chlids.length-1]
			} else {
				self._firstNodes[pid] = null;
				self._lastNodes[pid] = null;	
			}
		},
		updateLastNodes : function(pid){
			this.refreshDisplayNodes(pid);
			return this;	
		},
		//对当前节点的子节点的排序数字重计算
		resetNodesOrder : function( pid ){
			var self = this
				,opt=this.configs
				,undef;	
			var childs = self.getChildrens( pid );
			//sortOrder
			var isAsc = opt.sortOrder === 'asc' ? true : false;
			var len = childs.length || 0;
			var sorts = {};
			$.each( childs,function(i,node){
				var index = isAsc ? i : --len;
				node[ opt.sortField ] = index;
				sorts[ node[opt.idField] ] = index;
			} );	
			self.fireEvent( 'onResetOrder',[ sorts,childs,opt ] );
		},
		_sortItems : function( list ){
			var self = this
				,opt=this.configs
				,undef;
			if( !Nex.isArray( list ) || !list.length ) {
				return list;	
			}	
			var isAsc = opt.sortOrder == "asc" ? true : false;	
			list.sort(function(a,b){
				a[opt.sortField] = self._undef(a[opt.sortField],0);
				b[opt.sortField] = self._undef(b[opt.sortField],0);
				if( a[opt.sortField] >  b[opt.sortField] ) {
					return isAsc ? 1 : -1;
				} if( a[opt.sortField] === b[opt.sortField] ){
					return 0;
				} else {
					return isAsc ? -1 : 1;
				}
			});
			return list;
		},
		unSelectNode : function(tid){
			var self = this
				,opt=this.configs
				,undef;
			if( tid === undef ) return self;	
			if( !self.isSelected(tid) ) return self; 
			var r = self.fireEvent("onBeforeUnSelectNode",[tid,opt]);
			if( r === false ) return self;
			var el = self.getNodeEl( tid );
			el.removeClass("nex-tree-item-selected");
			self.selection[tid] = false;
			self.fireEvent("onUnSelectNode",[tid,opt]);
			return self;
		},
		selectNode : function(tid){
			var self = this
				,opt=this.configs
				,undef;
			if( tid === undef ) return self;
			for( var i in self.selection ) {
				if(self.selection[i] && opt.singleSelect) {
					if( tid+'' == i+'' ) continue;//如果单选情况下 重复选择无效
					self.unSelectNode(i);	
				}
			}
			if( !opt.singleSelect && self.selection[tid] ) {
				self.unSelectNode(tid);	
				return self;	
			}
			if( self.isSelected(tid) ) return self; 
			var r = self.fireEvent("onBeforeSelectNode",[tid,opt]);
			if( r === false ) return self;
			var el = self.getNodeEl( tid );
			el.addClass("nex-tree-item-selected");
			self.selection[tid] = true;
			self.fireEvent("onSelectNode",[tid,opt]);
			return self;
		},
		isSelected : function(tid){
			return !!this.selection[tid];	
		},
		getSelectedNodes : function(){
			var list = [];
			for( tid in this.selection ) {
				if( this.selection[tid] ) {
					list.push( this.getNode(tid) );
				}
			}	
			return list;
		},
		isLeaf : function( id ){
			var self = this
				,opt=this.configs
				,undef;
			var rootId = self.getRootId();	
			if( id === rootId ) return false;
			var tnode = Nex.isPlainObject(id) ? id : self._getNode(id);
			//如果是根节点 那么是获取不到node的 需要通过_isRoot来判断是否根节点 跟节点一定不是leaf
			if( !tnode && !self._isRoot(id) ) return true;
			if( self._isRoot(id) ) return false;
			if( tnode[ opt.leafField ] === undef ) {
				var tid = tnode[opt.idField];
				var childrens = self.getChildrens(tid);
				if( childrens.length ) {
					return false;	
				}
				return true;	
			} else {
				return !!tnode[ opt.leafField ];	
			}
		},
		getAllChildrens : function(pid) {
			var self = this
				,opt=this.configs
				,undef;
			var childs = [];
			var pid = self._undef(pid, self.getRootId());
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
		*获取节点的子节点
		*/
		getChildrens : function(pid){
			var self = this
				,opt=this.configs
				,undef;

			var pid = pid === undef ? self.getRootId() : pid;
			
			var childs = self._dataChildrens[pid] === undef ? [] : self._dataChildrens[pid];
			
			var list = [];
			for( var i=0, len=childs.length;i<len;i++ ) {
				var child = childs[i];
				list.push( child );	
			}
			return childs.concat([]);//返回一个新数组
		},
		getLevelData : function( level ){
			return this._dataLevels[level] || [];	
		},
		/*删除节点数据  只删除数据*/
		_removeChildrenData : function(tid){
			var self = this
				,opt=this.configs
				,undef;
			
			if( tid === undef ) return false;	
			
			var node = self._getNode( tid );
			if( !node ) return false;
			
			var pid = self.getParentID(tid);
			
			//_dataChildrens
			var list = self.getChildrens(pid);
			Nex.array_splice( function(i, d){
				if( d[opt.idField]+'' === tid+'' ) return true;	
			}, list );
			
			self._updateChildrens(pid, list);
			//_dataLevels
			var lvs = self.getLevelData(node.levelField);
			Nex.array_splice( function(i, d){
				if( d[opt.idField]+'' === tid+'' ) return true;	
			}, lvs );
			
			self.updateLastNodes(pid);
			
			delete self._dataHashMaps[ tid ];
			
			//self._dataChildrens[tid] = [];
			
			return true;
		},
		/*
		*添加节点 适合批量
		*/
		_addChildren : function(tid, data){
			var self = this,
				opt=this.configs,
				undef;	
			var d = !Nex.isArray( data ) ? [data] : data;	
			//var r = self.fireEvent('onBeforeAddChildren',[tid,data,opt]);	
			//if( r === false ) return false;
			self.dataToTree(d, tid);
			
			self.resetNodesOrder(tid);
			
			self.refreshTree(tid);
			//self.fireEvent('onAddChildren',[tid,data,opt]);	
			self.resetNodesOrder(tid);
			return true;
		},
		addChildren : function(tid, data){
			var self = this,
				opt=this.configs,
				undef;	
			var d = !Nex.isArray( data ) ? [data] : data;	
			var r = self.fireEvent('onBeforeAddChildren',[tid,data,opt]);	
			if( r === false ) return false;
			
			self._addChildren(tid, data);
			
			self.fireEvent('onAddChildren',[tid,data,opt]);	
			return true;
		},
		/*删除节点 适合单节点的删除*/
		_removeChildren : function(tid, f){
			var self = this
				,opt=this.configs
				,undef;
			var f = f === undef ? true : f;
			if( tid === undef ) return false;
			
			var pid = self.getParentID(tid);
			if( pid === false ) return false;
			
			var r = self._removeChildrenData( tid );	
			if( !r ) return false;
			
			self.getNodeCt(tid).remove();
			
			if( opt.showTreeLines && f ) {
				//addnode removenode 这里都有效率问题，不应该是全部更新，而应该分好几种情况，有时间再推算下
				/*var childs = self.getAllChildrens( pid );
				for( var i=0;i<childs.length;i++ ) {
					var chlid = childs[i];
					self.refreshTreeItem( chlid[opt.idField] );		
				}*/
				self.refreshTreeAllItem( pid );
				
			}
			//self.fireEvent('onRemoveChildren',[tid,opt]);				
			return true;
		},
		removeChildren : function(tid,f){
			var self = this
				,opt=this.configs
				,undef;
			var f = f === undef ? true : f;
			if( tid === undef ) return false;
			
			var r = self.fireEvent('onBeforeRemoveChildren',[tid,opt]);	
			if( r === false ) return false;
			
			var res = self._removeChildren( tid );	
			
			self.fireEvent('onRemoveChildren',[tid,opt]);		
			return res;
		},
		_addNodeData : function(tid, data, end){
			var self = this
				,opt=this.configs
				,undef;
			var d = !Nex.isArray( data ) ? [data] : data;	
			var end = self._undef( end,true );
			
			var childs = self.getChildrens( tid );
			//数据添加
			self.dataToTree(d,tid);	
			var _childs = [];
			if( end ) {
				_childs = childs.concat( d );
			} else {
				_childs = d.concat( childs );	
			}
			
			self._updateChildrens(tid, _childs);
			
			self.resetNodesOrder(tid);
		},
		/*添加子节点 适合单条数据添加 */
		_addNode : function(tid,data,end,expand){//expand 添加后是否展开 end后面添加
			var self = this
				,opt=this.configs
				,undef;
		
			if( tid === undef ) return false; 
			var node = self._getNode( tid );
			var isRoot = self._isRoot(tid);
			if( !node && !isRoot ) return false;
						
			var expand = self._undef( expand,false );
			var end = self._undef( end,true );
			var d = !$.isArray( data ) ? [data] : data;	
			
			self._addNodeData( tid,d,end );
			
			if( !self.isExpanded(tid) ) {
				if( expand ) {
					self.expandNode( tid );	
				}
				self.refreshTreeItem( tid );		
				return true;	
			} else {
				
				if( isRoot ) {
					node = {};
					node[opt.openField] = true;	
				}
				
				if( !node[ opt.openField ] ) {
					if( expand ) {
						self.expandNode( tid );	
					}
				}	
			}
			
			var lis = [];
			for( var i=0;i<d.length;i++ ) {
				var li = $(self.getNodeHtml( d[i] ));
				lis.push( li );
			}	
			if( !end ) {
				lis.reverse();	
			}
			var ul = self.getNodeChildEl( tid );
			
			for( var j=0;j<lis.length;j++ ) {
				ul[ end?'append':'prepend' ]( lis[j] );
			}
			
			if( opt.showTreeLines ) {
				//addnode removenode 这里都有效率问题，不应该是全部更新，而应该分好几种情况，有时间再推算下
				//var childs = self.getAllChildrens( tid );
				/*for( var i=0;i<childs.length;i++ ) {
					var chlid = childs[i];
					self.refreshTreeItem( chlid[opt.idField] );		
				}*/
				self.refreshTreeAllItem( tid );//chlid
			}
			
			return true;
		},
		/*添加节点 适合单条数据添加 */
		addNode : function(tid,data,end,expand){
			var self = this
				,opt=this.configs
				,undef;	
			if( tid === undef ) return false; 
			var node = self._getNode( tid );
			var isRoot = self._isRoot(tid);
			if( !node && !isRoot ) return false;	
			var r = self.fireEvent('onBeforeAddNode',[tid,data,end,expand,opt]);	
			if( r === false ) return false;	
			
			var res = self._addNode( tid,data,end,expand );
			
			self.fireEvent('onAddNode',[tid,data,end,expand,opt]);	
			return res;
		}, 
		/*删除节点  tid可以是一个数组 适合批量*/
		_removeNode : function(tid){
			var self = this
				,opt=this.configs
				,undef;
			//var r = self.fireEvent('onBeforeRemoveNode',[tid,opt]);	
			//if( r === false ) return false;
			var d = !Nex.isArray( tid ) ? [tid] : tid;	
			var pids = {};
			for( var i=0;i<d.length;i++ ) {
				pids[ self.getParentID( d[i] ) ]=true;
				self._removeChildren( d[i],false );	
			}	
			$.each( pids,function(k,v){
				if( v ) {
					self.refreshTreeAllItem( k );	
				}	
			} );
			//self.fireEvent('onRemoveNode',[tid,opt]);
			return true;
		},
		removeNode : function( tid ){
			var self = this
				,opt=this.configs
				,undef;
			
			var r = self.fireEvent('onBeforeRemoveNode',[tid,opt]);	
			if( r === false ) return false;	
				
			var res = self._removeNode(tid);	
			
			self.fireEvent('onRemoveNode',[tid,opt]);	
			
			return res;
		},
		_afterNodeData : function(tid,data,after){
			var self = this
				,opt=this.configs
				,undef;
			var d = !$.isArray( data ) ? [data] : data;	
			var after = self._undef( after,true );	
			var pid = self.getParentID(tid);
			if( pid === false ) return false;
			
			var childs = self.getChildrens( pid );
			
			//数据添加
			self.dataToTree(d,pid);	
			
			for( var i=0;i<childs.length;i++ ) {
				var child = childs[i];
				if( child[opt.idField]+'' === tid+'' ) break;
			}
			
			Nex.array_insert(i, d, childs, !after);
			
			self._updateChildrens(pid, childs);
			
			self.resetNodesOrder(pid);
		//	console.log( childs );
			//主要是刷新lastNode firstNode
			//self.getDisplayNodes(pid);
		//	console.log(r);
		},
		/*添加节点 适合单条数据添加 */
		_afterNode : function(tid,data,after,expand){//expand 添加后是否展开 after后面添加
			var self = this
				,opt=this.configs
				,undef;
			//$.isPlainObject  _getNode
			if( tid === undef ) return false; 
			var node = self._getNode( tid );
			if( !node ) return false;
			
			var expand = self._undef( expand,false );
			var after = self._undef( after,true );
			var d = !$.isArray( data ) ? [data] : data;	
			
			var pid = self.getParentID(tid);
			if( pid === false ) return false;

			
			self._afterNodeData( tid,d,after );
			
			var isRoot = self._isRoot(pid);
			if( isRoot ) {
				node = {};
				node[opt.openField] = true;	
			}
			
			var ul = self.getNodeChildEl( pid );
			
			if( !ul.size() ) {
				if( expand ) {
					self.expandNode( pid );	
				}
				self.refreshTreeItem( tid );	
				//self.fireEvent('onAfterNode',[tid,data,after,expand,opt]);	
				return true;	
			} else {
				if( !node[ opt.openField ] ) {
					if( expand ) {
						self.expandNode( pid );	
					}
				}	
			}
			if( opt.showTreeLines ) {
				//var childs = self.getAllChildrens( pid );
				//addnode removenode 这里都有效率问题，不应该是全部更新，而应该分好几种情况，有时间再推算下
				/*for( var i=0;i<childs.length;i++ ) {
					var chlid = childs[i];
					self.refreshTreeItem( chlid[opt.idField] );		
				}*/
				self.refreshTreeAllItem( pid );//childs
			}
			var lis = [];
			for( var i=0;i<d.length;i++ ) {
				var li = $(self.getNodeHtml( d[i] ));
				lis.push( li );
			}	
			if( after ) {
				lis.reverse();	
			}
			
			var li = self.getNodeCt(tid);
			
			for( var j=0;j<lis.length;j++ ) {
				li[ after?'after':'before' ]( lis[j] );
			}
			//self.fireEvent('onAfterNode',[tid,data,after,expand,opt]);	
			return true;
		},
		afterNode : function(tid,data,after,expand){
			var self = this
				,opt=this.configs
				,undef;	
			if( tid === undef ) return false; 
			var node = self._getNode( tid );
			if( !node ) return false;
				
			var r = self.fireEvent('onBeforeAfterNode',[tid,data,after,expand,opt]);	
			if( r === false ) return false;
			
			var res = self._afterNode( tid,data,after,expand );	
			
			self.fireEvent('onAfterNode',[tid,data,after,expand,opt]);
			
			return res;
		},
		_moveNode : function(src,dist,pos){//src 需要移动的节点 dist drop节点 pos: 1前 2中 3后
			var self = this
				,opt=this.configs
				,undef;
			var pos = pos || 2;	
			if( src == dist ) return false;	
			var node = self._getNode( src );	
			if( !node ) return false;
			node = $.extend({},node);
			
			delete node[opt.childrenField];
			
			self._removeChildren( src );//false
			if( pos == 2 ) {
				self._addNode( dist,node,true );	
			} else if( pos == 1 ) {
				self._afterNode( dist,node,false );
			} else {
				self._afterNode( dist,node,true );	
			}
			self.refreshTreeItem( dist );		
			
			return true;
		},
		moveNode : function(src,dist,pos){//src 需要移动的节点 dist drop节点 pos: 1前 2中 3后
			var self = this
				,opt=this.configs
				,undef;
			var r = self.fireEvent('onBeforeMoveNode',[src,dist,pos,opt]);	
			if( r === false ) return false;
			var res = self._moveNode( src,dist,pos || 2 );
			self.fireEvent('onMoveNode',[src,dist,pos || 2,opt]);
			return res;
		},
		_getParentsList : function(tid){
			var self = this
				,opt=this.configs
				,root=opt.root
				,pids = [];
			var node = $.isPlainObject(tid) ? tid : self._getNode(tid);	
			if( !node ) return [];
			var maps = self.getDataMaps();
			var id = node[opt.idField];
			var pid = self.getParentID(id);
			while( 1 ) {
				if( !(pid in maps) ) break;
				pids.push( pid );	
				pid = self.getParentID(pid);
				if( pid === opt.root ) break;
			}
			return pids.reverse();
		},
		isFirstNode : function(tid, pid){
			var self = this
				,opt=this.configs;
			var pid = Nex.unDefined(pid, self.getParentID(tid));
			
			var first = self._firstNodes[ pid ] || {};
				
			return first[opt.idField]+'' === tid+'' ? true : false;
		},
		isLastNode : function(tid, pid){
			var self = this
				,opt=this.configs;
			var pid = Nex.unDefined(pid, self.getParentID(tid));
			
			var last = self._lastNodes[ pid ] || {};
			
			return last[opt.idField]+'' === tid+'' ? true : false;
		},
		/*
		* 获取节点的占位符
		*/
		getNodeSpacers : function(tnode){
			var self = this
				,opt=this.configs
				,pids = [];
			var node = $.isPlainObject(tnode) ? tnode : self._getNode(tnode);
			if( !node ) return [];
			//console.log(node);
			var n = node;
			var cpid = node[opt.idField];
			//pids.push(cpid);
			pids = self._getParentsList( cpid );
			//console.log(pids);
			var spacer = [];
		
			for( var i=0;i<pids.length;i++ ) {
				//是否最后一个节点
				var pid = pids[i];
				if( self._isRoot(pid) ) continue;
				if( self.isLastNode(pid) ) {
					spacer.push('nex-tree-empty');	
				} else {
					spacer.push(opt.showTreeLines ? 'nex-tree-line' : 'nex-tree-empty');
				}
			}	
			if( opt.showExpanderIcon ) {
				if( self.isLeaf(cpid) ) {
					var d = self.getDataMaps();
					var j=0;
					for( var x in d ) {
						j++;
						if( j>=2 ) break;
					}
					if(j>1) {
						if( self.isLastNode(cpid) ) {
							spacer.push(opt.showTreeLines ? 'nex-tree-elbow-end':'nex-tree-empty');
						} else {
							spacer.push(opt.showTreeLines ? 'nex-tree-elbow':'nex-tree-empty');
						}
					} else {
						spacer.push('nex-tree-empty');//如果树形只有一条记录 可以显示nex-tree-empty nex-tree-elbow-end		 
					}
				} else {
					if( self.isLastNode(cpid) ) {
						spacer.push(opt.showTreeLines ? 'nex-tree-expander-icon nex-tree-expander-end':'nex-tree-expander-icon nex-tree-expander-nl');
					} else {
						spacer.push(opt.showTreeLines ? 'nex-tree-expander-icon nex-tree-expander' : 'nex-tree-expander-icon nex-tree-expander-nl');
					}
				}
			}
			self.fireEvent('onGetSpacers',[ cpid,spacer ]);
			return spacer;
		},
		/*
		* 获取节点的容器
		*/
		getNodeCt : function( tid ){
			var self = this
				,opt=this.configs;	
			var tid = Nex.unDefined( tid, self.getRootId() );	
			return self._isRoot(tid) ? $("#"+opt.id+'_'+tid+'_child') : $("#"+opt.id+'_'+tid);
		},
		/*
		* 获取节点元素
		*/
		getNodeEl : function( tid ){
			var self = this
				,opt=this.configs;	
			var tid = Nex.unDefined( tid, self.getRootId() );	
			return $("#"+opt.id+'_'+tid+'_wraper');
		},
		getNodeTextEl : function( tid ){
			return $( '>.nex-tree-text', this.getNodeEl(tid) );
		},
		getNodeChildEl : function( tid ){
			var self = this
				,opt=this.configs;	
			var tid = Nex.unDefined( tid, self.getRootId() );	
			return $("#"+opt.id+'_'+tid+'_child');	
		},
		/*
		* 创建一个占位符 标签 eg: <span class="nex-tree-indent nex-tree-icon nex-tree-leaf"></span>
		*/
		createSpacer : function( cls, style ){
			var style = style ? 'style="'+style+'"' : '';
			return ['<span class="nex-tree-indent ', cls ,'" ', style ,'></span>'].join('');
		},
		/*
		* 获取节点Html 如果参数inner=true 则只获取里面的内部html
		*/
		getNodeHtml : function(tnode, inner){
			var self = this
				,opt=this.configs
				,inner = Nex.unDefined( inner, false )
				,spacers = [];
			var node = $.isPlainObject(tnode) ? tnode : self._getNode(tnode);
			if( !node ) return '';
			
			var tid = node[opt.idField];
			var rootId = self.getRootId();
				
			var spacers = self.getNodeSpacers(node);
			var treeID = [opt.id,'_',node[opt.idField]].join("");
			
			//var _pid = self.getParentID(tid);
			if( !inner ) {
				var liCls='';
				if( self.isFirstNode( tid ) ) {
					liCls = 'nex-tree-first';	
					if( self.isFirstNode( tid, rootId ) ) {
						liCls+=' nex-tree-first-all';
					}
				}
				if( self.isLastNode( tid ) ) {
					liCls = 'nex-tree-last';	
				}
				liCls = [ liCls ];
				
				self.fireEvent('onGetNodeCls',[ tid,liCls ]);
			}
			self.fireEvent('onGetNodeSpacers',[ tid,spacers ]);
			if( !inner ) {
				if( self.isSelected(tid) ) {
					liCls.push('nex-tree-item-selected');
				}
			}
			var _s = [];
			if( !inner ) {
				_s.push(['<li id="',treeID,'" class="nex-tree-item" treeid="',tid,'"><div id="',treeID,'_wraper" treeid="',tid,'" class="nex-tree-item-wraper ',liCls.join(' '),'">'].join(""));
			}
			for( var i=0,len=spacers.length;i<len;i++ ) {
				_s.push( self.createSpacer( spacers[i] ) );	
			}
			
			if( opt.showTreeIcon ) {
				var icon = node[opt.iconClsField];
				var bg = '';
				if( node[opt.iconField] ) {
					bg = 'background-image:url('+node[opt.iconField]+');';
				}
				var icons = ['nex-tree-icon'];
				if( self.isLeaf( tid ) ) {
					icons.push( 'nex-tree-leaf' );
					if( icon !== undefined )
						icons.push( icon );
				} else {
					icons.push( 'nex-tree-parent' );
					if( icon !== undefined )
						icons.push( icon );
				}
				_s.push( self.createSpacer( icons.join(' '), bg ) );	
			}
			
			self.fireEvent('onCreateNodeSpacers',[ tid, _s ]);
			
			_s.push(['<span class="nex-tree-text">',node[opt.textField],'</span>'].join(''));
			if( !inner ) {
				_s.push('</div></li>');
				self.fireEvent('onCreateNode',[ tid, _s ]);
			}
			return _s.join('');
		},
		refreshTreeItem : function(tid){
			var self = this, undef;	
			
			if( tid === undef || self._isRoot(tid) ) {
				return self;	
			}
			
			var node = self.getNodeEl( tid );
			if( node.length ) {
				node.html( self.getNodeHtml( tid, true ) );	
			
				if( self.isLeaf(tid) ) {
					self.getNodeChildEl(tid).remove();	
				}
			}	
			return self;
		},
		refreshTreeAllItem : function(pid){
			var self = this
				,opt=this.configs
				,undef;
					
			var childs = Nex.isArray( pid ) ? pid : self.getAllDisplayNodes(pid, false);
			
			self.refreshTreeItem( pid );	
			
			for( var i=0;i<childs.length;i++ ) {
				var node = childs[i];
				self.refreshTreeItem( node[opt.idField] );		
			}		
		},
		_isRoot : function(tid){
			return (tid+'' === this.getRootId()+'') ? true : false;
		},
		/*
		* 获取节点下需要显示的子节点，和getChildrens不同在于 会经过排序,分类,设置好first last node和自定义等处理
		* @group 默认true 对节点进行分类 如果设置false则不分类 主要用在刷新时
		*/
		getDisplayNodes : function(tid, group){
			var self = this
				,opt=this.configs;	
				
			var tid = self._undef(tid, self.getRootId());	
			var group = self._undef(group, true);	
			var sortable = opt.sortable;	
			var pid = self.getParentID( tid );
			var childrens = self.getChildrens(tid);//self._undef(opt._childrens[ tid ],[]);
			if( sortable ) {
				var sr = self.fireEvent('onBeforeSortTreeData',[ tid,childrens,opt ]);
				if( sr !== false ) {
					childrens = self._sortItems( childrens );	
					self.fireEvent('onSortTreeData',[ tid,childrens,opt ]);
				}
			}
			if( group ) {
				childrens = self._groupNodes( childrens );
			}
			self._updateChildrens(tid, childrens);
			
			self.fireEvent('onGetDisplayNodes',[ tid,childrens,opt ]);
			
			self._updateLastNodes(tid, childrens);
			
			return childrens;
		},
		refreshDisplayNodes : function(tid){
			return this.getDisplayNodes.apply(this, arguments);	
		},
		getAllDisplayNodes : function(pid, group){
			var self = this;
			var opt = this.configs;
			var list = [],childs=[];
			list = self.getDisplayNodes.apply(self, arguments);	
			for( var i=0, len = list.length; i<len; i++ ) {
				var node = list[i];
				var id = node[opt.idField];
				if( !self.isLeaf( id ) ) {
					childs = childs.concat(self.getAllDisplayNodes(id, group));	
				}	
			}
			return list.concat(childs);
		},
		/*
		*创建Tree但不显示
		*/
		_bulidTree : function(tid){
			var self = this
				,opt=this.configs;	
			var tid = self._undef(tid,opt.root);
			if( self.isLeaf( tid ) ) {
				return false;	
			}
			var bd = self.getBody();
			var isRoot = self._isRoot(tid);
			var treeID = [opt.id,'_',tid,'_child'].join("");
			var tree = $("#"+treeID);
			
			var r = self.fireEvent('onBeforeBulidTree',[ tree,tid,opt ]);
			if( r === false ) return false;
			
			var createTree = function(){
				var childrens = self.getDisplayNodes(tid);
				var tree = ['<ul id="',treeID,'">'];
				var nodesHtml = [];
				self.fireEvent('onGetTreeNodesStart',[ tid, nodesHtml, opt ]);
				for( var i=0, len=childrens.length;i<len;i++ ) {
					nodesHtml.push( self.getNodeHtml(childrens[i]) );
				}
				self.fireEvent('onGetTreeNodes',[ tid, nodesHtml, opt ]);
				tree.push( nodesHtml.join('') );
				tree.push('</ul>');
				tree = $(tree.join(""));
				tree.hide();
				var render = isRoot ? bd : $("#"+opt.id+'_'+tid);
				render.append(tree);	
				//tree.slideDown();	
				return tree;
			};
			//防止重复创建
			if( !tree.length ) {
				tree = createTree();
				//self.bindTreeEvent(tree);
				self.fireEvent('onBulidTree',[ tid, tree,opt ]);
			}
			
			return tree;
		},
		showLeafLoading : function(tid){
			var self = this,
				opt = self.configs;	
			if( self._isRoot( tid ) ) {
				self.showLoading();	
			} else {
				$("#"+opt.id+'_'+tid+'_wraper').addClass('nex-tree-loading');
			}
		},
		hideLeafLoading : function(tid){
			var self = this,
				opt = self.configs;	
			if( self._isRoot( tid ) ) {
				self.hideLoading();	
			} else {
				$("#"+opt.id+'_'+tid+'_wraper').removeClass('nex-tree-loading');
			}	
		},
		isExpandNode : function(tid){
			var self = this
				,opt=this.configs
				,undef;
			if( tid === undef ) return false;
			
			if( self._isRoot(tid) ) return true;
			
			var node = self._getNode(tid);
			if( node === false ) return false ;
			return !!node[ opt.openField ];
		},
		toggleNode : function(tid){
			var self = this
				,opt=this.configs
				,undef;
			
			var node = self._getNode(tid);
			if( !node ) return self;
			
			if( self.isExpanded(tid) ) {
				self.collapseNode(tid);
			} else {
				self.expandNode(tid);	
			}
			return self;
		},
		//解析服务器数据到本地
		parseAsyncData : function(data){
			var self = this
				,opt = self.configs;	
			self.dataToTree( Nex.isArray( data ) ? data : [ data ] );	
			return self;
		},
		/*
		*加载数据
		*/
		_loadTreeData : function( tid, s, f, c ){
			var self = this
				,opt=this.configs;
			var d = {};
			d[ opt.idField ] = tid;	
			self.loadAsyncData( d, function( data ){
				self.parseAsyncData( data );
				if( Nex.isFunction( s ) ) {
					s( data );	
				}	
			}, f, c );	
			return self;
		},
		isExpanded : function( tid ){
			var self = this
				,opt=this.configs;
			//检测是否已经展开
			var nc = self.getNodeChildEl( tid );
			if( nc.length && (self.getNode( tid, opt.openField ) || self._isRoot(tid)) ) {
				return true;	
			}	
			return false;
		},
		isCollapsed: function( tid ){
			var self = this
				,opt=this.configs;
			//检测是否已经展开
			var nc = self.getNodeChildEl( tid );
			if( !nc.length || (!self.getNode( tid, opt.openField ) && !self._isRoot(tid)) ) {
				return true;	
			}
			return false;	
		},
		_expandNode : function(tid, cb, anim){
			var self = this
				,opt=this.configs
				,undef
				,pids = [];	
			
			var anim = Nex.unDefined( anim, opt.animate );	
			if( tid === undef ) return false;
			
			var node = self._getNode(tid);
			if( !node && !self._isRoot(tid) ) return false ;
			
			pids = self._getParentsList( tid );
			
			for( var i=0;i<pids.length;i++ ) {
				var _tid = pids[i];
				var _node = self._getNode(_tid);
				//if( self._isRoot( _tid ) ) continue;
				if( _node ) _node[opt.openField] = true;
				
				if( self.getNodeChildEl(_tid).length ) {
					continue;	
				}
				
				var tree = self._bulidTree(_tid);
				if( !tree ) continue;
				tree.show();
				$("#"+opt.id+'_'+_tid+'_wraper').addClass("nex-tree-open");
			}
			
			if( opt.singleExpand ) {
				var childs = self.getChildrens( self.getParentID(tid) );
				$.each(childs, function(i, node){
					var cid = node[opt.idField];
					if( tid == cid ) return;
					//console.log( !self.isLeaf(cid) && node[opt.openField] );
					if( !self.isLeaf(cid) && node[opt.openField] ) {
						self.collapseNode(cid);	
					}
				});	
			}
			
			var tree = self._bulidTree(tid);
			if( !tree ) return false;
			var el = self.getNodeEl(tid);
			
			if( node ) {
				node[opt.openField] = true;
			}
			
			function c(){
				self.fireEvent('onExpandNode',[tid,opt]);
				if( cb && Nex.isFunction(cb) ) {
					cb();	
				}
			}
			el.addClass("nex-tree-open");	
			if( anim && $('>.nex-tree-item', tree).length ) {
				tree.stop(true,true).slideDown(opt.animateTime, function(){
					c();
				});	
			} else {
				tree.show();	
				c();
			}
			return true;
		},
		expandNode : function(tid, cb, anim){
			var self = this
				,opt=this.configs
				,undef;	
			var tid = self._undef(tid, self.getRootId());		
			
			//如果tid是 root 则不需要任何检查 直接展开
			if( !self._isRoot(tid) ) {
				if( self.isLeaf(tid) ) {
					return self;	
				}
				
				if( self.isExpanded( tid ) ) {
					return self;	
				}
				
				var r = self.fireEvent('onBeforeExpandNode',[tid,opt]);
				if( r === false ) return self;
			}
			
			if( self.isEmptyData(tid) && opt.url ) {
				self.showLeafLoading( tid );
				self._loadTreeData(tid,function(){
					self.hideLeafLoading( tid );
					self._expandNode(tid, cb, anim);	
					var childrens = self.getAllChildrens(tid);
					for( var i=0;i<childrens.length;i++ ) {
						if( childrens[i][opt.openField] )
							self.expandNode(childrens[i][opt.idField], null, anim);	
					}	
					/*if( Nex.isFunction( cb ) ) {
						cb();	
					}*/				   
				});
			} else {
				self._expandNode(tid, cb, anim);
				
				/*if( Nex.isFunction( cb ) ) {
					cb();	
				}*/
				//removeOnCollapse
				//BUG 待定
				/*setTimeout(function(){
					var childs = self.getChildrens( tid );
					$.each( childs,function(i,node){ 
						if( node[opt.openField] ) {
							self.expandNode( node[opt.idField] );
						}
					 } );
				},0); */
			}
		},
		_collapseNode : function(tid, cb, anim){
			var self = this
				,opt=this.configs
				,undef;	
			var anim = Nex.unDefined( anim, opt.animate );		
			if( tid === undef ) return false;
			var node = self._getNode(tid);
			if( node === false || self._isRoot(tid) ) return false;
			
			var isRoot = self._isRoot(tid);
			if( isRoot ) return false;
			//var treeID = [opt.id,'_',tid,'_child'].join("");
			var el = self.getNodeEl(tid);
			var tree = self.getNodeChildEl(tid);
			
			node[opt.openField] = false;	
			
			function c(){
				self.fireEvent('onCollapseNode',[tid, opt]);
				if( opt.removeOnCollapse ) {
					tree.remove();	
				}
				if( cb && Nex.isFunction( cb ) ) {
					cb();	
				}	
			}
			
			el.removeClass("nex-tree-open");	
			
			if( anim ) {
				if( tree.size() ) {
					tree.stop(true,true).slideUp(opt.animateTime,function(){//.stop(true,true)
						c();									
					});
				}
			} else {
				tree.hide();
				c();
			}
			
			return true;
		},
		collapseNode : function(tid){
			var self = this,opt=this.configs;
			var tid = self._undef(tid,opt.root);
			
			if( self.isCollapsed( tid ) ) {
				return self;	
			}
				
			var r = self.fireEvent('onBeforeCollapseNode',[tid,opt]);
			if( r === false ) return self;
			self._collapseNode(tid);
		},
		expandLevel : function( level ){
			var self = this,
				opt=this.configs;
			/*
			 这里可能还需要做写处理 如果一级目录下有空节点 直接展开三级 那么这一级是不会展开的。。。
			*/	
				
			var levels = self.getLevelData( level );
			$.each( levels, function(i, node){
				var id = node[ opt.idField ];
				if( !self.isLeaf( id ) ) {
					self.expandNode(id);	
				}	
			} );
			return self;
		},
		collapseLevel : function( level ){
			var self = this,
				opt=this.configs;
			var levels = self.getLevelData( level );
			$.each( levels, function(i, node){
				var id = node[ opt.idField ];
				if( !self.isLeaf( id ) ) {
					self.collapseNode(id);	
				}	
			} );
			return self;
		},
		/*
		*打开当前节点的子节点
		*/
		expandChildrens : function(pid){
			var self = this,
				opt=this.configs;
			var pid = self._undef(pid,opt.root);	
			var childs = self.getChildrens(pid);
		
			for(var i=0;i<childs.length;i++) {
				if( self.isLeaf( childs[i] ) ) continue;
				//console.log(childs[i]);
				self.expandNode( childs[i][opt.idField] );	
			}
		},
		/*
		*打开当前节点下的所有子节点
		*/
		expandAll : function(pid){
			var self = this,
				opt=this.configs;	
			var pid = self._undef(pid,opt.root);
			var isRoot = self._isRoot(pid);
			//开启Url情况下 在 获取新值后自动展开
			/*if( opt.url ) {
				self.unbind("onLoadSuccess.expandAll");
				self.bind("onLoadSuccess.expandAll",function(tid,data){
					setTimeout(function(){
						self.expandAll(tid);					
					},0);
				});
			}*/
		//	var allChilds = self.getAllChildrens(pid);
			self.expandNode(pid, function(){
				var allChilds = self.getAllChildrens(pid);	
				for( var i=0;i<allChilds.length;i++ ) {
					var tid = allChilds[i][opt.idField];
					var isLeaf = self.isLeaf(tid);
					if( !isLeaf ) {
						self.expandAll(tid);
					}	
				}
			});
			//for( var i=0;i<allChilds.length;i++ ) {
//				var tid = allChilds[i][opt.idField];
//				var isLeaf = self.isLeaf(tid);
//				if( !isLeaf ) {
//					self.expandNode(tid);
//				}	
//			}
			/*for(var tid in opt._data) {
				
				if( !isLeaf && isRoot ) {
					self.expandNode(tid);
				} else if( !isLeaf ) {
					var pids = self._getParentsList(tid);
					if( self.inArray(pid,pids) !== -1 ) {
						self.expandNode(tid);	
					}
				}
			}*/
			
		},
		collapseChildrens : function(pid){
			var self = this,
				opt=this.configs;
			var pid = self._undef(pid,opt.root);	
			var childs = self.getChildrens(pid);
		
			for(var i=0;i<childs.length;i++) {
				if( self.isLeaf( childs[i] ) ) continue;
				//console.log(childs[i]);
				self.collapseNode( childs[i][opt.idField] );	
			}
		},
		collapseAll : function(pid){
			var self = this,
				opt=this.configs;	
			var pid = self._undef(pid,opt.root);
			
			var allChilds = self.getAllChildrens(pid);
			self.collapseNode(pid);
			for( var i=0;i<allChilds.length;i++ ) {
				var tid = allChilds[i][opt.idField];
				var isLeaf = self.isLeaf(tid);
				if( !isLeaf ) {
					self.collapseNode(tid);
				}	
			}
		
			/*for(var tid in opt._data) {
				var isLeaf = self.isLeaf(tid);
				if( !isLeaf && isRoot ) {
					self.collapseNode(tid);
				} else if( !isLeaf ) {
					var pids = self._getParentsList(tid);
					if( self.inArray(pid,pids) !== -1 ) {
						self.collapseNode(tid);	
					}
				}
			}	*/
		},
		/*
		* 检测是否一个目录节点为空 一般拿来检测是否需要动态加载数据
		*/
		isEmptyData : function(pid){
			var self = this,
				opt=this.configs,
				undef;
			var pid = self._undef(pid,opt.root);
			
			var childs = self.getChildrens(pid);
			
			return childs.length ? false : true;
		},
		
		/*
		* 刷新某节点 整个节点都会重新创建
		*/
		refreshTree : function(pid){
			var self = this,
				opt=this.configs;	
			var rootId = self.getRootId();
			var pid = self._undef(pid, rootId);
			//var bd = self.getBody();
			//var r = self.fireEvent('onBeforeRefreshTree',[pid,opt]);
//			if( r === false ) return self;
			var isRoot = self._isRoot(pid);
			if( isRoot ) {
				self.getNodeCt(pid).remove();
				self.expandNode(pid, null, false);
			} else {
				var node = self._getNode(pid);
				if( !node ) return self;
				
				var tree = self.getNodeCt(pid);
				self.getNodeChildEl(pid).remove();
				
				self.refreshTreeItem(pid);
				
				if( node[opt.openField] ) {
					self.expandNode(pid, null, false);	
				}
			}
			var allChilds = self.getAllChildrens(pid);
			for( var i=0;i<allChilds.length;i++ ) {
				if( allChilds[i][opt.openField] ) {
					self.expandNode(allChilds[i][opt.idField], null, false);	
				}	
			}
			//self.fireEvent('onRefreshTree',[pid,opt]);
			return self;
		}
	});
	
	return tree;
});	