/*
jquery.nexShowAt.js
http://www.extgrid.com/nexShowAt
author:nobo
qq:505931977
QQ交流群:13197510
email:zere.nobo@gmail.com or QQ邮箱
eg1:
var at = new Nex.showAt({source:'#t1',el:'#t2'});
eg2:
$("#t1").showAt("#t2"[,{xAlign:'right'}]);
*/
define(function(require){
	require('Nex');

	var showAt = Nex.define('Nex.showat.ShowAt',{
		extend : 'Nex.AbstractComponent',
		alias : 'Nex.ShowAt Nex.showAt',
		xtype : 'showAt showat',
		configs : function(){
			return {
				prefix : 'showAt-',
				denyManager : true,
				//source : null,
				autoShow : false,//是否自动显示
				//openAtOpt : true,//开启后 可使用参数 at 代替el来设置，只是助于理解
				el : null,
				at : null,// 相当于at 或者 一个 坐标eg {left:0,top:2}
				parent : null,//source 的父元素 会自动获取offsetParent  document.body
				autoRegion : true,//自动调整显示方位
				visibleable : true,//必定可见 相对于source的父元素
				visibleEdge : 0,//距离right bottom的最小宽度
				visibleEdgeLT : 0,//距离 left top的最小宽度
				offsetX : 0,//正 负 分别代表外离 内缩
				offsetY : 0,//同上
				zAlign : 'y',// x:横 y:竖
				xAlign : 'center',// left right center
				yAlign : 'center',//top cenger bottom
				animate : null//动画显示函数 默认直接showonBeforeShow : $.noop
			};	
		}		
	});
	showAt.override({
		initComponent : function(opt) {
			var self = this,undef;
			var opt = this.configs;
			
			self.callParent(arguments);
			
			if( Nex.isArray(opt.at) ) {
				opt.at = {
					left : opt.at[0],	
					top : opt.at[1]
				};	
			}
			
			self.parseSource()
				.parseEl();
			
		},
		parseSource : function(){
			var self = this;
			var opt = self.configs;	
			/*
			if( opt.openAtOpt && opt.at !== null ) {
				opt.el = opt.at;	
			}*/
			var s = $(opt.el);//opt.el
			
			if( opt.parent ) {
				if( opt.parent !== window && opt.parent !== document ) {
					opt.parent = $(opt.parent);
					if( opt.parent.length ) {
						var position = opt.parent.css('position');
						if( position === 'static' ) {
							opt.parent.css('position','relative');	
						}
					} else {
						 opt.parent = null;	
					}
				} else {
					opt.parent = $(document.body);
				}
			}  
			if( !opt.parent ) {
				if( s.is(':hidden') ) {
					var p = s._display('nex-hide2display');
					opt.parent = s.offsetParent();//如果source的display 设置为 none 则会是返回body
					p._hidden('nex-hide2display');	
				} else {
					opt.parent = s.offsetParent();	
				}
			}
			//曾经在chrome下获取得到的是一个html
			opt.parent = opt.parent.is('html') ? $(document.body) : opt.parent;
			return self;
		},
		parseEl : function(){
			var self = this;
			var opt = self.configs;	
			if( opt.at === null ) {//at
				opt.at = opt.parent;
				if( opt.at.is('body') ) {
					opt.at = window;	
				}
			} else {
				if( $(opt.at).is('body') ) {
					opt.at = window;	
				}
			}
			opt.at = (opt.at === document) ? window : opt.at;
			return self;
		},
		sysEvents : function(){
			var self = this;
			var opt = self.configs;
			self.callParent(arguments);
			self.bind("onCreate",self._checkToShow,self);
			return self;
		},
		_checkToShow : function(){
			var self = this;
			var opt = self.configs;
			if( opt.autoShow ) {
				self.show();	
			}		
		},
		//获取 source元素的 offsetParent
		getRender : function(p){
			var self = this,undef;
			var opt = self.configs;
			var parent = p === undef ? opt.parent : $(p);
			if( parent.is('body') || parent.is('html') ) {//opt.el === window || 
				return window;	
			} else {
				return  parent[0];	
			}
		},
		//返回相对于parent(renderTo)的绝对位置
		getOffset : function(el){
			var self = this,undef;
			var opt = self.configs;	
			var renderTo = self.getRender();
	
			if( $._isPlainObject( el ) ) {
				el.left = el.left === undef ? 0 : el.left ;
				el.top = el.top === undef ? 0 : el.top ;
				//var offset = $.extend({},el);
				//已经指定了坐标 不需要在计算 
				//var sLeft = $(renderTo).scrollLeft();
				//var sTop = $(renderTo).scrollTop();
				//offset.left += sLeft;
				//offset.top += sTop;
				//return offset;
			}
			//Nex.isPlainObject
			
			if( $.isWindow(renderTo) ) {// === window
				if( Nex.isPlainObject( el ) ) {
					//el.left = el.left === undef ? 0 : el.left ;
					//el.top = el.top === undef ? 0 : el.top ;
					return $.extend({},el); 	
				}
				var offset = $(el).offset();//el是个纯对象时 会返回null
				var sLeft = $(window).scrollLeft();
				var sTop = $(window).scrollTop();
				//return !offset ? {left:sLeft,top:sTop} : offset;	
				return !offset ? {left:sLeft,top:sTop} : offset;	
			} else {
				var renderTo = $(renderTo);
				var sLeft = renderTo.scrollLeft();
				var sLeftBorder = parseFloat(renderTo.css('borderLeftWidth')) || 0;
				//sLeftBorder = isNaN( sLeftBorder ) ? 0 : sLeftBorder;
				var sLeftPadding = parseFloat(renderTo.css('paddingLeft')) || 0;
				//sLeftPadding = isNaN( sLeftPadding ) ? 0 : sLeftPadding;
				
				var sTop = renderTo.scrollTop();
				var sTopBorder = parseFloat(renderTo.css('borderTopWidth')) || 0;
				//sTopBorder = isNaN( sTopBorder ) ? 0 : sTopBorder;
				var sTopPadding = parseFloat(renderTo.css('paddingTop')) || 0;
				//sTopPadding = isNaN( sTopPadding ) ? 0 : sTopPadding;
				var offset = {
					left : 0,
					top : 0
				};
				//try {
					var rOffset = renderTo.offset();
					var eOffset = offset;	
					if( Nex.isPlainObject( el ) ) {
						eOffset = $.extend({}, el);
					} else {
						eOffset = $(el).offset() || offset;		
					}
					offset = {
						left : eOffset.left - rOffset.left - sLeftBorder - sLeftPadding,
						top : eOffset.top - rOffset.top - sTopBorder - sTopPadding
					};	
				//} catch(e){
					//..el 不是dom	
				//	sLeft = 0;
				//	sTop = 0;
				//}
				return {
					left : 	sLeft + offset.left,
					top : sTop + offset.top
				};
			}
		},
		//获取el[at]周围可显示空间
		getShowSpace : function(el,parent){
			var self = this,undef;
			var opt = self.configs;
			if( opt.at === undef && parent ) {
				el = parent;	
			}
			var el = self._undef(el,opt.at);
			var parent = self._undef(parent,opt.parent);
			//需要获取的对象
			var obj = $(el);
			
			var renderTo = self.getRender(parent);//getOffsetParent
			
			//获取窗口显示区域大小
			var cw = $(renderTo).width();
			var ch = $(renderTo).height();
			
			var offset = self.getOffset(el);
			
			//获取滚位置
			var sLeft = $(renderTo).scrollLeft();
			var sTop = $(renderTo).scrollTop();
			
			var space = {
				top : offset.top - sTop,
				left : offset.left - sLeft
			};
			space.bottom = ch - space.top - ( $._isPlainObject(el) ? 0 : obj._outerHeight() );
			space.right = cw - space.left - ( $._isPlainObject(el) ? 0 : obj._outerWidth() );
			
			return space;
		},
		/*
		*检测是否有足够的空间显示
		*@param a bottom top right left
		*@param el 
		*/
		checkSpace : function(a,s,e,r){
			var self = this;
			var opt = self.configs;	
			var space = self.getShowSpace();// opt.el,opt.parent
			if( space[a]<=0 ) return false;
			var _r = true;
			switch(a){
				case 'bottom':
					_r = s.height>space.bottom?false:true;
					break;
				case 'top' : 
					_r =  s.height>space.top?false:true;
					break;
				case 'right' :
					_r = s.width>space.right?false:true;
					break;
				case 'left' :
					_r = s.width>space.left?false:true;
					break;
			};
			return _r;
		},
		/*
		*根据当前的设置自动适配对应显示位置
		*/
		adaptRegion : function(s,e,r){
			var self = this;
			var opt = self.configs;	
			var zAlign = opt.zAlign.toLowerCase();
			var xAlign = opt.xAlign.toLowerCase();
			var yAlign = opt.yAlign.toLowerCase();
			var space = self.getShowSpace();
			
			var _r = self.fireEvent('onBeforeAdaptRegion',[/*xAlign,yAlign,zAlign,*/opt]);
			if( _r === false ) return false;
			if( zAlign==='y' ) {
				if( yAlign==='center' ) return;
				var sp = self.checkSpace(yAlign,s,e,r);
				if( sp === false ) {
					var _yAlign = yAlign==='bottom' ? 'top' : 'bottom';
					var sp = self.checkSpace(_yAlign,s,e,r);	
					if( sp ) {
						opt.yAlign = _yAlign;
					} else {
						if( space.bottom > space.top ) {
							opt.yAlign = 'bottom';	
						} else if( space.bottom < space.top ) {
							opt.yAlign = 'top';		
						} //===情况
						//opt.yAlign = space.bottom>=space.top?'bottom':'top';	
					}
				}
			} else {
				if( xAlign==='center' ) return;
				var sp = self.checkSpace(xAlign,s,e,r);
				if( sp === false ) {
					var _xAlign = xAlign==='right' ? 'left' : 'right';
					var sp = self.checkSpace(_xAlign,s,e,r);	
					if( sp ) {
						opt.xAlign = _xAlign;
					} else {
						if( space.left > space.right ) {
							opt.yAlign = 'left';	
						} else if( space.left < space.right ) {
							opt.yAlign = 'right';		
						} //===情况
						//opt.xAlign = space.left>=space.right?'left':'right';	
					}
				}	
			}	
			self.fireEvent('onAdaptRegion',[/*opt.xAlign,opt.yAlign,opt.zAlign,*/opt]);
		},
		/*是否出现水平滚动条*/ 
		//scrollHeight scrollWidth
		hasScrollBarX : function(el){
			return Nex.hasScroll(el,'left');
		},
		/*是否出现垂直滚动条*/
		hasScrollBarY : function(el){
			return Nex.hasScroll(el);
		},
		adaptPosition : function(pos){
			var self = this;
			var opt = self.configs;
			var renderTo = self.getRender();
			
			//if( !$.isWindow(renderTo) ) return pos;
			
			var winWidth = $(renderTo).width();
			var winHeight = $(renderTo).height();
			if( !$.isWindow(renderTo) ) {//用clientWidth
				var scrollbarSize = self.getScrollbarSize();
				if( self.hasScrollBarX(renderTo) ) {
					winHeight -= scrollbarSize.width;	
				}
				if( self.hasScrollBarY(renderTo) ) {
					winWidth -= scrollbarSize.height;	
				}
			}
			/*
			*有个小bug @已修正
			*如果renderTo 不是window时，应该判断renderTo 是否出现滚动条 然后winWidth - scrollBarWidth,winHeight - scrollBarWidth
			*/
			
			//获取滚位置
			var sLeft = $(renderTo).scrollLeft();
			var sTop = $(renderTo).scrollTop();
			var width = self.getWidth(opt.el);
			var height = self.getHeight(opt.el);
			var edge = opt.visibleEdge;//Number>0
			var edge_lt = opt.visibleEdgeLT;//top left 的edge
			//计算出 bottom right 的超出edge部分 eg 如果edge=5 计算出x=4那么可以得到4-5 = -1 超出-1px
			var x = winWidth + sLeft - pos.left - width;
			var y = winHeight + sTop - pos.top - height;
			//计算bottom right 的edge
			//x = x<0?x:0;
			//y = y<0?y:0;
			x = x<edge?x-edge:0;
			y = y<edge?y-edge:0;
			//计算 top left 的edge 此处的 edge_lt 可以换成 edge 
			pos.left = (pos.left + x - sLeft)<edge_lt?sLeft+edge_lt:(pos.left + x);
			pos.top = (pos.top + y - sTop)<edge_lt?sTop+edge_lt:(pos.top + y);
			
			self.fireEvent('onAdaptPosition',[pos,opt]);
			return pos;
		},
		getWidth : function(el){
			var self = this;
			var opt = self.configs;
			return $._isPlainObject(el) ? 0 : $(el)._outerWidth();
		},
		getHeight : function(el){
			var self = this;
			var opt = self.configs;
			return $._isPlainObject(el) ? 0 : $(el)._outerHeight();
		},
		/*
		*x_inner_top x_inner_bottom y_inner_left y_inner_right
		*/
		x_innerleft : function(s,e,r){
			var self = this;
			var opt = self.configs;
			return e.left + opt.offsetX;
		},
		x_innerright : function(s,e,r){//el ,at
			var self = this;
			var opt = self.configs;
			return e.left + ( e.width-s.width ) - opt.offsetX;
		},
		y_innertop : function(s,e,r){
			var self = this;
			var opt = self.configs;
			return e.top + opt.offsetY;
		},
		y_innerbottom : function(s,e,r){
			var self = this;
			var opt = self.configs;
			return e.top + ( e.height-s.height ) - opt.offsetY;
		},
		x_left : function(s,e,r){
			var self = this;
			var opt = self.configs;
			var zAlign = opt.zAlign.toLowerCase();
			return zAlign==='y' ? e.left + opt.offsetX : e.left-s.width - opt.offsetX ;
		},
		x_center : function(s,e,r){
			var self = this;
			var opt = self.configs;
			return e.left+(e.width-s.width)/2;
			//return (e.width-s.width)/2;
		},
		x_right : function(s,e,r){
			var self = this;
			var opt = self.configs;
			var zAlign = opt.zAlign.toLowerCase();
			return zAlign==='y' ? e.left + ( e.width-s.width ) - opt.offsetX : e.left+e.width + opt.offsetX ;
		},
		y_top : function(s,e,r){
			var self = this;
			var opt = self.configs;
			var zAlign = opt.zAlign.toLowerCase();
			return zAlign==='y' ? e.top-s.height - opt.offsetY : e.top-( s.height-e.height ) - opt.offsetY;
		},
		y_center : function(s,e,r){
			var self = this;
			var opt = self.configs;
			var zAlign = opt.zAlign.toLowerCase();
			return e.top+(e.height-s.height)/2;
			//return (e.height-s.height)/2;
		},
		y_bottom : function(s,e,r){
			var self = this;
			var opt = self.configs;
			var zAlign = opt.zAlign.toLowerCase();
			return zAlign==='y' ? e.top+e.height + opt.offsetY : e.top + opt.offsetY;
		},
		
		fixPosition : function(pos,opt){
			var self = this;
			
			/*if( opt.parent[0] !== document.body ) {
				if( $.support.boxModel == true ) {
					var _pos = $(opt.parent).offset();
					pos.left = pos.left- _pos.left;
					pos.top = pos.top- _pos.top;
				}
			}*/
			return pos;
		},
		unFixPosition : function(pos,opt){
			var self = this;
			/*if( opt.parent[0] !== document.body ) {
				if( $.support.boxModel == true ) {
					var _pos = $(opt.parent).offset();
					pos.left = pos.left + _pos.left;
					pos.top = pos.top + _pos.top;
				}
			}*/
			return pos;
		},
		getShowPos : function(){
			var self = this;
			var opt = self.configs;
			/*判断el是否隐藏*/
			var isHidden = opt.el.is(':hidden');
			var dp = null;
			if( isHidden ) {
				dp = opt.el._display('nex-hide2display');
			}
			//滚动位置
			var renderTo = self.getRender();
			var sLeft = $(renderTo).scrollLeft();
			var sTop = $(renderTo).scrollTop();
			var scrollPos = {
				left : sLeft,
				top : sTop
			};
			//源数据
			var source = self.getOffset(opt.el);
			source.width = self.getWidth( opt.el );
			source.height = self.getHeight( opt.el );
			//目标数据
			var target = self.getOffset(opt.at);
			target.width = self.getWidth( opt.at );
			target.height = self.getHeight( opt.at );
			//自动设置或获取显示方位
			if( opt.autoRegion ) {
				self.adaptRegion(source,target,scrollPos);
			}
			
			//获取显示位置
			var _func = function(func){
				var getPos = null;
				if( func in opt ) {
					getPos = opt[func];	
				} else if( func in self ) {
					getPos = self[func];		
				} else if( func in window ) {
					getPos = window[func];	
				} else {
					getPos = function(){return {left:0,top:0};};	
				}
				return getPos;
			}
			var x_func = 'x_'+opt.xAlign.toLowerCase();
			var y_func = 'y_'+opt.yAlign.toLowerCase();
			var pos = {
				left : _func(x_func).call(self,source,target,scrollPos),
				top : _func(y_func).call(self,source,target,scrollPos) 
			};
			var _pos = false;
			if( opt.visibleable ) {
				_pos = self.adaptPosition(pos);	
			}
			self.fireEvent("onGetPosition",[p,opt]);
			var p = _pos ? _pos : pos;
			//对显示坐标做最终检测
			p = self.fixPosition(p,opt);
			
			if( isHidden && dp ) {
				dp._hidden('nex-hide2display');
			}
			
			//位置的最后修改
			return p;
		},
		/*
		*显示到指定位置
		*@param left 可选,
		*@param top 可选
		*/
		showAtPos : function(left, top){},
		/*
		*@param el 可选 如果为可选 则默认使用opt.el
		*@param options 可选 显示参数
		*/
		showAtEl : function(el, options){},
		show : function(){
			var self = this,
				opt=this.configs;	
			//不建议在这里获取坐标
			//因为如果改变at的position为absolute时 source的位置会改变，使得showAt会出现错乱	
			//var pos = self.getShowPos();
			var r = self.fireEvent("onBeforeShow",[pos,opt]);
			if( r === false ) return false;
			var callBack = function(){
				self.fireEvent("onShow",[pos,opt]);	
			}
			if( $.isFunction(opt.animate) ) {
				var pos = self.getShowPos();//单独获取
				opt.animate.call(self,opt.el,pos,callBack);	
			} else {
				var src = $(opt.el);
				var position = $(opt.el).css('position');
				if( position === 'static' || position === 'relative' ) {
					//pos.position = 'absolute';
					src.css('position','absolute');
				}
				var pos = self.getShowPos();//单独获取
				src.css(pos).show();
				callBack();
			}
		}
	});
	$.fn.showAt = function(options,conf){
		var undef,opt;
		var conf = conf === undef ? {} : conf;
		if( options === undef ) {
			opt = {}	
		}else if( !$._isPlainObject(options) ) {
			opt = { at:options };	
			$.extend(opt,conf);
		} else {
			opt = 	options;
		}
		var list = [];
		this.each(function(){
			opt.el = $(this);
			opt.autoShow = true;
			var o = Nex.Create('showAt',opt);
			//o.show();
			list.push(o);
			//$(this).data('nex.showAt',o);
		});
		return list.length === 1 ? list[0] : list;
	};
	
	return showAt;
});	