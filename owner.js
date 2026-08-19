import{initializeApp}from"https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import{getAuth,signInWithEmailAndPassword,onAuthStateChanged,signOut}from"https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import{getFirestore,collection,getDocs,addDoc,doc,updateDoc,deleteDoc,getDoc,setDoc,serverTimestamp}from"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import{getStorage,ref,uploadBytes,getDownloadURL}from"https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

const firebaseConfig={apiKey:"AIzaSyCsS0rR0wOz3mGBszmtKwPXQZi4pFVcukA",authDomain:"cafemenu-3ff9a.firebaseapp.com",projectId:"cafemenu-3ff9a",storageBucket:"cafemenu-3ff9a.firebasestorage.app",messagingSenderId:"52378316579",appId:"1:52378316579:web:8512b57f8a9c6f64b8a696",measurementId:"G-7DEMS2C6DY"};
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app),storage=getStorage(app);
let categories=[],products=[],editingId=null,editingType=null;
const $=id=>document.getElementById(id),placeholder="https://placehold.co/900x600?text=CafeMenu";

function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2200)}
function img(v){return v||placeholder}

$("loginForm").addEventListener("submit",async e=>{e.preventDefault();$("loginError").textContent="";try{await signInWithEmailAndPassword(auth,$("loginEmail").value,$("loginPassword").value)}catch(err){$("loginError").textContent="بيانات الدخول غير صحيحة أو حدث خطأ."}});
$("logoutBtn").onclick=()=>signOut(auth);

onAuthStateChanged(auth,async user=>{if(user){$("loginScreen").classList.add("hidden");$("app").classList.remove("hidden");await loadAll()}else{$("app").classList.add("hidden");$("loginScreen").classList.remove("hidden")}});

document.querySelectorAll(".nav").forEach(btn=>btn.onclick=()=>{document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));btn.classList.add("active");document.querySelectorAll(".page").forEach(x=>x.classList.add("hidden"));$(btn.dataset.page+"Page").classList.remove("hidden");$("pageTitle").textContent=btn.textContent.replace(/^[^ ]+ /,"")});
$("quickCategory").onclick=()=>openCategoryModal();$("quickProduct").onclick=()=>openProductModal();$("addCategoryBtn").onclick=()=>openCategoryModal();$("addProductBtn").onclick=()=>openProductModal();$("closeModal").onclick=closeModal;

async function loadAll(){
  categories=(await getDocs(collection(db,"categories"))).docs.map(d=>({id:d.id,...d.data()}));
  products=(await getDocs(collection(db,"products"))).docs.map(d=>({id:d.id,...d.data()}));
  render();
  await loadSettings();
}
function render(){
  $("categoryCount").textContent=categories.length;$("productCount").textContent=products.length;
  $("availableCount").textContent=products.filter(p=>p.available!==false).length;
  $("featuredCount").textContent=products.filter(p=>p.featured===true).length;
  $("categoriesGrid").innerHTML=categories.length?categories.map(c=>`<article class="card"><img class="card-image" src="${esc(img(c.image))}" onerror="this.src='${placeholder}'"><div class="card-body"><h4>${esc(c.name)}</h4><p>${products.filter(p=>p.categoryId===c.id).length} أصناف</p><div class="card-actions"><button class="dark" onclick="editCategory('${c.id}')">تعديل</button><button class="danger" onclick="deleteCategory('${c.id}')">حذف</button></div></div></article>`).join(""):`<div class="empty">لا توجد أقسام. أضف أول قسم.</div>`;
  $("productsGrid").innerHTML=products.length?products.map(p=>`<article class="card"><img class="card-image" src="${esc(img(p.image))}" onerror="this.src='${placeholder}'"><div class="card-body"><h4>${esc(p.name)} <span class="price">${Number(p.price||0)} ₪</span></h4><p>${esc(p.description||"بدون وصف")}</p><span class="badge ${p.available!==false?"badge-on":"badge-off"}">${p.available!==false?"متوفر":"غير متوفر"}</span>${p.featured?'<span class="badge badge-on">⭐ مميز</span>':""}${p.offer?'<span class="badge badge-on">🔥 عرض</span>':""}<div class="card-actions" style="margin-top:10px"><button class="dark" onclick="editProduct('${p.id}')">تعديل</button><button class="danger" onclick="deleteProduct('${p.id}')">حذف</button></div></div></article>`).join(""):`<div class="empty">لا توجد أصناف. أضف أول صنف.</div>`;
}

