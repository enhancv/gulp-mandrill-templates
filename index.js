const mandrill = require('mandrill-api/mandrill');
const through = require('through2');
const gutil = require('gulp-util');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

module.exports = function (options) {
    const client = new mandrill.Mandrill(options.key);

    return through.obj(function(file, encoding, next) {
        const code = file.contents.toString();
        const subject = /<title>(.*?)<\/title>/.test(code)
            ? entities.decode(code.match(/<title>(.*?)<\/title>/)[1])
            : '';
        const name = file.stem;

        client.templates.info(
            { name: name },
            function (info) {
                if (info.code == code) {
                    gutil.log(gutil.colors.cyan("[skip]"), name);
                    next(null, file);
                } else {
                    client.templates.update(
                        { name: name, code: code, publish: true, subject: subject },
                        function (result) {
                            gutil.log(gutil.colors.green("[update]"), file.stem);
                            next(null, file);
                        }
                    );
                }
            },
            function (error) {
                if (error.name === 'Unknown_Template') {
                    client.templates.add(
                        { name: name, code: code, publish: true, subject: subject },
                        function () {
                            gutil.log(gutil.colors.green("[add]"), name);
                            next(null, file);
                        }
                    );
                } else {
                    throw error;
                }
            }
        );
    });
};
