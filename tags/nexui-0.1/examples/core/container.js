var s;
$(function(){
	
	function cx(){
		this.a=1;
		this.b=1;	
	}
		
require(['Nex/container/Container'], function(Component){
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
				onFocusIn : function(){
					console.log('onFocusIn')	
				},
				onFocusOut : function(){
					console.log('onFocusOut')	
				},
				onScroll : function(){
					console.log('onScroll')	
				},
				onScrollTopStart : function(){
					console.log('onScrollTopStart')	
				},
				onScrollTopEnd : function(){
					console.log('onScrollTopEnd')	
				},
				onShow : function(){
					console.log('onShow')	
				},
				onHide : function(){
					console.log('onHide')	
				},
				showFn : function( el, cb ){
					el.fadeIn(200,cb)	
				},
				hideFn : function( el, cb ){
					el.fadeOut(200,cb)	
				},
				loaderTarget : document.body,
				width : '50%',
				height : '60%',
				padding : 20,
				//maxWidth : 500,
				//maxHeight : 190,
				minWidth : function(){
					return $(window).width();	
				},
				style : {
					border : '1px solid red',
					padding : 10	
				},
				html : 'adf',
				groupBy : 'a',
				//renderTpl : '<div><%=id%></div>',
				onResizea : function(){
					console.log('cc')	
				},
				items : [
					Component.creator( { 
						html : 'zhou',
						groupBy : 'a b', 
						width : 200,
						height : 60,
						onResizea : function(){ console.log('s') } 
					} ),
					Component.creator( { html : 'nobo',groupBy : 'b', renderAfter : false,onResizea : function(){ console.log('s') } } ),
					new Component({
						 id : 'myt',
						 html : '658',
						 height : '100%',
						 minHeight : 30,
						 style : {
							border : '1px solid red'	 
						},
						 onResizea : function(){ console.log('s') } ,
						 groupBy : 'a b', 
						 onResize : function(){ console.log('resize2') } 
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