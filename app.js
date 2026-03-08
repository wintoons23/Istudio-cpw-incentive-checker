/* ================= ELEMENT ================= */

const barcodeInput = document.getElementById("barcodeInput");
const searchBtn = document.getElementById("searchBtn");
const scanBtn = document.getElementById("scanBtn");
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");

const productName = document.getElementById("productName");
const staffCom = document.getElementById("staffCom");
const leaderCom = document.getElementById("leaderCom");
const readerEl = document.getElementById("reader");

let database = [];
let scanning = false;
let stream = null;

/* ================= โหลด Database ================= */

async function loadDatabase(){

try{

const res = await fetch("database.json",{cache:"no-store"});
const data = await res.json();

let allRows = [];

Object.keys(data).forEach(key=>{
if(Array.isArray(data[key])){
allRows = allRows.concat(data[key]);
}
});

/* normalize Part Number */

database = allRows
.filter(r=>r && r["Part Number"])
.map(r=>{

const raw = String(r["Part Number"]);
const clean = raw.replace(/[^\w]/g,"").trim();

return {...r,__pn_clean:clean};

});

console.log("DB Loaded:",database.length);

}catch(err){

alert("โหลด database ไม่ได้");
console.error(err);

}

}

loadDatabase();

/* ================= ค้นหาสินค้า ================= */

function searchBarcode(code){

if(!code) return;

const input = String(code)
.replace(/[^\w]/g,"")
.trim();

const product = database.find(
item=>item.__pn_clean === input
);

if(!product){

productName.innerText = "ไม่พบ Part Number นี้";
staffCom.innerText = "-";
leaderCom.innerText = "-";

return;

}

productName.innerText = product["Model"] || "-";
staffCom.innerText = (product["Sales Staff"] || 0)+" บาท";
leaderCom.innerText = (product["Store Leader"] || 0)+" บาท";

}

/* ================= ปุ่มค้นหา ================= */

searchBtn.addEventListener("click",()=>{

searchBarcode(barcodeInput.value);

});

/* ================= ปิดกล้อง ================= */

function stopScanner(){

try{

if(stream){
stream.getTracks().forEach(t=>t.stop());
stream = null;
}

Quagga.stop();

}catch(e){}

readerEl.innerHTML = "";

scanning = false;

}

/* ================= Scan กล้อง ================= */

scanBtn.addEventListener("click",async ()=>{

if(scanning) return;

scanning = true;

/* สร้าง video */

readerEl.innerHTML =
'<video id="camera" playsinline style="width:100%;height:320px;background:#000"></video>';

try{

stream = await navigator.mediaDevices.getUserMedia({

video:{
facingMode:{ideal:"environment"},
width:{ideal:1280},
height:{ideal:720}
}

});

const video = document.getElementById("camera");

video.srcObject = stream;

await video.play();

/* init quagga */

Quagga.init({

inputStream:{
type:"LiveStream",
target:video,
constraints:{
facingMode:"environment"
}
},

locator:{
patchSize:"medium",
halfSample:true
},

numOfWorkers:4,

decoder:{
readers:[

"code_128_reader",
"ean_reader",
"ean_8_reader",
"upc_reader",
"upc_e_reader"

]

},

locate:true

},err=>{

if(err){

console.error(err);

alert("Quagga init ไม่สำเร็จ");

stopScanner();

return;

}

Quagga.start();

});

/* scan สำเร็จ */

let detected = false;

Quagga.onDetected(result=>{

if(detected) return;

detected = true;

const code = result.codeResult.code;

barcodeInput.value = code;

stopScanner();

searchBarcode(code);

});

}catch(err){

console.error(err);

alert("เปิดกล้องไม่ได้ (ต้องใช้ https หรือ localhost)");

stopScanner();

}

});

/* ================= Scan จากรูป ================= */

const codeReader = new ZXing.BrowserMultiFormatReader();

uploadBtn.addEventListener("click",()=>fileInput.click());

fileInput.addEventListener("change",async e=>{

const file = e.target.files[0];

if(!file) return;

const img = document.createElement("img");

img.src = URL.createObjectURL(file);

img.onload = async ()=>{

try{

const result = await codeReader.decodeFromImageElement(img);

const code = result.text;

barcodeInput.value = code;

searchBarcode(code);

}catch(err){

alert("อ่านโค้ดจากรูปไม่ออก");

console.error(err);

}

};

});
