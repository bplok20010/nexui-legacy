define(function(require){
	require('./util/jquery.plugins');
	var Nex = require('./core/Nex');
	
	Nex.extend(Nex, {	
		when : function(){
			var arr = [].slice.apply(arguments);
			var deferreds = [];
			for( var i=0,len=arr.length;i<len;i++ ) {
				var cmp;
				var deferred = arr[i];
				
				if( Nex.isXType( deferred ) || Nex.isString( deferred ) ) {
					deferred = Nex.create( deferred );
				} else if (Nex.isCreator(deferred)){
					deferred = deferred();	
				}
				
				if( deferred ) {
					deferreds.push( deferred );
				}
			}
		
			return $.extend($.when.apply( $, deferreds ),{
				success : function(){
					this.done.apply( this,arguments )	
				},
				error : function(){
					this.fail.apply( this,arguments )	
				},
				complete : function(){
					this.always.apply( this,arguments )	
				}	
			});	
		}
	});
	
	$(function(){
		if( Nex.isIE && Nex.IEVer ) {
			var cls = ['nex-ie'];
			var bd = $('html');
			cls.push( 'nex-ie'+Nex.IEVer );
			if( Nex.IEVer<8 ) {
				cls.push( 'nex-ielt8' );
			}
			if( Nex.IEVer<9 ) {
				cls.push( 'nex-ielt9' );
			}
			bd.addClass( cls.join(' ') );
		}
	});
	
	return Nex;
});