/**
* Layout
* @author nobo
* @date 2016/9/13
*/
define(function(require){
	var Nex = require('../Nex');
	var Container = require('../container/Container');
	var LayoutRegion = require('./LayoutRegion');
	
	var Layout = Nex.define('Nex.layout.Layout',{
		extend : 'Nex.container.Container',
		alias : 'Nex.Layout',
		xtype : 'layout',
		
		componentCls : 'nex-layout',
		prefix : 'layout-',
		
		config : function(opt){
			return {
				autoRenderData : false,
				virtualScrollWrapper : false,
				autoScroll : false,
				layouts : ['north', 'south', 'east', 'west'],
				width : '100%',
				height : '100%',
				animCollapse : true,//动画形式折叠
				animCollapseDuration : 200,//动画形式折叠
				animCollapseEasing : 'swing',// linear swing easeOutQuad easeOutCirc
				animExpandFn : null,
				animCollapseFn : null,
				/**
				* 双击分割线开启折叠功能
				*/
				dblclickToCollapse : true,
				/**
				* 默认配置信息
				*/
				defaults : {},
				_north : {
					height : 80
				},
				_south : {
					height : 40
				},
				_east : {
					width : 80
				},
				_west : {
					width : 160
				},
				_center : {},
				/**
				* 布局配置信息
				*/
				north : {},
				south : {},
				east : {},
				west : {},
				center : {}
			};			
		},
		
		initComponent : function(){
			this._super(arguments);
			
			this.regions = {
				north : null,
				south : null,
				east : null,
				west : null,
				center : null	
			};
			
			this.width = this.width || '100%';
			this.height = this.height || '100%';
		},
		//渲染布局时，设置body
		onRender : function(){
			this._super(arguments);
			
			this.initLayoutBody();
		},
		//覆盖父类渲染过程
		doRenderData : function(){
			this.initLayoutRegion();
		},
		
		$body : null,
		
		initLayoutBody : function(){
			var el = this.el;
			
			var bd = $( '<div class="nex-layout-body" id="'+this.id+'_body" />' );
			this.$body = bd;
			
			el.append(bd);
			
			this.initLayoutBody = Nex.noop;
	
		},
		
		getBody : function(){
			return this.$body;	
		},
		/**
		* 设置布局位置和大小
		*/
		setViewSize : function(){
			this._super(arguments);
			//这个判断可以不用，在首次调用setViewSize时，regions还没有创建的
			if( !this._isInitLayoutRegion ) return;
			
			this.updateRegionPos();	
		},
		
		updateRegionPos : function(){
			var regions = this.regions;
			
			Nex.each( regions, function(region){
				region && region.setRegionPos( regions );	
			} );	
		},
		
		updateRegionSize : function(){
			var regions = this.regions;
			
			Nex.each( regions, function(region){
				region && region.isAcceptResize() && region.resize();	
			} );	
		},
		
		updateRegionPosAndSize : function(){
			this.updateRegionPos();
			this.updateRegionSize();	
		},
		
		_isInitLayoutRegion : false,
		
		initLayoutRegion : function(){
			var self = this;
			var layouts = this.layouts;
			var $body = this.getBody();
			var regions = this.regions;
			
			if( Nex.contains( layouts, 'north' ) ) {
				this.createRegion('north');
			}
			
			if( Nex.contains( layouts, 'south' ) ) {
				this.createRegion('south');
			}
			
			if( Nex.contains( layouts, 'east' ) ) {
				this.createRegion('east');
			}
			
			if( Nex.contains( layouts, 'west' ) ) {
				this.createRegion('west');
			}
			
			this.createRegion('center');
			
			this._isInitLayoutRegion = true;	
			
			//注意：
			//问题
			//布局创建完成后，各个布局其实没有设置位置，宽高也就没有拉伸，
			//一旦设置updateRegionPos那么容器的宽度会相应拉伸，这个时候应该再调用updateRegionSize触发布局块的resize
			//所以这里的createRegion会执行2次resize
			//解决方案，在创建时在onContainerCreate就更新当前的布局，但是必须先竖后横再中的顺序创建eg: north south west east center
			//如此就不再需要调用updateRegionPos
			//this.updateRegionPos();
			
			this.initLayoutRegion = Nex.noop;
		},
		
		getRegionConfig : function(region){
			return Nex.extend({}, this.defaults || {}, this['_'+region], this[region]);
		},
		
		createRegion : function(region, cfg){
			var self = this;
			var regions = this.regions;
			var layouts = ['center', 'north', 'south', 'west', 'east'];
			
			if( !Nex.contains(layouts, region) ) throw new TypeError('TypeError: region not in '+ layouts.join(',') );
			
			if( !this.isRendered() ) {
				this[region] = Nex.extend( this[region], cfg || {} );
				return null;	
			}
			
			if( regions[region] ) return regions[region];
			
			var width, cWidth, height, cHeight, $body = this.getBody();
			
			function onSplitDragStart(){
				var region = self.getRegion('center');
				
				if( !region ) return;
				
				cWidth = region.getWidth();
				cHeight = region.getHeight();	
				
				width = this.getWidth();
				height = this.getHeight();
			}
			
			function onSplitDrag(dist){
				if( region == 'north' ) {
					if( dist.top > 0 && Math.abs(dist.top) > cHeight ) dist.top = cHeight;
					if( dist.top < 0 && Math.abs(dist.top) > height ) dist.top = -height;
				}
				if( region == 'south' ) {
					if( dist.top < 0 && Math.abs(dist.top) > cHeight ) dist.top = -cHeight;
					if( dist.top > 0 && Math.abs(dist.top) > height ) dist.top = height;
				}
				if( region == 'west' ) {
					if( dist.left > 0 && Math.abs(dist.left) > cWidth ) dist.left = cWidth;
					if( dist.left < 0 && Math.abs(dist.left) > width ) dist.left = -width;
				}
				if( region == 'east' ) {
					if( dist.left < 0 && Math.abs(dist.left) > cWidth ) dist.left = -cWidth;
					if( dist.left > 0 && Math.abs(dist.left) > width ) dist.left = width;
				}
			}
			
			function onSplitDragEnd(){
				self.updateRegionPosAndSize();
			}
			
			function onCreate(){
				if( this.collapsed && !this.is('center') ) {
					self.doCollapse(this, false);	
				}
			}
			
			function onSplitBtnClick(e){
				self.toggle(this.position);
			}
			
			function onSplitDblClick(e){
				if( self.dblclickToCollapse )
					self.toggle(this.position);
			}
			
			var opt = Nex.extend(this.getRegionConfig(region), cfg || {}, {
				renderTo : $body,
				position : region,
				regions : regions,
				'onSplitDragStart._rgn_' : onSplitDragStart,
				'onSplitDrag._rgn_' : onSplitDrag,
				'onSplitDragEnd._rgn_' : onSplitDragEnd,
				'onCreate._rgn_' : onCreate,
				'onSplitBtnClick._rgn_' : onSplitBtnClick,
				'onSplitDblClick._rgn_' : onSplitDblClick
			});
			
			regions[region] = LayoutRegion.create(opt);
			
			//对于单独通过API创建布局时 则需要重新刷新布局，因为API的调用不一定是按照一定顺序创建的
			if(this._isInitLayoutRegion) {
				this.updateRegionPosAndSize();	
			}
			
			self.fireEvent('onRegionCreate', region, regions[region]);
			
			return regions[region];
		},
		
		removeRegion : function(region){
			var self = this;
			var regions = this.regions;
			
			if( regions[region] && region !== 'center' ) {
				regions[region].destroy();	
				regions[region] = null;
				
				this.updateRegionPosAndSize();	
				
				self.fireEvent('onRegionRemove', region, regions[region]);
			}
			
			return true;
		},
		
		getRegion : function(region){
			return this.regions[region];
		},
		
		getRegionEl : function(region){
			var rgn = this.getRegion(region);
			return rgn ? rgn.el : rgn;	
		},
		
		doExpand : function(layout, anim){
			var self = this;
			var anim = Nex.unDefined(anim, this.animCollapse);
			var deferred = $.Deferred();
			var isHori = Nex.contains(['west', 'east'], layout.position),
				sProp = {
					north : 'top',
					south : 'bottom',
					west : 'left',
					east : 'right'	
				},animPorps = {
					opacity : 1
				};
			
			function cb(){
				self.updateRegionPosAndSize();
				deferred.resolveWith( self, [layout]);	
				
				if( layout.$split )
					layout.$split.removeClass('nex-layout-split-collapsed nex-layout-split-'+layout.position+'-collapsed');
			}
			
			if( !anim ) {
				layout.show();
				cb();
			} else {
				if( this.animExpandFn && Nex.isFunction(this.animExpandFn) ) {
					this.animExpandFn( layout, cb );
				} else {
					layout.show();
					layout.el.css('opacity', 0);
					animPorps[ sProp[layout.position] ] = 0;
					layout.el
						.css(sProp[layout.position], isHori ? -layout.getWidth() : -layout.getHeight())
						.stop(true, true)
						.animate(animPorps, this.animCollapseDuration, this.animCollapseEasing, function(){
							cb();	
						});	
				}
			}
			
			layout.collapsed = false;	
			
			return deferred.promise();	
		},
		
		doCollapse : function(layout, anim){
			var self = this;
			var anim = Nex.unDefined(anim, this.animCollapse);
			var deferred = $.Deferred();
			var isHori = Nex.contains(['west', 'east'], layout.position),
				sProp = {
					north : 'top',
					south : 'bottom',
					west : 'left',
					east : 'right'	
				},animPorps = {
					opacity : 0
				};
			
			function cb(){
				deferred.resolveWith( self, [layout]);	
				if( layout.$split )
					layout.$split.addClass('nex-layout-split-collapsed nex-layout-split-'+layout.position+'-collapsed');
			}
			
			if( !anim ) {
				layout.hide();
				cb();
			} else {
				if( this.animCollapseFn && Nex.isFunction(this.animCollapseFn) ) {
					this.animCollapseFn( layout, cb );
				} else {
					layout.setAcceptResize(false);
					animPorps[ sProp[layout.position] ] = isHori ? -layout.getWidth() : -layout.getHeight();
					layout.el
						.css(sProp[layout.position], 0)
						.stop(true, true)
						.animate(animPorps, this.animCollapseDuration, this.animCollapseEasing, function(){
							layout.hide();
							cb();
						});	
				}
			}
			
			layout.collapsed = true;
			
			this.updateRegionPosAndSize();
			
			return deferred.promise();		
		},
		
		expand : function(region, anim){
			var self = this;
			var layout = this.getRegion(region);
			if( !layout || layout.is('center') ) return this;
			
			if(self.fireEvent('onBeforeExpand', region, layout) === false) return false;
			
			var defer = this.doExpand( layout, anim );
			
			defer.done(function(){
				self.fireEvent('onExpand', region, layout);
			});
			
			return defer;	
		},
		
		collapse : function(region, anim){
			var self = this;
			var layout = this.getRegion(region);
			if( !layout || layout.is('center') ) return this;
			
			if(self.fireEvent('onBeforeCollapse', region, layout) === false) return false;
			
			var defer = this.doCollapse( layout, anim );
			
			defer.done(function(){
				self.fireEvent('onCollapse', region, layout);
			});
			
			return defer;	
		},
		
		toggle : function(region, anim){
			var layout = this.getRegion(region); 	
			if( !layout ) return this;
			
			return this[ layout.collapsed ? 'expand' : 'collapse' ](region, anim);
		}
	});
	
	return Layout;	
});