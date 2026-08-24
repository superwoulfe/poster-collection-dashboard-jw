(()=>{
  const A=window.APP;
  A.driveImage=v=>{
    const raw=A.validUrl(v);
    if(!raw)return'';
    try{
      const u=new URL(raw);
      const h=u.hostname.toLowerCase();
      if(h==='drive.google.com'||h.endsWith('.drive.google.com')){
        let id='';
        const m=u.pathname.match(/\/file\/d\/([^/]+)/);
        if(m)id=m[1];
        if(!id)id=u.searchParams.get('id')||'';
        return id?`https://drive.google.com/uc?export=view&id=${encodeURIComponent(id)}`:'';
      }
      if(h==='lh3.googleusercontent.com'||h.endsWith('.googleusercontent.com'))return raw;
    }catch{}
    return'';
  };
  A.imagePage=r=>A.driveImage(r.imageUrl);
  A.thumb=r=>{
    const p=A.imagePage(r);
    return p?`/api/thumb?url=${encodeURIComponent(p)}&title=${encodeURIComponent(r.title||'')}`:'';
  };
})();
