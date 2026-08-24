const PRIVATE_HOST_RE = /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/i;
function decodeHtml(s=''){return s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>')}
function findMeta(html,key){const patterns=[new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`,`i`),new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`,`i`)];for(const p of patterns){const m=html.match(p);if(m)return decodeHtml(m[1])}return''}
export default async function handler(req,res){
  try{
    const raw=Array.isArray(req.query.url)?req.query.url[0]:req.query.url;
    if(!raw)return res.status(400).send('Missing url');
    const u=new URL(raw);if(!/^https?:$/.test(u.protocol)||PRIVATE_HOST_RE.test(u.hostname))return res.status(400).send('Invalid url');
    const page=await fetch(u,{redirect:'follow',headers:{'user-agent':'Mozilla/5.0 (compatible; CollectionReferenceBot/1.0)'}});
    if(!page.ok)return res.status(404).send('Source unavailable');
    const ct=page.headers.get('content-type')||'';
    let imageUrl='';
    if(ct.startsWith('image/')) imageUrl=page.url;
    else{
      const html=(await page.text()).slice(0,1500000);
      imageUrl=findMeta(html,'og:image')||findMeta(html,'twitter:image');
      if(!imageUrl){const m=html.match(/<img[^>]+src=["']([^"']+)["']/i);if(m)imageUrl=decodeHtml(m[1])}
      if(!imageUrl)return res.status(404).send('No reference image found');
      imageUrl=new URL(imageUrl,page.url).href;
    }
    const iu=new URL(imageUrl);if(!/^https?:$/.test(iu.protocol)||PRIVATE_HOST_RE.test(iu.hostname))return res.status(400).send('Invalid image url');
    const ir=await fetch(iu,{redirect:'follow',headers:{'user-agent':'Mozilla/5.0','referer':page.url}});if(!ir.ok)return res.status(404).send('Image unavailable');
    const ict=ir.headers.get('content-type')||'image/jpeg';if(!ict.startsWith('image/'))return res.status(415).send('Not an image');
    const buf=Buffer.from(await ir.arrayBuffer());if(buf.length>8*1024*1024)return res.status(413).send('Image too large');
    res.setHeader('Content-Type',ict);res.setHeader('Cache-Control','public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000');res.status(200).send(buf);
  }catch(e){res.status(500).send('Reference image unavailable')}
}
