# Publish html files as mandrill templates

Will publish html files as mandrill templates, using the filename stem (without extension) as the name of the template

## Install

```
npm install gulp-mandrill-templates
```

## Usage
```
const gulpMandrillTemplates = require('gulp-mandrill-templates');

gulp.task('publish', function () {
	return gulp.src('dist/**/*.html')
		.pipe(gulpMandrillTemplates({ key: process.env.MANDRILL_KEY }))
		.pipe(gulp.dest('dist'));
});
```