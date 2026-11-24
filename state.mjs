import {questions} from './questions.mjs';
export const KEY='residency-voice-answers-v1';
export const labels={empty:'Not answered',answered:'Answered',unknown:'Not sure',none:'None / not applicable',ask:'Ask someone / follow up'};
export function fresh(){return {version:1,current:0,updatedAt:null,answers:Object.fromEntries(questions.map(q=>[q.id,{text:'',status:'empty'}]))};}
export function setAnswer(s,id,text){s.answers[id].text=text;if(['empty','answered'].includes(s.answers[id].status))s.answers[id].status=text.trim()?'answered':'empty';s.updatedAt=new Date().toISOString();}
export function setStatus(s,id,status){if(!labels[status])throw Error('Invalid status');s.answers[id].status=status;s.updatedAt=new Date().toISOString();}
export function save(storage,s){try{storage.setItem(KEY,JSON.stringify(s));return {ok:true};}catch{return {ok:false};}}
export function parseImport(raw){const x=JSON.parse(raw);if(!x||x.version!==1||!x.answers||Array.isArray(x.answers)||Object.keys(x.answers).some(id=>!questions.some(q=>String(q.id)===id)))throw Error('Not a compatible answers backup.');const s=fresh();for(const q of questions){const a=x.answers[q.id];if(!a||typeof a.text!=='string'||!Object.hasOwn(labels,a.status)||a.text.length>500000)throw Error('Invalid answer data.');s.answers[q.id]={text:a.text,status:a.status};}s.current=Number.isInteger(x.current)&&x.current>=0&&x.current<21?x.current:0;s.updatedAt=typeof x.updatedAt==='string'?x.updatedAt:null;return s;}
export function load(storage){try{const raw=storage.getItem(KEY);return raw?{state:parseImport(raw),recoveryRequired:false}:{state:fresh(),recoveryRequired:false};}catch{return {state:fresh(),recoveryRequired:true};}}
export function transcript(base,results){return [base.trim(),...Array.from(results,r=>r[0]?.transcript?.trim()||'')].filter(Boolean).join(' ');}
export function report(s){return ['RESIDENCY QUESTIONNAIRE ANSWERS','Updated: '+(s.updatedAt||'Not yet edited'),'Raw responses for review. Unknown and follow-up items are retained.','',...questions.flatMap(q=>[`${q.id}. ${q.title}`,q.prompt,`Status: ${labels[s.answers[q.id].status]}`,s.answers[q.id].text||'(No response recorded)','',''])].join('\n');}
