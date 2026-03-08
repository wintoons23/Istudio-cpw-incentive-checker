/* =========================================
Incentive Checker - Stable Version
เวอร์ชั่นเสถียร ใช้งานจริงได้
========================================= */

let scanner = null
let products = []

/* =========================================
โหลด database.json
========================================= */

fetch("database.json")
.then(res => res.json())
.then(data => {
products = data
})
.catch(err => {
console.error("โหลด database ไม่สำเร็จ", err)
})

/* =========================================
Elements ต่างๆ
========================================= */

const input = document.getElementById("barcodeInput")
const searchBtn = document.getElementById("searchBtn")
const scanBtn = document.getElementById("scanBtn")
const uploadBtn = document.getElementById("uploadBtn")
const fileInput = document.getElementById("fileInput")
const reader = document.getElementById("reader")

const productName = document.getElementById("productName")
const staffCom = document.getElementById("staffCom")
const leaderCom = document.getElementById("leaderCom")
const tamagCom = document.getElementById("tamagCom")

const incentiveExtra = document.getElementById("incentiveExtra")
const incentiveDetail = document.getElementById("incentiveDetail")
const incentiveDate = document.getElementById("incentiveDate")

/* =========================================
ฟังก์ชันทำความสะอาด barcode
========================================= */

function cleanBarcode(code){

if(!code) return ""

return String(code)
.replace(/\s/g,"")
.replace(/\n/g,"")
.trim()

}

/* =========================================
ค้นหาสินค้า
========================================= */

function searchProduct(code){

const clean = cleanBarcode(code)

if(!clean){
alert("กรุณากรอก Part Number")
return
}

const product = products.find(p =>
cleanBarcode(p["Part Number"]) === clean
)

if(!product){

productName.innerText = "ไม่พบสินค้า ❌"
staffCom.innerText = "-"
leaderCom.innerText = "-"
tamagCom.innerText = "-"
incentiveExtra.style.display = "none"

return
}

/* แสดงข้อมูลสินค้า */

productName.innerText = product.Model || "-"

staffCom.innerText = product["Sales Staff"] || "-"
leaderCom.innerText = product["Store Leader"] || "-"

/* คำนวณ incentive ตาแม็ก */

const leader = Number(product["Store Leader"]) || 0
tamagCom.innerText = leader / 2

/* ข้อมูลเพิ่มเติม */

incentiveDetail.innerText = product["Incentive Details"] || "-"
incentiveDate.innerText =
(product["Start Date"] || "") + " - " +
(product["End Date"] || "")

incentiveExtra.style.display = "block"

}

/* =========================================
ปุ่ม Check Incentive
========================================= */

searchBtn.addEventListener("click", ()=>{

searchProduct(input.value)

})

/* =========================================
กด Enter เพื่อค้นหา
========================================= */

input.addEventListener("keypress", (e)=>{

if(e.key==="Enter"){
searchProduct(input.value)
}

})

/* =========================================
ระบบ Scan กล้อง
========================================= */

scanBtn.addEventListener("click", async ()=>{

reader.classList.add("active")

try{

/* ถ้ามี scanner เก่าให้ปิดก่อน */

if(scanner){
await scanner.stop().catch(()=>{})
}

/* สร้าง scanner */

scanner = new Html5Qrcode("reader")

/* ดึงรายการกล้อง */

const cameras = await Html5Qrcode.getCameras()

if(!cameras.length){
alert("ไม่พบกล้อง")
return
}

/* เลือกกล้องหลัง */

const backCamera =
cameras.find(c =>
c.label.toLowerCase().includes("back")
) || cameras[0]

/* เริ่ม scan */

await scanner.start(

backCamera.id,

{
fps:20,

qrbox:{
width:280,
height:120
},

aspectRatio:1.7

},

/* scan สำเร็จ */

(decodedText)=>{

const clean = cleanBarcode(decodedText)

input.value = clean

searchProduct(clean)

/* ปิดกล้อง */

scanner.stop().catch(()=>{})

reader.classList.remove("active")

},

(err)=>{}

)

}catch(err){

console.error(err)

alert("เปิดกล้องไม่ได้")

}

})

/* =========================================
Select From Gallery
========================================= */

uploadBtn.addEventListener("click", ()=>{

fileInput.click()

})

fileInput.addEventListener("change", async (e)=>{

const file = e.target.files[0]

if(!file) return

const tempScanner = new Html5Qrcode("reader")

try{

const result = await tempScanner.scanFile(file,true)

const clean = cleanBarcode(result)

input.value = clean

searchProduct(clean)

}catch(err){

alert("อ่าน barcode จากรูปไม่ได้")

}

})
