define(function(require, exports, module){
	
	require('Nex/EventObject');
	
	Nex.apply(Nex, {
		RESIZE_DELAY   : 100
	});
	Nex.Class('Nex.Manager',{
		singleton : true,//单例模式
		extend : 'Nex.EventObject',
		//构造函数
		constructor : function(){
			this._super( arguments );	
			this.components = {};
			this.fireEvent('onCreate');
		},
		//判断id是否存在 如果不存在则删除
		isExists : function(id){
			var self = this;
			
			var cmp = self.components[id];
			
			if( cmp && (cmp.getDom()).length ) {
				return true;	
			}
	
			if( cmp.configs.autoDestroy ) {
				cmp.destroy();	
			}
				
			return false;
		},
		//释放无效组件
		gc : function(id){
			//getAllChildren
			if( id ) {
				var cmp = Nex.get(id);
				if( cmp ) {
					cmp.isExists();	
				}	
				var childs = this.getAllChildren( id );
				for( var i=0;i<childs.length;i++ ) {
					var cmp = childs[i];
					cmp.isExists();	
				}
			} else {
				for( var key in this.components ) {
					var cmp = this.components[key];
					
					cmp.isExists();
					
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
			
			if( !cmp.configs.autoDestroy ) {
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
			
			name = $.trim(name+'').split(/\s+/g);
			
			for( var id in comps ) {
				var cmp = comps[id];
				if( cmp ) {
					var gname = $.trim(cmp.configs.groupBy+'').split(/\s+/g);
					for( var i=0; i<gname.length; i++ ) {
						if( Nex.inArray( gname[i], name ) !== -1 ) {
							c.push( cmp );
							break;
						}	
					}
				}
			}
			
			return c;
		},
		add : function( cmp ){
			this.components[cmp.configs.id] = cmp;
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
					pid = cmp.$parent.configs.id;	
				}
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
				var _id = cmp.configs.id;
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
				cmp._autoResize && cmp._autoResize();
			}
			return this;
		},
		/**
		group, eventName, arg1, agr2,...
		给组件发送消息 一般当作自定义消息来使用
		@ *name 组件的groupName
		@ *evt 发送的消息事件
		@ params 发送的参数 可以是数组
		@ sender 发送者 这个参数可以通过 arguments[ arguments.length-1 ] 获得
		*/
		sendMessage : function(){
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
			setTimeout(function(){
				self.sendMessage.apply( self, args );					
			},0);
			return true;
		}
	});	
	
	$.each( ['gc'
			,'get','getGroup','getChildren','getAllChildren'
			,'sendMessage','postMessage'],function(i,method){
		var m = Nex.Manager;
		var returnself = {
			//gc 							: true,
			//sendMessage 				: true,
			//postMessage 				: true
		};
		Nex[ method ] = function(){
			var tmp = m[ method ].apply( m,arguments );
			return tmp;//returnself[method] ? this : tmp;
		};
	} );
	
	var wt = 0;
	
	function resize(){
		clearTimeout( wt );	
		wt = setTimeout(function(){
			
			wt = 0;
			
			Nex.Manager.resize();
				
		}, Nex.RESIZE_DELAY);			
	}
	
	if (window.attachEvent) {
		window.attachEvent("onresize", resize);
	} else if (window.addEventListener) {
		window.addEventListener("resize", resize, false);
	}
	
});