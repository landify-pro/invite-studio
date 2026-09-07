import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {resolve} from "node:path";

const root=resolve(import.meta.dirname,"..");
const html=readFileSync(resolve(root,"index.html"),"utf8");
const css=readFileSync(resolve(root,"assets/v12.css"),"utf8");
const js=readFileSync(resolve(root,"assets/v12.js"),"utf8");

test("all local assets referenced by the page exist",()=>{
  const refs=[...html.matchAll(/(?:src|href|srcset)="(assets\/[^"? ]+)/g)].map(match=>match[1]);
  assert.ok(refs.length>=10);
  for(const ref of refs)assert.ok(existsSync(resolve(root,ref)),`Missing ${ref}`);
});

test("the current page no longer loads base64 runtime sprites",()=>{
  assert.doesNotMatch(html,/runtime\//);
  assert.doesNotMatch(js,/data:image|v10_/);
});

test("interactive controls have accessible names",()=>{
  for(const id of ["seal","skip","musicBtn","menuToggle","rsvpBtn"]){
    assert.match(html,new RegExp(`id="${id}"[^>]*(?:aria-label=|>[^<])`));
  }
});

test("responsive and reduced-motion rules are present",()=>{
  assert.match(css,/@media\(max-width:820px\)/);
  assert.match(css,/@media\(max-width:560px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test("countdown remains readable on its dark panel",()=>{
  assert.match(css,/\.countdown-panel\{color:var\(--ivory\)\}/);
});

test("the invitation uses the current couple and wedding date",()=>{
  assert.match(html,/Михаил/);
  assert.match(html,/Лиана/);
  assert.match(html,/21 июля 2027/);
  assert.match(js,/2027-07-21T17:00:00\+03:00/);
  assert.doesNotMatch(html,/Александр|Мария|21 июня 2027/);
});

test("the fullscreen envelope starts without a floating letter or card",()=>{
  assert.match(html,/class="opening fullscreen-opening"/);
  assert.doesNotMatch(html,/opening-card|opening-video|video-card-bridge/);
  assert.match(html,/class="fullscreen-seal"/);
  assert.match(css,/\.fullscreen-opening\{[^}]*--meet-x:50%;[^}]*--meet-y:48%/s);
});

test("the mobile invitation ornament and countdown stay visually contained",()=>{
  assert.match(css,/\.invitation-copy:after\{right:-54px;bottom:-48px;width:132px;height:132px/);
  assert.match(css,/\.counter strong\{font-size:clamp\(25px,7vw,34px\)\}/);
});

test("the opening uses four viewport-native flaps and a cinematic light transition",()=>{
  for(const flap of ["top","right","bottom","left"]){
    assert.match(html,new RegExp(`screen-flap-${flap}`));
    assert.match(css,new RegExp(`\\.screen-flap-${flap}\\{`));
  }
  for(const stage of ["is-seal-pressed","is-unsealing","is-envelope-opening","is-flashing","is-flash-peak","is-revealing"]){
    assert.match(js,new RegExp(`classList\\.add\\(\"${stage}\"\\)`));
  }
  assert.match(css,/clip-path:polygon\(0 0,100% 0,var\(--meet-x\) var\(--meet-y\)\)/);
  assert.match(css,/clip-path:polygon\(100% 0,100% 100%,var\(--meet-x\) var\(--meet-y\)\)/);
  assert.match(css,/clip-path:polygon\(0 100%,100% 100%,var\(--meet-x\) var\(--meet-y\)\)/);
  assert.match(css,/clip-path:polygon\(0 0,var\(--meet-x\) var\(--meet-y\),0 100%\)/);
  assert.match(css,/\.fullscreen-opening\.is-flash-peak \.opening-whiteout/);
});

test("the opening respects reduced motion",()=>{
  assert.match(js,/prefers-reduced-motion: reduce/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\).*\.fullscreen-opening/s);
});

test("portrait and landscape screens receive dedicated generated paper artwork",()=>{
  assert.match(html,/paper-embossed-desktop-v17\.webp/);
  assert.match(html,/paper-embossed-mobile-v17\.webp/);
  assert.match(css,/@media\(orientation:portrait\).*paper-embossed-mobile-v17\.webp/s);
  assert.doesNotMatch(js,/openingVideo|requestVideoFrameCallback|positionVideoBridge/);
});

test("RSVP supports both configured endpoint and honest demo mode",()=>{
  assert.match(js,/if\(rsvpEndpoint\)/);
  assert.match(js,/демонстрационной версии/);
  assert.match(js,/response\.ok/);
});
