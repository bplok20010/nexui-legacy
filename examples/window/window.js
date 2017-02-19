var s;
$(function(){
		
require(['Nex/window/Window', 'Nex/form/Text'], function(Window, Text){
	WIN = Window.create({
		renderTo : window,
		//dragHandle : null,
		title :　'window - test',
		width : '50%',
		//maxHeight : '50%',
		//height : '50%',
		maximized : true,
		maximizable : true,
		//collapsed : true,
		alwaysOnTop : true,
		modal : true,
		fixed : true,
		icon: '//127.0.0.1/nexui/themes/default/window/images/w_expand.png',
		collapsible : true,
		//virtualScroll : false,
		showFn : function(el, cb){
			console.log('adf')
			var pos = {
				left : parseInt(el.css('left')),
				top : parseInt(el.css('top'))	
			}
			el.show()
			  .css({
				 opacity : 0,
				 top : pos.top - 20  
			  })
			  .animate({
				opacity : 1,
				top : pos.top  
			  },400, cb);
			//el.fadeIn(400, cb);	
		},
		hideFn : function(el, cb){
			el.fadeOut(400, cb)	
		},
		showAt : {
		//	my : 'left bottom',
		//	at : 'right bottom'
		},
		padding : 10,
		autoScroll : true,
		border : '5px solid #000',
		bodyPadding : '5px 12px 5px 5px',
		html : 'Window bodyWindow bodyWindow bodyWindow bodyWindow bodyWindow bodyWindow bodyWindow bodyWindow bodyWindow bodyWindow bodyWindow bodyWindow bodyWindow bodyWindow bodyWindow body',
		items : [
			Text.create({
				width : '100%',
				labelText : 'Test....',
				onClick : function(){
					Window.create({
						renderTo : WIN.getBody(),
						isFixed : false,
						html : 'Hello WIndow',
						padding : 5,
						modal : true,
						modalStyle : {
							backgroundColor : 'red',
							opacity : .4	
						},
						showAt : {
							at : 'center top',
							my : 'center bottom',
							within : WIN.getBody()	
						}
					})	
				}
			}),
			Text.create({
				width : '100%',
				labelText : 'Test....',
				onClick : function(){
					Window.create({
						title : 'Alert',
						html : 'Hello WIndow',
						padding : 5,
						//modal : true,
						modalStyle : {
							backgroundColor : 'red',
							opacity : .4	
						},
						showAt : {
							at : 'center top',
							my : 'center bottom'
						}
					})	
				}	
			}),
			Text.create({
				width : '100%',
				labelText : 'Test....'	
			}),
			Text.create({
				width : '100%',
				labelText : 'Test....'	
			}),
			Text.create({
				width : '100%',
				labelText : 'Test....'	
			}),
			Text.create({
				width : '100%',
				labelText : 'Test....'	
			})
		]
	});
});

});		