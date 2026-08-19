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

let restaurant = {
  name: "CaféMenu",
  tagline: "منيو إلكتروني",
  description: "اكتشف أشهى الوجبات والحلويات والمشروبات في مكان واحد.",
  heroTitle: "طعم يستحق التجربة",
  heroImage: "",
  logo: "☕",
  phone: "0590000000",
  whatsapp: "970590000000",
  address: "موقع المطعم",
  hours: "يومياً 10:00 - 23:00"
};

let cart = JSON.parse(localStorage.getItem("cart") || "[]");



/* =====================================================
   FIREBASE
===================================================== */

async function loadFirebaseData() {

  try {

    const { initializeApp } =
      await import(
        "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js"
      );

    const {
      getFirestore,
      collection,
      getDocs,
      doc,
      getDoc
    } =
      await import(
        "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js"
      );

    const app = initializeApp(firebaseConfig);

    const db = getFirestore(app);



    /* =========================
       RESTAURANT SETTINGS
    ========================= */

try {

  const restaurantRef =
    doc(db, "settings", "restaurant");

  const restaurantSnap =
    await getDoc(restaurantRef);

  if (restaurantSnap.exists()) {

    const data = restaurantSnap.data();

    restaurant = {
      ...restaurant,

      name:
        data.restaurantName ||
        data.name ||
        restaurant.name,

      tagline:
        data.tagline ||
        restaurant.tagline,

      description:
        data.description ||
        restaurant.description,

      heroTitle:
        data.heroTitle ||
        restaurant.heroTitle,

      heroImage:
        data.heroImage ||
        restaurant.heroImage,

      logo:
        data.logoUrl ||
        data.logo ||
        restaurant.logo,

      phone:
        data.phone ||
        restaurant.phone,

      whatsapp:
        data.whatsapp ||
        restaurant.whatsapp,

      address:
        data.address ||
        restaurant.address,

      hours:
        data.hours ||
        restaurant.hours
    };

  }

} catch (settingsError) {

  console.warn(
    "Restaurant settings could not be loaded:",
    settingsError
  );

}

/* =========================
   DESIGN SETTINGS
========================= */

try {

  const designRef =
    doc(db, "settings", "design");

  const designSnap =
    await getDoc(designRef);

  if (designSnap.exists()) {

    restaurant = {
      ...restaurant,
      ...designSnap.data()
    };

  }

} catch (designError) {

  console.warn(
    "Design settings could not be loaded:",
    designError
  );

}

    /* =========================
       CATEGORIES + PRODUCTS
    ========================= */

    const [
      categoriesSnap,
      productsSnap
    ] = await Promise.all([

      getDocs(
        collection(db, "categories")
      ),

      getDocs(
        collection(db, "products")
      )

    ]);


    categories =
      categoriesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));


    products =
      productsSnap.docs

        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        .filter(
          p => p.available !== false
        );


    applyRestaurantSettings();

    render();

  } catch (error) {

    console.error(
      "Firebase Error:",
      error
    );

    const productsElement =
      document.getElementById("products");

    const featuredElement =
      document.getElementById("featuredProducts");

    if (productsElement) {

      productsElement.innerHTML =
        "<p>حدث خطأ أثناء تحميل المنيو.</p>";

    }

    if (featuredElement) {

      featuredElement.innerHTML =
        "<p>تعذر تحميل الأصناف.</p>";

    }

  }

}



/* =====================================================
   HELPER
===================================================== */

function setText(id, value) {

  const element =
    document.getElementById(id);

  if (!element) return;

  if (
    value !== undefined &&
    value !== null &&
    String(value).trim() !== ""
  ) {

    element.textContent = value;

  }

}



/* =====================================================
   RESTAURANT SETTINGS
===================================================== */

function applyRestaurantSettings() {

  const name =
    restaurant.name ||
    "CaféMenu";

  const tagline =
    restaurant.tagline ||
    "منيو إلكتروني";

  const description =
    restaurant.description ||
    "اكتشف أشهى الوجبات والحلويات والمشروبات في مكان واحد.";

  const heroTitle =
    restaurant.heroTitle ||
    "طعم يستحق التجربة";

  const phone =
    restaurant.phone ||
    "0590000000";

  const whatsapp =
    restaurant.whatsapp ||
    "970590000000";

  const address =
    restaurant.address ||
    "موقع المطعم";

  const hours =
    restaurant.hours ||
    "يومياً 10:00 - 23:00";



  /* =========================
     TEXT
  ========================= */

  setText(
    "restaurantName",
    name
  );

  setText(
    "footerName",
    name
  );

  setText(
    "copyrightName",
    name
  );

  setText(
    "restaurantTagline",
    tagline
  );

  setText(
    "heroTitle",
    heroTitle
  );

  setText(
    "heroDescription",
    description
  );

  setText(
    "restaurantHours",
    hours
  );

  setText(
    "restaurantAddress",
    address
  );

  setText(
    "restaurantPhone",
    phone
  );

  setText(
    "footerAddress",
    `📍 ${address}`
  );

  setText(
    "footerPhone",
    `📞 ${phone}`
  );

  setText(
    "footerHours",
    `🕐 ${hours}`
  );



  /* =========================
     LOGO
  ========================= */

  applyLogo(
    "restaurantLogo",
    restaurant.logo
  );

  applyLogo(
    "footerLogo",
    restaurant.logo
  );



  /* =========================
     PHONE
  ========================= */

  const phoneLink =
    document.getElementById("phoneLink");

  if (phoneLink) {

    phoneLink.href =
      `tel:${phone.replace(/\s+/g, "")}`;

  }



  /* =========================
     WHATSAPP
  ========================= */

  const whatsappLink =
    document.getElementById("whatsappLink");

  if (whatsappLink) {

    whatsappLink.href =
      `https://wa.me/${cleanPhone(whatsapp)}`;

  }



  /* =========================
     HERO IMAGE
  ========================= */

  if (restaurant.heroImage) {

    document.documentElement.style
      .setProperty(
        "--restaurant-hero",
        `url("${restaurant.heroImage}")`
      );

  }

}



