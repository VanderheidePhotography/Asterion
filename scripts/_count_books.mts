import { entities } from '../src/data/index.ts';
import { archiveTextFor } from '../src/data/archiveTexts.ts';

const clusters = ['hermetica','alchemy','kabbalah','renaissance','early-modern','freemasonry','occult-revival','scholarship'];
console.log('cluster\ttotal\tred(scan)\tpurple\tworks\tworks-no-scan');
let tR=0,tP=0;
for (const c of clusters) {
  const mem = entities.filter(e=>e.cluster===c);
  const red = mem.filter(e=>!!archiveTextFor(e));
  const purple = mem.length - red.length;
  const works = mem.filter(e=>e.type==='work');
  const worksNoScan = works.filter(e=>!archiveTextFor(e));
  tR+=red.length; tP+=purple;
  console.log(`${c}\t${mem.length}\t${red.length}\t${purple}\t${works.length}\t${worksNoScan.length}`);
}
console.log(`TOTAL red=${tR} purple=${tP}`);
