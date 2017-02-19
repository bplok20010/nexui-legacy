
$(function(){
	
trees = [
	
	{text:'node3',id:3,leaf:false},
	{text:'node4',id:4},
	{text:'node52',id:5,order:-2},
	{text:'node6',id:6},
	{text:'node7',id:7,icon:'cc'},
	{text:'node8',id:8},
	{text:'node2',id:2,children:[{text:'node2',id:9}]},
	
	{text:'node56',id:1,children : [
		{text:'node2',id:10,open:true,children:[{text:'node2',id:13},{text:'node2',open:true,id:25,children:[{text:'node2',id:49}]},{text:'node2',id:12}]}
	]}
];
		
require(['Nex/tree/Tree', 'Nex/form/Text'], function(Tree, Text){
			main = Tree.create({
				id : 'rot',
				renderTo : document.body,
				data : trees,
				width : '300',
				height : '100%',
			});
			
		});
});		