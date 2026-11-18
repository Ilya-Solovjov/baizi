// Loads the browser data files into Node for build scripts.
const fs = require('fs'), path = require('path'), vm = require('vm');
module.exports = function load(files) {
  const ctx = { window: {} }; ctx.window.window = ctx.window; vm.createContext(ctx);
  ctx.BAIZI = undefined;
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', f), 'utf8').replace(/^window\.BAIZI = window\.BAIZI \|\| \{\};/m, 'window.BAIZI = window.BAIZI || {}; var BAIZI = window.BAIZI;'), ctx);
  return ctx.window.BAIZI;
};
