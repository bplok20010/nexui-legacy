define(function(require){
	
	//本想用Numeral.js里的+-*/ 但是发现里面的*也有问题
	
	var isToFixedBroken = (0.9).toFixed() !== '1';
	
	return {
		/*
		* 修正取舍位为5时的BUG eg: (0.615).toFixed(2) 0.61
		*/
		toFixed: function(value, precision) {
			if (isToFixedBroken) {
				precision = precision || 0;
				var pow = Math.pow(10, precision);
				return (Math.round(value * pow) / pow).toFixed(precision);
			}
	
			return value.toFixed(precision);
		},
		
		/**
		* 如果有小数位则保留指定长度小数位  不进行四舍五入
		*/
		decimal: function(v, dec) {
			var val = Math.pow(10, dec || 0);
			return Math.floor(v * val) / val;
		},
		
		/**
		* 作用同toFixed
		* 区别： 
		*	(0.6).toFixed(2) ==> 0.60
		* 	(0.6).toDecimalFixed(2) ==> 0.6 或去掉后面的多余0
		*/
		toDecimalFixed: function(v, dec) {
			var val = this.toFixed(v, dec).split('.');
			if( val[1] ) {
				val[1] = val[1].replace(/0+$/,'');
				return Number(val.join('.')) + '';	
			}
			return Number(val.join('.')) + '';
		},
		
		random: function (from, to) {
			return Math.floor(Math.random() * (to - from + 1) + from);
		},
		
		add : function (arg1, arg2) {  
			var r1, r2, m, c;
			try {
				r1 = arg1.toString().split(".")[1].length;
			}
			catch (e) {
				r1 = 0;
			}
			try {
				r2 = arg2.toString().split(".")[1].length;
			}
			catch (e) {
				r2 = 0;
			}
			c = Math.abs(r1 - r2);
			m = Math.pow(10, Math.max(r1, r2));
			if (c > 0) {
				var cm = Math.pow(10, c);
				if (r1 > r2) {
					arg1 = Number(arg1.toString().replace(".", ""));
					arg2 = Number(arg2.toString().replace(".", "")) * cm;
				} else {
					arg1 = Number(arg1.toString().replace(".", "")) * cm;
					arg2 = Number(arg2.toString().replace(".", ""));
				}
			} else {
				arg1 = Number(arg1.toString().replace(".", ""));
				arg2 = Number(arg2.toString().replace(".", ""));
			}
			return (arg1 + arg2) / m;
        },

        subtract : function (arg1, arg2) {
            var r1, r2, m, n;
			try {
				r1 = arg1.toString().split(".")[1].length;
			}
			catch (e) {
				r1 = 0;
			}
			try {
				r2 = arg2.toString().split(".")[1].length;
			}
			catch (e) {
				r2 = 0;
			}
			m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
			n = (r1 >= r2) ? r1 : r2;
			return ((arg1 * m - arg2 * m) / m).toFixed(n);            
        },

        multiply : function (arg1, arg2) {
            var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
			try {
				m += s1.split(".")[1].length;
			}
			catch (e) {
			}
			try {
				m += s2.split(".")[1].length;
			}
			catch (e) {
			}
			return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
        },

        divide : function (arg1, arg2) {
           var t1 = 0, t2 = 0, r1, r2;
			try {
				t1 = arg1.toString().split(".")[1].length;
			}
			catch (e) {
			}
			try {
				t2 = arg2.toString().split(".")[1].length;
			}
			catch (e) {
			}
			with (Math) {
				r1 = Number(arg1.toString().replace(".", ""));
				r2 = Number(arg2.toString().replace(".", ""));
				return (r1 / r2) * pow(10, t2 - t1);
			}
        }
	};
	
});