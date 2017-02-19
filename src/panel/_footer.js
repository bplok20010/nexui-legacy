define(function(require){
	var Nex = require('../Nex');
	
	function config(opt){
		return {
			footerCls : '',
			footerItems : null
		};
	};
	
	var PanelFooter = {
		config : config,
		getFooter : function(){
			return this.views['footer'];	
		},
		renderedFooter : false,
		setFooter : function(){
			var self = this,undef;
			var opt = this;	
			var container = self.el;
			
			if( this.renderedFooter ) return self;
			
			if( !opt.footerItems ) return self;
			
			var footerItems = opt.footerItems;
			
			var footer = $('<div class="nex-panel-footer '+opt.footerCls+'" id="'+opt.id+'_footer"></div>');
			self.views['footer'] = footer;
			self._vviews['footer'] = footer;
			container.append(footer);	
			
			this.renderedFooter = true;
			
			self.addComponent( footerItems, null, footer, true  );
			
			self.onFooterCreate(footer);
			
			self.fireEvent("onFooterCreate",footer);
			
			return self;
		},
		onFooterCreate : function(){}
	};
	
	return PanelFooter;
});