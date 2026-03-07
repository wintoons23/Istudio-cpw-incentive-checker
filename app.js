let database = [];

// ===== โหลด database =====
async function loadDatabase() {
const res = await fetch("database.json");
database = await res.json();
}

loadDatabase();

// ===== DOM =====
const input = document.getElementById("barcodeInput");
const searchBtn = document.getElementById("searchBtn");
const scanBtn = document.getElementById("scanBtn");

const productName = document.getElementById("productName");
const staffCom = document.getElementById("staffCom");
const leaderCom = document.getElementById("leaderCom");
const tamagCom = document.getElementById("tamagCom");

const reader = document.getElementById("reader");

// ===== ทำความสะอาด barcode =====
function normalizeBarcode(value) {

return value
.replace("(01)", "")      // ลบ prefix GS1
.replace(/\s/g, "")       // ลบ space
.replace(/\D/g, "")       // เอาเฉพาะตัวเลข
.replace(/^0+/, "")       // ลบเลข 0 ข้างหน้า
.trim();

}

// ===== หา product =====
function findProduct(part) {

const cleaned = normalizeBarcode(part);

return database.find(item => {

```
if (!item["Part Number"]) return false;

const dbPart = normalizeBarcode(String(item["Part Number"]));

return dbPart === cleaned;
```

});

}

// ===== แสดงสินค้า =====
function showProduct(data) {

productName.innerText = data["Model"] || "-";

staffCom.innerText = data["Sales Staff"] || "-";
leaderCom.innerText = data["Store Leader"] || "-";

const tamag =
Number(data["Total incentive"]) -
Number(data["Sales Staff"]) -
Number(data["Store Leader"]);

tamagCom.innerText = tamag || "-";

}

// ===== reset =====
function clearResult() {

productName.innerText = "ไม่พบสินค้า";
staffCom.innerText = "-";
leaderCom.innerText = "-";
tamagCom.innerText = "-";

}

// ===== search =====
function searchProduct() {

const value = input.value;

if (!value) {
alert("กรอก Part Number ก่อน");
return;
}

const product = findProduct(value);

if (!product) {
clearResult();
return;
}

showProduct(product);

}

// ===== click search =====
searchBtn.addEventListener("click", searchProduct);

// ===== enter search =====
input.addEventListener("keypress", function (e) {

if (e.key === "Enter") {
searchProduct();
}

});

// ===== scanner =====
let codeReader;

scanBtn.addEventListener("click", () => {

reader.style.display = "block";

codeReader = new ZXing.BrowserMultiFormatReader();

codeReader.decodeFromVideoDevice(
null,
"reader",
(result, err) => {

```
  if (result) {

    const text = result.getText();

    input.value = normalizeBarcode(text);

    codeReader.reset();

    reader.style.display = "none";

    searchProduct();
  }

}
```

);

});
