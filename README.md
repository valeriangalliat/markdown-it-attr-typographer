# markdown-it-attr-typographer [![npm version](http://img.shields.io/npm/v/markdown-it-attr-typographer.svg?style=flat-square)](https://www.npmjs.org/package/markdown-it-attr-typographer)

> Enable [markdown-it] typographer mode on text attributes.

[markdown-it]: https://github.com/markdown-it/markdown-it

## Overview

markdown-it comes with a `typographer` options allowing for smart quotes
and various [replacements].

[replacements]: https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.js

But it only applies those replacements on text nodes, not attributes. If
you want to have the `typographer` mode applied to text attributes, like
`title` and `alt`, this plugin is for you!

## Usage

```js
const md = require('markdown-it')({ typographer: true })
  .use(require('markdown-it-attr-typographer'), opts)
```

The `opts` object can contain:

| Name   | Description                                                              | Default |
|--------|--------------------------------------------------------------------------|---------|
| `html` | Whether to parse literal HTML to apply typographer transforms there too. | `false` |

## Example

This source Markdown:

```markdown
# Title <small>[link](/whatever "With it's title(tm)")</small>

Some ![Image(tm) with "quotes"](/whatever "With it's title(tm)")
```

Will be rendered as:

```html
<h1>Title <small><a href="/whatever" title="With it’s title™">link</a></small></h1>
<p>Some <img src="/whatever" alt="Image™ with “quotes”" title="With it’s title™"></p>
```

Additionally, with `{ html: true }`, it will enable:

```markdown
Some <abbr title='Abbreviation(tm) with "quotes"'>*AWQ(tm)*</abbr>

<figure class="whatever">
  <img alt='Image(tm) with "quotes"' title=Hello(tm) src="/whatever">
</figure>

Some <a href="/link" title="With &quot;quoted&quot; title(tm)">link</a>
```

To be rendered as:

```html
<p>Some <abbr title='Abbreviation™ with “quotes”'><em>AWQ™</em></abbr></p>
<figure class="whatever">
  <img alt='Image™ with “quotes”' title=Hello™ src="/whatever">
</figure>
<p>Some <a href="/link" title="With “quoted” title™">link</a></p>
```

## Apply typographer transforms to anything

If you want to have an easily accessible function to apply markdown-it's
typographer transforms on any string, you can also use this plugin for
this.

```js
const md = require('markdown-it')({ typographer: true })
  .use(require('markdown-it-attr-typographer'))

// This will only process the text if the `typographer` option is set to `true`.
md.typographer(`Some "text" --- that's coming with various transforms(c)`)
```

Additionally, if you want to apply markdown-it typography to any string
regardless of the state of your markdown-it instance (or without
actually using markdown-it), you can use the global function.

```js
const { typographer } = require('markdown-it-attr-typographer')

// This will always transform the text.
typographer(`Some "text" --- that's coming with various transforms(c)`)
```

You can pass markdown-it options as second argument, e.g. for French
style quotes:

```js
md.typographer(`Some "text" --- that's coming with various transforms(c)`, {
  quotes: ['«\xA0', '\xA0»', '‹\xA0', '\xA0›']
})
```
