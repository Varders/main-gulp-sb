let project_folder = "build";
let source_folder = "#src";

let fs = require('fs');

let path = {
	build:{
		html: project_folder+"/",
		css: project_folder+"/css",
		js: project_folder+"/js",
		img: project_folder+"/img",
		fonts: project_folder+"/fonts/",
	},
	src:{
		html: [source_folder+"/*.html", "!" + source_folder + "/_*.html"],
		css: source_folder+"/scss/main.scss",
		js: source_folder+"/js/script.js",
		img: source_folder+"/img/**/*.{jpg,png,svg,gif,ico,webp}",
		fonts: source_folder+"/fonts/*.ttf",
	},
	watch:{
		html: source_folder+"/**/*.html",
		css: source_folder+"/scss/**/*.scss",
		js: source_folder+"/js/**/*.js",
		img: source_folder+"/img/**/*.{jpg,png,svg,gif,ico,webp}",
	},
	clean:"./"+project_folder+"/"
}

let { src, dest } = require('gulp'),
	gulp = require('gulp'),
	browsersync = require('browser-sync').create(),
	fileinclude = require('gulp-file-include'),
	del = require('del'),
	scss = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	group_media = require('gulp-group-css-media-queries'),
	clean_css = require('gulp-clean-css'),
	rename = require('gulp-rename'),
	gulp_uglify = require('gulp-uglify'), // Работает
	imagemin = require('gulp-imagemin'),
	webp = require('gulp-webp'),
	webphtml = require('gulp-webp-html'),
	webpcss = require('gulp-webpcss'),
	ttf2woff = require('gulp-ttf2woff'),
	ttf2woff2 = require('gulp-ttf2woff2'),
	fonter = require('gulp-fonter');

function fonts(){
	src(path.src.fonts) 
		.pipe(ttf2woff())
		.pipe(dest(path.build.fonts));
	return src(path.src.fonts)
		.pipe(ttf2woff2())
		.pipe(dest(path.build.fonts));
}
	

function browserSync(){
	browsersync.init({
		server:{
			baseDir:"./"+project_folder+"/"
		},
		port: 3000,
		notify: false
	})
}

// Настройка HTML 
function html(){
	return src(path.src.html)
		.pipe(fileinclude())
		.pipe(webphtml())
		.pipe(dest(path.build.html))
		.pipe(browsersync.stream())
}

// Настройка IMG
function images(){
	return src(path.src.img)
		.pipe(webp({
			quality: 70
		})
		)

		.pipe(src(path.src.img))
		.pipe(
			imagemin({
				progressive: true,
				svgoPlugins: [{removeViewBox: false}],
				interaced: true,
				optimizationLevel: 3 // 0 to 7
			})
		)
		.pipe(dest(path.build.img))
		.pipe(browsersync.stream())
}

// Настройка js
function js(){
	return src(path.src.js)
	.pipe(fileinclude())
	.pipe(dest(path.build.js))
	.pipe(
		rename({
			extname: ".min.js"
		})
	)
	.pipe(gulp_uglify(/* options */))
	.pipe(dest(path.build.js))
	.pipe(browsersync.stream())

}



// Настройка css
function css(){
	return src(path.src.css)
		.pipe(
			scss({
				outputStyle: "expanded" // Развернутый
			})
		)
		.pipe(
			autoprefixer({
				overrideBrowserslist: ["last 5 versions"],
				cascade: true
			})
		)
		.pipe(
			group_media()
		)
		.pipe(webpcss())
		.pipe(dest(path.build.css))
		.pipe(
			clean_css()
		)
		.pipe(
			rename({
				extname: ".min.css"
			})
		)
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream())
}

// Из otf в ttf
gulp.task('otf2ttf', function() {
	return gulp.src([source_folder + '/fonts/*.otf'])
		.pipe(fonter({formats: ['ttf']}))
		.pipe(dest('#src/fonts/'));
})

// Файлы в live режиме
function watchFiles(){
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.css], css);
	gulp.watch([path.watch.js], js);
	gulp.watch([path.watch.img], images);

}

// Удаления файлов
function clean(){
	return del(path.clean);
}


let build = gulp.series(clean, gulp.parallel(html, css, js, images), fonts); 
let watch = gulp.parallel(browserSync, build, watchFiles);

exports.fonts = fonts;
exports.images = images;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;





