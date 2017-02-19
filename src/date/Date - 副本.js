/**
 *
 * The date parsing and formatting syntax contains a subset of
 * <a href="http://www.php.net/date">PHP's date() function</a>, and the formats that are
 * supported will provide results equivalent to their PHP versions.
 *
 * The following is a list of all currently supported formats:
 * <pre class="">
Format  Description                                                               Example returned values
------  -----------------------------------------------------------------------   -----------------------
  d     Day of the month, 2 digits with leading zeros                             01 to 31
  D     A short textual representation of the day of the week                     Mon to Sun
  j     Day of the month without leading zeros                                    1 to 31
  l     A full textual representation of the day of the week                      Sunday to Saturday
  N     ISO-8601 numeric representation of the day of the week                    1 (for Monday) through 7 (for Sunday)
  S     English ordinal suffix for the day of the month, 2 characters             st, nd, rd or th. Works well with j
  w     Numeric representation of the day of the week                             0 (for Sunday) to 6 (for Saturday)
  z     The day of the year (starting from 0)                                     0 to 364 (365 in leap years)
  W     ISO-8601 week number of year, weeks starting on Monday                    01 to 53
  F     A full textual representation of a month, such as January or March        January to December
  m     Numeric representation of a month, with leading zeros                     01 to 12
  M     A short textual representation of a month                                 Jan to Dec
  n     Numeric representation of a month, without leading zeros                  1 to 12
  t     Number of days in the given month                                         28 to 31
  L     Whether it&#39;s a leap year                                                  1 if it is a leap year, 0 otherwise.
  o     ISO-8601 year number (identical to (Y), but if the ISO week number (W)    Examples: 1998 or 2004
        belongs to the previous or next year, that year is used instead)
  Y     A full numeric representation of a year, 4 digits                         Examples: 1999 or 2003
  y     A two digit representation of a year                                      Examples: 99 or 03
  a     Lowercase Ante meridiem and Post meridiem                                 am or pm
  A     Uppercase Ante meridiem and Post meridiem                                 AM or PM
  g     12-hour format of an hour without leading zeros                           1 to 12
  G     24-hour format of an hour without leading zeros                           0 to 23
  h     12-hour format of an hour with leading zeros                              01 to 12
  H     24-hour format of an hour with leading zeros                              00 to 23
  i     Minutes, with leading zeros                                               00 to 59
  s     Seconds, with leading zeros                                               00 to 59
  u     Decimal fraction of a second                                              Examples:
        (minimum 1 digit, arbitrary number of digits allowed)                     001 (i.e. 0.001s) or
                                                                                  100 (i.e. 0.100s) or
                                                                                  999 (i.e. 0.999s) or
                                                                                  999876543210 (i.e. 0.999876543210s)
  O     Difference to Greenwich time (GMT) in hours and minutes                   Example: +1030
  P     Difference to Greenwich time (GMT) with colon between hours and minutes   Example: -08:00
  T     Timezone abbreviation of the machine running the code                     Examples: EST, MDT, PDT ...
  Z     Timezone offset in seconds (negative if west of UTC, positive if east)    -43200 to 50400
  c     ISO 8601 date
        Notes:                                                                    Examples:
        1) If unspecified, the month / day defaults to the current month / day,   1991 or
           the time defaults to midnight, while the timezone defaults to the      1992-10 or
           browser's timezone. If a time is specified, it must include both hours 1993-09-20 or
           and minutes. The "T" delimiter, seconds, milliseconds and timezone     1994-08-19T16:20+01:00 or
           are optional.                                                          1995-07-18T17:21:28-02:00 or
        2) The decimal fraction of a second, if specified, must contain at        1996-06-17T18:22:29.98765+03:00 or
           least 1 digit (there is no limit to the maximum number                 1997-05-16T19:23:30,12345-0400 or
           of digits allowed), and may be delimited by either a '.' or a ','      1998-04-15T20:24:31.2468Z or
        Refer to the examples on the right for the various levels of              1999-03-14T20:24:32Z or
        date-time granularity which are supported, or see                         2000-02-13T21:25:33
        http://www.w3.org/TR/NOTE-datetime for more info.                         2001-01-12 22:26:34
  U     Seconds since the Unix Epoch (January 1 1970 00:00:00 GMT)                1193432466 or -2138434463
  MS    Microsoft AJAX serialized dates                                           \/Date(1238606590509)\/ (i.e. UTC milliseconds since epoch) or
                                                                                  \/Date(1238606590509+0800)\/
</pre>
 *
 * Example usage (note that you must escape format specifiers with '\\' to render them as character literals):
 * <pre><code>
// Sample date:
// 'Wed Jan 10 2007 15:05:01 GMT-0600 (Central Standard Time)'

var dt = new Date('1/10/2007 03:05:01 PM GMT-0600');
console.log(Date.format(dt, 'Y-m-d'));                          // 2007-01-10
console.log(Date.format(dt, 'F j, Y, g:i a'));                  // January 10, 2007, 3:05 pm
console.log(Date.format(dt, 'l, \\t\\he jS \\of F Y h:i:s A')); // Wednesday, the 10th of January 2007 03:05:01 PM
</code></pre>
 *
 * Here are some standard date/time patterns that you might find helpful.  They
 * are not part of the source of Date, but to use them you can simply copy this
 * block of code into any script that is included after Date and they will also become
 * globally available on the Date object.  Feel free to add or remove patterns as needed in your code.
 * <pre><code>
Date.patterns = {
    ISO8601Long:"Y-m-d H:i:s",
    ISO8601Short:"Y-m-d",
    ShortDate: "n/j/Y",
    LongDate: "l, F d, Y",
    FullDateTime: "l, F d, Y g:i:s A",
    MonthDay: "F d",
    ShortTime: "g:i A",
    LongTime: "g:i:s A",
    SortableDateTime: "Y-m-d\\TH:i:s",
    UniversalSortableDateTime: "Y-m-d H:i:sO",
    YearMonth: "F, Y"
};
</code></pre>
 *
 * Example usage:
 * <pre><code>
var dt = new Date();
console.log(Date.format(dt, Date.patterns.ShortDate));
</code></pre>
 * <p>Developer-written, custom formats may be used by supplying both a formatting and a parsing function
 * which perform to specialized requirements. The functions are stored in {@link #parseFunctions} and {@link #formatFunctions}.</p>
 * @singleton
 */

