/*
*submitform处理工具 submitform
*Nex.util.SubmitForm
*/
define(function(require, exports, module){
	var submitform = {
		frame : function(f, c, isXML, doc) {
			var me = this;
			var n = 'sf'+ Math.floor(Math.random() * 99999);
			//
			//var d = document.createElement('DIV');
			var ifr = document.createElement('IFRAME');
			ifr.style.display = 'none';
			ifr.id = n;
			ifr.onload = function(){
				me.loaded(n);	
			};
			ifr.name = n;
			ifr.src = 'about:blank';
			//d.innerHTML = '<iframe style="display:none" src="about:blank" id="'+n+'" name="'+n+'" onload="Nex.getUtil(\'SubmitForm\').loaded(\''+n+'\')"></iframe>';
	
			document.body.appendChild(ifr);
	
			//var i = document.getElementById(n);
			
			f.setAttribute('target', n);
			
			ifr.isXML = !!isXML;
			ifr.docRoot = doc || 'body';
			ifr.onComplete = function(s){
				if (c && typeof c == 'function') {
					c(s);
				}	
				if ( ifr.parentNode ) {
					ifr.parentNode.removeChild( ifr );
				}
			};
			ifr.abort = function(){
				if ( this.parentNode ) {
					this.parentNode.removeChild( this );
				}	
			}
			
			return ifr;
		},
		/*
		* isXML=true服务器返回的是xml,格式eg:
		*   @header("Content-type: application/xml; charset=$_SC[charset]");
		*	<?xml version="1.0" encoding="UTF-8"?>";
		*	<root><![CDATA[<strong>Hello Nex!</strong>]]></root>;
		* isXML=false
		* 数据的根节点 eg:
		*	docRoot=textarea 默认 body
		*	<textarea>
		*		<strong>Hello Nex!</strong>
		*	</textarea>
		*/
		'submit' : function(f, func, isXML, doc) {
			if( typeof f !== 'object' ) {
				f = document.getElementById(f);	
			}
			
			var d = this.frame(f, func, isXML, doc);
			
			f.submit();
			return d;
		},
		//返回格式是text/html
		loaded : function(id) {
			function getDoc(frame) {
				var doc = frame.contentWindow ? frame.contentWindow.document : frame.contentDocument ? frame.contentDocument : frame.document;
				return doc;
			}
			var i = document.getElementById(id);
			
			if( !i ) return;
			
			var s = '';
			var doc;
			try{
				doc = getDoc( i );
			} catch(e) {
				//cross-origin error
				s = "无法显示此内容,可能错误：cross-origin";
			}
			if( doc ) {
				if (doc.location.href == "about:blank") {
					return;
				}
				
				if( !i.isXML ) {
					//var docRoot = doc.body ? doc.body : doc.documentElement;
			
					var pre = doc.getElementsByTagName(i.docRoot)[0];
					
					if (pre) {
						s = pre.textContent ? pre.textContent : pre.innerText;
					}
				} else {
					try {
						s = i.contentWindow.document.XMLDocument.text;
					} catch(e) {
						try {
							s = i.contentWindow.document.documentElement.firstChild.wholeText;
						} catch(e) {
							try {
								s = i.contentWindow.document.documentElement.firstChild.nodeValue;
							} catch(e) {
									s = "无法显示此内容,可能错误：cross-origin";//如果出现这个请检查域名是否相同 
							}
						}
					}	
				}
				/*else if (b) {
				 s = b.textContent ? b.textContent : b.innerText;
				 }*/
			}
			if (typeof(i.onComplete) == 'function') {
				i.onComplete(s);
			}
		}
	};
  
	return submitform;
});
