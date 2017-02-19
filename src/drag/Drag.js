/**
@draggable
*/
define(function(require, exports, module){
var Nex = require('../Nex');
var mouse = require('../mixin/_mouse');

var EventObject = require('../EventObject');


var drag = Nex.define('Nex.drag.Drag', [EventObject, mouse], {
	/** @private */
	alias : 'Nex.Drag',
	/** @private */
	xtype : 'drag',
	
	config : function(){
		return {
			/**
			 * 需要拖拽的元素
			 * @type {(jQuery|Element|Selector)}
			 */
			el : null,
			/**
			 * 初始时给元素添加样式
			 * @type {String} -多个样式用空格分割
			 */
			addClasses : '',
			/**
			* 当拖拽时，draggable 助手（helper）要追加到哪一个元素。
			* @type {(jQuery|Element|Selector|String)}
			* - jQuery
			*	一个 jQuery 对象，包含助手（helper）要追加到的元素。
			* - Element
			*	要追加助手（helper）的元素。
			* - Selector
			*	一个选择器，指定哪一个元素要追加助手（helper）。
			* - String
			*	字符串 "parent" 将促使助手（helper）成为 draggable 的同级。
			* @default "parent"
			*/
			appendTo : 'parent',
			/**
			 * 约束在水平轴 (x) 或垂直轴 (y) 上拖拽。可能的值："x", "y"。
			 */
			axis : false,
			/**
			 * 防止从指定的元素上开始拖拽。
			 */
			cancel : "input, textarea, button, select, option",
			/**
			* 约束在指定元素或区域的边界内拖拽。
			* @type {(Selector|Element|String|Array)}
			* - Selector
			*	可拖拽元素将被包含在 selector 第一个元素的边界内。如果未找到元素，则不设置 containment。 
			* - Element
			*	可拖拽元素将被韩寒在元素的边界。
			* - String
			*	可能的值："parent"、"document"、"window"。
			* - Array
			*	一个数组， 以形式 [ x1, y1, x2, y2 ] 定义元素的边界。
			*/
			containment : false,
			/**
			 * 拖拽操作期间的 CSS 光标。
			 */
			cursor : 'auto',
			/**
			 * 设置拖拽助手（helper）相对于鼠标光标的偏移:{ top, left, right, bottom }。
			 * @type {object}
			 */
			cursorAt : false,
			/**
			 * 鼠标按下后直到拖拽开始为止的时间，以毫秒计。该选项可以防止点击在某个元素上时不必要的拖拽。
			 */
			delay : 0,
			/**
			 * 如果设置为 true，则禁用该 draggable。
			 */
			disabled : false,
			/**
			 * 鼠标按下后拖拽开始前必须移动的距离，以像素计。该选项可以防止点击在某个元素上时不必要的拖拽。
			 * @type {Number}
			 */
			distance : 1,
			/**
			* 如果指定了该选项，则限制开始拖拽，除非鼠标在指定的元素上按下。只有可拖拽（draggable）元素的后代元素才允许被拖拽。
			* @type {(Selector|Element)}
			*/
			handle : false,
			handleCls : '',
			/**
			* 允许一个 helper 元素用于拖拽显示。
			* @type {(String|Function)}
			* 	- String 如果设置为 "clone"，元素将被克隆，且克隆将被拖拽。
			*	- Function 一个函数，将返回拖拽时要使用的 DOMElement。
			*/
			helper : "original",
			/**
			* 防止拖拽期间 iframes 捕捉鼠标移动（mousemove ）事件。在与 cursorAt 选项结合使用时，或鼠标光标未覆盖在助手（helper）上时，非常有用。
			* @type {(Boolean|Selector)}
			* 	- Boolean 当设置为 true 时，透明遮罩将被放置在页面上所有 iframes 上。
			*	- Selector 匹配 selector 的任意 iframes 将被透明遮罩覆盖。
			*/
			iframeFix : false,
			/**
			 * 当被拖拽时助手（helper）的不透明度。
			 */
			opacity : false,
			revert: false,
			revertDuration: 500,
			revertEasing: 'swing',
			/**
			 * 当被拖拽时，助手（helper）的 Z-index。
			 */
			zIndex : false
		};
	}		
});

drag.override({
	constructor : function() {
		var self = this;
		
		self._super(arguments);
		
		self.el = $(self.el);
		
		self.element = this.el;
		
		if( !self.el.length ) return;
		
		if ( self.helper === "original" ) {
			this._setPositionRelative();
		}
		if (self.addClasses){
			self.el.addClass(self.addClasses);
		}
		
		this._setHandleClassName();

		this._mouseInit();
	},
	
	_setPositionRelative: function() {
		if ( !( /^(?:r|a|f)/ ).test( this.el.css( "position" ) ) ) {
			this.el[ 0 ].style.position = "relative";
		}
	},
	
	_setHandleClassName: function() {
		this.handleEl = this.handle ?
			this.el.find( this.handle ) : this.el;
		this.handleEl.addClass( this.handleCls );
	},
	
	_removeHandleClassName : function(){
		this.handleEl.removeClass( this.handleCls );	
	},
	
	_blurActiveElement : function(){
		var document = this.document[ 0 ];

		// Only need to blur if the event occurred on the draggable itself, see #10527
		if ( !this.handleEl.is( event.target ) ) {
			return;
		}

		// support: IE9
		// IE9 throws an "Unspecified error" accessing document.activeElement from an <iframe>
		try {

			// Support: IE9, IE10
			// If the <body> is blurred, IE will switch windows, see #9520
			if ( document.activeElement && document.activeElement.nodeName.toLowerCase() !== "body" ) {

				// Blur any element that currently has focus, see #4261
				$( document.activeElement ).blur();
			}
		} catch ( error ) {}	
	},
	
	_mouseCapture: function(event) {

		this._blurActiveElement( event );

		// among others, prevent a drag on a resizable-handle
		if (this.helperEl || this.disabled) {
			return false;
		}

		//Quit if we're not on a valid handle
		this.hasHandle = this._getHandle(event);
		if (!this.hasHandle) {
			return false;
		}

		if(this.fireEvent('onBeforeDrag', event) === false) return false;
		
		this.onBeforeDrag(event);

		this._blockFrames( this.iframeFix === true ? "iframe" : this.iframeFix );

		return true;

	},
	
	_mouseStart: function(event) {
		
		this.helperEl = this._createHelper(event);
		
		//Cache the helper size
		this._cacheHelperProportions();
		
		//Cache the margins of the original element
		this._cacheMargins();
		
		this.cssPosition = this.helperEl.css( "position" );
		this.scrollParent = this.helperEl.scrollParent( true );
		this.offsetParent = this.helperEl.offsetParent();
		//this.cssPosition = this.helperEl.css( "position" );
		//this.offsetParent = this.helperEl.offsetParent();
		//this.scrollParent = this.cssPosition === "relative" ? this.helperEl.parent() : this.offsetParent;
		
		this.positionAbs = this.el.offset();
		this._refreshOffsets( event );
		
		this.originalPosition = this.position = this._generatePosition(event, false);
		this.originalPageX = event.pageX;
		this.originalPageY = event.pageY;
		
		(this.cursorAt && this._adjustOffsetFromHelper(this.cursorAt));
		
		//Recache the helper size
		this._cacheHelperProportions();
		
		this._mouseDrag(event, true);
		
		this.fireEvent('onStartDrag', event);
		
		this.onStartDrag(event);
		
	},
	
	_mouseDrag: function(event, noPropagation) {
		//onDrag
		
		this.position = this._generatePosition(event, true);
		this.positionAbs = this._convertPositionTo("absolute");
		
		if( !noPropagation ) {
			if( this.fireEvent('onDrag', event, this._uiHash()) === false ) {
				return false;	
			}
		}
		
		this.onDrag(event, this._uiHash());
			
		this.helperEl[ 0 ].style.left = this.position.left + "px";
		this.helperEl[ 0 ].style.top = this.position.top + "px";
		
		return false;
	},
	
	_mouseStop: function(event) {
		
		//If we are using droppables, inform the manager about the drop
		var that = this;

		if (this.revert === true || (Nex.isFunction(this.revert) && this.revert.call(this.el))) {
			$(this.helperEl).animate(this.originalPosition, parseInt(this.revertDuration, 10), this.revertEasing, function() {
				that.onStopDrag(event);
				that.fireEvent('onStopDrag', event);
				that._clear();
			});
		} else {
			this.onStopDrag(event);
			this.fireEvent('onStopDrag', event);
			this._clear();
		}

		return false;
	},
	
	_mouseUp: function( event ) {
		this._unblockFrames();

		// Only need to focus if the event occurred on the draggable itself, see #10527
		if ( this.handleEl.is( event.target ) ) {
			// The interaction is over; whether or not the click resulted in a drag, focus the element
			this.el.focus();
		}

		return mouse._mouseUp.call(this, event);
	},
	
	_createHelper : function(event){
		var o = this,
			helperIsFunction = Nex.isFunction( o.helper ),
			helper = helperIsFunction ?
				$( o.helper.apply( this.el[ 0 ], [ event, this ] ) ) :
				( o.helper === "clone" ?
					this.el.clone().removeAttr( "id" ) :
					this.el );

		if (!helper.parents("body").length) {
			helper.appendTo((o.appendTo === "parent" ? this.el[0].parentNode : o.appendTo));
		}

		// http://bugs.jqueryui.com/ticket/9446
		// a helper function can return the original element
		// which wouldn't have been set to relative in _create
		if ( helperIsFunction && helper[ 0 ] === this.el[ 0 ] ) {
			this._setPositionRelative();
		}

		if (helper[0] !== this.el[0] && !(/(fixed|absolute)/).test(helper.css("position"))) {
			helper.css("position", "absolute");
		}

		return helper;	
	},
	
	_cacheMargins: function() {
		this.margins = {
			left: (parseInt(this.el.css("marginLeft"), 10) || 0),
			top: (parseInt(this.el.css("marginTop"), 10) || 0),
			right: (parseInt(this.el.css("marginRight"), 10) || 0),
			bottom: (parseInt(this.el.css("marginBottom"), 10) || 0)
		};
	},
	
	_setContainment: function() {

		var isUserScrollable, c, ce,
			o = this,
			document = this.document[ 0 ];

		this.relativeContainer = null;

		if ( !o.containment ) {
			this.containment = null;
			return;
		}

		if ( o.containment === "window" ) {
			this.containment = [
				$( window ).scrollLeft() - this.offset.relative.left - this.offset.parent.left,
				$( window ).scrollTop() - this.offset.relative.top - this.offset.parent.top,
				$( window ).scrollLeft() + $( window ).width() - this.helperProportions.width - this.margins.left,
				$( window ).scrollTop() + ( $( window ).height() || document.body.parentNode.scrollHeight ) - this.helperProportions.height - this.margins.top
			];
			return;
		}

		if ( o.containment === "document") {
			this.containment = [
				0,
				0,
				$( document ).width() - this.helperProportions.width - this.margins.left,
				( $( document ).height() || document.body.parentNode.scrollHeight ) - this.helperProportions.height - this.margins.top
			];
			return;
		}

		if ( o.containment.constructor === Array ) {
			this.containment = o.containment;
			return;
		}

		if ( o.containment === "parent" ) {
			o.containment = this.helper[ 0 ].parentNode;
		}

		c = $( o.containment );
		ce = c[ 0 ];

		if ( !ce ) {
			return;
		}

		isUserScrollable = /(scroll|auto)/.test( c.css( "overflow" ) );

		this.containment = [
			( parseInt( c.css( "borderLeftWidth" ), 10 ) || 0 ) + ( parseInt( c.css( "paddingLeft" ), 10 ) || 0 ),
			( parseInt( c.css( "borderTopWidth" ), 10 ) || 0 ) + ( parseInt( c.css( "paddingTop" ), 10 ) || 0 ),
			( isUserScrollable ? Math.max( ce.scrollWidth, ce.offsetWidth ) : ce.offsetWidth ) -
				( parseInt( c.css( "borderRightWidth" ), 10 ) || 0 ) -
				( parseInt( c.css( "paddingRight" ), 10 ) || 0 ) -
				this.helperProportions.width -
				this.margins.left -
				this.margins.right,
			( isUserScrollable ? Math.max( ce.scrollHeight, ce.offsetHeight ) : ce.offsetHeight ) -
				( parseInt( c.css( "borderBottomWidth" ), 10 ) || 0 ) -
				( parseInt( c.css( "paddingBottom" ), 10 ) || 0 ) -
				this.helperProportions.height -
				this.margins.top -
				this.margins.bottom
		];
		this.relativeContainer = c;
	},
	
	_cacheHelperProportions: function() {
		this.helperProportions = {
			width: this.helperEl.outerWidth(),
			height: this.helperEl.outerHeight()
		};
	},
	
	_refreshOffsets: function( event ) {
		this.offset = {
			top: this.positionAbs.top - this.margins.top,
			left: this.positionAbs.left - this.margins.left,
			scroll: false,
			parent: this._getParentOffset(),
			relative: this._getRelativeOffset()
		};
		
		this.offset.click = {
			left: event.pageX - this.offset.left,
			top: event.pageY - this.offset.top
		};
	},
	
	_getParentOffset: function() {

		//Get the offsetParent and cache its position
		var po = this.offsetParent.offset(),
			document = this.document[ 0 ];

		// This is a special case where we need to modify a offset calculated on start, since the following happened:
		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
		if (this.cssPosition === "absolute" && this.scrollParent[0] !== document && $.contains(this.scrollParent[0], this.offsetParent[0])) {
			po.left += this.scrollParent.scrollLeft();
			po.top += this.scrollParent.scrollTop();
		}

		if ( this._isRootNode( this.offsetParent[ 0 ] ) ) {
			po = { top: 0, left: 0 };
		}

		return {
			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0),
			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0)
		};

	},
	
	_getRelativeOffset: function() {
		if ( this.cssPosition !== "relative" ) {
			return { top: 0, left: 0 };
		}

		var p = this.element.position(),
			scrollIsRootNode = this._isRootNode( this.scrollParent[ 0 ] );

		return {
			top: p.top - ( parseInt(this.helperEl.css( "top" ), 10) || 0 ) + ( !scrollIsRootNode ? this.scrollParent.scrollTop() : 0 ),
			left: p.left - ( parseInt(this.helperEl.css( "left" ), 10) || 0 ) + ( !scrollIsRootNode ? this.scrollParent.scrollLeft() : 0 )
		};
	},
	
	_convertPositionTo: function(d, pos) {

		if (!pos) {
			pos = this.position;
		}

		var mod = d === "absolute" ? 1 : -1,
			scrollIsRootNode = this._isRootNode( this.scrollParent[ 0 ] );

		return {
			top: (
				pos.top	+																// The absolute mouse position
				this.offset.relative.top * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.top * mod -										// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.offset.scroll.top : ( scrollIsRootNode ? 0 : this.offset.scroll.top ) ) * mod)
			),
			left: (
				pos.left +																// The absolute mouse position
				this.offset.relative.left * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.left * mod	-										// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.offset.scroll.left : ( scrollIsRootNode ? 0 : this.offset.scroll.left ) ) * mod)
			)
		};

	},
	
	_generatePosition: function( event, constrainPosition ) {

		var containment, co, top, left,
			o = this.options,
			scrollIsRootNode = this._isRootNode( this.scrollParent[ 0 ] ),
			pageX = event.pageX,
			pageY = event.pageY;

		// Cache the scroll
		if ( !scrollIsRootNode || !this.offset.scroll ) {
			this.offset.scroll = {
				top: this.scrollParent.scrollTop(),
				left: this.scrollParent.scrollLeft()
			};
		}
		
		/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */

		// If we are not dragging yet, we won't check for options
		if ( constrainPosition ) {
			if ( this.containment ) {
				if ( this.relativeContainer ){
					co = this.relativeContainer.offset();
					containment = [
						this.containment[ 0 ] + co.left,
						this.containment[ 1 ] + co.top,
						this.containment[ 2 ] + co.left,
						this.containment[ 3 ] + co.top
					];
				} else {
					containment = this.containment;
				}

				if (event.pageX - this.offset.click.left < containment[0]) {
					pageX = containment[0] + this.offset.click.left;
				}
				if (event.pageY - this.offset.click.top < containment[1]) {
					pageY = containment[1] + this.offset.click.top;
				}
				if (event.pageX - this.offset.click.left > containment[2]) {
					pageX = containment[2] + this.offset.click.left;
				}
				if (event.pageY - this.offset.click.top > containment[3]) {
					pageY = containment[3] + this.offset.click.top;
				}
			}

			if (o.grid) {
				//Check for grid elements set to 0 to prevent divide by 0 error causing invalid argument errors in IE (see ticket #6950)
				top = o.grid[1] ? this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1] : this.originalPageY;
				pageY = containment ? ((top - this.offset.click.top >= containment[1] || top - this.offset.click.top > containment[3]) ? top : ((top - this.offset.click.top >= containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

				left = o.grid[0] ? this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0] : this.originalPageX;
				pageX = containment ? ((left - this.offset.click.left >= containment[0] || left - this.offset.click.left > containment[2]) ? left : ((left - this.offset.click.left >= containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
			}

			if ( o.axis === "y" ) {
				pageX = this.originalPageX;
			}

			if ( o.axis === "x" ) {
				pageY = this.originalPageY;
			}
		}
		
		return {
			top: (
				pageY -																	// The absolute mouse position
				this.offset.click.top	-												// Click offset (relative to the element)
				this.offset.relative.top -												// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.top +												// The offsetParent's offset without borders (offset + border)
				( this.cssPosition === "fixed" ? -this.offset.scroll.top : ( scrollIsRootNode ? 0 : this.offset.scroll.top ) )
			),
			left: (
				pageX -																	// The absolute mouse position
				this.offset.click.left -												// Click offset (relative to the element)
				this.offset.relative.left -												// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.left +												// The offsetParent's offset without borders (offset + border)
				( this.cssPosition === "fixed" ? -this.offset.scroll.left : ( scrollIsRootNode ? 0 : this.offset.scroll.left ) )
			)
		};

	},
	
	_getHandle: function(event) {
		return this.handle ?
			!!$( event.target ).closest( this.el.find( this.handle ) ).length :
			true;
	},
	//?
	_isRootNode: function( element ) {
		return ( /(html|body)/i ).test( element.tagName ) || element === this.document[ 0 ];
	},
	
	_adjustOffsetFromHelper: function(obj) {
		if (typeof obj === "string") {
			obj = obj.split(" ");
		}
		if ($.isArray(obj)) {
			obj = { left: +obj[0], top: +obj[1] || 0 };
		}
		if ("left" in obj) {
			this.offset.click.left = obj.left + this.margins.left;
		}
		if ("right" in obj) {
			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
		}
		if ("top" in obj) {
			this.offset.click.top = obj.top + this.margins.top;
		}
		if ("bottom" in obj) {
			this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
		}
	},
	
	_blockFrames: function( selector ) {
		this.iframeBlocks = this.document.find( selector ).map(function() {
			var iframe = $( this );

			return $( "<div>" )
				.css( "position", "absolute" )
				.appendTo( iframe.parent() )
				.outerWidth( iframe.outerWidth() )
				.outerHeight( iframe.outerHeight() )
				.offset( iframe.offset() )[ 0 ];
		});
	},

	_unblockFrames: function() {
		if ( this.iframeBlocks ) {
			this.iframeBlocks.remove();
			delete this.iframeBlocks;
		}
	},
	
	_clear: function() {
		if (this.helperEl[0] !== this.el[0]) {
			this.helperEl.remove();
		}
		this.helperEl = null;
	},
	
	_uiHash: function() {
		return {
			helper: this.helperEl,
			position: this.position,
			originalPosition: this.originalPosition,
			offset: this.offset
		};
	},
	
	onDestroy : function(){
		this._super(arguments);
		this._removeHandleClassName();
		this._mouseDestroy();	
	},
	
	onBeforeDrag : function(event){},
	
	onStartDrag : function(event){
		this._setCursor();
		this._setOpacity();	
		this._setZIndex();	
	},
	
	onDrag : function(event, ui){},
	
	onStopDrag : function(event){
		this._resetCursor();	
		this._resetOpacity();
		this._resetZIndex();		
	},
	
	_setCursor : function(){
		if( this.cursor === false ) return;
		var t = $( "body" );
		if (t.css("cursor")) {
			this._cursor = t.css("cursor");
		}
		t.css("cursor", this.cursor);	
	},
	
	_resetCursor : function(){
		if (this._cursor) {
			$("body").css("cursor", this._cursor);
			this._cursor = null;
		}
	},
	
	_setOpacity : function(){
		if( this.opacity === false ) return;
		var t = $( this.helperEl );
		if (t.css("opacity")) {
			this._opacity = t.css("opacity");
		}
		t.css("opacity", this.opacity);	
	},
	
	_resetOpacity : function(){
		if (this._opacity) {
			$(this.helperEl).css("opacity", this._opacity);
			this._opacity = null;
		}	
	},
	
	_setZIndex : function(){
		if( this.zIndex === false ) return;
		var t = $( this.helperEl );
		if (t.css("zIndex")) {
			this._zIndex = t.css("zIndex");
		}
		t.css("zIndex", this.zIndex);	
	},
	
	_resetZIndex : function(){
		if (this._zIndex) {
			$(this.helperEl).css("zIndex", this._zIndex);
			this._zIndex = null;
		}	
	}
	
});

return drag;
});