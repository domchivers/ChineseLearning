/* Run with node validate-avatar.js. No browser storage or network changes. */
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const context={};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'avatar-catalogue.js'),'utf8')+';this.data=AVATAR_DATA;',context);
const data=context.data,model=require('./avatar-model')(data),wardrobe=require('./avatar-wardrobe')(data,model);
let count=0;
for(const [group,items] of Object.entries(data.variants)) for(const [item,tones] of Object.entries(items)) for(const tone of Object.keys(tones)) {
 const s={...wardrobe.defaults(),accessory:group==='clothing'?'none':group,outfit:data.hats[group]?'hoodie_trousers':item,hair:data.hats[group]?item:'tousled',tone};
 assert(model.supported(s));assert.equal(wardrobe.paths(s).length,1);
 for(const file of wardrobe.paths(s))assert(fs.existsSync(path.join(__dirname,file)),file);
 assert.equal(model.change(s,{tone:'light'}).accessory,s.accessory);assert.equal(model.change(s,{tone:'light'}).outfit,s.outfit);
 assert.equal(model.change(s,{mouth:'open'}),null);count++;
}
assert.equal(count,505);
for(const tone of Object.keys(data.tones))for(const accessory of ['scarf','backpack','crossbody']) {
 const s={...wardrobe.defaults(),tone,accessory};
 const jacket=model.garment(s,'top','Yellow jacket');assert(jacket);assert.equal(jacket.accessory,accessory);assert.equal(jacket.tone,tone);assert.equal(model.outfit(jacket.outfit).bottom,'Blue trousers');
 assert.equal(model.garment(jacket,'bottom','Coral skirt'),null);
}
for(const hair of Object.keys(data.layers.hair))for(const tone of Object.keys(data.tones)) {
 for(const accessory of Object.keys(data.hats)) {
  const s={...wardrobe.defaults(),accessory,hair,tone};assert(model.supported(s));wardrobe.paths(s).forEach(f=>assert(fs.existsSync(path.join(__dirname,f))));
 }
}
assert.equal(wardrobe.normalize({version:2,outfit:'deleted'}).outfit,'hoodie_trousers');
assert.equal(wardrobe.normalize({...wardrobe.defaults(),accessory:'scarf',tone:'dark'}).tone,'dark');
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'images/avatar-catalogue/manifest.json')));
assert.equal(Object.keys(manifest.files).length,630);
for(const f of Object.keys(manifest.files))assert(fs.statSync(path.join(__dirname,f)).size>0);
console.log('Passed: 505 variants, six-tone accessory retention, headwear/hair combinations, invalid-state recovery and 630 exported assets.');
