/*
*
*Nex.mixins.DropDown
*下拉列表框 或者 自定义下拉框 
*/
define(function(require){
	require('../Ajax');	

	return Nex.define('Nex.mixins.DataLoader', {
		extend : 'Nex.EventObject',
		config : function( opt ){
			return {
				url : '',
				ajaxClass : 'Nex.Ajax',//定义Nex.Ajax组件来发送请求
				ajaxCache : true,
				ajaxOptions : {},
				ajaxMethod : 'GET',
				ajaxDataType : 'json',
				ajaxDataFilter : null,
				ajaxData : {},
				ajaxSend : null
			};
		},	
		//从服务器中加载当前页数据
		loadAsyncData : function(/*[data, ]*/success, error, complete){
			var self = this,
				opt = self.configs;
				
			var args = [].slice.apply( arguments );	
			
			var cd = {};
			
			if( !Nex.isFunction( args[0] ) ) {
				cd = args[0];
				args.splice(0,1);	
			}
			
			var success = args[0],
				error = args[1],
				complete = args[2];
			
			var ajaxData = $.extend(opt.ajaxData || {}, cd);
			
			var ajaxOptions = $.extend({},{
					type 		: opt.ajaxMethod,
					cache 		: opt.ajaxCache,
					dataType	: opt.ajaxDataType,
					dataFilter	: opt.ajaxDataFilter
				});
				
			$.extend(ajaxOptions, opt.ajaxOptions);
			
			ajaxOptions.data = $.extend(ajaxOptions.data || {},ajaxData);
			ajaxOptions.$caller = self;
			ajaxOptions.url = opt.url;
			
			ajaxOptions.success = function(data){
				if( $.isFunction(success) ) {
					success(data);	
				}
				self.fireEvent('onLoadAsyncDataSuccess',[data,opt]);
			};
			ajaxOptions.error = function(xmlHttp){
				if( $.isFunction(error) ) {
					error(xmlHttp);	
				}
				self.fireEvent('onLoadAsyncDataError',[xmlHttp,opt]);
			};
			
			ajaxOptions.complete = function(data){
				if( $.isFunction(complete) ) {
					complete(data);	
				}
				self.fireEvent('onLoadAsyncDataEnd',[opt]);
				self.fireEvent('onLoadAsyncDataComplete',[data,opt]);	
			};
			
			if( self.fireEvent('onBeforeLoadAsyncData',[ajaxOptions,opt]) === false ) {
				return;	
			}	
			self.onLoadAsyncDataStart( ajaxOptions, opt );
			self.fireEvent('onLoadAsyncDataStart',[ajaxOptions,opt]);
			
			self.ajaxSend(ajaxOptions);
			
			return self;
		},
		onLoadAsyncDataStart : function(){},
		ajaxSend : function(ajaxOptions){
			var self = this;
			var opt = self.configs;
			if( $.isFunction( opt.ajaxSend ) ) {
				opt.ajaxSend.call(self, ajaxOptions);
			} else {
				Nex.Create(opt.ajaxClass, ajaxOptions);
			}
			return self;
		}
	});
});	