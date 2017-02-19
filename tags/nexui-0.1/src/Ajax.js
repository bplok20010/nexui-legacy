/**
 * Nex.Ajax
 * @class
 * @name Nex.Ajax
 * @module Nex/Ajax
 * @extends Nex.AbstractComponent
 * @see http://www.nexui.cn
 * @author: nobo(505931977@qq.com)
 */
/**
 * 使用的是jquery.ajax提交 更多参数可以参考jquery,只列出特殊参数
 * @typedef configs
 * @property {string|function(data, success, fail, opts)} url 可以自定义获取函数
 * @property {string} [sendType=ajax] 定义请求方式,可选值:ajax,form,file(可扩展)
 * @property {boolean} [responseXML=false] 只有当sendType=form|file才有效,因为form和file都是使用iframe方式提交 
 * 											如果为true 服务端发回格式为:
 *											<pre>			
 *										    <?xml version="1.0" encoding="UTF-8"?>"
 *										    <root><![CDATA[..Response Text..]]></root> 
 *										 	</pre>
 * @property {number|string} [docRoot=body] 只有当sendType=form|file且responseXML=false才有效
 *											  examples:
 *											    <pre>
 *											 	 docRoot = 'textarea';
 *											 	 <textarea>
 *											 		<strong>Hello Nex!</strong>
 *											 	 </textarea>
 *											    </pre>
 * @property {jqselector} injectFields  sendType=form|file时有效，在提交表单把injectFields的元素移到表单内一起提交到服务器
 * @property {jqselector} fileFields sendType=file时有效，在提交表单把fileFields的元素移到表单内一起提交到服务器
 */ 
/**
 * @event onAjaxReady
 * @augments opts
 * @desc 在参数准备好时触发
 * @example on('onAjaxReady')
 */ 
/**
 * @event onBeforeSend
 * @augments opts
 * @desc 在发送请求前触发 返回false可阻止事件并终止发送
 */ 
/**
 * @event onAjaxStart
 * @augments opts
 * @desc onBeforeSend的区别是：1.不能终止发送 2.触发会比onBeforeSend晚
 */
/**
 * @event onAjaxStop
 * @augments opts
 * @desc 同onComplete 触发更早
 */
/**
 * @event onSuccessHook
 * @augments data
 * @augments statusText
 * @desc 此事件和onSuccess的区别在于 如果返回的是false 则可以阻止onSuccess事件的触发 而且data也是尚未经过dataFilter处理的 但是经过$.ajax原生的dataFilter处理
 */
/**
 * @event onSuccess
 * @augments data
 * @augments statusText
 * @desc 请求成功后触发
 */   
/**
 * @event onError
 * @augments xhr
 * @augments statusText
 * @augments throw
 * @desc 请求失败
 */  
/**
 * @event onComplete
 * @augments xhr
 * @augments textStatus
 * @desc 请求完成触发
 */ 
/**
 * @event onAbort
 * @desc 取消请求后触发
 */  
