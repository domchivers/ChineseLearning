function makeAvatarModel(data){
 const faceDefault=s=>s.eyes==='open'&&s.brows==='none'&&s.mouth==='smile';
 const outfit=id=>data.outfits.find(o=>o.id===id);
 function supported(s){
  if(!outfit(s.outfit)||!data.layers.hair[s.hair])return false;
  if(s.tone!=='light'){
   if(!faceDefault(s))return false;
   if(s.accessory==='none'&&s.outfit==='hoodie_trousers')return !!data.tones[s.tone];
   const group=s.accessory==='none'?'clothing':s.accessory,key=data.hats[group]?s.hair:s.outfit;
   if(data.hats[group]&&s.outfit!=='hoodie_trousers')return false;
   if(!data.hats[group]&&s.hair!=='tousled')return false;
   return !!data.variants?.[group]?.[key]?.[s.tone];
  }
  if(s.accessory==='none')return true;
  if(!faceDefault(s))return false;
  if(data.hats[s.accessory])return s.outfit==='hoodie_trousers'&&!!data.hats[s.accessory][s.hair];
  return s.hair==='tousled'&&!!data.looks[s.accessory]?.[s.outfit];
 }
 function change(s,patch){const next={...s,...patch};return supported(next)?next:null}
 function garment(s,key,value){const current=outfit(s.outfit);const match=data.outfits.find(o=>o[key]===value&&['top','bottom','shoes'].every(k=>k===key||o[k]===current[k]));return match?change(s,{outfit:match.id}):null}
 return {supported,change,garment,outfit,faceDefault};
}
if(typeof module!=='undefined')module.exports=makeAvatarModel;
