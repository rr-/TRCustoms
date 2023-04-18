#!/usr/bin/env node
const prerender = require('prerender');
const fsCache = require('./plugins/filesystem-cache');

// borrow from https://github.com/prerender/prerender/blob/master/server.js
var server = prerender({
  chromeLocation: '/usr/lib/chromium/chrome',
  chromeFlags: [
    '--headless',
    //"--disable-gpu",
    '--remote-debugging-port=9222',
    //"--hide-scrollbars",
    '--no-sandbox',
    '--disk-cache-dir=/tmp/chromium',
  ],
});

server.use(prerender.sendPrerenderHeader());
server.use(prerender.blockResources());
server.use(prerender.removeScriptTags());
server.use(prerender.httpHeaders());
server.use(fsCache);

server.start();
