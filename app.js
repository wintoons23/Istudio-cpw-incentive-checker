const barcodeInput = document.getElementById("barcodeInput");
const searchBtn = document.getElementById("searchBtn");
const scanBtn = document.getElementById("scanBtn");

const productName = document.getElementById("productName");
const staffCom = document.getElementById("staffCom");
const leaderCom = document.getElementById("leaderCom");
const tamagCom = document.getElementById("tamagCom");

const reader = document.getElementById("reader");

let database = [];
let scanning = false;

const codeReader = new ZXing.BrowserMultiFormatReader();

/* โหลด database */
async function loadDatabase() {

const res = await fetch("database.json");
const raw = await res.json();

database = raw.filter(item => item["Part Number"]);

console.log("Loaded products:", database.length);

}

loadDatabase();

/* ทำความสะอาด barcode */
function cleanBarcode(code) {

return String(code)
.replace("(01)", "")
.replace(/\s/g, "")
.trim();

}

/* ค้นหา */
function searchBarcode(code) {

if (database.length === 0) {
alert("Database ยังโหลดไม่เสร็จ");
return;
}

const clean = cleanBarcode(code);

const product = database.find(p =>
String(p["Part Number"]).trim() === clean
);

if (!product) {

```
productName.innerText = "❌ ไม่พบสินค้า";
staffCom.innerText = "-";
leaderCom.innerText = "-";
tamagCom.innerText = "-";

return;
```

}

productName.innerText = product["Model"] || "-";

const staff = Number(product["Sales Staff"] || 0);
const leader = Number(product["Store Leader"] || 0);

staffCom.innerText = staff + " บาท";

const split = Math.floor(leader / 2);

leaderCom.innerText = split + " บาท";
tamagCom.innerText = split + " บาท";

}

/* ปุ่ม search */
searchBtn.onclick = () => {

searchBarcode(barcodeInput.value);

};

/* กด enter */
barcodeInput.addEventListener("keypress", e => {

if (e.key === "Enter") {
searchBarcode(barcodeInput.value);
}

});

/* scan กล้อง */
scanBtn.onclick = async () => {

if (scanning) return;

scanning = true;

reader.classList.add("active");
reader.innerHTML = `<video id="camera" playsinline></video>`;

try {

```
const result = await codeReader.decodeOnceFromVideoDevice(
  null,
  "camera"
);

barcodeInput.value = cleanBarcode(result.text);

reader.innerHTML = "";
reader.classList.remove("active");
scanning = false;

searchBarcode(result.text);
```

} catch (err) {

```
alert("เปิดกล้องไม่ได้");

reader.innerHTML = "";
reader.classList.remove("active");
scanning = false;
```

}

};
