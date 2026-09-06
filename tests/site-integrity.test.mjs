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
  for(const id of ["seal","videoSeal","skip","musicBtn","menuToggle","rsvpBtn"]){
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

test("the released seal and helper effects leave no ghost on the open envelope",()=>{
  assert.match(css,/\.envelope>img\.wax-seal\{inset:auto;left:50%;top:55%;width:24%;height:auto\}/);
  assert.match(css,/\.opening\.is-flap-half \.wax-seal\{visibility:hidden\}/);
  assert.match(css,/\.opening\.is-releasing \.seal-trigger\{opacity:0;pointer-events:none\}/);
  assert.match(css,/\.opening\.is-opening \.light-burst,\.opening\.is-rising \.light-burst\{opacity:0\}/);
  assert.match(css,/\.opening\.is-opening \.envelope-flap\{opacity:0;visibility:hidden\}/);
});

test("the open envelope and mobile invitation ornament stay visually contained",()=>{
  assert.match(css,/\.envelope-open\{clip-path:inset\(0 0 22% 0\)\}/);
  assert.match(css,/\.opening\.is-rising \.opening-card\{transform:translate3d\(0,-37%,26px\) scale\(\.78\) rotateX\(-1deg\)\}/);
  assert.match(css,/\.invitation-copy:after\{right:-54px;bottom:-48px;width:132px;height:132px/);
});

test("the opening uses a cinematic multi-stage sequence",()=>{
  for(const stage of ["is-reacting","is-tracing","is-releasing","is-flap-half","is-opening","is-rising","is-settled"]){
    assert.match(js,new RegExp(`classList\\.add\\(\"${stage}\"\\)`));
  }
  assert.match(html,/class="opening-flash"/);
  assert.match(html,/class="envelope-aura"/);
  assert.match(html,/class="inner-glow"/);
  assert.match(css,/\.opening\.is-flap-half \.envelope-flap/);
  assert.match(css,/\.opening\.is-opening \.inner-glow/);
  assert.match(css,/\.opening\.is-rising \.opening-card/);
  assert.match(css,/\.opening\.is-settled \.opening-card/);
});

test("the opening respects reduced motion",()=>{
  assert.match(js,/prefers-reduced-motion: reduce/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\).*\.opening-flash/s);
});

test("mobile opening uses the real video and a code-driven card bridge",()=>{
  assert.match(html,/id="openingVideo"[^>]*muted[^>]*playsinline/);
  assert.match(html,/assets\/video\/envelope-opening-mobile\.mp4/);
  assert.match(html,/id="videoCardBridge"/);
  assert.match(css,/\.opening\.has-mobile-video\.is-bridging \.video-card-bridge/);
  assert.match(js,/function positionVideoBridge\(\)/);
  assert.match(js,/function startVideoBridge\(\)/);
  assert.match(js,/requestVideoFrameCallback/);
});

test("RSVP supports both configured endpoint and honest demo mode",()=>{
  assert.match(js,/if\(rsvpEndpoint\)/);
  assert.match(js,/демонстрационной версии/);
  assert.match(js,/response\.ok/);
});
