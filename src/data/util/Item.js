/**
* Item.js
*/
define(function(require){
	var Nex = require('../../Nex');
	
	var itemIndex = 1;
	
	var Item = Nex.Class(null, null, {
		$isItem : true,
		idField : 'id',
		data : null,
		id : null,
		
		getId : function(){
			if( !this.id ) {
				return Nex.uuid() + '-' + itemIndex++;
			}
			return this.id;	
		},
		
		constructor: function( data, opts ){
			var opts = opts || {};
			
			if( opts.idField ) {
				this.idField = opts.idField;	
			}
			
			if( Nex.isObject( data ) ) {
				this.id = Nex.unDefined( data[this.idField], this.getId() );	
			} else {
				this.id = this.getId();	
			}	
			
			this.data = data;
		}
	});	
	
	return Item;
});