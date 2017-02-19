var s;
$(function(){
	
	function cx(){
		this.a=1;
		this.b=1;	
	}
		
require(['Nex/panel/Panel'], function(Component){
			s = function(){
			console.time('a')
			
			
			/*
			var el = $('<div>').attr({
				id : 'abc',
				'_afa_' : 'adf',
				zIndex : 3
			}).css({
				width : '50%'	
			}).appendTo(document.body);
			
			//el.parent().closest('[_nex_instance_]')
			
			*/
			main = Component.create({
				id : 'rot',
				renderTo : document.body,
				width : '50%',
				height : '60%',
				padding : 20,
				//maxWidth : 500,
				//maxHeight : 190,
				title : 'abc',
				iconCls : 'ab',
				closable : true,
				collapsible : true,
				icon : 'http://127.0.0.1/ext-5.1.0/build/examples/writer/images/grid.png',
				minWidth : function(){
					return $(window).width();	
				},
				
				style : {
					padding : 10	
				},
				
				tbar : 'Hello World',
				bbar : 'Hello World',
				lbar : 'Hello World',
				rbar : 'Hello World',
				
				footerItems : '<div style="height : 40px;">FOOTER</div>',
				
				tools : [{
					icon : 'http://127.0.0.1/ext-5.1.0/build/examples/writer/images/grid.png',
					tips : 'css'	
				},'b'],
				
				html : 'adf',
				groupBy : 'a',
				//renderTpl : '<div><%=id%></div>',
				onResizea : function(){
					console.log('cc')	
				}	
			});
			
			console.timeEnd('a')
			
			}
			s();
			return;
			var t = 0;
			x = setInterval(function(){
				s()	;
				if( t >= 12 ) {
					clearInterval(x);	
				}
				t++
			},100)
		});
		
});		