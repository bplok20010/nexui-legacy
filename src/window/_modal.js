/**
*
*/
define(function(require){
	
	function config(){
		return {
			modal : false,
			modalCls : '',
			modalStyle : null,
			showModalFn : null,
			hideModalFn : null,
			modalRenderTo : null
		};	
	}
	
	var WindowModal = {
		config : config,
		
		createModal : function(){
			var self = this;
			var opt = self;	
			
			if( !opt.modal ) return null;
			if( opt.views['modal'] ) return null;
			
			
			var container = self.el;
			
			var modalRenderTo = !opt.modalRenderTo ? opt.renderTo : $(opt.modalRenderTo).length ? opt.modalRenderTo : opt.renderTo;
			
			var cls = ['nex-window-modal'];
			
			if( self.isFixed ) {
				cls.push('nex-window-modal-fixed');	
			}
			
			if( opt.modalCls ) {
				cls.push( opt.modalCls );	
			}
			
			var modal = $('<div class="'+cls.join(' ')+'" id="'+opt.id+'_modal"></div>');	
			opt.views['modal'] = modal;
			//modal.css( 'zIndex',opt.zIndex-1 );
			if( this.modalStyle ) {
				modal.css(this.modalStyle);	
			}

			modal.bind({
				'click._modal' : function(e){
					self.fireEvent('onModalClick',modal,e);
					$(document).trigger('click',e);
					return false;
				},
				'dblclick._modal' : function(e){
					self.fireEvent('onModalDblClick',modal,e);
					$(document).trigger('dblclick',e);
					return false;
				},
				'mousedown._modal' : function(e){
					self.fireEvent('onModalMouseDown',modal,e);
					$(document).trigger('mousedown',e);
					return false;	
				},
				'mouseup._modal' : function(e){
					self.fireEvent('onModalMouseUp',modal,e);
					$(document).trigger('mouseup',e);
					return false;	
				},
				'keydown._modal' : function(e){
					self.fireEvent('onModalKeyDown',modal,e);
					$(document).trigger('keydown',e);
					return false;		
				},
				'keyup._modal' : function(e){
					self.fireEvent('onModalKeyUp',modal,e);
					$(document).trigger('keyup',e);
					return false;		
				},
				'mousewheel._modal' : function(e){
					self.fireEvent('onModalMouseWheel',modal,e);	
				},
				'mouseover._modal' : function(e){
					self.fireEvent('onModalMouseOver',modal,e);
					$(document).trigger('mouseover',e);
					return false;		
				},
				'mouseout._modal' : function(e){
					self.fireEvent('onModalMouseOut',modal,e);
					$(document).trigger('mouseout',e);
					return false;		
				}
			});
			var wraper = self.getModalRenderTo();
			
			if( !self.isFixed ) {
				
				modal.css({
					left : 	wraper.scrollLeft(),
					top : wraper.scrollTop()
				});
				
				wraper.on('scroll.modal'+this.id, function(){
					modal.css({
						left : wraper.scrollLeft(),
						top : wraper.scrollTop()	
					});	
				});
			}
			
			wraper.append(modal);	
			
			self.fireEvent("onModelCreate",modal);
			
			return modal;
		},
		getModalRenderTo : function(){
			var el = this.el;
			var opt = this;
			var wraper = el.parent();
			if( opt.modalRenderTo ) {
				var modalWraper = $( opt.modalRenderTo );
				wraper = modalWraper.length ? modalWraper : wraper;	
			}
			return wraper;
		},
		getModal : function(){
			var opt = this.configs;
			return opt.views['modal'] ? opt.views['modal'] : this.createModal();	
		},
		showModal : function(){
			var self = this;
			var opt = this;
			var modal = this.getModal();
			if( !modal ) return;
			
			function cb(){
				self.fireEvent( 'onModalShow',modal );	
			}
			
			if( this.showModalFn ) {
				this.showModalFn(modal, cb);	
			} else {
				modal.show();
				cb();
			}
			
			return this;
		},
		hideModal : function(){
			var self = this;
			var opt = this;
			var modal = this.getModal();
			
			if( !modal ) return;
			
			function cb(){
				self.fireEvent( 'onModalHide',modal );	
			}
			
			if( this.hideModalFn ) {
				this.hideModalFn(modal, cb);	
			} else {
				modal.hide();
				cb();
			}
			
			return this;
		},
		destroyModal : function(){
			var modal = this.views['modal'];
			
			this.views['modal'] = null;
			
			if( modal ) modal.remove();	
			
			if( !this.isFixed ) {
				wraper.off('.modal'+this.id);
			}
		}
	};
	
	return WindowModal;
});	