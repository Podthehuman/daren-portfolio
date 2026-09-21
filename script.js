document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'})}}));

const certSearch=document.getElementById('certificateSearch');
const certCategory=document.getElementById('certificateCategory');
const certGrid=document.getElementById('certificateGrid');
let certificateData=[];

const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fileUrl=f=>'assets/certificates/'+encodeURIComponent(f).replace(/%2F/g,'/');
const isImage=f=>/\.(png|jpe?g|webp|gif)$/i.test(f||'');

function renderCertificates(){
  if(!certGrid)return;
  const q=(certSearch?.value||'').toLowerCase().trim();
  const cat=certCategory?.value||'all';
  const items=certificateData.filter(c=>{
    const text=`${c.title||''} ${c.issuer||''}`.toLowerCase();
    return text.includes(q)&&(cat==='all'||c.category===cat);
  });
  if(!items.length){
    certGrid.innerHTML=`<article class="certificate-empty"><div class="certificate-icon">⌕</div><h3>No certificates found</h3><p>Try another search or category.</p></article>`;
    return;
  }
  certGrid.innerHTML=items.map(c=>{
    const url=fileUrl(c.file);
    const preview=isImage(c.file)
      ? `<img src="${url}" alt="${escapeHtml(c.title)} certificate preview" loading="lazy">`
      : `<div class="certificate-pdf-preview"><span>PDF</span><small>${escapeHtml(c.issuer||'Certificate')}</small></div>`;
    return `<article class="certificate-card" data-category="${escapeHtml(c.category||'other')}">
      <a class="certificate-preview-link" href="${url}" target="_blank" rel="noopener">${preview}</a>
      <h3>${escapeHtml(c.title)}</h3>
      <p>${escapeHtml(c.issuer||'Certificate')}</p>
      <span class="certificate-tag">${escapeHtml((c.category||'other').replace(/\b\w/g,m=>m.toUpperCase()))}</span>
      <a href="${url}" target="_blank" rel="noopener">View Certificate →</a>
    </article>`;
  }).join('');
}

async function loadCertificates(){
  if(!certGrid)return;
  try{
    const r=await fetch('assets/certificates/certificates.json',{cache:'no-store'});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    certificateData=await r.json();
    renderCertificates();
  }catch(err){
    certGrid.innerHTML=`<article class="certificate-empty"><div class="certificate-icon">!</div><h3>Certificate list ready</h3><p>Upload the matching certificate files and publish through GitHub Pages. For local testing, use VS Code Live Server because browsers may block JSON loading from <code>file://</code>.</p></article>`;
    console.warn('Certificate data could not be loaded:',err);
  }
}
certSearch?.addEventListener('input',renderCertificates);
certCategory?.addEventListener('change',renderCertificates);
loadCertificates();
