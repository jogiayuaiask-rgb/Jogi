const fs = require('fs');

// Fix DocumentMasonryGrid.tsx
let docGrid = fs.readFileSync('src/components/DocumentMasonryGrid.tsx', 'utf8');
docGrid = docGrid.replace(/file\.type/g, 'file.fileType');
docGrid = docGrid.replace(/file\.name/g, 'file.fileName');
docGrid = docGrid.replace(/file\.chunksCount/g, 'file.chunkCount');
fs.writeFileSync('src/components/DocumentMasonryGrid.tsx', docGrid);

// Fix EventHistoryPanel.tsx
let evtPanel = fs.readFileSync('src/components/EventHistoryPanel.tsx', 'utf8');
evtPanel = evtPanel.replace(/evt\.type === 'ingest'/g, "evt.action.toLowerCase().includes('ingest')");
evtPanel = evtPanel.replace(/evt\.type === 'error'/g, "evt.status === 'error'");
evtPanel = evtPanel.replace(/evt\.type === 'sync'/g, "evt.action.toLowerCase().includes('sync')");
evtPanel = evtPanel.replace(/evt\.type/g, "evt.status");
evtPanel = evtPanel.replace(/evt\.message/g, "evt.action");
evtPanel = evtPanel.replace(/e\.type/g, "e.status");
evtPanel = evtPanel.replace(/e\.message/g, "e.action");
fs.writeFileSync('src/components/EventHistoryPanel.tsx', evtPanel);

// Fix AdminDashboard.tsx
let adminDashboard = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');
adminDashboard = adminDashboard.replace(/<EventHistoryPanel events=\{events\} \/>/g, "<EventHistoryPanel recentEvents={events} />");
fs.writeFileSync('src/components/AdminDashboard.tsx', adminDashboard);
