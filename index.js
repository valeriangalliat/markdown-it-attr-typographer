const defaultPreset = require('markdown-it/lib/presets/default')
const replacements = require('markdown-it/lib/rules_core/replacements')
const quotes = require('markdown-it/lib/rules_core/smartquotes')
const he = require('html-entities')

function typographerToken (token, options) {
  options = Object.assign({ typographer: true, quotes: defaultPreset.options.quotes }, options)

  const state = {
    md: {
      options
    },
    tokens: [
      {
        type: 'inline',
        content: token.content, // Used to identify if we need to perform replacement.
        children: token.children // Where the replacement is actually performed.
      }
    ]
  }

  replacements(state)
  quotes(state)
}

function typographer (content, options) {
  const token = {
    content,
    children: [
      {
        type: 'text',
        content
      }
    ]
  }

  typographerToken(token, options)

  return token.children[0].content
}

/**
 * Note that for both block and inline HTML, we're potentially getting
 * partial HTML, e.g. just an open tag or just a closing tag.
 *
 * This makes it tricky to use a full-featured HTML parser, so instead
 * we uses regexes to parse HTML (yeah, I know).
 *
 * This means that this is likely not totally spec compliant might
 * behave unexpectedly in some edge cases.
 */
function processHtml (partialHtml, md) {
  return partialHtml.replace(/<(a|abbr|img) [^>]+>/g, tag => {
    return tag.replace(/ (?:alt|title)=(?:"([^"]*)"|'([^']*)'|([^ >]+))/g, (attr, doubleQuote, singleQuote, unquoted) => {
      // Only one will be matched.
      const value = doubleQuote || singleQuote || unquoted

      return attr.replace(value, he.encode(typographer(he.decode(value), md.options)))
    })
  })
}

function processInline (tokens, md, opts) {
  for (const token of tokens) {
    if (['link_open', 'image'].includes(token.type)) {
      for (const attr of token.attrs) {
        if (['alt', 'title'].includes(attr[0])) {
          attr[1] = typographer(attr[1], md.options)
        }
      }

      if (token.type === 'image') {
        // Assistive text is actually in the token children, not
        // attributes.
        typographerToken(token, md.options)
      }
    } else if (opts.html && token.type === 'html_inline') {
      token.content = processHtml(token.content, md)
    }
  }
}

function attrTypographer (md, opts) {
  if (!md.options.typographer) {
    md.typographer = content => content
    return
  }

  opts = Object.assign({}, attrTypographer.defaults, opts)

  md.typographer = content => typographer(content, md.options)

  md.core.ruler.push('attr_typographer', state => {
    if (!state.md.options.typographer) {
      return
    }

    for (const token of state.tokens) {
      if (token.type === 'inline') {
        processInline(token.children, md, opts)
      } else if (opts.html && token.type === 'html_block') {
        token.content = processHtml(token.content, md)
      }
    }
  })
}

attrTypographer.typographer = typographer

attrTypographer.defaults = {
  html: false
}

module.exports = attrTypographer
