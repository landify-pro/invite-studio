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
  for(const id of ["seal","musicBtn","menuToggle","rsvpBtn"]){
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

test("the opening starts on the cinematic envelope video without a floating letter",()=>{
  assert.match(html,/class="opening video-opening"/);
  assert.match(html,/id="openingVideo"[^>]*playsinline[^>]*muted/);
  assert.match(html,/data-desktop-src="assets\/video\/envelope-opening-desktop-v20\.mp4"/);
  assert.match(html,/data-mobile-src="assets\/video\/envelope-opening-v19\.mp4"/);
  assert.match(html,/data-desktop-poster="assets\/images\/envelope-video-poster-desktop-v20\.webp"/);
  assert.match(html,/data-mobile-poster="assets\/images\/envelope-video-poster-v19\.webp"/);
  assert.doesNotMatch(html,/opening-card|screen-flap|fullscreen-seal/);
});

test("the opening selects a dedicated film for desktop and mobile",()=>{
  assert.match(js,/matchMedia\("\(max-width:820px\)"\)/);
  assert.match(js,/openingVideo\.dataset\.mobileSrc/);
  assert.match(js,/openingVideo\.dataset\.desktopSrc/);
  assert.match(js,/openingVideo\.poster=poster/);
  assert.match(js,/openingVideo\.load\(\)/);
});

test("the mobile invitation ornament and countdown stay visually contained",()=>{
  assert.match(css,/\.invitation-copy:after\{right:-54px;bottom:-48px;width:132px;height:132px/);
  assert.match(css,/\.counter\{[^}]*width:min\(100%,300px\);[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/s);
  assert.match(css,/\.counter div:first-child strong\{font-size:clamp\(21px,6\.5vw,28px\)\}/);
  assert.match(css,/\.counter div\{width:100%;min-width:0;overflow:hidden/);
});

test("the video opening fills the viewport and dissolves into the site through white",()=>{
  assert.match(css,/\.video-opening \.opening-video\{[^}]*object-fit:cover;[^}]*object-position:50% 50%/s);
  assert.match(js,/await openingVideo\.play\(\)/);
  assert.match(js,/currentTime>=5\.56/);
  assert.match(js,/currentTime>=5\.98/);
  assert.match(css,/\.video-opening\.is-whiteout \.opening-whiteout\{opacity:1\}/);
  assert.match(css,/\.video-opening\.is-revealing \.opening-video-stage\{opacity:0\}/);
});

test("the opening respects reduced motion",()=>{
  assert.match(js,/prefers-reduced-motion: reduce/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\).*\.video-opening/s);
});

test("portrait and landscape screens keep the seal-centered video crop",()=>{
  assert.match(css,/\.opening-play\{[^}]*top:49%/s);
  assert.match(css,/@media\(orientation:portrait\).*\.opening-play\{top:49%;width:clamp\(118px,39vw,176px\)\}/s);
});

test("the opening uses a quiet animated instruction without a skip control",()=>{
  assert.match(html,/id="openingHint"/);
  assert.match(html,/Нажмите, чтобы открыть конверт/);
  assert.match(css,/@keyframes opening-hint-pulse/);
  assert.match(css,/\.opening-play:after\{content:none\}/);
  assert.doesNotMatch(html,/id="skip"|>Пропустить</);
  assert.doesNotMatch(js,/const skip=|skip\.addEventListener/);
});

test("RSVP supports both configured endpoint and honest demo mode",()=>{
  assert.match(js,/if\(rsvpEndpoint\)/);
  assert.match(js,/демонстрационной версии/);
  assert.match(js,/response\.ok/);
});
