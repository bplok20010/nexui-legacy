/**
* Function.js
* author: nobo
*/
define(function(require){
	var nativeBind = Function.prototype.bind,
		ctor = function(){},
		lang = require('./lang'),
		Func;	
	Func = {
		bind: function(func, context) {
			var args, bound;
			if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
			if (!lang.isFunction(func)) throw new TypeError;
			args = slice.call(arguments, 2);
			return bound = function() {
				if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
				ctor.prototype = func.prototype;
				var self = new ctor;
				ctor.prototype = null;
				var result = func.apply(self, args.concat(slice.call(arguments)));
				if (Object(result) === result) return result;
				return self;
			};
		},
		partial: function(func){
			var args = slice.call(arguments, 1);
			return function() {
				return func.apply(this, args.concat(slice.call(arguments)));
			};	
		},
		bindAll: function(obj) {
			var i, length = arguments.length, key;
			if (length <= 1) throw new Error('bindAll must be passed function names');
			for (i = 1; i < length; i++) {
				key = arguments[i];
				obj[key] = Func.bind(obj[key], obj);
			}
			return obj;
		},
		delay: function(func, wait) {
			var args = slice.call(arguments, 2);
			return setTimeout(function(){ return func.apply(null, args); }, wait);
		},
		defer: function(func) {
			return Func.delay.apply(Func, [func, 1].concat(slice.call(arguments, 1)));
		},
		throttle: function(func, wait) {},
		debounce: function(func, wait) {},
		once: function(func, wait) {},
		wrap: function(func, wait) {},
		compose: function(func, wait) {},
		after: function(func, wait) {},
		before: function(func, wait) {}
	}	
});