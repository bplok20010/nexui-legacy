var s;
$(function(){
	
require(['Nex/panel/Panel', 'Nex/form/Text'], function(Component, Text){

			main = Component.create({
				id : 'rot',
				renderTo : document.body,
				width : '50%',
				height : '60%',
				padding : 5,
				animCollapse :　true,
				//maxWidth : 500,
				//maxHeight : 190,
				title : 'abc123',
				iconCls : 'ab',
				closable : true,
				collapsible : true,
				hideFn : function(el, cb){
					console.log(cb);
					el.fadeOut(1000, function(){
						cb && cb();	
					});
				},
					
				icon : 'http://127.0.0.1/ext-5.1.0/build/examples/writer/images/grid.png',
				
				html : {
					xtype : 'container',
					style : {
						border : '1px solid red'	
					},	
					width : '100%',
					height : function(el){
						return el.height()	
					},
					overflow : 'hidden',
					onResize : function(){
						console.log('onResize...', this.id, arguments);
					}
				},
				//groupBy : 'a',
				//renderTpl : '<div><%=id%></div>',
				onResize : function(){
					console.log('cc')	
				},
				
				items : 'cc'
			});
			
		});
		
});		