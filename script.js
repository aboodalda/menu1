/* =====================================================
   FIREBASE CONFIG
===================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyCsS0rR0wOz3mGBszmtKwPXQZi4pFVcukA",
  authDomain: "cafemenu-3ff9a.firebaseapp.com",
  projectId: "cafemenu-3ff9a",
  storageBucket: "cafemenu-3ff9a.firebasestorage.app",
  messagingSenderId: "52378316579",
  appId: "1:52378316579:web:8512b57f8a9c6f64b8a696"
};


/* =====================================================
   GLOBAL DATA
===================================================== */

let products = [];
let categories = [];

let activeCategory = "الكل";

let restaurant = {
  name: "CaféMenu",
  tagline: "منيو إلكتروني",
  description:
    "اكتشف أشهى الوجبات والحلويات والمشروبات في مكان واحد.",
  heroTitle: "طعم يستحق التجربة",
  heroDescription:
    "اكتشف أشهى الوجبات والحلويات والمشروبات في مكان واحد.",
  heroImage: "",
  logo: "☕",
  phone: "0590000000",
  whatsapp: "970590000000",
  address: "موقع المطعم",
  hours: "يومياً 10:00 - 23:00",
  primaryColor: "",
  buttonColor: ""
};


/* =====================================================
   CART
===================================================== */

let cart = JSON.parse(
  localStorage.getItem("cart") || "[]"
);


/* =====================================================
   FIREBASE
===================================================== */

