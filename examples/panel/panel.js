var s;
$(function(){
	
	function cx(){
		this.a=1;
		this.b=1;	
	}
		
require(['Nex/panel/Panel', 'Nex/form/Text'], function(Component, Text){
			s = function(){
			console.time('a')
			
			console.log($.support.boxSizing)
			
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
				padding : 5,
				animCollapse :　false,
				//maxWidth : 500,
				//maxHeight : 190,
				title : 'abc',
				iconCls : 'ab',
				closable : true,
				collapsible : true,
				bodyPadding : '0 9px 0 0',
				hideFn : function(el, cb){
					console.log(cb);
					el.fadeOut(1000, function(){
						cb && cb();	
					});
				},
					
				icon : 'http://127.0.0.1/ext-5.1.0/build/examples/writer/images/grid.png',
				/*minWidth : function(){
					return $(window).width();	
				},*/
				
				autoScroll : true,
				
				style : {
					//padding : 10	
				},
				
				tbar : [Text.create()],
				bbarPadding : 5,
				bbarStyle : {
					border : '1px solid red'	
				},
				bbarCls : 'bbar',
				bbar : {
					xtype : 'container',
					html : 'ddd'	
				},
				lbar : 'Hello World',
				rbar : 'Hello World',
				
				footerItems : '<div style="height : 40px;">FOOTER</div>',
				
				tools : [{
					icon : 'http://127.0.0.1/ext-5.1.0/build/examples/writer/images/grid.png',
					tips : 'css',
					callBack : function(){
						console.log(arguments)	
					}	
				},'b',
				{
					icon : 'http://127.0.0.1/ext-5.1.0/build/examples/writer/images/grid.png',
					tips : 'css',
					disabled : true,
					tips : '无权限',
					callBack : function(){
						console.log(arguments)	
					}	
				}],
				
				toolTipsTag : 'jtips',
				
				//overflowX : 'hidden',
				
				html : 'adf',
				groupBy : 'a',
				//renderTpl : '<div><%=id%></div>',
				onResizea : function(){
					console.log('cc')	
				},
				
				items : [
					/*{
						title : 'inner panel',
						html : '<div style="min-width: 200px; padding : 5px;">inner panle content .......</div>'	
					},*/
					Text.create({
						width : function(el){
							return 200
						},
						labelText : 'ddddd'	
					}),
					Text.create({
						width : '100%',
						labelText : 'ddddd'	
					}),
					Text.create({
						width : '100%',
						labelText : 'ddddd'	
					}),
					Text.create({
						width : '100%',
						labelText : 'ddddd'	
					}),
					Text.create({
						width : '100%',
						labelText : 'ddddd'	
					}),
					Text.create({
						width : '100%',
						labelText : 'ddddd'	
					}),
					Text.create({
						width : '100%',
						labelText : 'ddddd'	
					}),
					Text.create({
						width : '100%',
						labelText : 'ddddd'	
					}),
					Text.create({
						width : '100%',
						labelText : 'ddddd'	
					}),
					Text.create({
						width : '100%',
						labelText : 'ddddd'	
					}),
					Text.create({
						width : '100%',
						labelText : 'ddddd'	
					})
				]
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