const fs = require('fs');
let code = fs.readFileSync('src/components/IngestionHeatmap.tsx', 'utf8');

code = code.replace(/\\\$\{/g, '${');

fs.writeFileSync('src/components/IngestionHeatmap.tsx', code);
