var gulp = require('gulp');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var babel = requier('gulp-babel');

gulp.task('babel-amd', function(){

    var options = {};
    // ie8 Object.defineProperty issues
    // https://babeljs.io/docs/advanced/loose/#es6-modules
    options.loose = ['es6.modules']
    options.modules = 'amd';

    gulp.src('mini-mongoose/**/*.js')
    .pipe(babel(options))
    .pipe(gulp.dest('dist/'));

});

gulp.task('babel-common', function(){

    var options = {};
    // ie8 Object.defineProperty issues
    // https://babeljs.io/docs/advanced/loose/#es6-modules
    options.loose = ['es6.modules']
    options.modules = 'common';

    gulp.src('mini-mongoose/**/*.js')
    .pipe(babel(options))
    .pipe(gulp.dest('dist/'));

});

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



