/**
* Support.js
*/
define(function(require, exports, module){

	var userAgent = navigator.userAgent.toLowerCase();
	
	function detectBrowser(ua) {
		var browser = false, match = [],
			browserRxs = {
				edge: /(edge)[ \/]([\w.]+)/i,
				webkit: /(chrome)[ \/]([\w.]+)/i,
				safari: /(webkit)[ \/]([\w.]+)/i,
				opera: /(opera)(?:.*version|)[ \/]([\w.]+)/i,
				msie: /(msie\s|trident.*? rv:)([\w.]+)/i,
				mozilla: /(mozilla)(?:.*? rv:([\w.]+)|)/i
			};

		for (var agent in browserRxs) {
			if (browserRxs.hasOwnProperty(agent)) {
				match = ua.match(browserRxs[agent]);
				if (match) {
					browser = {};
					browser[agent] = true;
					browser[match[1].toLowerCase().split(" ")[0].split("/")[0]] = true;
					browser.version = parseInt(document.documentMode || match[2], 10);

					break;
				}
			}
		}

		return browser;
	};
	
	var input = document.createElement("input");

	var placeholder = "placeholder" in input;
	var propertyChangeEvent = "onpropertychange" in input;
	
	var browser = detectBrowser(userAgent);
	
	var check = function(regex){
            return regex.test(userAgent);
        },
		isStrict = document.compatMode == "CSS1Compat",
        version = function (is, regex) {
            var m;
            return (is && (m = regex.exec(userAgent))) ? parseFloat(m[1]) : null;
        },
		docMode = document.documentMode,
        isWindows = check(/windows|win32/),
        isMac = check(/macintosh|mac os x/),
        isLinux = check(/linux/),
		isAndroid = check(/(Android|Android.*(?:Opera|Firefox).*?\/)\s*(\d+)\.(\d+(\.\d+)?)/),
		isIphone = check(/(iPhone|iPod).*OS\s+(\d+)[\._]([\d\._]+)/),
		isIpad = check(/(iPad).*OS\s+(\d+)[\._]([\d_]+)/),
		isWP = check(/(Windows Phone(?: OS)?)\s(\d+)\.(\d+(\.\d+)?)/);

    try {
        document.execCommand("BackgroundImageCache", false, true);
    } catch(e) {}
	
	return {
		placeholder : placeholder,
		
		propertyChangeEvent : propertyChangeEvent,
		
		browser : browser,
		
		userAgent : userAgent,

        isStrict: isStrict,

        isOpera : browser.opera,

        isWebKit : browser.webkit,

        isChrome : browser.chrome,
		
		isSafari : browser.safari,
		
		isMozilla : browser.mozilla,

		IEVer : browser.msie && browser.version,
        
        isIE : browser.msie,
		
		isIE6 : browser.msie && browser.version === 6,
		
		isIE7 : browser.msie && browser.version === 7,
		
		isIE8 : browser.msie && browser.version === 8,
		
		isIE9 : browser.msie && browser.version === 9,
		
		isIE10 : browser.msie && browser.version === 10,
		
		isIE11 : browser.msie && browser.version === 11,

        isLinux : isLinux,

        isWindows : isWindows,

        isMac : isMac	
	};
});