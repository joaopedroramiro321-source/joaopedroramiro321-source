import { mkdir, writeFile } from 'node:fs/promises';

const owner = process.env.PROFILE_OWNER;
const token = process.env.GITHUB_TOKEN;
if (!owner || !token) throw new Error('PROFILE_OWNER and GITHUB_TOKEN required');
async function query(query, variables) {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }), signal: AbortSignal.timeout(60000)
  });
  if (!response.ok) throw new Error(`GitHub HTTP ${response.status}`);
  const result = await response.json();
  if (result.errors) throw new Error(JSON.stringify(result.errors));
  return result.data.user;
}
const user = await query(`query($login:String!){user(login:$login){
  followers{totalCount}
  contributionsCollection { contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } } }
}}`, { login: owner });
let repos = [], cursor = null;
do {
  const page = await query(`query($login:String!,$cursor:String){user(login:$login){
    repositories(first:100,after:$cursor,ownerAffiliations:OWNER,privacy:PUBLIC,isFork:false){
      pageInfo{hasNextPage endCursor}
      nodes{name stargazerCount languages(first:100){edges{size node{name color}}}}
    }
  }}`, { login: owner, cursor });
  repos.push(...page.repositories.nodes);
  cursor = page.repositories.pageInfo.hasNextPage ? page.repositories.pageInfo.endCursor : null;
} while (cursor);
const calendar = user.contributionsCollection.contributionCalendar;
const days = calendar.weeks.flatMap(w => w.contributionDays);
const stars = repos.reduce((n, r) => n + r.stargazerCount, 0);
const languages = new Map();
for (const repo of repos) for (const {size, node} of repo.languages.edges) {
  const prev = languages.get(node.name) || { size: 0, color: node.color || '#58a6ff' };
  languages.set(node.name, { size: prev.size + size, color: prev.color });
}
const ranked = [...languages].sort((a,b)=>b[1].size-a[1].size);
const bytes = ranked.reduce((s, [,v])=>s+v.size,0);
let longest=0, run=0;
for (const day of days) { run=day.contributionCount>0?run+1:0; longest=Math.max(longest,run); }
let index=days.length-1, current=0;
// An unfinished UTC day does not break yesterday's streak.
if (days[index]?.date===new Date().toISOString().slice(0,10) && days[index].contributionCount===0) index--;
while(index>=0 && days[index--].contributionCount>0) current++;
const active=days.filter(d=>d.contributionCount>0).length;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const text=(x,y,s,size=16,color='#c9d1d9',extra='')=>`<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${size}" fill="${color}" ${extra}>${esc(s)}</text>`;
const stamp=new Date().toISOString().slice(0,10);
function svg(title,subtitle,body,height=240){return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="${height}" viewBox="0 0 900 ${height}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><rect x="1" y="1" width="898" height="${height-2}" rx="16" fill="#0d1117" stroke="#1f6feb"/>${text(28,38,title,23,'#58a6ff')}${text(28,62,subtitle,12,'#8b949e')}${body}${text(28,height-18,`Atualizado em ${stamp} · Dados públicos do GitHub`,11,'#8b949e')}</svg>`;}
function metrics(items){return items.map(([label,value],i)=>{const x=28+i*(844/items.length);return text(x,127,value,35,'#ffffff')+text(x,157,label,14);}).join('');}
await mkdir('assets',{recursive:true});
const panels={
  'stats.svg':svg('GitHub em números','Repositórios públicos próprios, sem forks · Contribuições nos últimos 12 meses',metrics([['Repositórios',repos.length],['Estrelas recebidas',stars],['Seguidores',user.followers.totalCount],['Contribuições',calendar.totalContributions]])),
  'streak.svg':svg('Streak · frequência de contribuições','Janela de 12 meses · Dias em UTC · O dia de hoje ainda pode ser completado',metrics([['Sequência atual',`${current} dias`],['Maior sequência na janela',`${longest} dias`],['Dias com contribuições',active]])),
  'trophies.svg':svg('Troféus · marcos do perfil','Painel próprio de marcos reais; não representa os Achievements oficiais do GitHub.',metrics([['Projetos publicados',repos.length],['Estrelas conquistadas',stars],['Dias de atividade no ano',active]]))
};
const top=ranked.slice(0,6);
panels['languages.svg']=svg('Top Languages','Participação em bytes nos repositórios públicos próprios, sem forks; não mede proficiência.',top.map(([name,v],i)=>{const y=99+i*32,p=100*v.size/(bytes||1);return text(28,y,name,14)+`<rect x="190" y="${y-12}" width="550" height="13" rx="6" fill="#161b22"/><rect x="190" y="${y-12}" width="${550*p/100}" height="13" rx="6" fill="${v.color}"/>`+text(765,y,`${p.toFixed(1)}%`,14);}).join(''),Math.max(180,115+top.length*32));
const recent=days.slice(-90), max=Math.max(1,...recent.map(d=>d.contributionCount));
const points=recent.map((d,i)=>`${28+i*844/Math.max(1,recent.length-1)},${205-d.contributionCount/max*115}`).join(' ');
panels['activity.svg']=svg('Activity Graph','Contribuições diárias · Últimos 90 dias · Escala relativa ao maior dia do período',`<path d="M28 205 H872" stroke="#30363d"/><polyline points="${points}" fill="none" stroke="#58a6ff" stroke-width="2"/>${text(28,231,recent[0]?.date||'',12)}${text(872,231,recent.at(-1)?.date||'',12,'#c9d1d9','text-anchor="end"')}${text(28,82,`Máximo diário: ${max}`,11,'#8b949e')}`,280);
for (const [name,content] of Object.entries(panels)) await writeFile(`assets/${name}`,content);
console.log(`Generated ${Object.keys(panels).length} panels from ${repos.length} repositories and ${days.length} days.`);


