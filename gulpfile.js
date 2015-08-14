var gulp = require('gulp'),
    rigger = require('gulp-rigger'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    uglify = require('gulp-uglify'),
    opn = require('opn'),
    connect = require('gulp-connect'),
    less = require('gulp-less');

// Переменная с указанием всех необходимых путей
var path = {
  build: { //Тут мы укажем куда складывать готовые после сборки файлы
    html: 'build/',
    js: 'build/js/',
    css: 'build/css/',
    img: 'build/img/',
    fonts: 'build/fonts/'
  },
  src: { //Пути откуда брать исходники
    html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
    js: 'src/js/main.js',//В стилях и скриптах нам понадобятся только main файлы
    style: 'src/style/main.less',
    img: 'src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
    fonts: 'src/fonts/**/*.*'
  },
  watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
    html: 'src/**/*.html',
    js: 'src/js/**/*.js',
    style: 'src/style/**/*.less',
    img: 'src/img/**/*.*',
    fonts: 'src/fonts/**/*.*'
  },
  clean: './build'
};

// Запуск локального сервера
gulp.task('connect', function() {
  connect.server( {
    root: 'build',
    livereload: true,
    port: 8888
  });
  opn('http://localhost:8888');
})

// Сборка html
gulp.task('html:build', function () {
  gulp.src(path.src.html) //Выберем файлы по нужному пути
    .pipe(rigger()) //Прогоним через rigger
    .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
    .pipe(connect.reload()); //И перезагрузим наш сервер для обновлений
});

// Сборка css
gulp.task('style:build', function () {
  gulp.src(path.src.style) //Выберем наш main.less
    .pipe(sourcemaps.init()) //То же самое что и с js
    .pipe(less()) //Скомпилируем
    .pipe(autoprefixer()) //Добавим вендорные префиксы
    .pipe(cssmin()) //Сожмем
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.css)) //И в build
    .pipe(connect.reload());
});

// Сборка js
gulp.task('js:build', function () {
  gulp.src(path.src.js) //Найдем наш main файл
    .pipe(rigger()) //Прогоним через rigger
    .pipe(sourcemaps.init()) //Инициализируем sourcemap
    .pipe(uglify()) //Сожмем наш js
    .pipe(sourcemaps.write()) //Пропишем карты
    .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
    .pipe(connect.reload());
});

// Оптимизация изображений
gulp.task('image:build', function () {
  gulp.src(path.src.img) //Выберем наши картинки
    .pipe(imagemin({ //Сожмем их
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()],
      interlaced: true
    }))
    .pipe(gulp.dest(path.build.img)) //И бросим в build
    .pipe(connect.reload());
});

// Копирование шрифтов в production-версию
gulp.task('fonts:build', function() {
  gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts))
});

// Задача Build
gulp.task('build', [
  'html:build',
  'js:build',
  'style:build',
  'fonts:build',
  'image:build'
]);

// Отслеживание изменений в файлах
gulp.task('watch', function(){
  gulp.watch(path.watch.html,['html:build'])
  gulp.watch(path.watch.style,['style:build'])
  gulp.watch(path.watch.js,['js:build'])
  gulp.watch(path.watch.img,['image:build'])
  gulp.watch(path.watch.fonts,['fonts:build'])
})

// Задача по умолчанию
gulp.task('default', ['connect', 'build', 'watch']);