define(function(require, exports, module){
	var toString = Object.prototype.toString;
	
	function isArray(obj){
		return toString.call(obj) == '[object Array]';		
	}
	
	function isFunction(obj){
		return toString.call(obj) == '[object Function]';	
	}
	
	function isDate(obj){
		return toString.call(obj) == '[object Date]';	
	}
	
	function escapeRegex(str){
		return str.replace(/([-.*+?^${}()|[\]\/\\])/g, "\\$1");	
	}
	
	function defalut(value, defaultValue){
		if (isFinite(value)) {
            value = parseFloat(value);
        }

        return !isNaN(value) ? value : defaultValue;	
	}
	
	module.exports = {
		isDate : isDate,
		/**
		 * parse时的默认时间，否则取当前时间
		 * y,m,d,h,i,s,ms
		 */
		defaults : {},
		
		 y2kYear : 50,

		/**
		 * Date interval constant
		 * @type String
		 */
		MILLI : "ms",
	
		/**
		 * Date interval constant
		 * @type String
		 */
		SECOND : "s",
	
		/**
		 * Date interval constant
		 * @type String
		 */
		MINUTE : "mi",
	
		/** Date interval constant
		 * @type String
		 */
		HOUR : "h",
	
		/**
		 * Date interval constant
		 * @type String
		 */
		DAY : "d",
	
		/**
		 * Date interval constant
		 * @type String
		 */
		MONTH : "mo",
	
		/**
		 * Date interval constant
		 * @type String
		 */
		YEAR : "y",
		
		pad : function(v, len, s){
			var res = "" + v, 
				s = s || '0',
				len = len || 2;
			for (; res.length < len; res = s + res) {
			}
			return res;		
		},
		now : Date.now || function(){
			return +new Date();	
		},
		/**
		 * 判断当前年份是否闰年
		 * @param {int|Date} year 年份或者日期对象
		 * @return {boolean}
		 */
		isLeapYear : function(year){
			year = isDate(year) ? year.getFullYear() : parseInt(year, 10);
			return (year%4 === 0 && year%100 !== 0) || year%400 === 0;	
		},
		/**
		 * Compares if two dates are equal by comparing their values.
		 * @param {Date} date1
		 * @param {Date} date2
		 * @return {Boolean} True if the date values are equal
		 */
		isEqual: function(date1, date2) {
			// check we have 2 date objects
			if (date1 && date2) {
				return (date1.getTime() === date2.getTime());
			}
			// one or both isn't a date, only equal if both are falsey
			return !(date1 || date2);
		},
		/**
		 * 复制当前日期对象
		 * @param {Date}
		 * @return {Date}
		 */
		clone : function(date){
			return new Date( date.getTime() );	
		},
		
		/**
		 * Returns the number of milliseconds between two dates
		 * @param {Date} dateA The first date
		 * @param {Date} dateB (optional) The second date, defaults to now
		 * @return {Number} The difference in milliseconds
		 */
		getElapsed: function(dateA, dateB) {
			return Math.abs(dateA - (dateB || new Date()));
		},
		// private
		parseCodes: {
			d: {
				f: function(v, date){
					date.d = parseInt(v, 10);
				},
				r: "(3[0-1]|[1-2][0-9]|0[1-9])" // day of month with leading zeroes (01 - 31)
			},
			j: {
				f: function(v, date){
					date.d = parseInt(v, 10);
				},
				r: "(3[0-1]|[1-2][0-9]|[1-9])" // day of month without leading zeroes (1 - 31)
			},
			D: function() {
				for (var a = [], i = 0; i < 7; a.push(this.getShortDayName(i)), ++i); // get localised short day names
				return {
					f: null,
					r: "(?:" + a.join("|") +")"
				};
			},
			l: function() {
				return {
					f:null,
					r:"(?:" + this.dayNames.join("|") + ")"
				};
			},
			N: {
				f: null,
				r: "[1-7]" // ISO-8601 day number (1 (monday) - 7 (sunday))
			},
			S: {
				f:null,
				r:"(?:st|nd|rd|th)"
			},
			w: {
				f:null,
				r:"[0-6]" // javascript day number (0 (sunday) - 6 (saturday))
			},
			z: {
				f: function(v, date){
					date.z = parseInt(v, 10);
				},
				r:"(\\d{1,3})" // day of the year (0 - 364 (365 in leap years))
			},
			W: {
				f:null,
				r:"(?:\\d{2})" // ISO-8601 week number (with leading zero)
			},
			F: function() {
				return {
					f: function(v, date){
						date.m = parseInt(this.getMonthNumber(v), 10);
					}, // get localised month number
					r:"(" + this.monthNames.join("|") + ")"
				};
			},
			 M: function() {
				for (var a = [], i = 0; i < 12; a.push(this.getShortMonthName(i)), ++i); // get localised short month names
				return {
					f: function(v, date){
						date.m = parseInt(this.getMonthNumber(v), 10);
					},
					r:"(" + a.join("|") + ")"
				};
			},
			m: {
				f: function(v, date){
					date.m = parseInt(v, 10) - 1;	
				},
				r: "(1[0-2]|0[1-9])"	
			},
			n: {
				f: function(v, date){
					date.m = parseInt(v, 10) - 1;
				},
				r:"(1[0-2]|[1-9])" // month number without leading zeros (1 - 12)
			},
			t: {
				f:null,
				r:"(?:\\d{2})" // no. of days in the month (28 - 31)
			},
			L: {
				f:null,
				r:"(?:1|0)"
			},
			o: function() {
				return this.parseCodes.Y;
			},
			Y: {
				f: function(v, date){
					date.y = parseInt(v, 10);	
				},
				r:"(\\d{4})" // 4-digit year
			},
			y: {
				f: function(v, date){
					var _y = parseInt(v, 10);
					date.y = _y > this.y2kYear ? 1900 + _y : 2000 + _y;
				}, // 2-digit year
				r:"(\\d{1,2})"
			},
			a : {
				f: function(v, date){
					var h = date.h;
					if( /(am)/i.test( v ) ) {
						if( !h || h == 12 ) {
							h = 0;	
						}	
					} else {
						if( !h || h < 12 ) {
							h = (h || 0) + 12;	
						}	
					}	
				},
				r:"(am|pm|AM|PM)",
				calcAtEnd: true	
			},
			A : function(){
				return this.parseCodes.a;	
			},
			g : {
				f: function(v, date){
					date.h = parseInt(v, 10);	
				},
            	r:"(1[0-2]|[0-9])" //  12-hr format of an hour without leading zeroes (1 - 12)	
			},
			G : {
				f: function(v, date){
					date.h = parseInt(v, 10);	
				},
            	r:"(2[0-3]|1[0-9]|[0-9])" // 24-hr format of an hour without leading zeroes (0 - 23)
			},
			h : {
				f: function(v, date){
					date.h = parseInt(v, 10);	
				},
            	r:"(1[0-2]|0[1-9])" //  12-hr format of an hour with leading zeroes (01 - 12)	
			},
			H: {
				f: function(v, date){
					date.h = parseInt(v, 10);	
				},
				r: "(2[0-3]|[0-1][0-9])" //  24-hr format of an hour with leading zeroes (00 - 23)
			},
			i: {
				f: function(v, date){
					date.i = parseInt(v, 10);	
				},
				r: "([0-5][0-9])" // minutes with leading zeros (00 - 59)
			},
			s: {
				f: function(v, date){
					date.s = parseInt(v, 10);	
				},
				r: "([0-5][0-9])" // seconds with leading zeros (00 - 59)
			},
			u : {
				f : function(v, date){
					var ms = v;
					date.ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);
				},
				r : '(\\d+)'
			},
			O : {
				f: function(v, date){
					var o = v,
						sn = o.substring(0,1),
						hr = o.substring(1,3)*1 + Math.floor(o.substring(3,5) / 60),
						mn = o.substring(3,5) % 60;
					
					date.o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + this.pad(hr, 2, '0') + this.pad(mn, 2, '0')) : null;
				},
				r: "([+\-]\\d{4})" // GMT offset in hrs and mins	
			},
			P : {
				f: function(v, date){
					var o = v,
						sn = o.substring(0,1),
						hr = o.substring(1,3)*1 + Math.floor(o.substring(4,6) / 60),
						mn = o.substring(4,6) % 60;
					
					date.o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + this.pad(hr, 2, '0') + this.pad(mn, 2, '0')) : null;
				},
				r: "([+\-]\\d{2}:\\d{2})" // GMT offset in hrs and mins (with colon separator)	
			},
			T : {
				f:null,
            	r:"[A-Z]{1,4}" // timezone abbrev. may be between 1 - 4 chars	
			},
			Z : {
				f: function(v, date){
					var zz = v * 1;
					date.zz = (-43200 <= zz && zz <= 50400)? zz : null;	
				},
            	r:"([+\-]?\\d{1,5})" // leading '+' sign is optional for UTC offset	
			},
			c : function() {
				var calc = [],
					arr = [
						this.getParseCode("Y", 1), // year
						this.getParseCode("m", 2), // month
						this.getParseCode("d", 3), // day
						this.getParseCode("h", 4), // hour
						this.getParseCode("i", 5), // minute
						this.getParseCode("s", 6), // second
						{
							f: function(v, date){
								var ms = v || '0';
								date.ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);
							}
						}, // decimal fraction of a second (minimum = 1 digit, maximum = unlimited)
						{c:[ // allow either "Z" (i.e. UTC) or "-0530" or "+08:00" (i.e. UTC offset) timezone delimiters. assumes local timezone if no timezone is specified
							"if(results[8]) {", // timezone specified
								"if(results[8] == 'Z'){",
									"zz = 0;", // UTC
								"}else if (results[8].indexOf(':') > -1){",
									this.getParseCode("P", 8).c, // timezone offset with colon separator
								"}else{",
									this.getParseCode("O", 8).c, // timezone offset without colon separator
								"}",
							"}"
						].join('\n')}
					];
	
				for (var i = 0, l = arr.length; i < l; ++i) {
					//calc.push(arr[i].f);
				}
	
				return {
					f: function(){
						console.log( arguments );	
					},
					r:[
						arr[0].r, // year (required)
						"(?:", "-", arr[1].r, // month (optional)
							"(?:", "-", arr[2].r, // day (optional)
								"(?:",
									"(?:T| )?", // time delimiter -- either a "T" or a single blank space
									arr[3].r, ":", arr[4].r,  // hour AND minute, delimited by a single colon (optional). MUST be preceded by either a "T" or a single blank space
									"(?::", arr[5].r, ")?", // seconds (optional)
									"(?:(?:\\.|,)(\\d+))?", // decimal fraction of a second (e.g. ",12345" or ".98765") (optional)
									"(Z|(?:[-+]\\d{2}(?::)?\\d{2}))?", // "Z" (UTC) or "-0530" (UTC offset without colon delimiter) or "+08:00" (UTC offset with colon delimiter) (optional)
								")?",
							")?",
						")?"
					].join("")
				};
			},
			U : {
				c: function(v, date){
					date.u = parseInt(v, 10);	
				},
            	s:"(-?\\d+)" // leading minus sign indicates seconds before UNIX epoch	
			}
		},
		
		getParseCode : function(code){
			var pCode = this.parseCodes[code];
			
			if( isFunction(pCode) ) pCode = pCode.call(this);
			
			return pCode;
		},
		
		parseFunctions : {},
		
		createParser : function(format){
			if( this.parseFunctions[format] ) {
				return this.parseFunctions[format];
			}
			//eg: step1: foramt = Y-m-d\s
			var obj, parser,
				self = this,
				calc = [],
				reg = ['\\\\?['],
				_reg = [],
				reg2 = [];
				parseCodes = this.parseCodes,
				_format = format,
				format = escapeRegex(format || this.defaultFormat);
				
			//eg: after escapeRegex => step2: foramt = Y\-m\-d\\s //此处的\s不应该转成\\s 所以后续需要转回\s	
		
			for( var k in parseCodes ) {
				_reg.push( k );
				reg2.push('\\\\' + k);
			}
			
			reg.push( _reg.join('|') );
			
			reg.push(']');	
			
			reg = reg.join('');
			
			format = format.replace( new RegExp( reg2.join('|', 'g') ), function(ch){
				return ch.replace('\\', '');	
			} );
			//eg: step3: foramt = Y\-m\-d\s
			
			var parseRegex = new RegExp(reg, 'g');
			
			var regExp = format.replace( parseRegex, function(ch, idx){
				if( ch.charAt(0) == "\\" ) return ch.slice(1);
				
				obj = self.getParseCode(ch);
				
				if( obj.f ) {
					calc.push( obj );
				}
				
				return obj.r;
			} );
			
			parser = function(input, strict){
				var ret = input.match(regExp);
				if( !ret ) return;
				
				var dt, y, m, d, h, i, s, ms, o, z, zz, u, v,
					date = {},
					fnCall = [],
					fnCallEnd = [],
					def = this.defaults;
				
				//var date = self.clearTime(new Date);//defalut
				
				for( var i = 1; i < ret.length; i++ ) {
					var obj = calc[i-1];
					if( obj.calcAtEnd ) {
						fnCallEnd.push( {fn : obj.f, params : [ ret[i], date, strict, i, ret ]} );
					} else {
						fnCall.push( {fn : obj.f, params : [ ret[i], date, strict, i, ret ]} );
					}
				}
				
				for( var i = 0, calls = fnCall.concat(fnCallEnd); i < calls.length; i++ ) {
					var obj = calls[i];
					if( obj.fn && isFunction(obj.fn) ) {
						obj.fn.apply( self, obj.params );	
					}
				}	
				
				console.log( date );
				
			};	
			
			this.parseFunctions[_format] = parser;
		
			return parser;
		},
		
		parse : function(input, format, strict){
			return this.createParser(format)(input, strict);
		},
		
		/**
		 * Attempts to clear all time information from this Date by setting the time to midnight of the same day,
		 * automatically adjusting for Daylight Saving Time (DST) where applicable.
		 * (note: DST timezone information for the browser's host operating system is assumed to be up-to-date)
		 * @param {Date} date The date
		 * @param {Boolean} clone true to create a clone of this date, clear the time and return it (defaults to false).
		 * @return {Date} this or the clone.
		 */
		clearTime : function(date, clone) {
			if (clone) {
				return this.clearTime(this.clone(date));
			}
	
			// get current date before clearing time
			var d = date.getDate();
	
			// clear time
			date.setHours(0);
			date.setMinutes(0);
			date.setSeconds(0);
			date.setMilliseconds(0);
	
			if (date.getDate() != d) { // account for DST (i.e. day of month changed when setting hour = 0)
				// note: DST adjustments are assumed to occur in multiples of 1 hour (this is almost always the case)
				// refer to http://www.timeanddate.com/time/aboutdst.html for the (rare) exceptions to this rule
	
				// increment hour until cloned date == current date
				for (var hr = 1, c = this.add(date, this.HOUR, hr); c.getDate() != d; hr++, c = this.add(date, this.HOUR, hr));
	
				date.setDate(d);
				date.setHours(c.getHours());
			}
	
			return date;
		},
	};
});