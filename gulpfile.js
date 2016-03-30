// -----------------------------------
// ------------ VARIABLES ------------
// -----------------------------------

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var es = require('event-stream');
var bowerFiles = require('main-bower-files');
var browserSync = require('browser-sync');
var del = require('del');
var runSequence = require('run-sequence');

// -----------------------------------
// ------------- PATHS ---------------
// -----------------------------------

var DEV_FOLDER = 'dist.dev';

var sourcePaths = {
	fonts: 'app/fonts/**/*',
	images: 'app/images/**/*',
	pages: ['app/**/*.jade', '!app/**/_*.jade'],
	all_pages: 'app/partials/*.jade',
	scripts: 'app/js/**/*.js',
	styles: '**/*.scss',
	stylesFolder: 'app/sass/'
}

var devPaths = {
	fontsFolder: DEV_FOLDER + '/fonts/',
	imagesFolder: DEV_FOLDER + '/images/',
	main: DEV_FOLDER,
	pages: DEV_FOLDER + '/*.html',
	scriptsFolder: DEV_FOLDER + '/js/',
	stylesFolder: DEV_FOLDER + '/css/',
	scripts: DEV_FOLDER + '/js/**/*.js',
	styles: DEV_FOLDER + '/css/**/*.css'
}
 
// -----------------------------------
// ------------- PIPES ---------------
// -----------------------------------

var pipes = {};

pipes.assembleFonts = function() {
	console.log("Carrying fonts into the dev folder...");
	return gulp.src(sourcePaths.fonts)
				.pipe(gulp.dest(devPaths.fontsFolder));
}

pipes.fontAwesome = function() {
	console.log("Copying font awesome...");
	return gulp.src("bower_components/font-awesome/fonts/**.*")
				.pipe(gulp.dest(devPaths.fontsFolder));
}

pipes.assembleJS = function() {
	console.log('Assembling app.js...');
	return gulp.src(sourcePaths.scripts)
				.pipe(plugins.concat('app.js'))
				.pipe(gulp.dest(devPaths.scriptsFolder));
}

pipes.assembleVendorJS = function() {
	console.log('Assembling vendor.js...');
	return gulp.src(bowerFiles("**/*.js"))
				.pipe(plugins.concat('vendor.js'))
				.pipe(gulp.dest(devPaths.scriptsFolder));
}

pipes.assembleVendorCSS = function() {
	console.log("Assembling vendor.css...");
	return gulp.src(bowerFiles("**/*.css").concat(["app/bower/jquery-ui/themes/base/jquery-ui.css", "app/bower/select2/dist/css/select2.css"]))
				.pipe(plugins.concat('vendor.css'))
				.pipe(gulp.dest(devPaths.stylesFolder));
}

pipes.assembleImages = function() {
	console.log("Assembling images...");
	return gulp.src(sourcePaths.images)
				.pipe(plugins.imagemin({
					progressive: true,
					interlaced: true
				}))
				.pipe(gulp.dest(devPaths.imagesFolder));
}

pipes.compileSASS = function() {
	console.log("Compiling main.scss...");
	return gulp.src("app/sass/main.scss")
				.pipe(plugins.plumber())
				.pipe(plugins.compass({
					config_file: 'config.rb',
					css: devPaths.stylesFolder,
					sass: sourcePaths.stylesFolder
				}))
				.pipe(gulp.dest(devPaths.stylesFolder));
}

pipes.compileJADE = function() {
	console.log("Compiling .jade files...");
	var YOUR_LOCALS = {};
	return gulp.src(sourcePaths.pages)
				.pipe(plugins.jade({
					locals: YOUR_LOCALS,
					pretty: '\t'
				}))
				.pipe(gulp.dest(devPaths.main))
}

pipes.injectDev = function() {
	console.log("Injecting dependencies...");
	return es.merge(pipes.assembleFonts(), pipes.compileJADE()
				.pipe(plugins.inject(pipes.assembleVendorJS(), {read: false, relative: true, name: 'vendor'}))
				.pipe(plugins.inject(pipes.assembleJS(), {read: false, relative: true, name: 'custom'}))
				.pipe(plugins.inject(es.merge(pipes.compileSASS(), pipes.assembleVendorCSS()), {read: false, relative: true}))
				.pipe(gulp.dest(DEV_FOLDER)));
}

pipes.devServer = function() {
	browserSync({
		port: 9000,
		server: {
		  baseDir: DEV_FOLDER
		}
	});
	gulp.watch(sourcePaths.scripts, pipes.assembleJS);
	gulp.watch(sourcePaths.styles, pipes.compileSASS);
	gulp.watch(sourcePaths.all_pages, pipes.injectDev);
	gulp.watch([
		devPaths.pages,
		devPaths.scripts,
		devPaths.styles
	]).on('change', browserSync.reload);
}

// -----------------------------------
// ------------- TASKS ---------------
// -----------------------------------

gulp.task('fonts', pipes.assembleFonts);
gulp.task('js', pipes.assembleJS);
gulp.task('vendorjs', pipes.assembleVendorJS);
gulp.task('vendorcss', pipes.assembleVendorCSS);
gulp.task('sass', pipes.compileSASS);
gulp.task('jade', pipes.compileJADE);
gulp.task('inject', pipes.injectDev);
gulp.task('server', pipes.devServer);
gulp.task('images', pipes.assembleImages);
gulp.task('fontawesome', pipes.fontAwesome);

gulp.task('clean-dev', function() {
	return del(DEV_FOLDER);
});

gulp.task('default', function() {
	runSequence(
		'clean-dev',
		['js', 'vendorjs', 'images', 'fontawesome'],
		'inject',
		'server'
	);
});