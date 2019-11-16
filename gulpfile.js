//Подключаем gulp
const gulp = require('gulp');
//Объединение файлов
const concat = require('gulp-concat');
//Добавление префиксов
const autoprefixer = require('gulp-autoprefixer');
//Оптимизация стилей
const cleanCSS = require('gulp-clean-css');
//Оптимизация скриптов
const uglify = require('gulp-uglify-es').default;
//Удаление файлов
const del = require('del');
//Синхронизация с браузером
const browserSync = require('browser-sync').create();
//Для препроцессоров стилей
const sourcemaps = require('gulp-sourcemaps');
//Sass препроцессор
const sass = require('gulp-sass');
//Оптимизация картинок
const imagemin = require('gulp-imagemin');
//Оптимизация HTML
const htmlmin = require('gulp-htmlmin');

//Порядок подключения файлов со стилями
const styleFiles = [
	'./src/sass/main.+(scss|sass)'
];
//Порядок подключения js файлов
const scriptFiles = [
	'./src/js/main.js'
];

//Task для обработки HTML
gulp.task('html', () => {
	return gulp.src('src/*.html')
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(gulp.dest('build/'));
});

//Task для обработки стилей
gulp.task('styles', () => {
	//Шаблон для поиска файлов CSS
	//Всей файлы по шаблону './src/css/**/*.css'
	return gulp.src(styleFiles)
		.pipe(sourcemaps.init())
		//Указать stylus() , sass() или less()
		.pipe(sass({
			includePaths: require('node-normalize-scss').includePaths
		}))
		//Объединение файлов в один
		.pipe(concat('style.min.css'))
		//Добавить префиксы
		.pipe(autoprefixer())
		//Минимизация CSS
		.pipe(cleanCSS({compatibility: 'ie8'}))
		.pipe(sourcemaps.write('./'))
		//Выходная папка для стилей
		.pipe(gulp.dest('./build/css'))
		.pipe(browserSync.stream());
});

//Task для обработки скриптов
gulp.task('scripts', () => {
	//Шаблон для поиска файлов JS
	//Всей файлы по шаблону './src/js/**/*.js'
	return gulp.src(scriptFiles)
		//Объединение файлов в один
		.pipe(concat('script.min.js'))
		.pipe(sourcemaps.init())
		//Минимизация JS
		.pipe(uglify())
		//Source maps
		.pipe(sourcemaps.write('./'))
		//Выходная папка для скриптов
		.pipe(gulp.dest('./build/js'))
		.pipe(browserSync.stream());
});

//Task для очистки папки build
gulp.task('del', () => {
	return del(['build/*'])
});

//Task для сжатия images
gulp.task('img-compress', () => {
	return gulp.src('./src/images/+(icon|img)')
		.pipe(imagemin({
			progressive: true
		}))
		.pipe(gulp.dest('./build/images'))
});

//Task для отслеживания изменений в файлах
gulp.task('watch', () => {
	browserSync.init({
		server: {
			baseDir: "build"
		}
	});
	gulp.watch("./src/*.html").on('change', browserSync.reload);
	//Следить за картинками
	gulp.watch('./src/images/**', gulp.parallel('img-compress'))
	//Следить за файлами со стилями с нужным расширением
	gulp.watch('./src/sass/**/*.+(scss|sass|css)', gulp.parallel('styles'))
	//Следить за JS файлами
	gulp.watch('./src/js/**/*.js', gulp.parallel('scripts'))
	//При изменении HTML запустить синхронизацию
	gulp.watch("./src/*.html").on('change', gulp.parallel('html'));
});

//Task по умолчанию, Запускает del, html, styles, scripts, img-compress и watch
gulp.task('default', gulp.series('del', gulp.parallel('html', 'styles', 'scripts', 'img-compress'), 'watch'));