define(function(require){
	
	require('Nex/AbstractComponent');
	
	var utilsSubmit = require('Nex/utils/SubmitForm');
	
	var ajax = Nex.define('Nex.Ajax',{
		extend : 'Nex.AbstractComponent',
		xtype : 'ajax',
		/**
		 * @member
		 * @name configs
		 * 配置参数
		 */
		configs : function(opt){
			return {
				prefix : 'nexajax-',
				autoDestroy : false,
				//sendType 可选值 ajax(默认) form file
				sendType : 'ajax',//ajax默认 form 定义发送类型 默认使用$.ajax发送数据
				/*
				* @ignore
				* sendType=form
				* responseXML=true服务器返回的是xml,格式eg:
				*   @header("Content-type: application/xml; charset=$_SC[charset]");
				*	<?xml version="1.0" encoding="UTF-8"?>";
				*	<root><![CDATA[<strong>Hello Nex!</strong>]]></root>;
				*/
				responseXML : false,
				/*
				* @ignore
				* sendType=form
				* responseXML=false
				* 数据的根节点 eg:
				*	docRoot=textarea
				*	<textarea>
				*		<strong>Hello Nex!</strong>
				*	</textarea>
				*/
				docRoot : 'body',
				/*
				* @ignore
				* sendType=form
				* injectFields = $('.myform input') or '.myform input'
				* 在提交表单之前把injectFields的元素移到表单内一起提交到服务器,最后还原
				*/
				injectFields : '',
				fileFields : '',
				//contentType : 'application/x-www-form-urlencoded',//application/x-www-form-urlencoded默认 multipart/form-data text/plain ...
				ajax : null,
				_data : {},
				data : {},
				_qdata : {},
				dataFilter : null,
				events : {}
			};		
		}
	});
	/**
     * Get请求
	 * @function
	 * @static
	 * @name get
	 * @param {string|function} url	
	 * @param {object} data 可选
	 * @param {function} callback 可选
	 * @param {string} dataType 可选
	 * @return {ajax}
	 */
	/**
     * Post请求
	 * @function
	 * @name post
	 * @static
	 * @param {string|function} url	
	 * @param {object} data 可选
	 * @param {function} callback 可选
	 * @param {string} dataType 可选
	 * @return {ajax}
	 */ 
	$.each( [ "get", "post" ], function( i, method ) {
		ajax[ method ] = function( url, data, callback, type ) {
			if ( $.isFunction( data ) ) {
				type = type || callback;
				callback = data;
				data = undefined;
			}
	
			return this.create({
				type: method,
				url: url,
				data: data,
				success: callback,
				dataType: type
			});
		};
	});
	ajax.addStatics({
		/**
		 * 同$.when
		 * @static
		 */
		when : function(){
			return Nex.when.apply(Nex,arguments);	
		},
		/**
		 * 请求一个脚本
		 * @static
		 * @param url
		 * @param callback
		 */
		getScript : function( url, callback ) {
			return this.get( url, null, callback, "script" );
		},
		/**
		 * 请求一个脚本
		 * @static
		 * @param url
		 * @param data
		 * @param callback
		 */
		getJSON : function( url, data, callback ) {
			return this.get( url, data, callback, "json" );
		},
		/**
		* 创建一个请求 同 return new Nex.Ajax(d)
		*/
		request : function( d ){
			return this.create( d );	
		}
	});
	ajax.override({
		initComponent : function() {
			var self = this,undef;
			var opt = this.configs;
			self._super(arguments);
			opt._beforeSend = opt.beforeSend || null;
			opt._error = opt.error || null;
			opt._success = opt.success || null;
			opt._abort = opt.abort || null;
			opt._complete = opt.complete || null;
			
			if( $.isPlainObject(opt.data) ) {
				opt.data = $.extend( {},opt._data,opt.data,opt._qdata );
			} else if( typeof opt.data === 'string' && typeof opt._qdata === 'string' ) {
				opt.data = opt.data.length ? '&'+opt._qdata : opt._qdata;
			}
			
			var firstUpperCase = function(string){
				return (string+"").replace( /(^|\s+)\w/g, function(s){
					return s.toUpperCase();	
				} );	
			};
			var Deferred = self.getDeferred();
			/*opt.abort = function(){
				var argvs = [];
				for( var i=0;i<arguments.length;i++ ) {
					argvs.push( arguments[i] );	
				}
				argvs.push( this );
				var r = self.fireEvent('onAbort',argvs);	
				if( r === false ) return r;	
				if( $.isFunction( opt._abort ) ) {
					return opt._abort.apply( self,argvs );
				}
			}*/
			opt.beforeSend = function(){
				self.doBeforeSend.apply(self, arguments);	
			};
			opt.success = function(){
				self.doSuccess.apply(self, arguments);	
			};
			opt.error = function(){
				self.doError.apply(self, arguments);	
			};
			opt.complete = function(){
				self.doComplete.apply(self, arguments);		
			};
			
			self.fireEvent('onAjaxReady',[ opt ]);	
			
			opt.sendType = (opt.sendType + "").toLowerCase();
			
			//检测url是否是用户自定义函数
			if( $.isFunction( opt.url ) ) {
				opt.ajax = $.Deferred ? $.Deferred() : opt.url;	
				var success = function( data ){
					var status =  Nex.unDefined(status,'success');
					var xhr =  Nex.unDefined(xhr, null);
					opt.success.apply( self,[ data, 'success', null ] );
					opt.complete.call( self, xhr, status );
				}; 
				var error = function( statusText, error ){//statusText
					var status =  Nex.unDefined(statusText,'error');
					var error =  Nex.unDefined(error,null);
					opt.error.apply( self,[ null, status, error ] );
					opt.complete.call( self, null, status );
				};
				var rf = opt.beforeSend.call( self,null,opt );
				if( rf !== false ) {
					var _opt = $.extend( {dataFilter:null},opt );
					delete _opt.beforeSend; 
					delete _opt.dataFilter;
					delete _opt.success; 
					delete _opt.error; 
					delete _opt.complete; 
					setTimeout( function(){
						var xhr = {
							abort : function(){
								error(this, 'canceled' , null);	
							}	
						};
						opt.ajax = xhr;
						var undef,d = opt.url.apply( self,[_opt.data,success,error,_opt] );	 
						if( d !== undef ) {
							if( d===false ) {
								error( 'error', null);	
							} else {
								success( d, 'success');		
							}
						}
					},0 );
				}
			} else {
				var _opt = $.extend( {},opt );
				//_opt.sendType = null;
				delete _opt.sendType; 
				_opt.beforeSend = function(xhr){
					return opt.beforeSend.call( self,xhr,opt );	
				};
				_opt.dataFilter = null;
				delete _opt.dataFilter;
				
				var xhr = {
					abort : function( TS ){
						_opt.error(this, 'canceled' , null);	
						_opt.complete(this, TS , null);	
					}	
				};
				
				function parseAjax(ajax){
					var ajax = ajax && typeof ajax === 'object' ? ajax : xhr;
					return Nex.applyIf( ajax,xhr );	
				}
				
				var _method = Nex.isFunction(opt.sendType) ? opt.sendType : self[opt.sendType+'Send'];
				if( Nex.isFunction(opt.sendType) ) {
					setTimeout(function(){
						opt.ajax = parseAjax( _method.call(self,_opt) );	
					},0);
				} else {
					opt.ajax = parseAjax( (_method||self.sendAjax).call(self,_opt) );	
				}
			}
			
		},
		doBeforeSend : function(){
			var self =  this;
			var opt = this.configs;
			
			var argvs = [];
			for( var i=0;i<arguments.length;i++ ) {
				argvs.push( arguments[i] );	
			}
			//argvs.push( this );
			var r = self.fireEvent('onBeforeSend',argvs);	
			if( r === false ) return r;
			var rf;
			if( $.isFunction( opt._beforeSend ) ) {
				rf = opt._beforeSend.apply( self,argvs );
			}
			if( rf === false ) return false;
			self.fireEvent('onAjaxStart',argvs);	
		},
		isSuccess : false,
		//data textStatus
		doSuccess : function(){
			var self =  this;
			var opt = this.configs;
			var Deferred = self.getDeferred();
			//var argvs = [];
			var argvs = [].slice.apply(arguments);
			/*for( var i=0;i<arguments.length;i++ ) {
				argvs.push( arguments[i] );	
			}*/
			
			
			if( self.isSuccess ) {
				return;	
			}
			
			self.isSuccess = true;
			
			argvs[1] = argvs[1] || 'success';
			
			if( self._customAbort === true ) {
				return;
			}
			
			if( self.fireEvent('onSuccessHook',argvs)===false ) {
				return;	
			}
			
			if( $.isFunction( opt.dataFilter ) ) {
				argvs[0] = opt.dataFilter.call( self,argvs[0],opt.dataType || 'html' );	
			}
			
			if( self.isError ) {
				return;	
			}
			
			//argvs.push( this );
			var r = self.fireEvent('onSuccess',argvs);	
			//if( r === false ) return r;	
			if( r!==false && $.isFunction( opt._success ) ) {
				opt._success.apply( self,argvs );
			}
			if( Deferred ) {
				Deferred.resolveWith.apply( Deferred, [ opt.context || self, argvs ] );	
			}
		},
		//当前请求失败
		isError : false,
		//xhr statusText throw
		doError : function(){
			var self =  this;
			var opt = this.configs;
			var Deferred = self.getDeferred();
			var argvs = [].slice.apply(arguments);
			/*for( var i=0;i<arguments.length;i++ ) {
				argvs.push( arguments[i] );	
			}*/
			//argvs.push( this );
			//不可重复执行
			if( self.isError ) {
				return;	
			}
			
			self.isError = true;
			
			if( self._customAbort === true ) {
				return;
			}
			
			if( argvs.length === 1 ) {
				argvs[2] = argvs[0];	
			}
			
			argvs[0] = self.getXHR();
			
			argvs[1] = argvs[1] || 'error';
			
			var statusText = argvs[1];//abort 的状态信息 canceled timeout
			/*if( self._customAbort === true ) {
				opt.abort.apply( this,argvs );
				return;
			}*/
			if( $.inArray( statusText, [ 'timeout', 'canceled' ] ) !== -1 ) {
				var new_argvs = [].concat(argvs);
				new_argvs[1] = statusText;
				if( self.fireEvent('onAbort',new_argvs) !== false ) {
					$.isFunction( opt._abort ) && opt._abort.apply( self,new_argvs );	
				}
			}
			var r = self.fireEvent('onError',argvs);	
			//if( r === false ) return r;
			if( r !== false && $.isFunction( opt._error ) ) {
				opt._error.apply( self,argvs );
			}
			if( Deferred ) {
				Deferred.rejectWith.apply( Deferred, [ opt.context || self, argvs ] );	
			}	
		},
		isComplete : false,
		//xhr textStatus
		doComplete : function(){
			var self =  this;
			var opt = this.configs;
			var argvs = [].slice.apply(arguments);
			/*var argvs = [];
			for( var i=0;i<arguments.length;i++ ) {
				argvs.push( arguments[i] );	
			}*/
			//argvs.push( this );
			if( self.isComplete ) {
				return;	
			}
			
			self.isComplete = true;
			
			if( self._customAbort === true ) {
				return;
			}
			
			argvs[0] = self.getXHR();
			
			argvs[1] = argvs[1] || ( self.isError ?　'error' : 'success' );
			
			self.onAjaxStop.apply(self, argvs);
			self.fireEvent('onAjaxStop',argvs);
			var r = self.fireEvent('onComplete',argvs);	
			if( r !== false && $.isFunction( opt._complete ) ) {
				opt._complete.apply( self,argvs );
			}		
		},
		//设置是否用户自己调用abort来取消请求
		_customAbort : false,//--可以取消当前状态。。。
		/**
		 * 取消当前请求
		 * @paman {function} fn 可选,如果传了回调 则说明是绑定onAbort事件
		 * @return {this}
		 */
		abort : function(fn){
			var self = this;
			var argvs = arguments;
			if( argvs.length && $.isFunction(fn) ) {
				for( var i=0,len = argvs.length;i<len;i++ ) {
					if( $.isFunction( argvs[i] ) ) {
						this.bind('onAbort.deferred',argvs[i]/*,this*/);
					}		
				}
			} else {
				var ajax = self.getAjax();
				if( ajax && ajax.abort ) {
					ajax.abort( fn || 'canceled' );	
				}
				//设置取消状态
				self._customAbort = true;
			}
			return self;
		},
		/*
		*自定义发送接口
		* @ignore
		* opt.sendType = ajax;
		* prototype.sendAjax = Function
		* examples:
		*	sendAjax = function(opt){
		*		var xhr = new Http();
		*		if( opt.beforeSend(xhr) === false ) {
		*			return null;	
		*		}
		*		xhr.send(opt.url,opt.data);	
		*		xhr.success = function(data){
		*			opt.success(data, 'success', xhr );	
		*		};
		*		xhr.error = function(xhr,statueText , errorObject){
		*			opt.error(xhr, msg, errorObject);	
		*		}
		*		//opt.complete 必须要调用。。。
		*		xhr.complete = function(){
		*			opt.complete(xhr, 'success or error');	
		*		}
		*		如果xhr 不会触发abort 我们要自己实现 abort的 eg:
		*		xhr.abort = function( statueText ){//statueText=timeout|canceled
		*			opt.error(xhr, statueText, errorObject);
		*		//	opt.complete(xhr, 'success or error'); //??		
		*		}
		*		setTimeout(function(){
		*			xhr.abort('timeout');
		*		},timeout);
		*		return xhr;
		*	}	  
		*/
		//通过ajax方式提交
		ajaxSend : function(options){
			return $.ajax( options );	
		},
		//application/x-www-form-urlencoded multipart/form-data text/plain
		formEnctypeReg : /^\s*(application\/x-www-form-urlencoded|multipart\/form-data|text\/plain)/i,
		getFormEnctype : function(type){
			var matches = this.formEnctypeReg.exec( type+"" );
			return matches ? matches[1] : 'application/x-www-form-urlencoded';
		},
		//通过动态创建表单方式提交
		formSend : function(opt){
			var self = this;
			var _opt = this.configs;
			var timeoutTimer = 0;
			var opt = $.extend({ timeout:0 },$.ajaxSettings,opt);
			var fid = _opt.id+'_submitform';
			var method = (opt.type+"").toLowerCase();
			method = Nex.inArray( method, ['get','post'] ) === -1 ? 'post' : method;
			console.log(self.getFormEnctype(opt.contentType));
			var tpl = [
				'<div class="nex-hidden" style="width:0px;height:0px;overflow:hidden;">',
					'<form id="',fid,'" autocomplete="off" novalidate="novalidate" method="',method,'" action="',$.trim(opt.url),'" enctype="',self.getFormEnctype(opt.contentType),'"></form>',
				'</div>'
			];
			var fwrap = $(tpl.join(''));
			$(document.body).append( fwrap );
			var form = document.getElementById(fid);	
			//触发beforeSend
			if( opt.beforeSend(form) === false ) {
				fwrap.remove();
				return null;	
			}
			//解析URL地址取得search字符串
			var parseUrl = Nex.parseUrl(opt.url);
			var queryString = [];
			if( parseUrl.search ) {
				queryString.push( parseUrl.search );
			}
			//param数据
			if( Nex.isObject(opt.data) ) {
				var query = $.param(opt.data,!!opt.traditional);
				if( query ) {
					queryString.push( query );
				}
			} else if( opt.data && !Nex.isEmpty(opt.data) ) {
				queryString.push( opt.data );	
			}
			//生成Input
			var inputs = [];
			if( queryString.length ) {
				$.each( (queryString.join('&')).split('&'), function(i, str){
					var str = str.split('=');
					if( !str.length ) return;
					
					inputs.push(['<input type="hidden" autocomplete="off" name="',decodeURIComponent(str[0]),'" value="',decodeURIComponent(Nex.unDefined(str[1],'')),'">'].join(''));
				} );
			}
			var $form = $(form);
			if( inputs.length ) {
				$form .append( $(inputs.join('')) );	
			}
			//injectFields
			var $restoreFields = null;
			if( opt.injectFields ) {
				$restoreFields = $(opt.injectFields);
				$restoreFields.each( function(){
					var field = $(this);
					var cfield = field.clone();	//removeData
					field.data('_$restore',cfield);
					field.after( cfield );
					$form.append( field );
				} );	
			}
			function restoreFields(){
				if( $restoreFields ) {
					$restoreFields.each( function(){
						var field = $(this);
						var cfield = field.data('_$restore');	//removeData
						field.removeData('_$restore');
						cfield.after( field );
						cfield.remove();
					} );		
				}
			}
			//表单提交
			//var utilsSubmit = Nex.getUtil('SubmitForm');
			
			var xhr;
			xhr = utilsSubmit.submit(form, function( data ){
				if( timeoutTimer ) {
					clearTimeout(timeoutTimer);	
				}
				
				var response = self.ajaxConvert( data, opt.dataType || 'html' );
				
				if( response.state === 'parsererror' ) {
					opt.error( xhr, 'parsererror', response.error );	
				} else {
					opt.success( response.data, 'success', xhr );		
				}
				
				opt.complete( xhr, response.state );
				
				restoreFields();
				
			}, _opt.responseXML, _opt.docRoot );
			//abort
			form.abort = function( TS ){
				if( timeoutTimer ) {
					clearTimeout(timeoutTimer);	
				}
				xhr.abort();	
				opt.error( xhr, TS, null );
				opt.complete( xhr, TS );
			}
			//timeout
			if( opt.timeout>0 ) {
				timeoutTimer = setTimeout(function(){
					timeoutTimer = 0;
					form.abort('timeout');
				}, opt.timeout);	
			}
			return form;
		},
		/*
		* @ignore
		* 上传文件
		* eg fileFields = ".file"
		*/
		fileSend : function( opt ){
			var self = this;
			if( opt.fileFields ) {
				opt.injectFields = $( opt.injectFields ).add( $(opt.fileFields) );
			}
			opt.type = "post";
			opt.contentType = "multipart/form-data";
			return self.formSend(opt);	
		},
		getAjax : function(){
			return this.C('ajax');	
		},
		getXHR : function(){
			return this.C('ajax');	
		},
		//用于Nex.when
		/*getDeferred : function(){
			return this.configs.deferred;	
		},*/
		getConverters : function(){
			var converters = $.ajaxSettings.converters;
			var conv = {
				'*' : converters['* text'],
				'text' : converters['* text'],
				'html' : function(res){return res;},
				'json' : converters['text json'],
				'xml' : converters['text xml'],
				'script' : converters['text script']
			};
			return conv;	
		},
		ajaxConvert : function(s, dataType){
			var conv = this.getConverters();
			var dataType = (dataType+"").toLowerCase();
			var response;
			dataType = conv[dataType] ? dataType : '*';
			try {
				response = conv[dataType]( s );
			} catch ( e ) {
				return { state: "parsererror", error: e };
			}
			return { state: "success", data: response };
		},
		/*sysEvents : function(){
			var self = this;
			var opt = self.configs;
			self._super(arguments);
			self.bind("onComplete",self._removeAjax,self);
			return self;
		},*/
		onAjaxStop : function(){
			this.destroy();	
		},
		done : function(func){
			var defered = this.getDeferred();
			var argvs = arguments;
			for( var i=0,len = argvs.length;i<len;i++ ) {
				if( $.isFunction( argvs[i] ) ) {
					if( defered.state() === 'pending' ) {
						this.bind('onSuccess.deferred',argvs[i]/*,this*/);
					} else {
						defered.done(argvs[i]);		
					}
				}		
			}
			return this;	
		},
		success : function(){
			this.done.apply(this,arguments);	
			return this;	
		},
		fail : function(){	
			var defered = this.getDeferred();
			var argvs = arguments;
			for( var i=0,len = argvs.length;i<len;i++ ) {
				if( $.isFunction( argvs[i] ) ) {
					if( defered.state() === 'pending' ) {
						this.bind('onError.deferred',argvs[i]/*,this*/);
					} else {
						defered.fail(argvs[i]);	
					}
				}		
			}
			return this;	
		},
		error : function(){
			this.fail.apply(this,arguments);	
			return this;	
		},
		then : function(s,f,p){	
			var defered = this.getDeferred();
			if( $.isFunction( s ) ) {
				if( defered.state() === 'pending' ) {
					this.bind('onSuccess.deferred',s);
				} else {
					defered.done( s );	
				}
			}	
			if( $.isFunction( f ) ) {
				if( defered.state() === 'pending' ) {
					this.bind('onError.deferred',f);
				} else {
					defered.fail( s );		
				}
			}		
			return this;	
		},
		always : function(){
			var defered = this.getDeferred();
			var argvs = arguments;
			for( var i=0,len = argvs.length;i<len;i++ ) {
				if( $.isFunction( argvs[i] ) ) {
					if( defered.state() === 'pending' ) {//pending
						this.bind('onComplete.deferred',argvs[i]/*,this*/);
					} else {
						defered.always(argvs[i]);	
					}
				}		
			}
			return this;
		},
		complete : function(){
			return this.always.apply(this,arguments);	
		}
	});
	
	return ajax;
});