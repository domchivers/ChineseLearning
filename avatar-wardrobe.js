/* Reviewed whole-character catalogue. No fitting, tinting or garment cutting. */
function makeAvatarWardrobe(data, model) {
  const defaults = () => ({version:2, outfit:'hoodie_trousers', accessory:'none', hair:'tousled', tone:'light', eyes:'open', brows:'none', mouth:'smile'});
  const normalize = saved => {
    const state = {...defaults(), ...saved, version:2};
    return model.supported(state) ? state : defaults();
  };
  function paths(s) {
    if (!model.supported(s)) throw new Error('This combination is unavailable.');
    if (s.tone !== 'light' && !(s.accessory === 'none' && s.outfit === 'hoodie_trousers')) {
      const group = s.accessory === 'none' ? 'clothing' : s.accessory;
      return [data.variants[group][data.hats[group] ? s.hair : s.outfit][s.tone]];
    }
    if (s.accessory !== 'none') return [data.hats[s.accessory]?.[s.hair] || data.looks[s.accessory][s.outfit]];
    if (s.tone !== 'light') return [data.tones[s.tone], data.layers.hair[s.hair]];
    return [data.layers.outfit[s.outfit], data.layers.eyes[s.eyes], data.layers.brows[s.brows], data.layers.mouth[s.mouth], data.layers.hair[s.hair]].filter(Boolean);
  }
  const names = {none:'None',scarf:'Scarf',backpack:'Backpack',crossbody:'Crossbody bag',cap_glasses:'Blue cap + glasses',headphones:'Headphones',bucket:'Panda bucket hat',beanie:'Beanie',sunhat:'Sunhat',green_cap:'Green cap',brown_cap:'Brown cap'};
  function reason(s) {
    if (!model.faceDefault(s) && (s.accessory !== 'none' || s.tone !== 'light')) return 'Choose Open eyes, None brows and Smile for this look.';
    if (data.hats[s.accessory] && s.outfit !== 'hoodie_trousers') return 'Choose the cream hoodie and blue trousers outfit first.';
    if (s.hair !== 'tousled' && (data.looks[s.accessory] || (s.tone !== 'light' && s.accessory === 'none' && s.outfit !== 'hoodie_trousers'))) return 'Choose Tousled hair for this outfit.';
    return 'This combination is not available yet. Try Outfit sets.';
  }
  function options(s, category) {
    const current = model.outfit(s.outfit);
    if (['top','bottom','shoes'].includes(category)) return [...new Set(data.outfits.map(o=>o[category]))].map(label=>({label, on:current[category]===label, next:model.garment(s,category,label), why:'Not available with your other clothing choices. Try Outfit sets.'}));
    if (category==='outfits') return data.outfits.map(o=>({label:o.top,sub:o.bottom+' · '+o.shoes,on:s.outfit===o.id,next:model.change(s,{outfit:o.id}),why:reason({...s,outfit:o.id})}));
    const values=category==='accessory'?Object.keys(names):category==='tone'?Object.keys(data.tones):Object.keys(data.layers[category]);
    return values.map(id=>({label:names[id] || id[0].toUpperCase()+id.slice(1),on:s[category]===id,next:model.change(s,{[category]:id}),why:reason({...s,[category]:id}),swatch:category==='tone'?data.toneColours[id]:null}));
  }
  return {defaults,normalize,paths,options,names};
}
if (typeof module !== 'undefined') module.exports=makeAvatarWardrobe;
