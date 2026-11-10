import { name } from './copy.mjs?v=10';
import { icon } from './icons.mjs';
import { worldAsset } from './worlds.mjs';

function expeditionSteps(t, assetUrl) {
  const stages = [
    { universe: 'I', scene: 14, iconName: 'compass' },
    { universe: 'I', scene: 14, iconName: 'note' },
    { universe: 'II', scene: 22, iconName: 'orbit' },
  ];
  return stages.map(({ universe, scene, iconName }, index) => `<article class="phase-tile">
    <div class="phase-scene"><img src="${assetUrl(worldAsset(scene))}" alt="" loading="lazy" decoding="async"><div class="phase-coordinates"><span>${icon('orbit', 13)} ${t.universe} ${universe}</span><span class="phase-number">0${index + 1}</span></div></div>
    <div class="phase-content"><h3>${icon(iconName, 18)} ${t.phases[index][0]}</h3><p>${t.phases[index][1]}</p></div>
  </article>`).join('');
}

export function renderCover(host, { t, lang, session, oldPractice, message, assetUrl, homeUrl }) {
  const entryLabel = session ? session.game.phase === 'complete' ? t.report : t.resume : t.start;
  host.innerHTML = `<header class="site-head"><div class="frame head-inner">
    <a class="brand" href="${homeUrl}" data-page="/" aria-label="${name}"><img src="${assetUrl('mark.svg')}" width="42" height="42" alt=""><strong>${name}</strong></a>
    <nav aria-label="${t.home}"><a href="#expeditions">${t.how}</a><a href="#data">${t.data}</a></nav>
    <div class="head-tools"><div class="language" role="group" aria-label="${t.language}"><button type="button" data-lang="en" lang="en" aria-pressed="${lang === 'en'}">EN</button><button type="button" data-lang="zh" lang="zh-CN" aria-pressed="${lang === 'zh'}">中文</button></div></div>
  </div></header>
  ${message ? `<div class="frame flash" role="status">${message}</div>` : ''}
  <main id="main" class="frame home-main">
    <section class="hero" aria-labelledby="hero-title"><div class="hero-image"></div><div class="hero-shade"></div><div class="hero-grid"></div>
      <span class="corner top-left"></span><span class="corner top-right"></span><span class="corner bottom-left"></span><span class="corner bottom-right"></span>
      <div class="hero-content"><div class="eyebrow hero-label"><span class="tag-dot"></span>${t.pilot}</div>
        <h1 id="hero-title">${name}</h1><p class="hero-tagline">${t.heroTagline}</p>
        <p class="hero-desc">${t.intro}</p><div class="hero-actions"><button type="button" class="button primary" data-ui="enter">${entryLabel}${icon('arrow', 20)}</button><a class="button secondary" href="#expeditions">${t.howLink}</a></div>
        <ul class="hero-facts"><li>${icon('layers', 16)}${t.roundsMeta}</li><li>${icon('orbit', 16)}${t.worldMeta}</li><li>${icon('monitor', 16)}${t.deviceMeta}</li></ul>
      </div><p class="hero-plate">${t.heroCaption}<span></span></p>
    </section>
    <section class="home-section" id="expeditions"><div class="section-head"><p class="eyebrow">${t.flowKicker}</p><h2>${t.flowTitle}</h2><p>${t.flowIntro}</p></div>
      <div class="phase-grid">${expeditionSteps(t, assetUrl)}</div>
    </section>
    <div class="home-info"><section class="info-tile" id="help"><p class="eyebrow">${t.helpKicker}</p><h2>${t.helpTitle}</h2><p>${t.helpText}</p></section><section class="info-tile" id="data"><p class="eyebrow">${t.dataKicker}</p><h2>${t.dataTitle}</h2><p>${t.dataText}</p>${oldPractice ? `<div class="legacy-download"><button class="button secondary" type="button" data-ui="download-practice">${t.downloadPractice}${icon('download', 16)}</button></div>` : ''}</section></div>
  </main>
  <footer class="site-foot frame"><span><span class="foot-dot"></span>${name}</span></footer>`;
}
