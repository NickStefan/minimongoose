var gulp = require('gulp');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

gulp.task('browserify', function(){

    /* example init */
    gulp.src('src/js/init.js')
    .pipe(browserify({debug: true}))
    .pipe(concat('init.js'))
    //.pipe(uglify())
    .pipe(gulp.dest('public/js'));

});

gulp.task('dev',['browserify']);

gulp.task('watch', function(){
    gulp.watch('dev/**/*.*', ['dev']);
});



