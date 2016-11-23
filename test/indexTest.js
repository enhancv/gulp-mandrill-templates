const assert = require('assert');
const File = require('vinyl');
const mandrill = require('mandrill-api/mandrill');
const mandrillTemplates = require('../');
const dotenv = require('dotenv');

dotenv.config({ silent: true });
let client;

describe('gulp-mandrill-templates', function() {
    before (function () {
        client = new mandrill.Mandrill(process.env.MANDRILL_KEY);
    });

    afterEach (function (done) {
        client.templates.delete({ name: 'test-template' }, () => done());
    });

    it('should add template', function (done) {
        const fakeFile = new File({
            path: '/tmp/test-template.html',
            contents: new Buffer('<html><body></body></html>')
        });
        const plugin = mandrillTemplates({ key: process.env.MANDRILL_KEY });

        plugin.write(fakeFile);

        plugin.once('data', function (file) {
            assert(file.isBuffer());
            assert.equal(file.contents.toString(), '<html><body></body></html>');

            client.templates.info(
                { name: 'test-template' },
                function (info) {
                    assert.equal(info.code, '<html><body></body></html>');
                    done();
                }
            );
        });
    });

    it('should update template', function (done) {
        const fakeFile = new File({
            path: '/tmp/test-template.html',
            contents: new Buffer('<html><body>changed</body></html>')
        });
        const plugin = mandrillTemplates({ key: process.env.MANDRILL_KEY });

        client.templates.add({ name: 'test-template', code: '<html><body>initial</body></html>' }, () => {
            plugin.write(fakeFile);

            plugin.once('data', function (file) {
                assert(file.isBuffer());
                assert.equal(file.contents.toString(), '<html><body>changed</body></html>');

                client.templates.info(
                    { name: 'test-template' },
                    function (info) {
                        assert.equal(info.code, '<html><body>changed</body></html>');
                        done();
                    }
                );
            });
        });
    });
});