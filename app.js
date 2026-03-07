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

const incentiveExtra = document.getElementById("incentiveExtra")
const incentiveDetail = document.getElementById("incentiveDetail")
const incentiveDate = document.getElementById("incentiveDate")

function searchProduct(code){

const product = database.find(
p => String(p["Part Number"]).trim() === String(code).trim()
)

if(!product){

productName.innerText = "ไม่พบสินค้า ❌"

staffCom.innerText = "-"
leaderCom.innerText = "-"
tamagCom.innerText = "-"

incentiveExtra.style.display = "none"

return
}

productName.innerText = product["Model"]

staffCom.innerText = product["Sales Staff"]
leaderCom.innerText = product["Store Leader"]
tamagCom.innerText = product["Total incentive"]

if(product["Incentive Details"]){

incentiveExtra.style.display = "block"

incentiveDetail.innerText = product["Incentive Details"]

incentiveDate.innerText =
(product["Start Date"] || "") +
" - " +
(product["End Date"] || "")

}else{

incentiveExtra.style.display = "none"

}

}

/* manual search */

searchBtn.addEventListener("click", ()=>{

const code = input.value.trim()

if(code) searchProduct(code)

})

/* scan camera */

scanBtn.addEventListener("click", async ()=>{

reader.classList.add("active")

const html5QrCode = new Html5Qrcode("reader")

try{

const cameras = await Html5Qrcode.getCameras()

if(!cameras.length){

alert("ไม่พบกล้อง")

return

}

const cameraId = cameras[0].id

await html5QrCode.start(

cameraId,

{
fps: 10,
qrbox: { width: 300, height: 120 }
},

(decodedText)=>{

input.value = decodedText

searchProduct(decodedText)

html5QrCode.stop()

reader.classList.remove("active")

}

)

}catch(err){

console.error(err)

alert("ไม่สามารถเปิดกล้องได้")

}

})

/* gallery */

uploadBtn.addEventListener("click", ()=>{

fileInput.click()

})

fileInput.addEventListener("change", async (e)=>{

const file = e.target.files[0]

if(!file) return

const html5QrCode = new Html5Qrcode("reader")

try{

const result = await html5QrCode.scanFile(file,true)

input.value = result

searchProduct(result)

}catch(err){

alert("อ่าน barcode จากรูปไม่ได้")

}

})
