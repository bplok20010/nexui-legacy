/**
* Store.js
*/
define(function(require){
	var Nex = require('../Nex');
	var EventObject = require('../EventObject');
	
	var Item = require('./util/Item');
	
	function isItem(Item){
		return Nex.isInstance(Item) && Item['$isItem'];
	}
	
	var Store = Nex.define('Nex.data.Store', EventObject, {
		xtype : 'store',
		'$isStore' : true,
		
		config : function(){
			return {
				idField : 'id',
				
				pageNumberField : 'page',
				pageSizeField : 'limit',
		
				currentPage: 1,
				
				pageSize: 25,
				
				data : null,
				//数据的ID索引
				index : null,
				
				totalCount: 0,
				
				/**
				* 自定义数据装载
				* function
				* @return Promise
				*/
				request: null,
				//当加载远程数据成功时，只加载一次
				loadOnce : false,
				
				//数据更新时 深度检查
				deep : true	
			};	
		},
		
		constructor: function(){
			
			this.data = [];
			
			this.index = {};
			
			this._super(arguments);
			
			this.init();
				
		},
		
		init : function(){
			
			this._saveList = [];
			
			this.setData( this.data );	
			
		},
		
		isItem : isItem,
		
		wrap: function(item){
			if( isItem(item) ) {
				return item;	
			}
			return new Item(item, {
				idField : this.idField	
			});
		},
		
		wrapAll: function( data ){			
			if( Nex.isIterable(data) ) {
				var ds = [];
				for( var i = 0; i < data.length; i++ ) {
					ds.push(this.wrap(data[i]));	
				}	
				return ds;
			} else {
				return this.wrap(data[i]);	
			}	
			
		},
		
		unWrap: function(item){
			if( isItem(item) ) {
				return item.data;	
			}	
			return item;	
		},
		
		unWrapAll: function(data){
			if( Nex.isIterable(data) ) {
				var ds = [];
				
				for( var i = 0; i < data.length; i++ ) {
					ds.push(this.unWrap(data[i]));	
				}	
				
				return ds;
			} else {
				return this.unWrap(data[i]);	
			}	
		},
		
		_saveList : null,
		//保存设置参数 供restore还原
		save : function(){
			var props = ['data', 'currentPage', 'pageSize', 'totalCount', 'request'],
				data = {};
				
			for( var i=0;i<props.length;i++ ) {
				data[props[i]] = this[props[i]];
			}
			
			this._saveList.push( data );
		},
		//还原上一次保存的参数
		restore: function(){
			var data = this._saveList.shift();
			
			if( data ) {
				Nex.extend( this, data );
			}
		},
		
		getPageSize : function(){
			return this.pageSize || this.getTotalCount();	
		},
		
		setPage : function(page){
			this.currentPage = page;	
		},
		
		getPage : function(){
			return this.currentPage;	
		},
		
		setPageSize : function(size){
			this.pageSize = size;	
		},
		
		getCount: function(){
			return this.data.length || 0;	
		},
		
		getTotalCount: function(){
			return this.totalCount || this.getCount();	
		},
		
		getTotalPages: function(){
			var self = this,
				total = self.getTotalCount(),
            	pageSize = self.getPageSize() || total;

            return Math.ceil((total || 0) / pageSize);	
		},
		
		setData: function(data, append){
			var idx, length, total, start = 0, idField = this.idField, records = data;
			
			if( Nex.isObject(data) ) {
				total = data.total;
				records = Nex.isIterable(data.data) ? data.data : ( data.data || [] );
				this.totalCount = total || records.length; 	
			}
			
			records = this.wrapAll(Nex.isIterable(records) ? records : [records]);
			
			if( !append ) {
				this.index = {};
				this.data = records;	
			} else {
				start = this.data.length;	
			}
			
			for (idx = 0, length = records.length; idx < length; idx++) {
				this.index[records[idx]['id']] = records[idx];
			
				if( append ) {
					this.data.push( records[idx] );	
				}
			
            }
			
			return this.data;
		},
		
		getData : function(){
			return this.data;	
		},
		
		onBeforeFetch: Nex.noop,
		
		fetch: function(params){
			var self = this,
				ctx = this.context || this,
				deferred = $.Deferred(),
				request = this.request,
				page = this.currentPage,
				limit = this.pageSize,
				pm = {},
				pn = this.pageNumberField,
				ps = this.pageSizeField;
			
			if( limit ) {	
				pm[pn] = page;
				pm[ps] = limit;
			}
			
			var requestParams = Nex.extend(pm, params || {});
			
			self.onBeforeFetch(requestParams);
			
			self.fireEvent('onBeforeFetch', requestParams);
			
			var limit = requestParams[ps] || 0,
				start = ((requestParams[pn] || 1) - 1) * limit,
				end = start + limit;
			
			if( !request ) {
				request = function(params){
					deferred.resolve(self.getRange(start, end));
					
					return deferred;		
				}	
			} else {
				var origRequest = request;
				var hasExec = false;
				var success = function(data){
						if( hasExec ) return;
						
						hasExec = true;
						self.setData(data);
						
						var dataset = self.getData()
						
						if( self.loadOnce ) {
							self.request = null;	
							dataset = self.getRange(start, end);
						}
						
						deferred.resolve(dataset);
						
						self.fireEvent('onLoadSuccess', dataset);
						
						self.fireEvent('onLoadComplete');
						/*
						if( self.loadOnce ) {
							self.request = null;	
						}*/
					},
				  	error = function(msg, ts, xhr){
						if( hasExec ) return;
						
						hasExec = true;
						deferred.reject(msg, ts, xhr);	
						
						self.fireEvent('onLoadError', msg, ts, xhr);
						
						self.fireEvent('onLoadComplete');
					};
				
				request = function(params){
					
					self.fireEvent('onBeforeLoad', params);
					
					var _deferred = origRequest.call(self, params, success, error);
					
					if(void 0 !== _deferred) {
						if( Nex.isPromiseLike(_deferred) ) {
							_deferred.then(success, error);
						} else {
							success(_deferred);	
						}
					}
					
					return deferred;		
				}	
			}
			
			return request.call(this, requestParams);
		},
		
		getRange: function(start, end){
			var data = this.data,
				length = data.length,
				range;	
				
			if (!length) {
            	range = [];
			} else {
				range = data.slice(start || 0, end || length);
			}
	
			return range;	
		},
		
		loadData : function(options){
			return this.fetch(options);	
		},
		
		/**
		* 加载指定页数据
		*/
		loadPage : function(page, options){
			var page = Nex.unDefined(page, this.currentPage);	
			
			this.currentPage = page;
			
			return this.fetch(options);
		},
		
		page : function(page, opt){
			return this.loadPage(page, opt);
		},
		
		getPageData : function(page, opt){
			return this.loadPage(page, opt);
		},
		
		nextPage : function(options){
			this.currentPage++;
			//this.currentPage = Math.min(this.currentPage, this.getTotalPages());
			
			return this.fetch(options);
		},
		
		prevPage : function(options){
			this.currentPage--;
			this.currentPage = Math.max(this.currentPage, 0);
			
			return this.fetch(options);
		},
		
		update: function(object, options){
			var self = this,
				id = options && options.id
				|| object[this.idField];
				
			var data = this.get( id );
			
			if( data ) {
				if( !this.equal( data.data, object ) ) {
					var index = this.indexOf(data);
					
					data.data = object;
					
					this.onUpdate(data, index);
					
					this.fireEvent('onUpdate', this, data, index);	
					this.fireEvent('onChange', {
						action : 'update',
						index : index,
						records : data,
						store : this	
					});	
				}	
			}	
			
			return id	
		},
		
		onUpdate : function(){},
		
		updateById: function(id, object){
			return this.update(object, id);
		},
		
		updateAt: function(index, object){
			return this.update(object, this.getAt(index));
		},
		
		equal : function (x, y) {
			if (x === y) {
				return true;
			}
	
			var xtype = Nex.type(x), ytype = Nex.type(y), field;
	
			if (xtype !== ytype) {
				return false;
			}
	
			if (xtype === "date") {
				return x.getTime() === y.getTime();
			}
	
			if (xtype !== "object" && xtype !== "array") {
				return false;
			}
			
			if( this.deep ) {
				for (field in x) {
					if (!equal(x[field], y[field])) {
						return false;
					}
				}
			} else {
				return false;	
			}
			
			return true;
		},
		
		get: function(id) {
            return this.index[id];
        },
		
		indexOf: function(data) {
			var idx, length;

			for (idx = 0, length = this.data.length; idx < length; idx++) {
				if (this.data[idx]['id'] == data[this.idField]) {
					return idx;
				}
			}
	
			return -1;
		},
		
		indexOfId: function(id) {
			var data = {};
			data[this.idField] = id
			return this.indexOf( data );
		},
		
		add : function(records){
			 return this.insert(this.data.length, records);	
		},
		
		insert: function(index, records) {
			var self = this,
				len, i,
				idField = this.idField;
			
			if (records) {
				if (!Nex.isIterable(records)) {
					records = [records];
				}
				
				len = records.length;
			}
			
			if (!len) {
				return [];
			}
			
			for (i = 0; i < len; ++i) {
				records[i] = self.wrap(records[i]);
				this.index[records[i]['id']] = records[i];
			}
			
			[].splice.apply(self.data, [index, 0].concat(records));
			
			this.onAdd(records, index);
			
			self.fireEvent('onAdd', self, records, index);
			
			self.fireEvent('onChange', {
				action : 'add',
				index : index,
				records : records,
				store : self
			});
			
			return records;
		},
		
		onAdd : function(){},
		
		clearData : function(){
			this.data.length = 0;	
			this.index = {};
		},
		
		empty: function(){
			this.removeAll();
		},
		
		removeAll: function(){
			this.clearData();
			this.onClear();
			this.fireEvent('onClear', this);	
			this.fireEvent('onChange', {
				action : 'clear',
				store : this
			});
		},
		
		onClear: function(){},
		
		remove: function(Item){
			var idx = this.indexOf(Item);

            if (idx !== -1) {
               return this.removeAt(idx, 1);
            }	
		},
		
		removeById: function(id){
			var idx = this.indexOfId(id);

            if (idx !== -1) {
                return this.removeAt(idx, 1);
            }	
		},
		
		removeAt: function(index, count){
			var self = this,
				records;
				
			records = this.data.splice(index, Nex.unDefined(count, 1));	
			
			this.onRemove(records, index);
			
			self.fireEvent('onRemove', self, records, index);
			
			self.fireEvent('onChange', {
				action : 'remove',
				index : index,
				records : records,
				store : self
			});
			
			Nex.each( record, function(data, i){
				delete self.index[data.id];	
			} );
			
			return records;
		},
		
		at: function(index){
			return this.getAt(index);	
		},
		
		getAt: function(index){
			return this.data[index];
		}

//		getById: null,
//		first: null,
//		last: null,
//		max: null,
//		min: null,
//		sum: null,
//		
//		push : Nex.noop,
//		slice : Nex.noop,	
//		sort : Nex.noop,	
//		join : Nex.noop,	
//		pop : Nex.noop,	
//		splice : Nex.noop,	
//		shift : Nex.noop,	
//		unshift : Nex.noop,	
//		indexOf : Nex.noop,	
//		forEach : Nex.noop,	
//		map : Nex.noop,	
//		reduce : Nex.noop,	
//		reduceRight : Nex.noop,	
//		filter : Nex.noop,	
//		find : Nex.noop,	
//		every : Nex.noop,	
//		some : Nex.noop,

	});
	
	Store.isItem = isItem;
	
	return Store;
});