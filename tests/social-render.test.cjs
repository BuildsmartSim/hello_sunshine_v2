const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const satori = require('satori').default;
const { Resvg } = require('@resvg/resvg-js');

const root = path.resolve(__dirname, '..');
const source = ts.transpileModule(fs.readFileSync(path.join(root, 'src/components/social/SunshineTemplate.tsx'), 'utf8'), {
    fileName: 'SunshineTemplate.tsx',
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const template = { exports: {} };
vm.runInNewContext(source, { exports: template.exports, require });
const logo = 'data:image/png;base64,' + fs.readFileSync(path.join(root, 'public/HSSLOGO black YELLOW.png')).toString('base64');
const font = fs.readFileSync(path.join(root, 'src/app/_fonts/Chicle-Regular.ttf'));

// Embed the real logo to exercise the template without network access.
function localAssets(element) {
    if (!React.isValidElement(element)) return element;
    const children = element.props.children;
    return React.cloneElement(element, {
        ...(element.type === 'img' ? { src: logo } : {}),
        children: Array.isArray(children) ? children.map(localAssets) : localAssets(children),
    });
}

for (const style of ['festival', 'announcement']) {
    for (const photo of [false, true]) {
        test(`social ${style} template renders a 1080px PNG with ${photo ? 'photo' : 'gradient'} background`, async () => {
            const element = template.exports.SunshineTemplate({
                style,
                headline: 'Sunshine & Friends <script>fixture</script>',
                body: 'Sauna, community & fresh air',
                ...(photo ? { bgImageUrl: logo } : {}),
            });
            const svg = await satori(localAssets(element), {
                width: 1080, height: 1080,
                fonts: [{ name: 'Chicle', data: font, weight: 400, style: 'normal' }],
            });
            assert.ok(svg.includes(logo), 'the logo must be embedded');
            assert.ok(!svg.includes('<script>'), 'headline text must not become SVG markup');
            const image = new Resvg(svg).render();
            assert.equal(image.width, 1080);
            assert.equal(image.height, 1080);
            assert.deepEqual(image.asPng().subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
        });
    }
}
