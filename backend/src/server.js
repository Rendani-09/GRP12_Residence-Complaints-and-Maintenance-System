'use strict';

// Render service is currently configured to run `node src/server.js`.
// Delegate to the compiled TypeScript output so runtime starts correctly.
require('../dist/server.js');
