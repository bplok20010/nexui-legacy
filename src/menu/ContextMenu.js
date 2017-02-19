//contextMenu
/*
$.fn.contextMenu( [ delegate ],opts );
1.$(div).contextMenu( opts );
2.$(document).contextMenu( 'tr',opts );
*/
define(function(require){
	require('Nex/menu/Menu');	
	
	$.fn.contextMenu = function( delegate,opts ){
		var args = [];
		if( !this.length ) return this;
		var selector = this.selector;
		if ( typeof delegate === "object" || typeof delegate === "function" ) {
			
			opts = delegate;
			
			if( this.data(selector) ) {
				if( $.isFunction( opts ) ) {
					var c = opts.call( this.data(selector) );	
					if( c ) {
						this.data( selector ).C( c, true );		
					}
				} else {
					this.data( selector ).C( opts );
				}
				return this;	
			}
			
			if( $.isFunction( opts ) ) {
				opts = opts.call() || {};	
			}
			
			opts.autoShow = false;
			
			args.push( opts.which == 1 ? 'click._cmenu' : 'contextmenu._cmenu', function(e){
				menuOpts.context = this;
				menu.show( [ e.pageX, e.pageY ] );
				e.preventDefault();	
				e.stopPropagation();//？ 这里是否必须
			} );
		} else if( delegate && (typeof opts === "object" || typeof opts === "function") ) {
			delegate = String( delegate );
			
			selector += '.'+delegate;
		
			if( this.data(selector) ) {
				if( $.isFunction( opts ) ) {
					var c = opts.call( this.data(selector) );	
					if( c ) {
						this.data( selector ).C( c, true );		
					}
				} else {
					this.data( selector ).C( opts );
				}
				return this;	
			}
			
			opts.autoShow = false;
			args.push( opts.which == 1 ? 'click._cmenu' : 'contextmenu._cmenu', delegate, function(e){
				menuOpts.context = this;
				menu.show( [ e.pageX, e.pageY ] );	
				e.preventDefault();
				e.stopPropagation();//？ 这里是否必须
			});
		}
		
		if( args.length ) {
			var menu = Nex.Create('menu', opts);
			var menuOpts = menu.configs;
			
			this.data( selector, menu );
			
			this.on.apply( this, args );	
			
			if( opts.which == 1 ) {
				menu.bind('@onBindMenuEvents._contextmenu', function( el ){
					$(el).click( function(e){
						e.preventDefault();
						e.stopPropagation();	
					} );	
				});		
			}
		} else {
			if( 'remove' == delegate ) {
				var cmenu = this.data( selector );
				cmenu.destroyMenu();	
				this.off('._cmenu');
				return this;
			}
			if( 'remove' == opts ) {
				var cmenu = this.data( selector+'.'+delegate );
				cmenu.destroyMenu();	
				this.off('._cmenu',delegate);
				return this;
			}
			if( !arguments.length )	{
				return this.data( selector );	
			} else {
				return this.data( selector+'.'+delegate );		
			}
		}
		
		return this;	
	};
	return $;
});