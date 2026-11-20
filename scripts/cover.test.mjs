import test from 'node:test'
import assert from 'node:assert/strict'
import {normalizeCoverUrl} from '../src/coverUrl.js'
const url='https://image.aladin.co.kr/product/28050/46/cover500/k102734432_2.jpg'
test('cover accepts plain, angle-wrapped and pasted Markdown image links',()=>{
 for(const value of [url,`  ${url}  `,`<${url}>`,`[${url}](${url})`])assert.equal(normalizeCoverUrl(value),url)
})
test('cover rejects invalid and executable URL schemes',()=>{
 for(const value of ['', 'abc', 'javascript:alert(1)','data:text/html,hello','file:///secret'])assert.equal(normalizeCoverUrl(value),'')
})
