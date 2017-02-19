define(function(require){
	
	var Nex = require('./Nex');
	
	var EventObject = require('./EventObject');
	
	var Manager = require('./ComponentManager');
	
	//var utilsSubmit = require('./util/SubmitForm');
	
	var ajax = Nex.Class('Nex.Ajax', EventObject, {
		$service : true,
		/**
		* @private
		*/
		xtype : 'ajax',
		
		/**
		* @config
		*/
		config : function(){
			return {
				denyManager: false,
				groupBy : '',
				id : '',
				/**
				* 当是function 返回的是Promise时 不需要手动调用resolve和reject, 
				* 如果不返回或者返回的不是Promise 那就需要手动调用resolve或reject
				* @type {url|function}
				* - function(params, resolve, reject)
				* - resolve(data)
				* - reject(msg, textStatus)
				* @return Promise
				*/
				url: '',
				/**
				* 设置超时时间
				*/
				timeout: 0,
				/**
				* 数据最终处理
				* @examples:
				* dataType = json
				* success  = function(data){
				*	return data.data;
				* }
				*/
				dataFormatter: null,
				/**
				* @ type {function(resolve, reject)}
				* 在触发success之前再次进行验证 如果这时候验证失败可以调用 hooks
				*/
				resolveProcess: null,
				
				async: true,
				
				sendType: 'ajax', // ajax form file
				
				data: {}
			};
		},
		
		_xhr: null,
		
		constructor : function(){
			this._super( arguments );
			
			this.id = this.getId();
			
			this.onStart();
			
			this.fireEvent("onStart");
			
			if( !this.denyManager ) {
				Manager.add( this );
			}
			
			this.initAjax();
			
		},
		/**
		* @Overview
		*/
		parseInitConfig: function(cfg, cover){
			if( !cfg ) return {};
			
			if( cfg.success && Nex.isFunction(cfg.success) ) {
				this.bind('onSuccess', cfg.success);	
				delete cfg.success;
			}
			
			if( cfg.error && Nex.isFunction(cfg.error) ) {
				this.bind('onError', cfg.error);	
				delete cfg.error;
			}
			
			if( cfg.complete && Nex.isFunction(cfg.complete) ) {
				this.bind('onComplete', cfg.complete);
				delete cfg.complete;	
			}
			
			if( cfg.abort && Nex.isFunction(cfg.abort) ) {
				this.bind('onAbort', cfg.abort);	
				delete cfg.abort;
			}
			
			return this._super([cfg, cover]);
		},
		
		getId : function(){
			if( Nex.isEmpty( this.id ) ) {
				return 'ajax_' + (++Nex.guid);	
			}
			return this.id;	
		},
		
		getAjaxConfig : function(){
			var self =this, cfg = {}, config = this.initialConfig;
			
			Nex.each(config, function(value, key){
				cfg[key] = self[key];	
			});	
			
			return cfg;
		},
		
		initAjax: function(){
			var self = this,
				resolveProcess = this.resolveProcess,
				dataFormatter = this.dataFormatter,
				dfd = $.Deferred();
			
			this.sendType = (this.sendType + "").toLowerCase();
			
			dfd.promise(this);
			
			dfd.done(function(data, ts, xhr){
					var args = [].slice.apply( arguments );
					
					self.fireEvent.apply(self, ['onSuccess'].concat(args));	
					self.off('onSuccess');	
				})
			   .fail(function(msg, ts, xhr){
					var args = [].slice.apply( arguments );
					
					if( Nex.inArray( ts, [ 'timeout', 'canceled', 'abort' ] ) !== -1 ) {
						self.fireEvent.apply(self, ['onAbort'].concat(args));	
						self.off('onAbort');
					}
					
					self.fireEvent.apply(self, ['onError'].concat(args));	
					self.off('onError');   
				})
			   .always(function(){
				   var args = [].slice.apply( arguments );
				   
					self.fireEvent.apply(self, ['onComplete'].concat(args));	
					self.off('onComplete');	
					
					self.destroy();
				});
			
			function reject(msg, ts, xhr){
				
				var args = [].slice.apply( arguments );
				
				dfd.rejectWith( self.context || self, args );
			}
			
			function resolve(data, ts, xhr){
				var args = [].slice.apply( arguments );
				
				if( dataFormatter && Nex.isFunction(dataFormatter) ) {
					args[0] = dataFormatter(args[0]);
				}
				
				dfd.resolveWith( self.context || self, args );	
			}
			
			if( Nex.isFunction(this.url) ) {
				this.sendType = 'custom';	
			}
			
			var method = Nex.isFunction(this.sendType) ? this.sendType : this[this.sendType+'Send'];
			
			if( !method ) {
				throw new Error('error sendType not exists!');
			}
			
			self.onBeforeSend();
			self.fireEvent('onBeforeSend', self.config);
			
			this._xhr = method.call(this, function(data, ts, xhr){
				if( resolveProcess && Nex.isFunction(resolveProcess) ) {
					resolveProcess.call(self, data, function(d){
						resolve(d || data, ts, xhr);	
					}, function(msg, ts){
						reject(msg, ts || 'error', xhr);	
					});
				} else {
					resolve(data, ts, xhr);	
				}
			}, reject);
			
		},
		
		onStart : function(){},
		onBeforeSend: function(){},
		
		customSend: function(resolve, reject){
			var undef,
				timeoutTimer,
				dfd = $.Deferred(),
				xhr = dfd.promise(),
				_resolve = function(data){
					if(timeoutTimer) {
						clearTimeout(timeoutTimer);	
					}
					resolve(data, 'success', xhr);
				},
				_reject = function(msg, ts){
					if(timeoutTimer) {
						clearTimeout(timeoutTimer);	
					}
					reject(msg, ts || 'error', xhr);	
				};
			
			xhr = this.url( this.data, _resolve, _reject, xhr);	
			
			if( xhr === undef || !Nex.isPromiseLike(xhr) ) {
				xhr = dfd.promise();	
			}
			
			xhr.then(_resolve, _reject);
			
			xhr.abort = xhr.abort || function(ts){
				ts = ts || 'abort';//canceled
				_reject(ts, ts);	
			}
			
			if( this.async && this.timeout > 0 ) {
				timeoutTimer = setTimeout(function(){
					xhr.abort('timeout');	
				}, this.timeout);	
			}
			
			return xhr;
		},
		
		/**
		* ajax请求
		*/
		ajaxSend: function(resolve, reject){
			var _resolve = function(data, ts, xhr){
					resolve(data, ts, xhr);
				},
				_reject = function(xhr, ts, msg){
					reject(msg, ts || 'error', xhr);	
				},
				xhr = $.ajax(this.getAjaxConfig());
			
			xhr.then(_resolve, _reject);
			
			return xhr;	
		},
		/**
		* form表单请求
		*/
		formSend: function(){},
		/**
		* form文件上传
		*/
		fileSend: function(){},
		/**
		* 如果不带参数则 取消当前请求
		* @param {...function} [bindFn] - 绑定onAbort事件
		*/
		abort : function(ts){
			var xhr = this._xhr;
			
			if( xhr && xhr.abort ) {
				xhr.abort(ts);
			}
			
			return this;
		},
		
		success: function(){
			this.done.apply(this, arguments);
			return this;	
		},
		
		error: function(){
			this.fail.apply(this, arguments);
			return this;	
		},
		
		complete: function(){
			this.always.apply(this, arguments);
			return this;	
		},
		/**
		* @Overview
		*/
		destroy : function(){
			
			Manager.remove( this.id );
			
			this.onDestroy();
			
			this.fireEvent('onDestroy');
			
			return this;
		},
		
		onDestroy: function(){}
		
	});
	
	return ajax;
});