/* =====================================================
   LOGO
===================================================== */

function applyLogo(id, logo) {

  const element =
    document.getElementById(id);

  if (!element) return;


  if (!logo) {

    element.textContent = "☕";

    return;

  }


  /*
    إذا كان الرابط صورة
  */

  if (
    typeof logo === "string" &&
    (
      logo.startsWith("http") ||
      logo.startsWith("data:image")
    )
  ) {

    element.innerHTML = `
      <img
        src="${logo}"
        alt="شعار المطعم"
        style="
          width:100%;
          height:100%;
          object-fit:contain;
          border-radius:inherit;
        "
      >
    `;

  } else {

    /*
      إذا كان Emoji
    */

    element.textContent = logo;

  }

}



/* =====================================================
   PHONE
===================================================== */

function cleanPhone(phone) {

  return String(phone || "")
    .replace(/\+/g, "")
    .replace(/\s+/g, "")
    .replace(/-/g, "");

}



/* =====================================================
   CATEGORIES
===================================================== */

function renderCategories() {

  const container =
    document.getElementById("categories");

  const menuContainer =
    document.getElementById("menuCategories");


  const allCategories = [
    {
      id: "all",
      name: "الكل"
    },
    ...categories
  ];


  const html =
    allCategories.map(c => {

      const safeName =
        String(c.name || "")
          .replace(/'/g, "\\'");

      return `
        <button
          class="category ${
            c.name === activeCategory
              ? "active"
              : ""
          }"
          onclick="setCategory('${safeName}')"
        >
          ${c.name || ""}
        </button>
      `;

    }).join("");


  if (container) {

    container.innerHTML = html;

  }


  if (menuContainer) {

    menuContainer.innerHTML = html;

  }

}



/* =====================================================
   PRODUCT CARD
===================================================== */

function card(p) {

  const image =
    p.image ||
    "https://placehold.co/900x600?text=CafeMenu";


  const name =
    p.name || "";


  const description =
    p.description ||
    "بدون وصف";


  const price =
    Number(p.price || 0);



  return `
    <article class="product">

      <img
        src="${image}"
        alt="${name}"
        loading="lazy"
      >

      <div class="product-body">

        <h3>
          ${name}
        </h3>

        <p>
          ${description}
        </p>

        <div class="product-bottom">

          <span class="price">
            ${price} ₪
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



/* =====================================================
   RENDER
===================================================== */

function render() {

  const searchInput =
    document.getElementById(
      "searchInput"
    );


  const q =
    searchInput
      ? searchInput.value
          .trim()
          .toLowerCase()
      : "";


  const list =
    products.filter(p => {

      const categoryMatch =
        activeCategory === "الكل" ||

        p.categoryId === activeCategory ||

        categories.some(
          c =>
            c.id === p.categoryId &&
            c.name === activeCategory
        );


      const searchMatch =
        !q ||

        (p.name || "")
          .toLowerCase()
          .includes(q) ||

        (p.description || "")
          .toLowerCase()
          .includes(q);


      return (
        categoryMatch &&
        searchMatch
      );

    });



  const productsElement =
    document.getElementById(
      "products"
    );


  if (productsElement) {

    productsElement.innerHTML =
      list.length

        ? list.map(card).join("")

        : "<p>لا توجد أصناف في هذا القسم.</p>";

  }



  /* =========================
     FEATURED
  ========================= */

  const featured =
    products.filter(
      p => p.featured === true
    );


  const featuredElement =
    document.getElementById(
      "featuredProducts"
    );


  if (featuredElement) {

    featuredElement.innerHTML =
      featured.length

        ? featured.map(card).join("")

        : "<p>لا توجد أصناف مميزة حالياً.</p>";

  }


  renderCategories();

  updateCart();

}



/* =====================================================
   CATEGORY
===================================================== */

function setCategory(category) {

  activeCategory =
    category;

  render();

}



/* =====================================================
   CART
===================================================== */

function addToCart(id) {

  const item =
    cart.find(
      x =>
        String(x.id) ===
        String(id)
    );


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



/* =====================================================
   REMOVE
===================================================== */

function removeFromCart(id) {

  cart =
    cart.filter(
      x =>
        String(x.id) !==
        String(id)
    );


  saveCart();

}



/* =====================================================
   SAVE CART
===================================================== */

function saveCart() {

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  updateCart();

}



/* =====================================================
   UPDATE CART
===================================================== */

function updateCart() {

  const count =
    cart.reduce(
      (sum, item) =>
        sum + item.qty,
      0
    );


  const cartCount =
    document.getElementById(
      "cartCount"
    );

  const cartCountTop =
    document.getElementById(
      "cartCountTop"
    );


  if (cartCount) {

    cartCount.textContent =
      count;

  }


  if (cartCountTop) {

    cartCountTop.textContent =
      count;

  }



  const items =
    document.getElementById(
      "cartItems"
    );


  if (!items) return;


  if (!cart.length) {

    items.innerHTML =
      '<p style="color:var(--muted)">السلة فارغة حالياً.</p>';

    document.getElementById(
      "cartTotal"
    ).textContent =
      "0 ₪";

    return;

  }


  let total = 0;

  const validCart = [];


  items.innerHTML =
    cart.map(item => {

      const product =
        products.find(
          p =>
            String(p.id) ===
            String(item.id)
        );


      if (!product) {

        return "";

      }


      validCart.push(item);


      total +=
        Number(product.price || 0) *
        item.qty;


      return `
        <div class="cart-row">

          <div>

            <strong>
              ${product.name}
            </strong>

            <br>

            <small>
              ${item.qty}
              ×
              ${product.price}
              ₪
            </small>

          </div>

          <button
            onclick="removeFromCart('${product.id}')"
          >
            حذف
          </button>

        </div>
      `;

    }).join("");


  cart =
    validCart;


  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );


  document.getElementById(
    "cartTotal"
  ).textContent =
    total + " ₪";

}



/* =====================================================
   SEARCH
===================================================== */

const searchInput =
  document.getElementById(
    "searchInput"
  );


if (searchInput) {

  searchInput.addEventListener(
    "input",
    render
  );

}



/* =====================================================
   CART BUTTON
===================================================== */

function openCart() {

  const modal =
    document.getElementById(
      "cartModal"
    );

  if (modal) {

    modal.classList.remove(
      "hidden"
    );

  }

}


const cartBtn =
  document.getElementById(
    "cartBtn"
  );


if (cartBtn) {

  cartBtn.onclick =
    openCart;

}


const cartBtnTop =
  document.getElementById(
    "cartBtnTop"
  );


if (cartBtnTop) {

  cartBtnTop.onclick =
    openCart;

}



/* =====================================================
   CLOSE CART
===================================================== */

const closeCart =
  document.getElementById(
    "closeCart"
  );


if (closeCart) {

  closeCart.onclick =
    () => {

      document
        .getElementById("cartModal")
        .classList.add("hidden");

    };

}



/* =====================================================
   THEME
===================================================== */

const themeBtn =
  document.getElementById(
    "themeBtn"
  );


if (themeBtn) {

  themeBtn.onclick =
    () => {

      document.body
        .classList
        .toggle("dark");


      themeBtn.textContent =
        document.body.classList.contains(
          "dark"
        )
          ? "☀️"
          : "🌙";


      localStorage.setItem(
        "dark",
        document.body.classList.contains(
          "dark"
        )
      );

    };

}


if (
  localStorage.getItem("dark") ===
  "true"
) {

  document.body
    .classList
    .add("dark");


  if (themeBtn) {

    themeBtn.textContent =
      "☀️";

  }

}



/* =====================================================
   WHATSAPP ORDER
===================================================== */

const whatsappBtn =
  document.getElementById(
    "whatsappBtn"
  );


if (whatsappBtn) {

  whatsappBtn.onclick =
    () => {

      if (!cart.length) {

        alert("السلة فارغة");

        return;

      }


      const lines = [];

      let total = 0;


      cart.forEach(item => {

        const product =
          products.find(
            p =>
              String(p.id) ===
              String(item.id)
          );


        if (!product) return;


        const subtotal =
          Number(product.price || 0) *
          item.qty;


        total += subtotal;


        lines.push(
          `• ${product.name} × ${item.qty} = ${subtotal} ₪`
        );

      });


      const msg =
        `مرحباً، أريد طلب:%0A` +
        lines.join("%0A") +
        `%0A%0Aالإجمالي: ${total} ₪`;


      const number =
        cleanPhone(
          restaurant.whatsapp ||
          "970590000000"
        );


      window.open(
        `https://wa.me/${number}?text=${msg}`,
        "_blank"
      );

    };

}



/* =====================================================
   START
===================================================== */

loadFirebaseData();
