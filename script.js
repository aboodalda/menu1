const firebaseConfig = {
  apiKey: "AIzaSyCsS0rR0wOz3mGBszmtKwPXQZi4pFVcukA",
  authDomain: "cafemenu-3ff9a.firebaseapp.com",
  projectId: "cafemenu-3ff9a",
  storageBucket: "cafemenu-3ff9a.firebasestorage.app",
  messagingSenderId: "52378316579",
  appId: "1:52378316579:web:8512b57f8a9c6f64b8a696"
};

let products = [];
let categories = [];
let activeCategory = "الكل";
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

async function loadFirebaseData() {
  try {
    const { initializeApp } =
      await import("https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js");

    const { getFirestore, collection, getDocs } =
      await import("https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js");

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const [categoriesSnap, productsSnap] = await Promise.all([
      getDocs(collection(db, "categories")),
      getDocs(collection(db, "products"))
    ]);

    categories = categoriesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    products = productsSnap.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(p => p.available !== false);

    render();
  } catch (error) {
    console.error("Firebase Error:", error);

    document.getElementById("products").innerHTML =
      "<p>حدث خطأ أثناء تحميل المنيو.</p>";

    document.getElementById("featuredProducts").innerHTML =
      "<p>تعذر تحميل الأصناف.</p>";
  }
}

function renderCategories() {
  const container = document.getElementById("categories");

  const allCategories = [
    { id: "all", name: "الكل" },
    ...categories
  ];

  container.innerHTML = allCategories.map(c => `
    <button
      class="category ${c.name === activeCategory ? "active" : ""}"
      onclick="setCategory('${c.name.replace(/'/g, "\\'")}')"
    >
      ${c.name}
    </button>
  `).join("");
}

function card(p) {
  return `
    <article class="product">
      <img
        src="${p.image || "https://placehold.co/900x600?text=CafeMenu"}"
        alt="${p.name || ""}"
        loading="lazy"
      >

      <div class="product-body">

        <h3>${p.name || ""}</h3>

        <p>${p.description || "بدون وصف"}</p>

        <div class="product-bottom">

          <span class="price">
            ${Number(p.price || 0)} ₪
          </span>

          <button
            class="add-btn"
            onclick="addToCart('${p.id}')"
          >
            + أضف
          </button>

        </div>

      </div>
    </article>
  `;
}

function render() {

  const searchInput = document.getElementById("searchInput");

  const q = searchInput
    ? searchInput.value.trim().toLowerCase()
    : "";

  const list = products.filter(p => {

    const categoryMatch =
      activeCategory === "الكل" ||
      p.categoryId === activeCategory ||
      categories.some(
        c => c.id === p.categoryId && c.name === activeCategory
      );

    const searchMatch =
      !q ||
      (p.name || "").toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q);

    return categoryMatch && searchMatch;
  });

  document.getElementById("products").innerHTML =
    list.length
      ? list.map(card).join("")
      : "<p>لا توجد أصناف في هذا القسم.</p>";

  const featured = products.filter(p => p.featured === true);

  document.getElementById("featuredProducts").innerHTML =
    featured.length
      ? featured.map(card).join("")
      : "<p>لا توجد أصناف مميزة حالياً.</p>";

  renderCategories();

  updateCart();
}

function setCategory(category) {
  activeCategory = category;
  render();
}

function addToCart(id) {

  const item = cart.find(x => String(x.id) === String(id));

  if (item) {
    item.qty++;
  } else {
    cart.push({
      id: id,
      qty: 1
    });
  }

  saveCart();
}

function removeFromCart(id) {

  cart = cart.filter(
    x => String(x.id) !== String(id)
  );

  saveCart();
}

function saveCart() {

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  updateCart();
}

function updateCart() {

  const count = cart.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  document.getElementById("cartCount").textContent = count;

  const items = document.getElementById("cartItems");

  if (!cart.length) {

    items.innerHTML =
      '<p style="color:var(--muted)">السلة فارغة حالياً.</p>';

    document.getElementById("cartTotal").textContent = "0 ₪";

    return;
  }

  let total = 0;

  const validCart = [];

  items.innerHTML = cart.map(item => {

    const product = products.find(
      p => String(p.id) === String(item.id)
    );

    if (!product) return "";

    validCart.push(item);

    total += Number(product.price || 0) * item.qty;

    return `
      <div class="cart-row">

        <div>
          <strong>${product.name}</strong>
          <br>
          <small>
            ${item.qty} × ${product.price} ₪
          </small>
        </div>

        <button onclick="removeFromCart('${product.id}')">
          حذف
        </button>

      </div>
    `;

  }).join("");

  cart = validCart;

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  document.getElementById("cartTotal").textContent =
    total + " ₪";
}

document
  .getElementById("searchInput")
  .addEventListener("input", render);

document
  .getElementById("cartBtn")
  .onclick = () => {
    document
      .getElementById("cartModal")
      .classList.remove("hidden");
  };

document
  .getElementById("closeCart")
  .onclick = () => {
    document
      .getElementById("cartModal")
      .classList.add("hidden");
  };

document
  .getElementById("themeBtn")
  .onclick = () => {

    document.body.classList.toggle("dark");

    document.getElementById("themeBtn").textContent =
      document.body.classList.contains("dark")
        ? "☀️"
        : "🌙";

    localStorage.setItem(
      "dark",
      document.body.classList.contains("dark")
    );
  };

if (localStorage.getItem("dark") === "true") {

  document.body.classList.add("dark");

  document.getElementById("themeBtn").textContent =
    "☀️";
}

document
  .getElementById("whatsappBtn")
  .onclick = () => {

    if (!cart.length) {
      alert("السلة فارغة");
      return;
    }

    const lines = [];

    let total = 0;

    cart.forEach(item => {

      const product = products.find(
        p => String(p.id) === String(item.id)
      );

      if (!product) return;

      const subtotal =
        Number(product.price || 0) * item.qty;

      total += subtotal;

      lines.push(
        `• ${product.name} × ${item.qty} = ${subtotal} ₪`
      );
    });

    const msg =
      `مرحباً، أريد طلب:%0A` +
      lines.join("%0A") +
      `%0A%0Aالإجمالي: ${total} ₪`;

    window.open(
      `https://wa.me/970590000000?text=${msg}`,
      "_blank"
    );
  };

loadFirebaseData();
