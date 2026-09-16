# Reviewed avatar catalogue — v217

The profile and editor share the new renderer in app.js. avatar-catalogue.js contains the reviewed manifest, avatar-model.js enforces supported combinations, and avatar-wardrobe.js resolves image paths and editor options. Images are lossless WebP exports under images/avatar-catalogue; manifest.json records their original catalogue paths and source hashes. All visible pixels and alpha were compared with the PNG source during export.

The catalogue contains 630 referenced images, including 505 new skin-tone variants. It does not contain every possible combination. Whole-character accessory looks retain their generated face and hair colour. Headwear uses the cream hoodie / blue trousers outfit; scarf, backpack and crossbody outfit sets use tousled hair. Tops, Bottoms and Shoes preserve the other selections when an exact combination exists. Outfit sets explicitly change the clothing together. No garment segmentation or automatic fitting is used.

New preferences use avatar.version = 2 with outfit, accessory, hair, tone, eyes, brows and mouth. Existing unversioned avatars keep the legacy renderer/editor. The explicit “Try new wardrobe” action saves avatarLegacy before selecting the new default, and “Use my previous avatar” restores it. Both fields travel with the existing preferences backup/sync. No user storage migration runs automatically.

All asset names are content-addressed. Five default layers and the catalogue scripts are precached with the app; other images are cached on demand in bubu-avatar-catalogue-v1. That cache survives ordinary app version updates. A previously unseen look requires connectivity; failed loads do not replace the saved selection. Catalogue image memory is bounded to 40 cached requests. The default avatar and downloaded looks can be used offline, subject to browser storage availability.

Validation:

- node validate-avatar.js: all 505 variants, six-tone accessory retention, headwear/hair combinations, invalid-state fallback and 630 file references.
- Browser tests at 375px: scarf/top/skin changes, save/reload, profile rendering, legacy switch/restore, no horizontal overflow or JavaScript errors.
- Real service-worker installation and offline reload of saved cap/bun; light and dark screenshots reviewed.
- JavaScript syntax and git whitespace checks passed.

The cache install now deduplicates its existing asset list: repeated path panda entries otherwise caused cache.addAll to reject.

This implementation is local and has not been committed or published. To release, follow the repository's existing deployment process. The app/cache stamp is v217.
