var gulp = require('gulp');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('browserify', function(){

    gulp.src('src/js/init.js')
    .pipe(browserify({debug: false}))
    .pipe(concat('init.js'))
    .pipe(uglify())
    .pipe(gulp.dest('public/js'));

});

gulp.task('default',['browserify']);

gulp.task('watch', function(){
    gulp.watch('src/**/*.*', ['default']);
});