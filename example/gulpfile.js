var gulp = require('gulp');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');

gulp.task('babel', function(){

    // var options = {};
    // // ie8 Object.defineProperty issues
    // // https://babeljs.io/docs/advanced/loose/#es6-modules
    // options.loose = ['es6.modules']
    // options.modules = 'amd';

    // gulp.src('src/**/*.js')
    // .pipe(babel(options))
    // .pipe(gulp.dest('build-amd/'));

});

gulp.task('browserify', function(){

    gulp.src('src/js/init.js')
    .pipe(browserify({debug: false}))
    .pipe(concat('init.js'))
    .pipe(uglify())
    .pipe(gulp.dest('public/js'));

});

gulp.task('dev',['browserify']);

gulp.task('watch', function(){
    gulp.watch('src/**/*.*', ['dev']);
});