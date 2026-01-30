import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const componentsDir = './components/ui';
const files = readdirSync(componentsDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

const replacements = [
  [/@radix-ui\/react-([^@]+)@[\d.]+/g, '@radix-ui/react-$1'],
  [/lucide-react@[\d.]+/g, 'lucide-react'],
  [/class-variance-authority@[\d.]+/g, 'class-variance-authority'],
  [/react-day-picker@[\d.]+/g, 'react-day-picker'],
  [/embla-carousel-react@[\d.]+/g, 'embla-carousel-react'],
  [/cmdk@[\d.]+/g, 'cmdk'],
  [/input-otp@[\d.]+/g, 'input-otp'],
  [/react-resizable-panels@[\d.]+/g, 'react-resizable-panels'],
  [/sonner@[\d.]+/g, 'sonner'],
  [/vaul@[\d.]+/g, 'vaul'],
];

files.forEach(file => {
  const filePath = join(componentsDir, file);
  let content = readFileSync(filePath, 'utf-8');
  
  replacements.forEach(([pattern, replacement]) => {
    content = content.replace(pattern, replacement);
  });
  
  writeFileSync(filePath, content, 'utf-8');
  console.log(`Fixed: ${file}`);
});

console.log('\n✅ All imports fixed!');
