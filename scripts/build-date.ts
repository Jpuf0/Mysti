import pkg from "../package.json";
import * as fs from 'fs-extra';

console.log('Current Build Date:', pkg.buildDate === null ? 'Unknown' : new Date(pkg.buildDate).toString().split(' ').slice(0, 5).join(' '));
const d = Date.now();
(pkg.buildDate as number | null) = d;
console.log('New Build Date:', pkg.buildDate === null ? 'Unknown' : new Date(pkg.buildDate).toString().split(' ').slice(0, 5).join(' '));
fs.writeFileSync(`${__dirname}/../package.json`, JSON.stringify(pkg, undefined, "   "));
if (fs.existsSync(`${__dirname}/../build`)) fs.writeFileSync(`${__dirname}/../build/package.json`, JSON.stringify(pkg, undefined, "  "));
