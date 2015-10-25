var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');

gulp.task('babel-common', function(){

    var options = {};
    // ie8 Object.defineProperty issues
    // https://babeljs.io/docs/advanced/loose/#es6-modules
    options.loose = ['es6.modules']
    options.modules = 'common';

    gulp.src('src/**/*.js')
    .pipe(babel(options))
    .pipe(gulp.dest('build/'));

});

gulp.task('default',['babel-common']);

gulp.task('watch', function(){
    gulp.watch('src/**/*.*', ['default']);
});



