var s;
$(function(){
	
require(['Nex/Component'], function(Component){
	var g = Component.create({
			html : '----------------'
		})
	Component.create({
		renderTo :　document.body,
		html : 'Hello Nex',
		tabIndex : 11,
		items : g,
		style : {
			border : '1px solid red'	
		},
		height : '50% - 50',
		width : '50% - 50'
	});
	
});
		
});		