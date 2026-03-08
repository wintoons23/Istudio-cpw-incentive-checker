/* =====================================
Elements
===================================== */

const barcodeInput = document.getElementById("barcodeInput");
const searchBtn = document.getElementById("searchBtn");
const scanBtn = document.getElementById("scanBtn");

const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");

const productName = document.getElementById("productName");
const staffCom = document.getElementById("staffCom");
const leaderCom = document.getElementById("leaderCom");

const reader = document.getElementById("reader");

/* =====================================
Database
===================================== */

let database = [];
let scanning = false;
let detected = false;

async function loadDatabase(){

try{

const res = await fetch("database.json",{cache:"no-store"});
const data = await res.json();

database = data
.filter(r=>r && r["Part Number"])
.map(r=>{

const clean = String(r["Part Number"])
.replace(/[^\w]/g,"")
.trim();

return {...r,__pn_clean:clean};

});

console.log("Database Loaded:",database.length);

}catch(err){

console.error(err);
alert("โหลด database.json ไม่สำเร็จ");

}

}

loadDatabase();

/* =====================================
Search
===================================== */

function searchBarcode(code){

if(!code) return;

const input = String(code)
.replace(/[^\w]/g,"")
.trim();

const product = database.find(
item=>item.__pn_clean === input
);

if(!product){

productName.innerText = "ไม่พบสินค้า";
staffCom.innerText = "-";
leaderCom.innerText = "-";

return;

}

productName.innerText = product["Model"] || "-";
staffCom.innerText = (product["Sales Staff"] || 0) + " บาท";
leaderCom.innerText = (product["Store Leader"] || 0) + " บาท";

}

/* =====================================
Search Button
===================================== */

searchBtn.addEventListener("click",()=>{

searchBarcode(barcodeInput.value);

});

/* =====================================
Camera Scan
===================================== */

scanBtn.addEventListener("click",()=>{

if(scanning) return;

scanning = true;
detected = false;

reader.style.display = "block";

Quagga.init({

inputStream:{

type:"LiveStream",
target:reader,

constraints:{
width:1280,
height:720,
facingMode:"environment"
}

},

locator:{
patchSize:"medium",
halfSample:true
},

numOfWorkers:navigator.hardwareConcurrency || 4,

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
alert("เปิดกล้องไม่ได้");

scanning=false;
reader.style.display="none";

return;

}

Quagga.start();

});

});


Quagga.onDetected(result=>{

if(detected) return;

detected = true;

const code = result.codeResult.code;

barcodeInput.value = code;

Quagga.stop();

reader.style.display="none";

scanning=false;

searchBarcode(code);

});

/* =====================================
Scan from Image
===================================== */

const codeReader = new ZXing.BrowserMultiFormatReader();

uploadBtn.addEventListener("click",()=>{

fileInput.click();

});

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

alert("อ่าน barcode ไม่ได้");

}

};

});
