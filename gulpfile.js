var gulp = require('gulp'),
	sass = require('gulp-sass'),
	browserSync = require('browser-sync').create(),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglifyjs'),
	cssnano = require('gulp-cssnano'),
	rename = require('gulp-rename'),
	del = require('del'),
	imagemin = require('gulp-imagemin'),
	pngquant = require('imagemin-pngquant'),
	cache = require('gulp-cache'),
	autoprefixer = require('gulp-autoprefixer'),
	pug = require('gulp-pug');

gulp.task('sass', function () {
	return gulp.src('app/sass/**/*.sass')
		.pipe(concat('main.sass'))
		.pipe(sass())
		.pipe(autoprefixer(['last 15 versions', '>1%', 'ie 8', 'ie 7']))
		.pipe(gulp.dest('app/build/static/css'))
		.pipe(browserSync.reload({ stream: true }))
});

gulp.task('pug', function () {
	return gulp.src('app/pug/pages/*')
		.pipe(pug({ pretty: true }))
		.pipe(gulp.dest('app/build'));
});

//transform jquery.js to min.js
gulp.task('scripts', function () {
	return gulp.src([
		'app/build/static/libs/jquery/dist/jquery.min.js',
		'app/build/static/libs/magnific-popup/dist/jquery.magnific-popup.min.js',
	])
		.pipe(concat('libs.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('app/build/static/js'));
});

//Сompression libs css
gulp.task('css-libs', function () {
	return gulp.src('app/build/static/css/libs.css')
		.pipe(cssnano())
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('dist/build/static/css'));
});

//Reload browser
gulp.task('browser-sync', function () {
	browserSync.init({
		server: {
			baseDir: 'app/build'
		},
		notify: false
	});
	browserSync.watch('app', browserSync.reload);
});

//Image
gulp.task('clear', function () {
	return cache.clearAll();
});

gulp.task('img', function () {
	return gulp.src('app/build/static/img/**/*')
		.pipe(cache(imagemin({
			interlaced: true,
			progressive: true,
			svgoPlugins: [{ removeViewBox: false }],
			use: [pngquant()]
		})))
		.pipe(gulp.dest('dist/build/static/img'));
});

//Clean build
gulp.task('clean', function () {
	return del.sync('dist');
});

gulp.task('watch', function () {
	gulp.watch('app/sass/*.sass', gulp.series('sass'));
	gulp.watch('app/build/static/js/**/*.js', gulp.series('scripts'));
	gulp.watch('app/pug/**/*.pug', gulp.series('pug'));
});

gulp.task('default', gulp.series(
	gulp.parallel('sass', 'pug'),
	gulp.parallel('browser-sync', 'watch')
));

//////
gulp.task('build', function () {
	var buildCss = gulp.src([
		'app/build/static/css/min.css',
		'app/build/static/css/libs.min.css',
	])
		.pipe(gulp.dest('dist/build/css'));

	var buildFonts = gulp.src('app/build/static/fonts/**/*')
		.pipe(gulp.dest('dist/build/fonts'));

	var buildJs = gulp.src('app/build/static/js/**/*')
		.pipe(gulp.dest('dist/build/js'));

	var boildHtml = gulp.src('app/build/*.html')
		.pipe(gulp.dest('dist/build'));
});

//Update or create dist
gulp.task('dist', gulp.series(
	gulp.parallel('pug', 'scripts',
		gulp.series('clean', 'img'),
		gulp.series('sass', 'css-libs')
	),
	gulp.series('build')
));