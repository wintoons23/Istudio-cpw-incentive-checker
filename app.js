/* =======================================================
Incentive Checker - Smart Barcode Scanner
เวอร์ชั่นปรับปรุงเสถียรและเร็วขึ้น
======================================================= */

let scanner = null
let products = []

/* =======================================================
โหลด database.json
======================================================= */

fetch("database.json")
.then(res => res.json())
.then(data => {
products = data
})
.catch(err => {
console.error("โหลด database ไม่สำเร็จ", err)
})

/* =======================================================
Element ต่างๆ
======================================================= */

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

/* =======================================================
ฟังก์ชันทำความสะอาด barcode
กันปัญหา newline / space / invisible char
======================================================= */

function cleanBarcode(code){

```
if(!code) return ""

return String(code)
    .replace(/\s/g,"")      // ลบ space
    .replace(/\n/g,"")      // ลบ newline
    .trim()
```

}

/* =======================================================
ค้นหา Part Number
======================================================= */

function searchProduct(code){

```
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

productName.innerText = product.Model

staffCom.innerText = product["Sales Staff"] || "-"
leaderCom.innerText = product["Store Leader"] || "-"

/* หาร incentive ให้ตาแม็ก */

const leader = Number(product["Store Leader"]) || 0
tamagCom.innerText = leader/2

/* แสดงข้อมูลเพิ่ม */

incentiveDetail.innerText = product["Incentive Details"] || "-"
incentiveDate.innerText = product["Start Date"] + " - " + product["End Date"]

incentiveExtra.style.display = "block"
```

}

/* =======================================================
ปุ่มค้นหาปกติ
======================================================= */

searchBtn.addEventListener("click", () => {

```
searchProduct(input.value)
```

})

/* =======================================================
กด Enter เพื่อค้นหา
======================================================= */

input.addEventListener("keypress", (e)=>{

```
if(e.key==="Enter"){
    searchProduct(input.value)
}
```

})

/* =======================================================
ระบบ Scan กล้อง
======================================================= */

scanBtn.addEventListener("click", async () => {

```
reader.classList.add("active")

try{

    /* ถ้ามี scanner เก่าให้ปิดก่อน */

    if(scanner){
        await scanner.stop().catch(()=>{})
    }

    scanner = new Html5Qrcode("reader")

    /* ดึงรายการกล้อง */

    const cameras = await Html5Qrcode.getCameras()

    if(!cameras.length){
        alert("ไม่พบกล้อง")
        return
    }

    /* พยายามเลือกกล้องหลัง */

    const backCamera =
    cameras.find(c => c.label.toLowerCase().includes("back")) 
    || cameras[0]

    /* เริ่ม scan */

    await scanner.start(

        backCamera.id,

        {
            fps:20,

            /* รองรับ barcode เกือบทั้งหมด */

            formatsToSupport:[

                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,

                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,

                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.CODE_39,
                Html5QrcodeSupportedFormats.CODE_93,

                Html5QrcodeSupportedFormats.ITF,
                Html5QrcodeSupportedFormats.CODABAR

            ],

            /* กรอบ scan เหมาะกับ barcode */

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

            /* ปิดกล้องหลัง scan สำเร็จ */

            scanner.stop()

            reader.classList.remove("active")

        },

        /* error scan (ไม่ต้องทำอะไร) */

        (err)=>{}

    )

}
catch(err){

    console.error(err)

    alert("เปิดกล้องไม่สำเร็จ")

}
```

})

/* =======================================================
Scan จากรูปภาพ
======================================================= */

uploadBtn.addEventListener("click", () => {

```
fileInput.click()
```

})

fileInput.addEventListener("change", async (e)=>{

```
const file = e.target.files[0]

if(!file) return

const scanner = new Html5Qrcode("reader")

try{

    const result = await scanner.scanFile(file,true)

    const clean = cleanBarcode(result)

    input.value = clean

    searchProduct(clean)

}
catch(err){

    alert("ไม่สามารถอ่าน barcode จากรูปได้")

}
```

})
