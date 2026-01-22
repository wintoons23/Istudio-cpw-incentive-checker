const barcodeInput = document.getElementById("barcodeInput");
const searchBtn = document.getElementById("searchBtn");
const scanBtn = document.getElementById("scanBtn");
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");

const productNameEl = document.getElementById("productName");
const staffCom = document.getElementById("staffCom");
const leaderCom = document.getElementById("leaderCom");
const tamagCom = document.getElementById("tamagCom");

const incentiveExtra = document.getElementById("incentiveExtra");
const incentiveDetail = document.getElementById("incentiveDetail");
const incentiveDate = document.getElementById("incentiveDate");

const readerEl = document.getElementById("reader");
const productImageWrap = document.getElementById("productImageWrap");
const productImage = document.getElementById("productImage");

let database = [];
let scanning = false;

const codeReader = new ZXing.BrowserMultiFormatReader();

/* ===== Load Database ===== */
async function loadDatabase() {
  const res = await fetch("database.json", { cache: "no-store" });
  const raw = await res.json();
  
  const merged = [];
  Object.keys(raw).forEach(key => {
    if (Array.isArray(raw[key])) {
      raw[key].forEach(item => {
        if (item && item["Part Number"]) {
          merged.push({
            ...item,
            __pn: String(item["Part Number"]).trim()
          });
        }
      });
    }
  });
  
  database = merged;
}
loadDatabase();

/* ===== Image ===== */
function fetchProductImage(name) {
  if (!name) {
    productImageWrap.style.display = "none";
    return;
  }
  
  const keyword = name.replace(/-.*$/, "").trim();
  productImage.src =
    "https://via.placeholder.com/600x600?text=" +
    encodeURIComponent(keyword);
  
  productImageWrap.style.display = "block";
}

/* ===== Search ===== */
function searchBarcode(code) {
  const clean = String(code).trim();
  const product = database.find(p => p.__pn === clean);
  
  if (!product) {
    productNameEl.innerText = "❌ ไม่พบสินค้า";
    staffCom.innerText = "-";
    leaderCom.innerText = "-";
    tamagCom.innerText = "-";
    incentiveExtra.style.display = "none";
    productImageWrap.style.display = "none";
    return;
  }
  
  productNameEl.innerText = product["Model"] || "-";
  staffCom.innerText = (product["Sales Staff"] || 0) + " บาท";
  
  const leaderTotal = Number(product["Store Leader"] || 0);
  const split = Math.floor(leaderTotal / 2);
  
  leaderCom.innerText = split + " บาท";
  tamagCom.innerText = split + " บาท";
  
  const detail = product["Incentive Details"];
  const start = product["Start Date"];
  const end = product["End Date"];
  
  if (detail || start || end) {
    incentiveExtra.style.display = "block";
    incentiveDetail.innerText = detail || "-";
    incentiveDate.innerText =
      start && end ? `${start} - ${end}` :
      start ? `เริ่ม ${start}` : "-";
  } else {
    incentiveExtra.style.display = "none";
  }
  
  fetchProductImage(product["Model"]);
}

/* ===== Events ===== */
searchBtn.onclick = () => {
  searchBarcode(barcodeInput.value);
};

/* ===== Scan Camera ===== */
scanBtn.onclick = async () => {
  if (scanning) return;
  scanning = true;
  
  readerEl.classList.add("active");
  readerEl.innerHTML = `<video id="camera" playsinline></video>`;
  
  try {
    const result = await codeReader.decodeOnceFromVideoDevice(
      null,
      "camera"
    );
    
    barcodeInput.value = result.text;
    
    readerEl.innerHTML = "";
    readerEl.classList.remove("active");
    scanning = false;
    
    searchBarcode(result.text);
  } catch (err) {
    alert("เปิดกล้องไม่ได้ หรือสแกนไม่สำเร็จ");
    readerEl.innerHTML = "";
    readerEl.classList.remove("active");
    scanning = false;
  }
};

/* ===== Gallery ===== */
uploadBtn.onclick = () => fileInput.click();

fileInput.onchange = async e => {
  const file = e.target.files[0];
  if (!file) return;
  
  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  
  img.onload = async () => {
    const result = await codeReader.decodeFromImageElement(img);
    barcodeInput.value = result.text;
    searchBarcode(result.text);
  };
};