/**
* Store.js
*/
define(function(require){
	var Nex = require('../Nex');
	var Store = require('./Store');
	
	var Item = require('./util/Item');
	
	function isItem(Item){
		return Nex.isInstance(Item) && Item['$isItem'];
	}
	
	var Tree = Nex.define('Nex.data.TreeStore', Store, {
		xtype : 'treestore',
		config : function(){
			return {
				rootId : -1, //根节点ID
				idField : 'id',
				parentField : 'pid',
				childrenField : 'children',
				leafField : 'leaf',
				loadOnce : true		
			};	
		},
		
		normalize : function(data){
			var defaults = {
					//pid : 
				};	
		},
		
		getNodeById : function(){
				
		},
		
		getNode : function(){
				
		},
	});	
	
	return Tree;
});