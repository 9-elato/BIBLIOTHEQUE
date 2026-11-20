export async function decodeModel(response){
 const bytes=await response.arrayBuffer(),header=new Uint8Array(bytes,0,Math.min(4,bytes.byteLength))
 // A host may transparently decompress .gz responses; don't decode twice.
 if(header[0]===0x1f&&header[1]===0x8b)return new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()
 return bytes
}
