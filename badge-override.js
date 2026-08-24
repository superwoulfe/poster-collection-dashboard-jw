(function(){
  const A=window.APP;
  if(!A)return;
  A.badge=(cls='poster-badge')=>{
    const initials=A.initials(A.ownerName());
    const src=window.COLLECTOR_BADGE_IMAGE||'';
    return `<div class="collector-badge ${cls}" role="img" aria-label="${A.esc(initials)} Gig Poster Collector badge"><img src="${src}" alt=""><span class="badge-initials">${A.esc(initials)}</span></div>`;
  };
})();
