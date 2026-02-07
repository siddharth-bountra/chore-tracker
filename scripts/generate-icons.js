const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "public", "icons");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

function makePng(size) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const crc32 = (data) => {
    let c = 0xffffffff;
    const table = (() => {
      const t = new Uint32Array(256);
      for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        t[n] = c;
      }
      return t;
    })();
    for (let i = 0; i < data.length; i++) c = table[(c ^ data[i]) & 0xff] ^ (c >>> 8);
    const b = Buffer.alloc(4);
    b.writeUInt32BE((c ^ 0xffffffff) >>> 0, 0);
    return b;
  };
  const writeChunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const chunk = Buffer.concat([Buffer.from(type), data]);
    const crc = crc32(chunk);
    return Buffer.concat([len, chunk, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const raw = Buffer.alloc((size * 3 + 1) * size);
  let o = 0;
  for (let y = 0; y < size; y++) {
    raw[o++] = 0;
    for (let x = 0; x < size; x++) {
      raw[o++] = 26;
      raw[o++] = 26;
      raw[o++] = 26;
    }
  }
  const zlib = require("zlib");
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    writeChunk("IHDR", ihdr),
    writeChunk("IDAT", idat),
    writeChunk("IEND", Buffer.alloc(0)),
  ]);
}

fs.writeFileSync(path.join(dir, "icon-192.png"), makePng(192));
fs.writeFileSync(path.join(dir, "icon-512.png"), makePng(512));
console.log("PWA icons written to public/icons/");
