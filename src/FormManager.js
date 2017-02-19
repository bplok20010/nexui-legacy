define(function(require){
	
	var Nex = require('./Nex');
	var CmpManager = require('./ComponentManager');

	var FormManager = Nex.define('Nex.form.Manager', {
		config : function(opt){
			return {
				fieldList : {}
			};
		},
		fieldList : {},
		
		getDom : function(id){
			return document.getElementById(id);	
		},
		
		isExists : function(id){
			if( !this.getDom(id) ) {
				return false;
			}	
			return true;
		},
		
		set : function(cmp){
			this.fieldList[ Nex.isInstance(cmp) ? cmp.config.id : cmp ] = true;		
		},
		unset: function(){
			var id = Nex.isInstance(cmp) ? cmp.config.id : cmp;
			//this.fieldList[ id ] = false;
			delete this.fieldList[ id ];	
		},
		/*
		*根据name , group 获取输入框对象
		*@param {string} 输入框name
		*@param {string} 输入框分组
		*@return {array}
		*/
		get : function(name, group){
			var self = this,
				opt = this.config,
				undef;
			if( name === undef ) return [];
			
			var group = Nex.unDefined( group , 'default' );
			
			var ls = [];
			
			var list = this.fieldList;
			for( var id in list ) {
				var cmp = CmpManager.get(id);
				//var fields = list[ group ];
				if( !cmp ) {
					delete list[id];
					continue;	
				}
				var _opt = cmp.config;
				var _name = _opt.name;
				var _group = String( _opt.group ).split(/\s+|,/);
				if( String( _name ) === String( name ) && $.inArray( String( group ), _group ) !== -1 ) {
					ls.push(cmp);		
				}
			}
			return ls;//ls.length == 1 ? ls[0] : ls
		},
		
		remove : function(cmp){
			var opt = this.config;
			this.fieldList[ Nex.isInstance(cmp) ? cmp.config.id : cmp ] = null;
			delete this.fieldList[ Nex.isInstance(cmp) ? cmp.config.id : cmp ];		
		},
		/*
		*用法同get只是find只会取第一个并返回
		*/
		"find" : function(){
			var re = [];
			re = this.get.apply( this,arguments );	
			return re.length ? re[0] : null;
		},
		/*
		*@m 如果为true则多个数据不转换字符串
		*/
		getVal : function(name,group,m){
			var self = this;
			if( $.type( group ) !== 'string' || group === '' ) {
				group = 'default';	
			}
			var obj = self.get( name, group );
			var val = [];
			var m = Nex.unDefined( m,false );
			if( Nex.isArray(obj) ) {
				Nex.each(obj, function(cmp, i){
					var _val = cmp.val();
					if( _val !== '' ) {
						val.push( _val );	
					}
				});
				var _v = {};
				var _s = false;
				Nex.each( val,function(value, i){
					if( $._isPlainObject( value ) ) {
						_s = true;
						$.each( value,function(k,v){
							_v[k] = _v[k] || [];
							_v[k].push( v );					   
						} );	
					} else {
						_v[name] = _v[name] || [];
						_v[name].push( value );
					}			 
				} );
				if( !_s ) {
					_v[name] = _v[name] || [];
					val = !m ? _v[name].join(',') : _v[name];		
				} else {
					val = _v;	
					if( Nex.isPlainObject( val ) ) {
						Nex.each( val,function(d, x){
							d = d || [];
							d[x] = !m ? d.join(',') : d;	
						} );
					}
				}
				return val;	
			}
			return {};
		},
		getValue : function(){
			return this.getVal.apply( this,arguments );	
		},
		setVal : function(value,name,group){
			var self = this;
			var obj = self.get(value, name);
			var val = [];
			if( Nex.isArray(obj) ) {
				Nex.each(obj,function(f, i){
					if( $.isArray( value ) ) {
						this.val(Nex.unDefined(value[i],''));	
					} else {
						this.val(value);
					}
				});
				return true;
			}
			return null;
		},
		setValue : function(){
			return this.setValue.apply( this,arguments );		
		},
		/*
		*@param {string} 分组 默认default
		*@param {boolean} 默认 false 不获取disabled的输入框 如果为true则获取
		*@param {boolean} 默认 false 返回组件 否则返回name
		*/
		getGroup : function(group,m,t){
			var self = this,opt=this.config;
			var group = Nex.unDefined( group , 'default' );	
			var m = Nex.unDefined( m , false );	
			var t = Nex.unDefined( t , false );	
			var list = this.fieldList;
			var inputs = [];
			var names = {};
			var _fields = [];
			for( var id in list ) {
				var cmp = Nex.getCmp(id);
				if( !cmp ) {
					delete list[id];
					continue;	
				}
				var _opt = cmp.config;
				var _name = _opt.name;
				var isDisabled = _opt.disabled;
				if( !m && isDisabled ) {
					continue;	
				}
				var _group = String( _opt.group ).split(/\s+|,/);
				if( $.inArray( String( group ), _group ) === -1 ) {
					continue;
				}
				_fields.push( cmp );
				if( !t ) {
					inputs.push( cmp );	
				} else {
					if( !names[ _name ] ) {
						inputs.push( _name );
					}
				}
				names[ _name ] = true;
			}
			
			inputs.call =function(){
				var argvs = [].slice.apply(arguments);
				if( !argvs.length ) return self;
				var method = argvs[0];
				argvs.splice(0,1);
				$.each( _fields,function(i,o){
					if( o[method] && $.isFunction( o[method] ) ) {
						o[method].apply( o,argvs );	
					}
				} );
				return self;	
			};
			return 	inputs;

		},
		getGroupName : function(group,m){
			return this.getGroup.apply( this,[ group,m,true ] );	
		},
		//获取某分组下的所有值
		/*
		*@m 是否获取disabled 字段 默认不获取 false
		*@t 如果为true如果多个数据不转换字符串
		*/
		getGroupVal : function(group,m,t){
			var self = this;
			var group = Nex.unDefined( group , 'default' );	
			var m = Nex.unDefined( m , false );	
			var groupNames = self.getGroupName(group,m);
			var data = {};
			$.each(groupNames,function(i,name){
				var value = self.getVal( name,group,t );
				if( $._isPlainObject( value ) ) {
					$.extend( data,value );	
				} else {
					data[ name ] = value;	
				}
			});
			return data;
		},
		getGroupValue : function(){
			return this.getGroupVal.apply( this,arguments );	
		},
		setGroupVal : function(data,group){
			var self = this;
			var data = data || {};
			if( $.isPlainObject( data ) && !$.isEmptyObject(data) ) {
				$.each( data,function(name,value){
					self.setVal( value,name,group );	
				} );	
			}
			return self;
		},
		setGroupValue : function(){
			return this.setGroupVal.apply( this,arguments );		
		},
		//验证是否通过，并返回错误的字段name
		/*
		*m 是否验证disabled 字段 默认不验证 false
		*/
		checkGroup : function(group,m) {
			var self = this;
			var group = Nex.unDefined( group , 'default' );	
			var m = Nex.unDefined( m , false );	
			var list = self.getGroup( group,m );
			var errorList = [];
			var r;
			for( var i=0;i<list.length;i++ ) {
				var field = list[i];
				r = field.checkVal();
				if( r === false ) {
					errorList.push(field.C('name'));	
				}
			}
			return errorList.length ? errorList : true;
		},
		//验证某分组是否通过
		/*
		*m 是否验证disabled 字段 默认不验证 false
		*/
		valid : function(group,m){
			var self = this;
			var r = self.checkGroup(group,m);
			return r === true ? true : false;
		},
		//验证某一元素
		checkField : function( name,group ){
			var self = this;
			var obj = self.get.apply( self,arguments );
			obj = $.isArray( obj ) ? obj : [obj];
			var re = true;
			$.each(obj,function(i,input){
				if( !input.checkVal() ) {
					re = false;
				}
			});
			return re;
		},
		resetGroup : function( group,m ){
			var self = this;
			var group = Nex.unDefined( group , 'default' );	
			var m = Nex.unDefined( m , false );	
			var list = self.getGroup( group,m );
			for( var i=0;i<list.length;i++ ) {
				var field = list[i];
				field.reset();
			}
			return self;	
		},
		"reset" : function(){
			return this.resetGroup.apply(this,arguments);	
		}
	});	
	
	return FormManager;
});	