async function loadFirebaseData() {

  try {

    const {
      initializeApp
    } = await import(
      "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js"
    );


    const {
      getFirestore,
      collection,
      getDocs,
      doc,
      getDoc
    } = await import(
      "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js"
    );


    const app =
      initializeApp(firebaseConfig);

    const db =
      getFirestore(app);


    /* =================================================
       RESTAURANT SETTINGS
    ================================================= */

    try {

      const restaurantRef =
        doc(
          db,
          "settings",
          "restaurant"
        );


      const restaurantSnap =
        await getDoc(
          restaurantRef
        );


      if (
        restaurantSnap.exists()
      ) {

        const data =
          restaurantSnap.data();


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

          /*
             مهم:
             نقرأ heroImage من إعدادات المطعم
             إذا كانت موجودة.
          */
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


    /* =================================================
       DESIGN SETTINGS
    ================================================= */

    try {

      const designRef =
        doc(
          db,
          "settings",
          "design"
        );


      const designSnap =
        await getDoc(
          designRef
        );


      if (
        designSnap.exists()
      ) {

        const design =
          designSnap.data();


        /*
          ندمج إعدادات التصميم
          مع بيانات المطعم.

          heroImage هنا لها أولوية
          لأنها محفوظة من قسم تخصيص المنيو.
        */

        restaurant = {

          ...restaurant,

          primaryColor:
            design.primaryColor ||
            restaurant.primaryColor,

          buttonColor:
            design.buttonColor ||
            restaurant.buttonColor,

          heroTitle:
            design.heroTitle ||
            restaurant.heroTitle,

          heroDescription:
            design.heroDescription ||
            restaurant.heroDescription,

          heroImage:
            design.heroImage ||
            restaurant.heroImage

        };

      }

    } catch (designError) {

      console.warn(
        "Design settings could not be loaded:",
        designError
      );

    }


    /* =================================================
       CATEGORIES + PRODUCTS
    ================================================= */

    const [
      categoriesSnap,
      productsSnap
    ] = await Promise.all([

      getDocs(
        collection(
          db,
          "categories"
        )
      ),

      getDocs(
        collection(
          db,
          "products"
        )
      )

    ]);


    categories =
      categoriesSnap.docs.map(
        item => ({

          id: item.id,

          ...item.data()

        })
      );


    products =
      productsSnap.docs

        .map(
          item => ({

            id: item.id,

            ...item.data()

          })
        )

        .filter(
          product =>
            product.available !== false
        );


    /* =================================================
       APPLY SETTINGS
    ================================================= */

    applyRestaurantSettings();


    /* =================================================
       RENDER
    ================================================= */

    render();


  } catch (error) {

    console.error(
      "Firebase Error:",
      error
    );


    const productsElement =
      document.getElementById(
        "products"
      );


    const featuredElement =
      document.getElementById(
        "featuredProducts"
      );


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
   SET TEXT
===================================================== */

function setText(
  id,
  value
) {

  const element =
    document.getElementById(id);


  if (!element) return;


  if (
    value !== undefined &&
    value !== null &&
    String(value).trim() !== ""
  ) {

    element.textContent =
      value;

  }

}


/* =====================================================
   APPLY RESTAURANT SETTINGS
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


  const heroDescription =
    restaurant.heroDescription ||
    description;


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


  /* =================================================
     TEXT
  ================================================= */

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
    heroDescription
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


  /* =================================================
     LOGO
  ================================================= */

  applyLogo(
    "restaurantLogo",
    restaurant.logo
  );


  applyLogo(
    "footerLogo",
    restaurant.logo
  );


  /* =================================================
     PHONE
  ================================================= */

  const phoneLink =
    document.getElementById(
      "phoneLink"
    );


  if (phoneLink) {

    phoneLink.href =
      `tel:${cleanPhone(phone)}`;

  }


  /* =================================================
     WHATSAPP
  ================================================= */

  const whatsappLink =
    document.getElementById(
      "whatsappLink"
    );


  if (whatsappLink) {

    whatsappLink.href =
      `https://wa.me/${cleanPhone(
        whatsapp
      )}`;

  }


  /* =================================================
     HERO IMAGE
  ================================================= */

  applyHeroImage();


  /* =================================================
     DESIGN COLORS
  ================================================= */

  if (
    restaurant.primaryColor
  ) {

    document.documentElement.style
      .setProperty(
        "--primary",
        restaurant.primaryColor
      );

  }


  if (
    restaurant.buttonColor
  ) {

    document.documentElement.style
      .setProperty(
        "--button",
        restaurant.buttonColor
      );

  }

}


/* =====================================================
   HERO IMAGE
===================================================== */

function applyHeroImage() {

  const hero =
    document.querySelector(
      ".hero"
    );


  const image =
    restaurant.heroImage;


  if (
    hero &&
    image &&
    String(image).trim()
  ) {

    hero.style.backgroundImage =
      `url("${String(image)
        .replace(/"/g, '\\"')}")`;

  }

}


/* =====================================================
   LOGO
===================================================== */

function applyLogo(
  id,
  logo
) {

  const element =
    document.getElementById(id);


  if (!element) return;


  if (!logo) {

    element.textContent =
      "☕";

    return;

  }


  if (
    typeof logo === "string" &&
    (
      logo.startsWith("http") ||
      logo.startsWith("data:image")
    )
  ) {

    element.innerHTML = `

      <img
        src="${escapeHtmlAttribute(
          logo
        )}"
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

    element.textContent =
      logo;

  }

}


/* =====================================================
   CLEAN PHONE
===================================================== */

function cleanPhone(
  phone
) {

  return String(
    phone || ""
  )
    .replace(/\+/g, "")
    .replace(/\s+/g, "")
    .replace(/-/g, "")
    .replace(/\(/g, "")
    .replace(/\)/g, "");

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(
  value
) {

  return String(
    value ?? ""
  ).replace(
    /[&<>"']/g,
    character => ({

      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"

    }[character])
  );

}


function escapeHtmlAttribute(
  value
) {

  return escapeHtml(value);

}


/* =====================================================
   CATEGORIES
===================================================== */

function renderCategories() {

  const container =
    document.getElementById(
      "categories"
    );


  const menuContainer =
    document.getElementById(
      "menuCategories"
    );


  const allCategories = [

    {
      id: "all",
      name: "الكل"
    },

    ...categories

  ];


  const html =
    allCategories.map(
      category => {

        const categoryName =
          category.name || "";


        return `

          <button
            class="category ${
              categoryName ===
              activeCategory
                ? "active"
                : ""
            }"
            onclick="setCategory('${escapeHtmlAttribute(
              categoryName
            )}')"
          >

            ${escapeHtml(
              categoryName
            )}

          </button>

        `;

      }
    ).join("");


  if (container) {

    container.innerHTML =
      html;

  }


  if (menuContainer) {

    menuContainer.innerHTML =
      html;

  }

}


/* =====================================================
   PRODUCT CARD
===================================================== */

function card(product) {

  const image =
    product.image ||
    "https://placehold.co/900x600?text=CafeMenu";


  const name =
    product.name ||
    "";


  const description =
    product.description ||
    "بدون وصف";


  const price =
    Number(
      product.price || 0
    );


  return `

    <article class="product">

      <img
        src="${escapeHtmlAttribute(
          image
        )}"
        alt="${escapeHtmlAttribute(
          name
        )}"
        loading="lazy"
        onerror="this.src='https://placehold.co/900x600?text=CafeMenu'"
      >

      <div class="product-body">

        <h3>
          ${escapeHtml(name)}
        </h3>

        <p>
          ${escapeHtml(
            description
          )}
        </p>

        <div class="product-bottom">

          <span class="price">
            ${price} ₪
          </span>

          <button
            class="add-btn"
            onclick="addToCart('${escapeHtmlAttribute(
              product.id
            )}')"
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
    products.filter(
      product => {

        const categoryMatch =

          activeCategory ===
          "الكل"

          ||

          product.categoryId ===
          activeCategory

          ||

          categories.some(
            category =>

              category.id ===
              product.categoryId

              &&

              category.name ===
              activeCategory
          );


        const searchMatch =

          !q

          ||

          (
            product.name ||
            ""
          )
            .toLowerCase()
            .includes(q)

          ||

          (
            product.description ||
            ""
          )
            .toLowerCase()
            .includes(q);


        return (
          categoryMatch &&
          searchMatch
        );

      }
    );


  /* =================================================
     PRODUCTS
  ================================================= */

  const productsElement =
    document.getElementById(
      "products"
    );


  if (productsElement) {

    productsElement.innerHTML =

      list.length

        ? list
            .map(card)
            .join("")

        : `
          <p>
            لا توجد أصناف في هذا القسم.
          </p>
        `;

  }


  /* =================================================
     FEATURED
  ================================================= */

  const featured =
    products.filter(
      product =>
        product.featured === true
    );


  const featuredElement =
    document.getElementById(
      "featuredProducts"
    );


  if (featuredElement) {

    featuredElement.innerHTML =

      featured.length

        ? featured
            .map(card)
            .join("")

        : `
          <p>
            لا توجد أصناف مميزة حالياً.
          </p>
        `;

  }


  renderCategories();

  updateCart();

}


