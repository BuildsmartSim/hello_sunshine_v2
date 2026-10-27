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

for (const style of ['festival', 'announcement']) {
    test(`authorized ${style} image route renders with local fonts and fixture storage`, async () => {
        let storedPng;
        const route = { exports: {} };
        const compiled = ts.transpileModule(fs.readFileSync(path.join(root, 'src/app/api/social/generate-image/route.ts'), 'utf8'), {
            compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
        }).outputText;
        const stubs = {
            '@/lib/auth': { requireAdmin: async () => ({ authorized: true }) },
            '@/lib/site-origin': { getSiteOrigin: () => 'https://fixture.invalid' },
            '@/components/social/SunshineTemplate': template.exports,
            satori: async (element, options) => {
                assert.deepEqual(Array.from(options.fonts, font => font.name), ['Chicle', 'Inter']);
                for (const font of options.fonts) assert.ok(Buffer.isBuffer(font.data));
                return satori(localAssets(element.type(element.props)), options);
            },
            '@supabase/supabase-js': { createClient: () => ({ storage: { from: bucket => {
                assert.equal(bucket, 'social-images');
                return {
                    upload: async (_name, png, options) => { storedPng = png; assert.equal(options.contentType, 'image/png'); return { error: null }; },
                    getPublicUrl: () => ({ data: { publicUrl: 'https://fixture.invalid/image.png' } }),
                };
            } } }) },
        };
        vm.runInNewContext(compiled, {
            exports: route.exports, console,
            require: name => name in stubs ? stubs[name] : require(name),
            process: { cwd: () => root, env: { NEXT_PUBLIC_SUPABASE_URL: 'https://fixture.invalid', SUPABASE_SERVICE_ROLE_KEY: 'fixture-only' } },
            fetch: async () => { throw new Error('Fonts must be loaded locally'); },
        });
        const response = await route.exports.POST(new Request('https://fixture.invalid/api/social/generate-image', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ style, headline: 'Hello Sunshine', body: 'Sauna & community' }),
        }));
        assert.equal(response.status, 200);
        assert.equal((await response.json()).url, 'https://fixture.invalid/image.png');
        assert.equal(storedPng.readUInt32BE(16), 1080);
        assert.equal(storedPng.readUInt32BE(20), 1080);
    });
}
