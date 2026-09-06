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

test("RSVP supports both configured endpoint and honest demo mode",()=>{
  assert.match(js,/if\(rsvpEndpoint\)/);
  assert.match(js,/демонстрационной версии/);
  assert.match(js,/response\.ok/);
});