/* =====================================================
   CATEGORY
===================================================== */

function setCategory(
  category
) {

  activeCategory =
    category;

  render();

}


/* =====================================================
   CART - ADD
===================================================== */

function addToCart(
  id
) {

  const item =
    cart.find(
      product =>
        String(product.id) ===
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
   CART - REMOVE
===================================================== */

function removeFromCart(
  id
) {

  cart =
    cart.filter(
      item =>
        String(item.id) !==
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
      (
        total,
        item
      ) =>
        total +
        Number(item.qty || 0),
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
      `
        <p style="color:var(--muted)">
          السلة فارغة حالياً.
        </p>
      `;


    const totalElement =
      document.getElementById(
        "cartTotal"
      );


    if (totalElement) {

      totalElement.textContent =
        "0 ₪";

    }


    return;

  }


  let total = 0;

  const validCart = [];


  items.innerHTML =
    cart
      .map(
        item => {

          const product =
            products.find(
              p =>
                String(p.id) ===
                String(item.id)
            );


          if (!product) {

            return "";

          }


          validCart.push(
            item
          );


          const qty =
            Number(
              item.qty || 0
            );


          const price =
            Number(
              product.price || 0
            );


          const subtotal =
            price * qty;


          total +=
            subtotal;


          return `

            <div class="cart-row">

              <div>

                <strong>
                  ${escapeHtml(
                    product.name
                  )}
                </strong>

                <br>

                <small>

                  ${qty}
                  ×
                  ${price}
                  ₪

                </small>

              </div>

              <button
                onclick="removeFromCart('${escapeHtmlAttribute(
                  product.id
                )}')"
              >
                حذف
              </button>

            </div>

          `;

        }
      )
      .join("");


  cart =
    validCart;


  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );


  const totalElement =
    document.getElementById(
      "cartTotal"
    );


  if (totalElement) {

    totalElement.textContent =
      total + " ₪";

  }

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
   OPEN CART
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

      const modal =
        document.getElementById(
          "cartModal"
        );


      if (modal) {

        modal.classList.add(
          "hidden"
        );

      }

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


      const isDark =
        document.body.classList.contains(
          "dark"
        );


      themeBtn.textContent =
        isDark
          ? "☀️"
          : "🌙";


      localStorage.setItem(
        "dark",
        isDark
      );

    };

}


if (
  localStorage.getItem(
    "dark"
  ) === "true"
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

        alert(
          "السلة فارغة"
        );

        return;

      }


      const lines = [];

      let total = 0;


      cart.forEach(
        item => {

          const product =
            products.find(
              p =>
                String(p.id) ===
                String(item.id)
            );


          if (!product) return;


          const qty =
            Number(
              item.qty || 0
            );


          const subtotal =
            Number(
              product.price || 0
            ) * qty;


          total +=
            subtotal;


          lines.push(
            `• ${product.name} × ${qty} = ${subtotal} ₪`
          );

        }
      );


      const message =
        [
          "مرحباً، أريد طلب:",
          ...lines,
          "",
          `الإجمالي: ${total} ₪`
        ].join("\n");


      const number =
        cleanPhone(
          restaurant.whatsapp ||
          "970590000000"
        );


      window.open(
        `https://wa.me/${number}?text=${encodeURIComponent(
          message
        )}`,
        "_blank"
      );

    };

}


/* =====================================================
   START
===================================================== */

loadFirebaseData();
