let database = []

fetch("database.json")
.then(res => res.json())
.then(data => database = data)

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

function searchProduct(code){

const product = database.find(p => p["Part Number"] === code)

if(!product){
productName.innerText = "ไม่พบสินค้า ❌"
staffCom.innerText = "-"
leaderCom.innerText = "-"
tamagCom.innerText = "-"
return
}

productName.innerText = product["Model"]
staffCom.innerText = product["Sales Staff"]
leaderCom.innerText = product["Store Leader"]
tamagCom.innerText = product["Total incentive"]

}

searchBtn.addEventListener("click", () => {
searchProduct(input.value.trim())
})

/* ===== CAMERA SCAN ===== */

scanBtn.addEventListener("click", async () => {

reader.classList.add("active")

const html5QrCode = new Html5Qrcode("reader")

try{

await html5QrCode.start(
{ facingMode: "environment" },
{
fps: 10,
qrbox: { width: 300, height: 120 }
},
(decodedText) => {

input.value = decodedText
searchProduct(decodedText)

html5QrCode.stop()
reader.classList.remove("active")

}
)

}catch(err){

alert("ไม่สามารถเปิดกล้องได้")

}

})

/* ===== SELECT FROM GALLERY ===== */

uploadBtn.addEventListener("click", () => {

fileInput.click()

})

fileInput.addEventListener("change", async (e) => {

const file = e.target.files[0]

if(!file) return

const html5QrCode = new Html5Qrcode("reader")

try{

const result = await html5QrCode.scanFile(file, true)

input.value = result
searchProduct(result)

}catch(err){

alert("ไม่สามารถอ่าน barcode จากรูปได้")

}

})
