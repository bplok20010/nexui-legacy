/*
* Region
* @author nobo
* @date 2016/9/13
*/
define(function(require){		
	var Nex = require('../Nex');
	var Container = require('../container/Container');

	var Region = Nex.define('Nex.layout.Region',{
		extend : 'Nex.container.Container',
		xtype : 'layoutregion',
		
		componentCls : 'nex-layoutregion',
		prefix : 'region-',
		
		config : function(opt){
			return {
				virtualScrollWrapper : false,
				
				autoScroll : false,
				/*
				onResize : function(){
					//test...
					console.log( this.position, 'resize ' )	
				},
				*/
				splitDragZIndex : 3,
				
				/**
				* 初始时设置布局位置
				* @type RegionMap : { north : LayoutRegion,south : LayoutRegion,east : LayoutRegion,west : LayoutRegion,center : LayoutRegion, }
				*/
				regions : null,
				
				/**
				 * 设置当前布局的方位
				 * 共有5个方位可设置：center north south west east
				 * 默认值：center
				 */
				position : 'center',
				/**
				* 布局块的宽度，当position=west|east有效
				*/
				width : '',
				/**
				* 布局块的高度，当position=north|south有效
				*/
				height : '',
				/**
				* 是否显示边框
				*/
				border : true,
				/**
				* 边框样式
				*/
				borderCls : 'nex-layout-border',
				/**
				* 是否显示分割线
				*/
				split : true,
				/**
				* 是否显示折叠按钮
				*/
				splitBtn : true,
				/**
				* 分割线宽度
				*/
				splitSize : 5,
				/**
				* 折叠状态
				*/
				collapsed : false
			};			
		},
		
		initComponent : function(){
			this._super(arguments);
			//设置布局块样式
			this.containerCls += ' nex-layout-region-' + this.position;
			
			var pos = this.position;
			if( pos == 'north' || pos == 'south' ) {
				this.width = '';	
				this.maxWidth = '';	
				this.minWidth = '';	
			}
			if( pos == 'east' || pos == 'west' ) {
				this.height = '';	
				this.maxHeight = '';
				this.minHeight = '';
			}
			if( pos == 'center' ) {
				this.width = '';
				this.height = '';
				this.maxHeight = '';
				this.minHeight = '';
				this.maxWidth = '';	
				this.minWidth = '';
				this.split = false;
			}
			
			this.hideFn = null;
			this.showFn = null;
		},
		
		onLayout : function(){
			this._super(arguments);
		},
		
		onContainerCreate : function(ct){
			this._super(arguments);
			
			//容器创建后创建分割线
			this.createSplitLine();
			
			if( this.regions ) {
				this.setRegionPos( this.regions );	
			}
			
		},
		
		onRenderData : function(){
			this._super(arguments);
			
			if( this.regions ) {
				this.setSplitPos();	
			}
			//对于autoHeight/Width时，在渲染数据后记录宽高缓存
			if( ( this.is('north') || this.is('south') ) && this.isAutoHeight() ) {
				this.checkSizeChange(true);	
			}
			if( ( this.is('west') || this.is('east') ) && this.isAutoWidth() ) {
				this.checkSizeChange(true);	
			}
		},
		
		initEvents : function(){
			this._super(arguments);
			
			this.setSplitDraggable();
		},
		
		setSplitDraggable : function(){
			var self = this;
			var id = this.id;
			var position = this.position;
			var $split = this.$split;
			var dist = {}, isMoving, $clone;
			
			if( this.split && $split ) {
				$split.off('.'+id);
				$split.on('mousedown.'+ id, function(e){
					var $doc = $(document);
					dist = {left:0, top : 0};
					isMoving = false;
					
					if( self.collapsed ) return;
					
					if( self.fireEvent('onBeforeSplitDrag', e, $split) === false ) return;
					
					$._save($(document.body), ['cursor']);
					$._save($split, ['zIndex']);
					
					document.body.style.cursor = Nex.contains(['north', 'south'], position) ? 'n-resize' : 'e-resize';
					
					$doc.disableSelection();
					//记录开始位置
					var start = {
						x : e.pageX,
						y : e.pageY	
					};
					//记录开始坐标
					var sPos = $split._position();
					
					$doc.on('mousemove.'+id, function(e){
						var _dist = {
							left : dist.left,
							top : dist.top	
						};
						dist.left = e.pageX - start.x;
						dist.top = e.pageY - start.y;
						
						if( !isMoving && !(Math.abs(dist.left) + Math.abs(dist.top))) {
							return;	
						}
						
						if( !isMoving ) {
							isMoving = true;
							self.fireEvent('onSplitDragStart', e, $split );
							$clone = $split.clone();
							$split.css('zIndex', self.splitDragZIndex);
							$split.after($clone);
						}
						
						var isHori = Nex.contains(['north', 'south'], position);
						var sProp = isHori ? 'top' : 'left';
						
						if( self.fireEvent('onSplitDrag', dist, e, $split) === false) {
							dist.left = _dist.left;
							dist.top = _dist.top;
							return;
						}
						
						var pos = {
							left : dist.left + sPos.left,
							top : dist.top + sPos.top
						};
						
						$split.css(sProp, pos[sProp]);
					});	
					
					$doc.one('mouseup.'+id, function(e){
						$doc.enableSelection();	
						$doc.off('.'+id);
						$._restore($(document.body), ['cursor']);
						$._restore($split, ['zIndex']);
						
						if( !isMoving ) return;
						
						$clone.remove();
						
						if( self.fireEvent('onSplitDragStop', dist, e, $split) === false ) {
							self.setSplitPos();	
						} else {
						
							if( Nex.contains(['north', 'south'], position) ) {
								if( Math.abs(dist.top) ) {
									if( position == 'south' ) dist.top *= -1;
									self.setHeight( self.getHeight() + dist.top );
								}
							} else {
								if( Math.abs(dist.left) ) {
									if( position == 'east' ) dist.left *= -1;
									self.setWidth( self.getWidth() + dist.left );
								}	
							}
							
						}
						
						self.fireEvent('onSplitDragEnd', dist, e, $split );
						
					});	
				});	
				
			}	
		},
		
		createSplitLine : function(){
			var self = this;
			var el = this.el;
			
			if( this.position == 'center' ) return null;
			
			if( this.$split ) return this.$split;
			
			if( this.split ) {
				var $split = $('<div class="nex-layout-split nex-layout-split-'+ this.position +'" id="'+this.id+'_split_'+ this.position +'" />');
				
				$split.on('click', function(e){
					if( e.isDefaultPrevented() ) return;
					self.fireEvent('onSplitClick', e);	
				});
				$split.on('dblclick', function(e){
					if( e.isDefaultPrevented() ) return;
					self.fireEvent('onSplitDblClick', e);	
				});
				$split.on('mouseover', function(e){
					if( e.isDefaultPrevented() ) return;
					self.fireEvent('onSplitOver', e);	
				});
				$split.on('mouseout', function(e){
					if( e.isDefaultPrevented() ) return;
					self.fireEvent('onSplitOut', e);	
				});
				
				if( this.splitBtn ) {
					var $splitBtn = $('<a href="javascript:void(0)" class="nex-layout-collapse-btn nex-layout-collapse-btn-'+this.position+'"></a>');
					$split.append($splitBtn);
					
					$splitBtn.on('click', function(e){
						e.preventDefault();
						self.fireEvent('onSplitBtnClick', e);	
					});
					$splitBtn.on('dblclick', function(e){
						e.preventDefault();
						self.fireEvent('onSplitBtnDblClick', e);	
					});
					$splitBtn.on('mouseover', function(e){
						e.preventDefault();
						self.fireEvent('onSplitBtnOver', e);	
					});
					$splitBtn.on('mouseout', function(e){
						e.preventDefault();
						self.fireEvent('onSplitBtnOut', e);	
					});
				}
				
				if( Nex.contains(['north', 'south'], this.position) ) {
					$split.css('height', this.splitSize);
				} else {
					$split.css('width', this.splitSize);	
				}
				
				el.after($split);
			}		
			
			this.$split = $split;
			
			this.fireEvent('onSplitCreate', $split);
			
			return this.$split;
		},
		
		getRegionWidth : function(){
			return this.collapsed ? 0 : this.getWidth();	
		},
		
		getRegionHeight : function(){
			return this.collapsed ? 0 : this.getHeight();	
		},
		/**
		* 根据不同的布局块返回相应的宽高，不能对center获取
		*/
		getRegionSize : function(){
			if( this.position == 'center' ) return null;
			
			return (Nex.contains(['north', 'south'], this.position) ? this.getRegionHeight() : this.getRegionWidth()) + (this.split ? this.splitSize : 0);	
		},
		/**
		* 设置布局块
		* RegionMap : { north : LayoutRegion,south : LayoutRegion,east : LayoutRegion,west : LayoutRegion,center : LayoutRegion, }
		* @param {RegionMap}
		*/
		setRegionPos : function(RegionMap){
			var region = this.position;
			var el = this.el;
			var pos = {
				top : '',
				left : '',
				right : '',
				bottom : ''	
			};
			
			//north south 不用处理
			switch( region ) {
				case 'east' : 
				case 'west' :
					pos[region == 'east' ? 'right' : 'left'] = 0;
					pos.top = RegionMap.north ? RegionMap.north.getRegionSize() : 0;
					pos.bottom = RegionMap.south ? RegionMap.south.getRegionSize() : 0;
					break;
				case 'north' : 
				case 'south' : 
					pos[region == 'north' ? 'top' : 'bottom'] = 0;
					pos.left = 0;
					pos.right = 0;
					break;		
				case 'center' :
					pos.top = RegionMap.north ? RegionMap.north.getRegionSize() : 0;
					pos.bottom = RegionMap.south ? RegionMap.south.getRegionSize() : 0;
					pos.right = RegionMap.east ? RegionMap.east.getRegionSize() : 0;
					pos.left = RegionMap.west ? RegionMap.west.getRegionSize() : 0;
					break;	
			}
			
			el.css(pos);
			//由于初始调用setRegionPos 还没有调用setSize或者没有执行doRenderData，所以高度无法确定，必须onRenderData后再调用setSplitPos
			if( !this.isInit() ) {
			
				this.setSplitPos();
			
			}
			
			return this;
		},
		/**
		* 设置分割线位置
		*/
		setSplitPos : function(){
			var region = this.position;
			var el = this.el;
			var $split = this.$split;
			var pos = {
				top : '',
				left : '',
				right : '',
				bottom : ''	
			};
			var sProp, sSize, isCollapsed = this.collapsed;
			
			switch( region ) {
				case 'east' : 
				case 'west' :
					pos.top = el.css('top');
					pos.bottom = el.css('bottom');
					sProp = region == 'east' ? 'right' : 'left';
					sSize = isCollapsed ? 0 : el.css('width');
					break;
				case 'north' : 
				case 'south' : 
					pos.left = 0;
					pos.right = 0;
					sProp = region == 'north' ? 'top' : 'bottom';
					sSize = isCollapsed ? 0 : el.css('height');
					break;	
			}
			
			if( this.split && $split ) {
				pos[sProp] = sSize;
				$split.css(pos);
			}	
		},
		is : function(region){
			return this.position === region;	
		},
		destroy : function(){
			this._super(arguments);
			
			if( this.$split ) this.$split.remove();
		}
	});
	
	return Region;
});