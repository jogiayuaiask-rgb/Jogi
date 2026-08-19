const fs = require('fs');

let file = 'src/components/ChatInterface.tsx';
let code = fs.readFileSync(file, 'utf8');

// Fix text
code = code.replace(/dark:text-\[\#051919\] dark:text-white\/90/g, 'dark:text-white/90');
code = code.replace(/dark:text-\[\#051919\] dark:text-white\/50/g, 'dark:text-white/50');
code = code.replace(/dark:text-\[\#051919\] dark:text-white\/70/g, 'dark:text-white/70');
code = code.replace(/dark:text-\[\#051919\] dark:text-white\/80/g, 'dark:text-white/80');
code = code.replace(/dark:text-\[\#051919\] dark:text-white/g, 'dark:text-white');

// Fix borders
code = code.replace(/dark:border-\[\#051919\] dark:border-white\/10/g, 'dark:border-white/10');
code = code.replace(/dark:border-\[\#051919\] dark:border-white\/20/g, 'dark:border-white/20');
code = code.replace(/dark:border-\[\#051919\] dark:border-white/g, 'dark:border-white');

// Fix bg
code = code.replace(/dark:bg-\[\#051919\]\/10 dark:bg-white\/5/g, 'dark:bg-white/5');

// Update prose classes
code = code.replace(/prose-p:text-\[\#051919\]\/70 dark:text-white\/90/g, 'prose-p:text-[#051919]/70 dark:prose-p:text-white/90');
code = code.replace(/prose-strong:text-\[\#051919\] dark:text-white/g, 'prose-strong:text-[#051919] dark:prose-strong:text-white');

fs.writeFileSync(file, code);

console.log("Fixed classes");
