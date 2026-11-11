/** Live Vultr capability checks; do not infer vision support from model names. */
export const CATALOG_URL="https://api.vultrinference.com/v1/models?output_modalities=text";
export function modalityNames(item,side="input_modalities"){
  const list=item?.[side]||[];
  return list.map(x=>typeof x==="string"?x:x?.type).filter(Boolean);
}
export function describeModel(item){
  if(!item?.id)throw Error("Catalog item missing model ID");
  const im=modalityNames(item),om=modalityNames(item,"output_modalities");
  const input=(item.input_modalities||[]).find(x=>x.type==="text")||{};
  const output=(item.output_modalities||[]).find(x=>x.type==="text")||{};
  const inputPrice=Number((input.pricing||[]).find(x=>x.type==="prompt")?.cost_usd);
  const outputPrice=Number((output.pricing||[]).find(x=>x.type==="completion")?.cost_usd);
  return {id:item.id,input:im,output:om,readsImages:im.includes("image"),
    writesText:om.includes("text"),inputUsdPerMillion:Number.isFinite(inputPrice)?inputPrice*1e6:null,
    outputUsdPerMillion:Number.isFinite(outputPrice)?outputPrice*1e6:null};
}
export async function catalog({fetcher=fetch}={}){
  const response=await fetcher(CATALOG_URL,{signal:AbortSignal.timeout(25000)});
  if(!response.ok)throw Error("Vultr catalog unavailable HTTP "+response.status);
  const payload=await response.json();
  if(!Array.isArray(payload.data)||!payload.data.length)throw Error("Catalog returned no models");
  return payload.data.map(describeModel);
}
export function selectModel(models,id,{vision=false}={}){
  const found=models.find(m=>m.id===id);
  if(!found)throw Error("Unknown Vultr model "+id+"; refusing silent fallback");
  if(!found.writesText||vision&&!found.readsImages)throw Error("Model lacks required modalities: "+id);
  return found;
}
export function assertActualModel(expected,actual){
  if(actual!==expected)throw Error("Vultr substituted "+String(actual)+" for "+expected+"; benchmark invalid");
  return actual;
}
