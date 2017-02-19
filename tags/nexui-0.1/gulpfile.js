var gulp = require('gulp');
//var jshint = require('gulp-jshint');
var minifycss = require('gulp-minify-css');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
//var jsdoc = require('gulp-jsdoc');
// 语法检查
var base = 'src/';
var dist = 'src/';
var css = 'themes/default/';
gulp.task('default', ['core', 'loader', 'css', 'min_all']);
gulp.task('core', function () {
	//console.log( jshint() );
    return gulp.src([
			base + '/core/Extend.js',//jquery 插件
			base + '/core/Nex.js', //Nex库
			base + '/core/Base.js', //类核心
			base + '/core/Class.js',//继承核心
			base + 'EventObject.js',//事件类
			base + 'ComponentManager.js',//实例管理
			base + 'AbstractComponent.js',//
			//base + 'Loader.js',//加载器 加载器单独出来了 使用requirejs
			//base + '/util/SubmitForm.js',//Ajax
			//base + 'Ajax.js',//Ajax
			base + 'Component.js',
			base + '/core/intro.js', //Nex库
			//base + '/core/outro.js', //Nex库
			//base + 'Separator.js',
		])
		//.pipe(uglify())
        .pipe(concat('Nex.dev.js'))
		.pipe(gulp.dest(dist))
		.pipe(uglify())
		.pipe(rename('Nex.js'))
        .pipe(gulp.dest(dist));
});
gulp.task('min_all', function () {
	//console.log( jshint() );
    return gulp.src([
			'./nex-all.js',//jquery 插件
		])
		.pipe(uglify())
		.pipe(rename('nex-all-min.js'))
        .pipe(gulp.dest('.'));
});
gulp.task('form', function () {
	return gulp.src([
			base + '/form/Manager.js',
			base + '/util/Validate.js',
			base + '/mixins/DropDown.js',
			base + '/form/AbstractForm.js',
			base + '/form/Display.js',
			base + '/form/Text.js',
			base + '/form/Trigger.js',
			base + '/form/Select.js',
			base + '/form/Textarea.js',
			base + '/form/Hidden.js',
			base + '/form/Password.js',
			base + '/form/ComboBox.js',
			base + '/form/Radio.js',
			base + '/form/Checkbox.js',
			base + '/form/SingleCheckbox.js',
		])
		//.pipe(uglify())
        .pipe(concat('Form.js'))
		.pipe(gulp.dest(dist))
		.pipe(uglify())
		.pipe(rename('Form.min.js'))
        .pipe(gulp.dest(dist));
});
gulp.task('loader', function () {
	return gulp.src([
			base + '/require.js',
			base + '/Loader.js',
		])
		//.pipe(uglify())
        .pipe(concat('../loader.dev.js'))
		.pipe(gulp.dest(dist))
		.pipe(uglify())
		.pipe(rename('../loader.js'))
        .pipe(gulp.dest(dist));
});
gulp.task('css', function (s) {
	gulp.src([
			css + '/nexBase.css',
			css + '/progressbar/ProgressBar.css',
			css + '/menu/nexMenu.css',
			css + '/layout/layout.css',
			css + '/buttons/nexButton.css',
			css + '/form/form.css',
			css + '/showat/nexShowAt.css',
			css + '/date/Calendar.css',
			css + '/panel/Panel2.css',
			css + '/pager/Pager.css',
			css + '/grid/absgrid.css',
			css + '/grid/Grid.css',
			css + '/accordion/Accordion.css',
			css + '/tab/SimpleTab.css',
			css + '/tab/Tab.css',
			css + '/tree/Tree.css',
			css + '/window/Window2.css',
			css + '/tooltip/ToolTip.css',
		])
        .pipe(concat('nex.dev.css'))
		.pipe(gulp.dest(css))
		.pipe(minifycss())
		.pipe(rename('nex.css'))
        .pipe(gulp.dest(css));
	//移动 图片	
		return gulp.src([
			css + '/**/images/*.png',
			css + '/**/images/*.gif',
			css + '/**/images/*.jpg',
		])
		.pipe(rename({dirname: ''}))  
		.pipe(gulp.dest(css+'/images'));
});
gulp.task('docs', function () {
	return gulp.src([
			base + '/*.js'
		])
		//template
		.pipe(jsdoc('./documentation-output'))
});
/*
// 合并文件之后压缩代码
gulp.task('minify', function (){
     return gulp.src('src/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('dist'))
        .pipe(uglify())
        .pipe(rename('all.min.js'))
        .pipe(gulp.dest('dist'));
});

// 监视文件的变化
gulp.task('watch', function () {
    gulp.watch('src/*.js', ['jshint', 'minify']);
});

// 注册缺省任务
gulp.task('default', ['jshint', 'minify', 'watch']);*/