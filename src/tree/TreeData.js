define(function(require){
	var Nex = require('../Nex');
	var Item = require('../data/util/Item');
		
	function isItem(Item){
		return Nex.isInstance(Item) && Item['$isItem'];
	}
	
	function config(opt){
		
		return {
			rootId : '0',
			idField : 'id'
		};
	};
	
	var TreeData = {
		config : config,
		
		_normalizeNode : function(node){
			node.level  = 0;	
		},
		
		_wrap : function(node){
			return isItem(node) ? node : this._normalizeNode(new Item(node, {
				idField : this.idField	
			}));
		},
		
		_unWrap : function(node){
			return node.data;	
		},
		
		_equal : function(a, b){
			return  a + '' === b + '';	
		},
		
		getRootId : function(){
			return this.rootId;	
		},
		//...
		getRootNode : function(){
			return {
				id : this.getRootId(),
				leaf : false,
				parent : null,
				level : 0
			};	
		},
		
		isRoot : function(id){
			return this._equal( id, this.getRootId() );	
		},
		
		getNode : function(id){
			var node = this._dataHashMaps[ id ];
			return node ? node : null;
		},
		
		getNodeData : function(id){
			var node = this.getNode(id);
			return node ? node.data : node;
		},
		
		/**
		* 把数据解析成有关联的树形数组
		*/
		dataToTree : function(data, pid){
			var self = this,
				opt=this.configs,
				isRoot = !Nex.isDefined( pid ) ? true : this.isRoot(pid)
				pNode;
				
			if( opt.simpleData ) {
				self._parseSimpleData(data || [],pid);
				return self;
			}
			
			if( !isRoot ) {
				pNode = this.getNode(pid);	
			}
			
			
			var childrenField = opt.childrenField;
			for( var i=0,len = data.length;i<len;i++ ) {
				var node = this._wrap(data[i]);
				//设置当前节点的层次  0为第一层 
				node.level = isRoot ? 0 : pNode.level + 1;
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
		
	};
	
	return TreeData; 
});	