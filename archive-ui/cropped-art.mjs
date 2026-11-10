import { worldAsset } from '../worlds.mjs';

// The site stores the archive's atlas cells as individual images. Apply the
// archive viewer's lighting and reflection to those same cells.
export function installCroppedArt(assetUrl) {
  function image(doc, id, form, variant) {
    const img = doc.createElement('img');
    img.src = assetUrl(worldAsset(id, form));
    img.alt = '';
    img.draggable = false;
    img.decoding = 'async';
    img.style.filter = `hue-rotate(${((variant >>> 8) % 17) - 8}deg) saturate(${96 + ((variant >>> 20) % 9)}%)`;
    if ((variant >>> 3) & 1) img.style.transform = 'scaleX(-1)';
    return img;
  }
  window.AGIIWorldArt = Object.freeze({
    has: id => id > 0 && id < 30,
    makeScene: (doc, theme, variant) => image(doc, theme.id, null, variant),
    makeFigure: (doc, theme, form, variant) => image(doc, theme.id, form, variant),
  });
}
