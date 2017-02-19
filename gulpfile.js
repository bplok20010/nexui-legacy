var gulp = require('gulp');
//var jshint = require('gulp-jshint');
var minifycss = require('gulp-minify-css');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task("sass", function(){
	return gulp.src('./themes/default/**/*.scss')
			.pipe(sass())
			.pipe(gulp.dest('./themes/default'));
});

gulp.task('default', ['sass'], function(){
	gulp.watch('./themes/default/**/*.scss', ['sass']);
});