const fs = require('fs');
const path = require('path');

// Các folder muốn bỏ qua
const IGNORE_DIRS = ['node_modules', '.git', '.expo', '.vscode', '.idea', 'dist', 'build'];

function printTree(dir, prefix = '') {
    try {
        const items = fs.readdirSync(dir).filter(item => !IGNORE_DIRS.includes(item));
        
        items.forEach((item, index) => {
            const isLast = index === items.length - 1;
            const connector = isLast ? '└── ' : '├── ';
            
            console.log(`${prefix}${connector}${item}`);
            
            const fullPath = path.join(dir, item);
            if (fs.statSync(fullPath).isDirectory()) {
                printTree(fullPath, prefix + (isLast ? '    ' : '│   '));
            }
        });
    } catch (err) {
        console.error(`Không đọc được thư mục: ${dir}`);
    }
}

console.log(`\n📂 CẤU TRÚC THƯ MỤC: ${path.basename(process.cwd())}`);
printTree('.');