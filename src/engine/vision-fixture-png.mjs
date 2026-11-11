import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

/** Deterministic PNG canaries, rendered in JS without Chromium or image APIs. */
const FONT = {
" ":["00000","00000","00000","00000","00000","00000","00000"],
"-":["00000","00000","00000","11111","00000","00000","00000"],
"/":["00001","00010","00100","00100","01000","10000","00000"],
"0":["01110","10001","10011","10101","11001","10001","01110"],
"1":["00100","01100","00100","00100","00100","00100","01110"],
"2":["01110","10001","00001","00010","00100","01000","11111"],
"3":["11110","00001","00001","01110","00001","00001","11110"],
"4":["00010","00110","01010","10010","11111","00010","00010"],
"5":["11111","10000","10000","11110","00001","00001","11110"],
"6":["01111","10000","10000","11110","10001","10001","01110"],
"7":["11111","00001","00010","00100","01000","01000","01000"],
"8":["01110","10001","10001","01110","10001","10001","01110"],
"9":["01110","10001","10001","01111","00001","00001","11110"],
"A":["01110","10001","10001","11111","10001","10001","10001"],
"B":["11110","10001","10001","11110","10001","10001","11110"],
"C":["01111","10000","10000","10000","10000","10000","01111"],
"D":["11110","10001","10001","10001","10001","10001","11110"],
"E":["11111","10000","10000","11110","10000","10000","11111"],
"F":["11111","10000","10000","11110","10000","10000","10000"],
"G":["01111","10000","10000","10111","10001","10001","01111"],
"H":["10001","10001","10001","11111","10001","10001","10001"],
"I":["11111","00100","00100","00100","00100","00100","11111"],
"J":["00111","00010","00010","00010","10010","10010","01100"],
"K":["10001","10010","10100","11000","10100","10010","10001"],
"L":["10000","10000","10000","10000","10000","10000","11111"],
"M":["10001","11011","10101","10101","10001","10001","10001"],
"N":["10001","11001","10101","10011","10001","10001","10001"],
"O":["01110","10001","10001","10001","10001","10001","01110"],
"P":["11110","10001","10001","11110","10000","10000","10000"],
"Q":["01110","10001","10001","10001","10101","10010","01101"],
"R":["11110","10001","10001","11110","10100","10010","10001"],
"S":["01111","10000","10000","01110","00001","00001","11110"],
"T":["11111","00100","00100","00100","00100","00100","00100"],
"U":["10001","10001","10001","10001","10001","10001","01110"],
"V":["10001","10001","10001","10001","10001","01010","00100"],
"W":["10001","10001","10001","10101","10101","10101","01010"],
"X":["10001","10001","01010","00100","01010","10001","10001"],
"Y":["10001","10001","01010","00100","00100","00100","00100"],
"Z":["11111","00001","00010","00100","01000","10000","11111"],
":":["00000","00100","00100","00000","00100","00100","00000"],
".":["00000","00000","00000","00000","00000","00100","00100"],
"+":["00000","00100","00100","11111","00100","00100","00000"]
};
const W=960,H=625;
const colors={paper:[247,245,239],white:[255,255,255],ink:[23,50,42],muted:[76,97,86],gold:[245,217,124],coral:[216,89,82],green:[25,71,53],navy:[24,43,82],border:[204,214,207]};
const put=(buf,x,y,c)=>{
 if(x<0||x>=W||y<0||y>=H)return;
 const i=(y*W+x)*3;buf[i]=c[0];buf[i+1]=c[1];buf[i+2]=c[2];
};
function rect(buf,x,y,w,h,c){
 for(let yy=Math.max(0,y);yy<Math.min(H,y+h);yy++)for(let xx=Math.max(0,x);xx<Math.min(W,x+w);xx++)put(buf,xx,yy,c);
}
function glyph(buf,str,x,y,scale,color){
 let dx=x;
 for(const char of str.toUpperCase()){
  const rows=FONT[char];
  if(!rows)throw Error("Missing glyph "+char);
  for(let ry=0;ry<7;ry++)for(let rx=0;rx<5;rx++)if(rows[ry][rx]==="1")
   rect(buf,dx+rx*scale,y+ry*scale,scale,scale,color);
  dx+=6*scale;
 }
}
function crcTable(){
 const result=new Uint32Array(256);
 for(let n=0;n<256;n++){
  let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);
  result[n]=c>>>0;
 }
 return result;
}
const TABLE=crcTable();
function crc(data){let c=0xffffffff;for(const byte of data)c=TABLE[(c^byte)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
function chunk(type,data){
 const name=Buffer.from(type,"ascii"),len=Buffer.alloc(4),sum=Buffer.alloc(4);
 len.writeUInt32BE(data.length);sum.writeUInt32BE(crc(Buffer.concat([name,data])));
 return Buffer.concat([len,name,data,sum]);
}
function png(buf){
 const width=Buffer.alloc(13);width.writeUInt32BE(W,0);width.writeUInt32BE(H,4);width[8]=8;width[9]=2;
 const raw=Buffer.alloc(H*(W*3+1));
 for(let y=0;y<H;y++){const offset=y*(W*3+1);raw[offset]=0;buf.copy(raw,offset+1,y*W*3,(y+1)*W*3);}
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk("IHDR",width),
   chunk("IDAT",deflateSync(raw,{level:9})),chunk("IEND",Buffer.alloc(0))]);
}
export function writeVisionFixture(f,output){
 if(!["green","navy"].includes(f.headerColor)||!["STARTER","TEAM"].includes(f.selected))
  throw Error("Unsupported fixture");
 const buf=Buffer.alloc(W*H*3);
 rect(buf,0,0,W,H,colors.paper);
 rect(buf,0,0,W,147,colors[f.headerColor]);
 glyph(buf,f.brand,51,50,6,colors.white);
 rect(buf,707,53,207,63,colors.gold);
 glyph(buf,f.badge,723,71,4,colors.ink);
 glyph(buf,"WORKSPACE / PRICING",52,178,2,colors.muted);
 glyph(buf,"CHOOSE HOW YOU WORK",52,231,4,colors.ink);
 for(const [i,label] of ["STARTER","TEAM"].entries()){
  const x=53+i*451,y=332,selected=f.selected===label;
  rect(buf,x,y,427,258,selected?colors.coral:colors.border);
  rect(buf,x+(selected?8:5),y+(selected?8:5),427-(selected?16:10),258-(selected?16:10),colors.white);
  glyph(buf,label,x+27,y+58,5,colors.ink);
  glyph(buf,i===0?"29 / MONTH":"99 / MONTH",x+27,y+164,3,colors.ink);
 }
 const file=join(output,f.id+".png");
 writeFileSync(file,png(buf));
 return file;
}