function openCategoryModal(item=null){
  editingId=item?.id||null;editingType="category";$("modalTitle").textContent=editingId?"تعديل القسم":"إضافة قسم";
  $("entityForm").innerHTML=`<label>اسم القسم<input id="fName" required value="${esc(item?.name||"")}" placeholder="مثال: الحلويات"></label><label>رابط صورة القسم<input id="fImage" value="${esc(item?.image||"")}" placeholder="https://..."><span class="hint">يمكنك وضع رابط صورة مباشر.</span></label><label>أو اختر صورة من الجهاز<input id="fFile" type="file" accept="image/*"><span class="hint">رفع الملف يحتاج تفعيل Firebase Storage.</span></label><img id="preview" class="preview" src="${esc(img(item?.image))}"><button class="primary" type="submit">حفظ</button>`;
  $("modal").classList.remove("hidden");bindPreview();
}
function openProductModal(item=null){
  editingId=item?.id||null;editingType="product";$("modalTitle").textContent=editingId?"تعديل الصنف":"إضافة صنف";
  $("entityForm").innerHTML=productForm(item||{});$("modal").classList.remove("hidden");bindPreview();
}
function productForm(p){
  return `<label>اسم الصنف<input id="fName" required value="${esc(p.name||"")}" placeholder="مثال: كريب نوتيلا"></label><label>القسم<select id="fCategory" required>${categories.map(c=>`<option value="${c.id}" ${p.categoryId===c.id?"selected":""}>${esc(c.name)}</option>`).join("")}</select></label><label>السعر (₪)<input id="fPrice" type="number" min="0" step="0.01" required value="${p.price??""}"></label><label>الوصف<textarea id="fDescription" placeholder="وصف مختصر">${esc(p.description||"")}</textarea></label><label>رابط صورة الصنف<input id="fImage" value="${esc(p.image||"")}" placeholder="https://..."></label><label>أو اختر صورة من الجهاز<input id="fFile" type="file" accept="image/*"><span class="hint">رفع الملف يحتاج تفعيل Firebase Storage.</span></label><img id="preview" class="preview" src="${esc(img(p.image))}"><label class="check"><input id="fAvailable" type="checkbox" ${p.available!==false?"checked":""}> الصنف متوفر</label><label class="check"><input id="fFeatured" type="checkbox" ${p.featured?"checked":""}> ⭐ الأكثر طلباً</label><label class="check"><input id="fOffer" type="checkbox" ${p.offer?"checked":""}> 🔥 عرض خاص</label><button class="primary" type="submit">حفظ</button>`;
}
function bindPreview(){
  const file=$("fFile"),url=$("fImage"),preview=$("preview");
  if(file)file.onchange=()=>{if(file.files[0])preview.src=URL.createObjectURL(file.files[0])};
  if(url)url.oninput=()=>{if(url.value.trim())preview.src=url.value.trim()};
}
function closeModal(){$("modal").classList.add("hidden");$("entityForm").innerHTML=""}

$("entityForm").addEventListener("submit",async e=>{
  e.preventDefault();
  try{
    let image=$("fImage")?.value.trim()||"";
    const file=$("fFile")?.files?.[0];
    if(file){
      try{
        const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
        const storageRef=ref(storage,`menu/${auth.currentUser.uid}/${Date.now()}-${safe}`);
        await uploadBytes(storageRef,file);
        image=await getDownloadURL(storageRef);
      }catch(storageError){
        alert("لم يتم رفع الصورة من الجهاز. تأكد من تفعيل Firebase Storage. يمكنك حالياً استخدام رابط صورة مباشر.");
        if(!image) return;
      }
    }
    if(editingType==="category"){
      const data={name:$("fName").value.trim(),image,updatedAt:serverTimestamp()};
      if(editingId)await updateDoc(doc(db,"categories",editingId),data);else await addDoc(collection(db,"categories"),{...data,createdAt:serverTimestamp()});
    }else{
      const data={name:$("fName").value.trim(),categoryId:$("fCategory").value,price:Number($("fPrice").value),description:$("fDescription").value.trim(),image,available:$("fAvailable").checked,featured:$("fFeatured").checked,offer:$("fOffer").checked,updatedAt:serverTimestamp()};
      if(editingId)await updateDoc(doc(db,"products",editingId),data);else await addDoc(collection(db,"products"),{...data,createdAt:serverTimestamp()});
    }
    closeModal();await loadAll();toast("تم الحفظ بنجاح");
  }catch(err){alert("حدث خطأ: "+err.message)}
});

window.editCategory=id=>openCategoryModal(categories.find(x=>x.id===id));
window.editProduct=id=>openProductModal(products.find(x=>x.id===id));
window.deleteCategory=async id=>{if(!confirm("هل تريد حذف القسم؟"))return;await deleteDoc(doc(db,"categories",id));await loadAll();toast("تم حذف القسم")};
window.deleteProduct=async id=>{if(!confirm("هل تريد حذف الصنف؟"))return;await deleteDoc(doc(db,"products",id));await loadAll();toast("تم حذف الصنف")};

async function loadSettings(){
  const s=await getDoc(doc(db,"settings","restaurant"));
  const d=s.exists()?s.data():{};
  $("restaurantName").value=d.restaurantName||"CaféMenu";$("whatsapp").value=d.whatsapp||"";$("phone").value=d.phone||"";$("address").value=d.address||"";$("hours").value=d.hours||"";$("logoUrl").value=d.logoUrl||"";
}
$("settingsForm").addEventListener("submit",async e=>{e.preventDefault();await setDoc(doc(db,"settings","restaurant"),{restaurantName:$("restaurantName").value.trim(),whatsapp:$("whatsapp").value.trim(),phone:$("phone").value.trim(),address:$("address").value.trim(),hours:$("hours").value.trim(),logoUrl:$("logoUrl").value.trim(),updatedAt:serverTimestamp()},{merge:true});toast("تم حفظ الإعدادات")});
