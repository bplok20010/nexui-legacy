var s;
$(function(){
	
	function cx(){
		this.a=1;
		this.b=1;	
	}
		
require(['Nex/container/Container'], function(Component){
			s = function(){
			//console.time('a')
			
			
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
					el.fadeIn(200, cb);	
				},
				hideFn : function( el, cb ){
					el.fadeOut(200, cb);
				},
				//loaderTarget : document.body,
				width : function(){
					return $(window).width() * .5;	
				},
				height : function(){
					console.log($(window).height());
					return $(window).height() * .5;	
				},
				//padding : 20,
				//maxWidth : 500,
				//maxHeight : 190,
				/*minWidth : function(){
					return $(window).width();	
				},*/
				minWidth : '100% - 150',
				style : {
					border : '1px solid red',
					padding : null	
				},
				html : '<div style="width : 200%; height : 200%; background : #f2f2f2; border:1px solid green; ">adf</div>',
				":onFocus" : function(){
					console.log( 'onFocus' )	
				},
				":onBlur" : function(){
					console.log( 'onBlur' )	
				},
				groupBy : 'a',
				//renderTpl : '<div><%=id%></div>',
				onResizea : function(){
					console.log('cc')	
				},
				items : {
					xtype : 'container',
					html : 'cc',
					":onFocus" : function(){
						console.log( 'onFocus2' )	
					},
					":onBlur" : function(){
						console.log( 'onBlur2' )	
					}
				}
			});
			
			//main.initVirtualScrollBar()
			
			//console.timeEnd('a')
			
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