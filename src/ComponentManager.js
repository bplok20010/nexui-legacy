define(function(require, exports, module){
	var Nex = require('./Nex');
	var EventObject = require('./EventObject');
	
	function triggerfocus(){
		
		var lastFocus = [];
		
		$(document).mousedown(function(e){
			Manager.focusEl( e.target );
		});	
	}
	
	var ManagerClass = Nex.Class(null, EventObject, {
		
		RESIZE_DELAY : 50,
		
		lastFocus : null,
		
		constructor : function(){
			this._super( arguments );	
			this.components = {};
			this.lastFocus = [];
			this.fireEvent('onCreate');
		},
		
		getFocusOrBlurEls: function(el, cancelBubble){
			var focusList = [];
			while(el) {
				if( el === document 
					|| el === document.body 
					|| el === document.documentElement ) {
					break;
				}
				
				var cmpid = el.getAttribute('_nex_instance_');
				
				if( cmpid && Manager.get( cmpid ) ) {
					focusList.push( cmpid );	
					if( cancelBubble ) break;
				}
						
				el = el.parentNode;
			}
			
			return focusList;
		},
		
		focusEl : function( el, cancelBubble ){
			var focusList = this.getFocusOrBlurEls( el, cancelBubble );
			var lastFocus = this.lastFocus;
			//触发onBlur
			Nex.each( lastFocus, function(cmpid, i){
				var cmp = Manager.get(cmpid);
				if( cmp && Nex.inArray( cmpid, focusList ) === -1 ) {	
					cmp.triggerBlur();
				}	
			} );
			//触发onFocus
			Nex.each( focusList, function(cmpid, i){
				var cmp = Manager.get(cmpid);
				if( cmp ) {	
					cmp.triggerFocus();
				}		
			} );	
			
			this.lastFocus = focusList;
		},
		blurEl: function(el, cancelBubble){
			var lastFocus = this.lastFocus;
			var blurList = this.getFocusOrBlurEls( el, cancelBubble );
			//触发onBlur
			Nex.each( blurList, function(cmpid, i){
				var cmp = Manager.get(cmpid);
				if( cmp && Nex.inArray( cmpid, lastFocus ) !== -1 ) {	
					cmp.triggerBlur();
				}		
			} );
		},
		//判断id是否存在 如果不存在则删除
		isExists : function(id){
			var self = this;
			
			var cmp = self.components[id];
			
			if( !cmp ) return false;
			
			if( cmp.$service ) return true;
			
			if( cmp.isExists && typeof cmp.isExists === 'function' ) {
				return cmp.isExists();
			}
				
			return false;
		},
		//释放无效组件
		gc : function(id){
		
			if( id ) {
				var cmp = Nex.get(id);
				if( cmp ) {
					this.isExists(id);
				}	
				var childs = this.getAllChildren( id );
				for( var i=0;i<childs.length;i++ ) {
					var cmp = childs[i];
					this.isExists(cmp.id);	
				}
			} else {
				for( var key in this.components ) {
					this.isExists(key);
				}	
			}
			
			return this;
		},
		/*
		*获取组件 获取所有组件时 每次都会调用_refreshCmps清空无效的组件
		*/
		get : function(id){
			var self = this,undef;
			if( id === undef ) {
				return self.components;
			}
			
			var cmp = self.components[id];
			
			if( !cmp ) {
				return null;	
			}
			
			if( !cmp.autoDestroy ) {
				return cmp;	
			} 
			
			if( cmp.isExists( id ) ) {
				return cmp;	
			}
			
			return null;	
		},
		//获取当前分组名的所有组件
		getGroup : function(name){
			var self = this;
			
			var name = Nex.isEmpty( name ) ? '' : name;
			
			var c = [];
			
			var comps = self.components;
			
			name = Nex.trim(name+'').split(/\s+/g);
			
			for( var id in comps ) {
				var cmp = comps[id];
				
				if( !this.isExists( cmp.id ) ) continue;
				
				var gname = Nex.trim(cmp.groupBy+'').split(/\s+/g);
				for( var i=0; i<gname.length; i++ ) {
					if( Nex.inArray( gname[i], name ) !== -1 ) {
						c.push( cmp );
						break;
					}	
				}
			}
			
			return c;
		},
		add : function( cmp ){
			this.components[cmp.id] = cmp;
			
			return this;
		},
		remove : function(id){
			if( this.components[id] ) {
				this.components[id] = null;
				delete this.components[id];
			}
			
			return this;
		},
		getChildren : function( id ){
			var self = this,undef;
			var list = [];
			var cmps = self.components;
			
			if( id === undef ) {
				id = null;	
			}
						
			if( id !== null && !self.components[id] ) return list;
			
			for( var key in this.components ) {
				var cmp = this.components[key];
				var pid = null;
				
				if( cmp.$parent ) {
					pid = cmp.$parent.id;	
				}
				
				if( !this.isExists( cmp.id ) ) continue;
				
				if( pid === id ) {
					list.push( cmp );	
				}
			}
			
			return list;
		},
		getRoot : function(){
			return this.getChildren();	
		},
		getAllChildren : function( id ){
			var self = this,undef;
			var list = [];
			var _list = self.getChildren( id );
			
			list = list.concat( _list );
			
			for( var i=0,len=_list.length;i<len;i++ ) {
				var cmp = _list[i];
				var _id = cmp.id;
				
				list = list.concat( self.getAllChildren( _id ));	
			}
			
			return list;
		},
		/*
		*更新当前id下 autoResize=true的子组件大小
		*/
		resize : function( pid ){
			var childs = this.getChildren(pid);
			
			for( var i=0;i<childs.length;i++ ) {
				var cmp = childs[i];
				cmp.updateLayout && cmp.updateLayout();
			}
			return this;
		},
		/**
		* 消息派送
		* @params {string} groupBy-消息派送的指定groupBy的组件上
		* @params {string} eventName 发送的消息事件
		* @params {...args}
		* @params {*} sender 发送者 这个参数可以通过 arguments[ arguments.length-1 ] 获得
		*/
		sendMessage : function(groupBy, eventName, args/*...args*/, sender){
			var self = this,undef;
			
			var args = [].slice.apply(arguments);
			
			if( args.length < 2 ) {
				return self;	
			}
			
			var name = args.shift();
		
			var cmps = self.getGroup( name );
			
			for( var i=0;i<cmps.length;i++ ) {
				var cmp = cmps[i];
				cmp.fireEvent.apply(cmp, args);
			}	
				
			return true;	
		},
		postMessage : function(){
			var self = this;
			var args = arguments;
			//Nex.defer(  )
			setTimeout(function(){
				self.sendMessage.apply( self, args );					
			},0);
			
			return true;
		}
	});	
	
	var Manager = new ManagerClass();
	
	triggerfocus();
	
	Nex.setNamespace('Nex.Manager', Manager);
	Nex.setNamespace('Nex.ComponentManager', Manager);
	
	Nex.each( ['gc'
			,'get','getGroup','getChildren','getAllChildren'
			,'sendMessage','postMessage'],function(method, i){
		var returnself = {
			//gc 							: true,
			//sendMessage 				: true,
			//postMessage 				: true
		};
		//Nex.bind(Manager[ method ], Manager)
		Nex[ method ] = function(){
			var tmp = Manager[ method ].apply( Manager, arguments );
			return tmp;//returnself[method] ? this : tmp;
		};
	} );
	
	Nex.getCmp = function(id){
		return Manager.get(id);
	}
	
	var resize = Nex.debounce(function(){
		Manager.resize();	
		Manager.fireEvent('onBrowserResize');	
	}, Manager.RESIZE_DELAY);
	
	if (window.attachEvent) {
		window.attachEvent("onresize", resize);
	} else if (window.addEventListener) {
		window.addEventListener("resize", resize, false);
	}
	
	return Manager;
});