const { strictEqual } = require('assert')
const md = require('markdown-it')
const attrTypographer = require('./')

const engine = md({ html: true, typographer: true })
  .use(attrTypographer, { html: true })

// When <https://github.com/eslint/eslint/issues/12156> is resolved
// we'll be able to use backticks when contents includes both double and
// single quotes even if not using template variables.
//
// Until then, we'll escape.
strictEqual(
  attrTypographer.typographer('Some "text" that\'s containing smart quotes(tm)'),
  'Some “text” that’s containing smart quotes™'
)

strictEqual(
  engine.typographer('Some "text" that\'s containing smart quotes(tm)'),
  'Some “text” that’s containing smart quotes™'
)

// Should do nothing if the `typographer` option is not enabled.
strictEqual(
  md().use(attrTypographer).typographer('Some "text" that\'s containing smart quotes(tm)'),
  'Some "text" that\'s containing smart quotes(tm)'
)

strictEqual(
  engine.render('Some [link](/whatever "With it\'s title(tm)")'),
  '<p>Some <a href="/whatever" title="With it’s title™">link</a></p>\n'
)

// Should do nothing if the `typographer` option is not enabled.
strictEqual(
  md().use(attrTypographer).render('Some [link](/whatever "With it\'s title(tm)")'),
  '<p>Some <a href="/whatever" title="With it\'s title(tm)">link</a></p>\n'
)

strictEqual(
  engine.render('Some ![Image(tm) with "quotes"](/whatever "With it\'s title(tm)")'),
  '<p>Some <img src="/whatever" alt="Image™ with “quotes”" title="With it’s title™"></p>\n'
)

strictEqual(
  engine.render('Some ![Image(tm) with "quotes" and *garbage* [in](/link) alt](/whatever "With it\'s title(tm)")'),
  '<p>Some <img src="/whatever" alt="Image™ with “quotes” and garbage in alt" title="With it’s title™"></p>\n'
)

strictEqual(
  engine.render('Some [link] reference\n\n[link]: /link "With it\'s title(tm)"'),
  '<p>Some <a href="/link" title="With it’s title™">link</a> reference</p>\n'
)

strictEqual(
  engine.render('Some [link] reference\n\n[link]: /link \'With "quoted" title(tm)\''),
  '<p>Some <a href="/link" title="With “quoted” title™">link</a> reference</p>\n'
)

strictEqual(
  engine.render('Some [link] reference\n\n[link]: /link (With parens\' and "quotes" title)'),
  '<p>Some <a href="/link" title="With parens’ and “quotes” title">link</a> reference</p>\n'
)

// Only way to mix them all I think.
strictEqual(
  engine.render('Some <a href="/link" title="With &quot;quoted&quot; title(tm)">link</a>'),
  '<p>Some <a href="/link" title="With “quoted” title™">link</a></p>\n'
)

// Should not mess with HTML when `html` is not enabled (default).
strictEqual(
  md({ html: true, typographer: true }).use(attrTypographer).render('Some <a href="/link" title="With parens\' and &quot;quotes&quot; title(tm)">link</a>'),
  '<p>Some <a href="/link" title="With parens\' and &quot;quotes&quot; title(tm)">link</a></p>\n'
)

strictEqual(
  engine.render('<figure class="whatever"><img alt=\'Image(tm) with "quotes"\' title=Hello(tm) src="/whatever"></figure>'),
  '<figure class="whatever"><img alt=\'Image™ with “quotes”\' title=Hello™ src="/whatever"></figure>'
)

strictEqual(
  engine.render('<figure class="whatever"><img alt="Image(tm) with &quot;quotes&quot;" title=Hello(tm) src="/whatever"></figure>'),
  '<figure class="whatever"><img alt="Image™ with “quotes”" title=Hello™ src="/whatever"></figure>'
)

strictEqual(
  engine.render('<div class="whatever">\n\nSome [link](/whatever "With it\'s title(tm)")\n\n</div>'),
  '<div class="whatever">\n<p>Some <a href="/whatever" title="With it’s title™">link</a></p>\n</div>'
)

strictEqual(
  engine.render('<div class="whatever">\n\nSome <abbr title=\'Abbreviation(tm) with "quotes"\'>*AWQ(tm)*</abbr>\n\n</div>'),
  '<div class="whatever">\n<p>Some <abbr title=\'Abbreviation™ with “quotes”\'><em>AWQ™</em></abbr></p>\n</div>'
)

strictEqual(
  engine.render('# Title <small>[link](/whatever "With it\'s title(tm)")</small>'),
  '<h1>Title <small><a href="/whatever" title="With it’s title™">link</a></small></h1>\n'
)

strictEqual(
  engine.render('# Title <small><a href="/whatever" title="With it\'s title(tm)">link</a></small>'),
  '<h1>Title <small><a href="/whatever" title="With it’s title™">link</a></small></h1>\n'
)

strictEqual(
  engine.render('# Title(tm)\n\n<!-- Don\'t mess with comments! -->\n\nHello "world"'),
  '<h1>Title™</h1>\n<!-- Don\'t mess with comments! -->\n<p>Hello “world”</p>\n'
)

const frenchQuotes = ['«\xA0', '\xA0»', '‹\xA0', '\xA0›']

strictEqual(
  attrTypographer.typographer('Some "text" that\'s containing \'smart\' quotes(tm)', { quotes: frenchQuotes }),
  'Some «\xA0text\xA0» that’s containing ‹\xA0smart\xA0› quotes™'
)

const frenchEngine = md({ html: true, typographer: true, quotes: frenchQuotes })
  .use(attrTypographer)

strictEqual(
  frenchEngine.typographer('Some "text" that\'s containing \'smart\' quotes(tm)'),
  'Some «\xA0text\xA0» that’s containing ‹\xA0smart\xA0› quotes™'
)
