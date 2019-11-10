//Подключаем галп
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

//Порядок подключения файлов со стилями
const styleFiles = [
	'./src/scss/main.scss'
]
//Порядок подключения js файлов
const scriptFiles = [
	'./src/js/main.js'
]

//Таск для обработки стилей
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
		.pipe(autoprefixer({
			cascade: false
		}))
		//Минимизация CSS
		.pipe(cleanCSS({
			level: 2
		}))
		.pipe(sourcemaps.write('./'))
		//Выходная папка для стилей
		.pipe(gulp.dest('./build/css'))
		.pipe(browserSync.stream());
});

//Таск для обработки скриптов
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

//Таск для очистки папки build
gulp.task('del', () => {
	return del(['build/*'])
});

//
gulp.task('img-compress', () => {
	return gulp.src('./src/img/**')
		.pipe(imagemin({
			progressive: true
		}))
		.pipe(gulp.dest('./build/img'))
});

//Таск для отслеживания изменений в файлах
gulp.task('watch', () => {
	browserSync.init({
		server: {
			baseDir: "./"
		}
	});
	//Следить за картинками
	gulp.watch('./src/img/**', gulp.series('img-compress'))
	//Следить за файлами со стилями с нужным расширением
	gulp.watch('./src/scss/**/*.scss', gulp.series('styles'))
	//Следить за JS файлами
	gulp.watch('./src/js/**/*.js', gulp.series('scripts'))
	//При изменении HTML запустить синхронизацию
	gulp.watch("./*.html").on('change', browserSync.reload);
});

//Таск по умолчанию, Запускает del, styles, scripts и watch
gulp.task('default', gulp.series('del', gulp.parallel('styles', 'scripts', 'img-compress'), 'watch'));