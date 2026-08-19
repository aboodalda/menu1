const products = [
  {id:1,name:'برجر كلاسيك',cat:'وجبات رئيسية',price:25,img:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',desc:'برجر لحم طازج مع الجبنة والخضار',featured:true},
  {id:2,name:'بيتزا خضار',cat:'بيتزا',price:28,img:'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80',desc:'صلصة طماطم، جبنة ومجموعة خضار طازجة',featured:true},
  {id:3,name:'كريب نوتيلا',cat:'حلويات',price:18,img:'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=900&q=80',desc:'كريب طري محشو بالنوتيلا مع لمسة شوكولاتة',featured:true},
  {id:4,name:'وجبة زنجر',cat:'وجبات رئيسية',price:24,img:'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=80',desc:'دجاج مقرمش، صوص خاص، بطاطا ومشروب'},
  {id:5,name:'بطاطا بالجبنة',cat:'مقبلات',price:12,img:'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80',desc:'بطاطا مقرمشة مع الجبنة والصوص'},
  {id:6,name:'كوكتيل فواكه',cat:'مشروبات',price:15,img:'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80',desc:'مزيج منعش من الفواكه الطازجة'},
  {id:7,name:'تشيز كيك',cat:'حلويات',price:16,img:'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=80',desc:'تشيز كيك كريمي مع صوص الفراولة'},
  {id:8,name:'كابتشينو',cat:'مشروبات',price:10,img:'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=900&q=80',desc:'قهوة إسبريسو مع حليب ورغوة ناعمة'}
];

let activeCategory = 'الكل';
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

const categories = ['الكل', ...new Set(products.map(p => p.cat))];

function renderCategories(){
  document.getElementById('categories').innerHTML = categories.map(c =>
    `<button class="category ${c===activeCategory?'active':''}" onclick="setCategory('${c}')">${c}</button>`
  ).join('');
}

function card(p){
  return `<article class="product">
    <img src="${p.img}" alt="${p.name}" loading="lazy">
    <div class="product-body">
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <div class="product-bottom">
        <span class="price">${p.price} ₪</span>
        <button class="add-btn" onclick="addToCart(${p.id})">+ أضف</button>
      </div>
    </div>
  </article>`;
}

function render(){
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const list = products.filter(p =>
    (activeCategory === 'الكل' || p.cat === activeCategory) &&
    (!q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q))
  );
  document.getElementById('products').innerHTML = list.length ? list.map(card).join('') : '<p>لا توجد نتائج.</p>';
  document.getElementById('featuredProducts').innerHTML = products.filter(p=>p.featured).map(card).join('');
  renderCategories();
  updateCart();
}

function setCategory(c){ activeCategory=c; render(); }

function addToCart(id){
  const item = cart.find(x=>x.id===id);
  if(item) item.qty++;
  else cart.push({id,qty:1});
  saveCart();
}

function removeFromCart(id){
  cart = cart.filter(x=>x.id!==id);
  saveCart();
}

function saveCart(){
  localStorage.setItem('cart',JSON.stringify(cart));
  updateCart();
}

function updateCart(){
  const count = cart.reduce((s,x)=>s+x.qty,0);
  document.getElementById('cartCount').textContent=count;
  const items = document.getElementById('cartItems');
  if(!cart.length){
    items.innerHTML='<p style="color:var(--muted)">السلة فارغة حالياً.</p>';
    document.getElementById('cartTotal').textContent='0 ₪';
    return;
  }
  let total=0;
  items.innerHTML=cart.map(x=>{
    const p=products.find(v=>v.id===x.id);
    total += p.price*x.qty;
    return `<div class="cart-row"><div><strong>${p.name}</strong><br><small>${x.qty} × ${p.price} ₪</small></div><button onclick="removeFromCart(${p.id})">حذف</button></div>`;
  }).join('');
  document.getElementById('cartTotal').textContent=total+' ₪';
}

document.getElementById('searchInput').addEventListener('input', render);
document.getElementById('cartBtn').onclick=()=>document.getElementById('cartModal').classList.remove('hidden');
document.getElementById('closeCart').onclick=()=>document.getElementById('cartModal').classList.add('hidden');

document.getElementById('themeBtn').onclick=()=>{
  document.body.classList.toggle('dark');
  document.getElementById('themeBtn').textContent=document.body.classList.contains('dark')?'☀️':'🌙';
  localStorage.setItem('dark',document.body.classList.contains('dark'));
};
if(localStorage.getItem('dark')==='true'){
  document.body.classList.add('dark');
  document.getElementById('themeBtn').textContent='☀️';
}

document.getElementById('whatsappBtn').onclick=()=>{
  if(!cart.length) return alert('السلة فارغة');
  const lines=cart.map(x=>{
    const p=products.find(v=>v.id===x.id);
    return `• ${p.name} × ${x.qty} = ${p.price*x.qty} ₪`;
  });
  const total=cart.reduce((s,x)=>s+products.find(p=>p.id===x.id).price*x.qty,0);
  const msg=`مرحباً، أريد طلب:%0A${lines.join('%0A')}%0A%0Aالإجمالي: ${total} ₪`;
  window.open(`https://wa.me/970590000000?text=${msg}`,'_blank');
};

render();
