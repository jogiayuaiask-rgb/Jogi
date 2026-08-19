const fs = require('fs');

let file = 'src/components/LiveDatabaseSyncTable.tsx';
let code = fs.readFileSync(file, 'utf8');

// I already did:
// <div className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
// Let's replace it with a pulsing one if it's not there.
if (!code.includes('animate-ping absolute')) {
  code = code.replace(
    '<div className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">\n            <Database className="w-5 h-5" />\n          </div>',
    '<div className="relative p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">\n            <Database className="w-5 h-5" />\n            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">\n              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4E8975] opacity-75"></span>\n              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4E8975]"></span>\n            </span>\n          </div>'
  );
  fs.writeFileSync(file, code);
}
