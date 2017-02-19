define(function(require){
	var Nex = require('../Nex');
	
	function config(opt){
		return {
			toolbarCls : '',
			
			tbarCls : '',
			bbarCls : '',
			rbarCls : '',
			lbarCls : '',
			
			tbarPadding : null,
			bbarPadding : null,
			lbarPadding : null,
			fbarPadding : null,
			
			tbarStyle : null,
			bbarStyle : null,
			lbarStyle : null,
			fbarStyle : null,
			
			tbar : null,
			bbar : null,
			rbar : null,
			lbar : null
		};
	};
	
	var PanelToolBar = {
		config : config,	
		renderedToolbars : false,
		setToolbars : function(){
			var self = this;
			var opt = self;	
			
			if( this.renderedToolbars ) {
				return self;	
			}
			
			if( self.tbar ) {
				var tbar = Nex.isArray( self.tbar ) ? self.tbar : [self.tbar];
				self._setToolbar(tbar,'tbar');
			}
			if( self.bbar ) {
				var bbar = Nex.isArray( self.bbar ) ? self.bbar : [self.bbar];
				self._setToolbar(bbar,'bbar');
			}
			if( self.lbar ) {
				var lbar = Nex.isArray( self.lbar ) ? self.lbar : [self.lbar];
				self._setToolbar(lbar,'lbar');
			}
			if( self.rbar ) {
				var rbar = Nex.isArray( self.rbar ) ? self.rbar : [self.rbar];
				self._setToolbar(rbar,'rbar');
			}
			
			this.renderedToolbars = true;
			
			self.fireEvent("onToolbarCreate");
			
			return self;	
		},
		_setToolbar : function( items,pos ){
			var self = this;
			var opt = self;	
			var in_pos = ['tbar','bbar','lbar','rbar'];
			var bd = self.views['body'];
			pos = !Nex.contains( in_pos, pos ) ? 'tbar' : pos;
			var tid = opt.id+'_toolbar_'+pos;
			var  tb = $('#'+tid);
			if( !tb.length ) {
				tb = $( '<div class="nex-panel-toolbar nex-panel-toolbar-'+pos+' '+opt.toolbarCls+' '+ self[pos+'Cls'] +'" id="'+tid+'"></div>' );
				if( pos === 'tbar' ) {
					bd.before( tb );	
				} else {
					bd.after( tb );	
				}
				
				self.views[pos] = tb;
				
				if( pos == 'tbar' || pos == 'bbar' ) {
					self._vviews[pos] = tb;
				} else {
					self._hviews[pos] = tb;	
				}
				
				var padding = self[pos+'Padding'];
				if( padding !== null ) {
					tb.css('padding', padding);	
				}
				
				var style = self[pos+'Style'];
				if( style !== null && style ) {
					tb.css(style);	
				}
				
			}
			
			var cmps = self.addComponent( items, null, tb, true );
			
			return tb;
		},
		createToolBar : function(pos, itmes){
			return this._setToolbar( items, pos );	
		},
		getToolBar : function(pos){
			return this.views[pos];	
		}
	};
	
	return PanelToolBar;
});