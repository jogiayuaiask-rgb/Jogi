const fs = require('fs');
let file = 'src/components/LiveDatabaseSyncTable.tsx';
let code = fs.readFileSync(file, 'utf8');

// I need to close `{!isCollapsed && (` that I opened at line 230:
// `      {!isCollapsed && (\n        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>\n`
// This should be closed right after the controls div, which is exactly at line 386/387.
// The code looks like this:
// `          </button>\n        </div>\n      </div>`
// Where the first `</div>` closes the controls flex-wrap, and the second `</div>` closes the header.
// It should be:
// `          </button>\n        </div>\n      )}\n      </div>\n      {!isCollapsed && (\n        <>\n`
code = code.replace(
  '          </button>\n        </div>\n      </div>\n\n      {/* Bulk Multi-Tag Input Banner */}',
  '          </button>\n        </div>\n      )}\n      </div>\n      {!isCollapsed && (\n      <>\n      {/* Bulk Multi-Tag Input Banner */}'
);

fs.writeFileSync(file, code);
