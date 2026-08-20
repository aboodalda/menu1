import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =====================================================
   FIREBASE CONFIG
===================================================== */

const firebaseConfig = {

  apiKey:
    "AIzaSyCsS0rR0wOz3mGBszmtKwPXQZi4pFVcukA",

  authDomain:
    "cafemenu-3ff9a.firebaseapp.com",

  projectId:
    "cafemenu-3ff9a",

  storageBucket:
    "cafemenu-3ff9a.firebasestorage.app",

  messagingSenderId:
    "52378316579",

  appId:
    "1:52378316579:web:8512b57f8a9c6f64b8a696",

  measurementId:
    "G-7DEMS2C6DY"

};


/* =====================================================
   INITIALIZE FIREBASE
===================================================== */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


/* =====================================================
   GLOBAL DATA
===================================================== */

let categories = [];

let products = [];

let editingId = null;

let editingType = null;


const $ = id =>
  document.getElementById(id);


const placeholder =
  "https://placehold.co/900x600?text=CafeMenu";


/* =====================================================
   ESCAPE HTML
===================================================== */

function esc(value) {

  return String(value ?? "")
    .replace(/[&<>"']/g, m => ({

      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"

    }[m]));

}


/* =====================================================
   TOAST
===================================================== */

function toast(message) {

  const element = $("toast");

  if (!element) return;

  element.textContent = message;

  element.classList.add("show");

  setTimeout(() => {

    element.classList.remove("show");

  }, 2500);

}


/* =====================================================
   IMAGE
===================================================== */

function img(value) {

  return value || placeholder;

}


/* =====================================================
   IMAGE COMPRESSION
===================================================== */

function compressImage(file) {

  return new Promise((resolve, reject) => {

    if (!file) {

      resolve("");

      return;

    }


    if (!file.type.startsWith("image/")) {

      reject(
        new Error("الملف المختار ليس صورة.")
      );

      return;

    }


    const reader = new FileReader();


    reader.onload = event => {

      const image = new Image();


      image.onload = () => {

        let width = image.width;

        let height = image.height;

        const MAX_SIZE = 900;


        if (
          width > MAX_SIZE ||
          height > MAX_SIZE
        ) {

          if (width > height) {

            height = Math.round(
              height * (MAX_SIZE / width)
            );

            width = MAX_SIZE;

          } else {

            width = Math.round(
              width * (MAX_SIZE / height)
            );

            height = MAX_SIZE;

          }

        }


        const canvas =
          document.createElement("canvas");


        canvas.width = width;

        canvas.height = height;


        const ctx =
          canvas.getContext("2d");


        ctx.imageSmoothingEnabled = true;

        ctx.imageSmoothingQuality = "high";


        ctx.fillStyle = "#ffffff";

        ctx.fillRect(
          0,
          0,
          width,
          height
        );


        ctx.drawImage(
          image,
          0,
          0,
          width,
          height
        );


        let quality = 0.72;


        let dataUrl =
          canvas.toDataURL(
            "image/webp",
            quality
          );


        if (
          !dataUrl.startsWith("data:image/webp")
        ) {

          dataUrl =
            canvas.toDataURL(
              "image/jpeg",
              quality
            );

        }


        while (
          dataUrl.length > 480000 &&
          quality > 0.35
        ) {

          quality -= 0.07;


          if (
            dataUrl.startsWith("data:image/webp")
          ) {

            dataUrl =
              canvas.toDataURL(
                "image/webp",
                quality
              );

          } else {

            dataUrl =
              canvas.toDataURL(
                "image/jpeg",
                quality
              );

          }

        }


        if (dataUrl.length > 600000) {

          const smallCanvas =
            document.createElement("canvas");


          const ratio =
            700 /
            Math.max(
              width,
              height
            );


          smallCanvas.width =
            Math.max(
              1,
              Math.round(width * ratio)
            );


          smallCanvas.height =
            Math.max(
              1,
              Math.round(height * ratio)
            );


          const smallCtx =
            smallCanvas.getContext("2d");


          smallCtx.fillStyle = "#ffffff";


          smallCtx.fillRect(
            0,
            0,
            smallCanvas.width,
            smallCanvas.height
          );


          smallCtx.drawImage(
            image,
            0,
            0,
            smallCanvas.width,
            smallCanvas.height
          );


          dataUrl =
            smallCanvas.toDataURL(
              "image/webp",
              0.60
            );


          if (
            !dataUrl.startsWith("data:image/webp")
          ) {

            dataUrl =
              smallCanvas.toDataURL(
                "image/jpeg",
                0.60
              );

          }

        }


        resolve(dataUrl);

      };


      image.onerror = () => {

        reject(
          new Error("تعذر قراءة الصورة.")
        );

      };


      image.src = event.target.result;

    };


    reader.onerror = () => {

      reject(
        new Error("تعذر قراءة الملف.")
      );

    };


    reader.readAsDataURL(file);

  });

}


/* =====================================================
   LOGIN
===================================================== */

const loginForm = $("loginForm");


if (loginForm) {

  loginForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      const loginError = $("loginError");

      if (loginError) {

        loginError.textContent = "";

      }


      try {

        const email =
          $("loginEmail")?.value.trim();

        const password =
          $("loginPassword")?.value;


        if (!email || !password) {

          if (loginError) {

            loginError.textContent =
              "اكتب البريد الإلكتروني وكلمة المرور.";

          }

          return;

        }


        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );


      } catch (error) {

        console.error(
          "Login error:",
          error
        );


        if (loginError) {

          if (
            error.code ===
            "auth/invalid-credential"
          ) {

            loginError.textContent =
              "البريد الإلكتروني أو كلمة المرور غير صحيحة.";

          } else if (
            error.code ===
            "auth/user-not-found"
          ) {

            loginError.textContent =
              "هذا الحساب غير موجود.";

          } else if (
            error.code ===
            "auth/wrong-password"
          ) {

            loginError.textContent =
              "كلمة المرور غير صحيحة.";

          } else if (
            error.code ===
            "auth/invalid-email"
          ) {

            loginError.textContent =
              "البريد الإلكتروني غير صحيح.";

          } else {

            loginError.textContent =
              "حدث خطأ أثناء تسجيل الدخول.";

          }

        }

      }

    }
  );

}


/* =====================================================
   LOGOUT
===================================================== */

const logoutBtn = $("logoutBtn");


if (logoutBtn) {

  logoutBtn.onclick = () => {

    signOut(auth);

  };

}


/* =====================================================
   AUTH STATE
===================================================== */

onAuthStateChanged(
  auth,
  async user => {

    if (user) {

      const loginScreen =
        $("loginScreen");

      const appElement =
        $("app");


      if (loginScreen) {

        loginScreen.classList.add("hidden");

      }


      if (appElement) {

        appElement.classList.remove("hidden");

      }


      await loadAll();


    } else {

      const appElement =
        $("app");

      const loginScreen =
        $("loginScreen");


      if (appElement) {

        appElement.classList.add("hidden");

      }


      if (loginScreen) {

        loginScreen.classList.remove("hidden");

      }

    }

  }
);


/* =====================================================
   NAVIGATION
===================================================== */

document
  .querySelectorAll(".nav")
  .forEach(button => {

    button.onclick = () => {

      document
        .querySelectorAll(".nav")
        .forEach(item => {

          item.classList.remove("active");

        });


      button.classList.add("active");


      document
        .querySelectorAll(".page")
        .forEach(page => {

          page.classList.add("hidden");

        });


      const page =
        $(button.dataset.page + "Page");


      if (page) {

        page.classList.remove("hidden");

      }


      const pageTitle =
        $("pageTitle");


      if (pageTitle) {

        pageTitle.textContent =
          button.textContent
            .replace(/^[^ ]+ /, "");

      }

    };

  });


/* =====================================================
   BUTTONS
===================================================== */

if ($("quickCategory")) {

  $("quickCategory").onclick =
    () => openCategoryModal();

}


if ($("quickProduct")) {

  $("quickProduct").onclick =
    () => openProductModal();

}


if ($("addCategoryBtn")) {

  $("addCategoryBtn").onclick =
    () => openCategoryModal();

}


if ($("addProductBtn")) {

  $("addProductBtn").onclick =
    () => openProductModal();

}


if ($("closeModal")) {

  $("closeModal").onclick =
    closeModal;

}


/* =====================================================
   LOAD ALL
===================================================== */

async function loadAll() {

  try {

    const categoriesSnapshot =
      await getDocs(
        collection(
          db,
          "categories"
        )
      );


    categories =
      categoriesSnapshot.docs.map(
        document => ({

          id: document.id,

          ...document.data()

        })
      );


    const productsSnapshot =
      await getDocs(
        collection(
          db,
          "products"
        )
      );


    products =
      productsSnapshot.docs.map(
        document => ({

          id: document.id,

          ...document.data()

        })
      );


    render();


    await loadSettings();

    await loadDesign();


  } catch (error) {

    console.error(
      "Load error:",
      error
    );


    toast(
      "تعذر تحميل البيانات"
    );

  }

}


/* =====================================================
   RENDER
===================================================== */

function render() {

  if ($("categoryCount")) {

    $("categoryCount").textContent =
      categories.length;

  }


  if ($("productCount")) {

    $("productCount").textContent =
      products.length;

  }


  if ($("availableCount")) {

    $("availableCount").textContent =
      products.filter(
        p =>
          p.available !== false
      ).length;

  }


  if ($("featuredCount")) {

    $("featuredCount").textContent =
      products.filter(
        p =>
          p.featured === true
      ).length;

  }


  /* =================================
     CATEGORIES
  ================================= */

  if ($("categoriesGrid")) {

    $("categoriesGrid").innerHTML =
      categories.length

        ?

        categories.map(category => `

          <article class="card">

            <img
              class="card-image"
              src="${esc(
                img(category.image)
              )}"
              onerror="this.src='${placeholder}'"
            >

            <div class="card-body">

              <h4>
                ${esc(category.name)}
              </h4>

              <p>
                ${
                  products.filter(
                    product =>
                      product.categoryId ===
                      category.id
                  ).length
                }
                أصناف
              </p>

              <div class="card-actions">

                <button
                  class="dark"
                  onclick="editCategory('${category.id}')"
                >
                  تعديل
                </button>

                <button
                  class="danger"
                  onclick="deleteCategory('${category.id}')"
                >
                  حذف
                </button>

              </div>

            </div>

          </article>

        `).join("")

        :

        `
        <div class="empty">
          لا توجد أقسام.
          أضف أول قسم.
        </div>
        `;

  }


  /* =================================
     PRODUCTS
  ================================= */

  if ($("productsGrid")) {

    $("productsGrid").innerHTML =
      products.length

        ?

        products.map(product => `

          <article class="card">

            <img
              class="card-image"
              src="${esc(
                img(product.image)
              )}"
              onerror="this.src='${placeholder}'"
            >

            <div class="card-body">

              <h4>

                ${esc(product.name)}

                <span class="price">

                  ${Number(
                    product.price || 0
                  )} ₪

                </span>

              </h4>


              <p>

                ${esc(
                  product.description ||
                  "بدون وصف"
                )}

              </p>


              <span
                class="badge ${
                  product.available !== false
                    ? "badge-on"
                    : "badge-off"
                }"
              >

                ${
                  product.available !== false
                    ? "متوفر"
                    : "غير متوفر"
                }

              </span>


              ${
                product.featured

                  ?

                  `
                  <span class="badge badge-on">
                    ⭐ مميز
                  </span>
                  `

                  :

                  ""
              }


              ${
                product.offer

                  ?

                  `
                  <span class="badge badge-on">
                    🔥 عرض
                  </span>
                  `

                  :

                  ""
              }


              <div
                class="card-actions"
                style="margin-top:10px"
              >

                <button
                  class="dark"
                  onclick="editProduct('${product.id}')"
                >
                  تعديل
                </button>

                <button
                  class="danger"
                  onclick="deleteProduct('${product.id}')"
                >
                  حذف
                </button>

              </div>

            </div>

          </article>

        `).join("")

        :

        `
        <div class="empty">
          لا توجد أصناف.
          أضف أول صنف.
        </div>
        `;

  }

}


/* =====================================================
   CATEGORY MODAL
===================================================== */

function openCategoryModal(item = null) {

  editingId =
    item?.id || null;

  editingType =
    "category";


  $("modalTitle").textContent =
    editingId
      ? "تعديل القسم"
      : "إضافة قسم";


  $("entityForm").innerHTML = `

    <label>

      اسم القسم

      <input
        id="fName"
        required
        value="${esc(
          item?.name || ""
        )}"
        placeholder="مثال: الحلويات"
      >

    </label>


    <label>

      رابط صورة القسم

      <input
        id="fImage"
        value="${esc(
          item?.image || ""
        )}"
        placeholder="https://..."
      >

    </label>


    <label>

      أو اختر صورة من الجهاز

      <input
        id="fFile"
        type="file"
        accept="image/*"
      >

      <span class="hint">
        سيتم تصغير وضغط الصورة تلقائياً.
      </span>

    </label>


    <img
      id="preview"
      class="preview"
      src="${esc(
        img(item?.image)
      )}"
    >


    <button
      class="primary"
      type="submit"
    >
      حفظ
    </button>

  `;


  $("modal")
    .classList
    .remove("hidden");


  bindPreview();

}


/* =====================================================
   PRODUCT MODAL
===================================================== */

function openProductModal(item = null) {

  editingId =
    item?.id || null;

  editingType =
    "product";


  $("modalTitle").textContent =
    editingId
      ? "تعديل الصنف"
      : "إضافة صنف";


  $("entityForm").innerHTML =
    productForm(
      item || {}
    );


  $("modal")
    .classList
    .remove("hidden");


  bindPreview();

}


/* =====================================================
   PRODUCT FORM
===================================================== */

function productForm(product) {

  return `

    <label>

      اسم الصنف

      <input
        id="fName"
        required
        value="${esc(
          product.name || ""
        )}"
        placeholder="مثال: كريب نوتيلا"
      >

    </label>


    <label>

      القسم

      <select
        id="fCategory"
        required
      >

        <option value="">
          اختر القسم
        </option>

        ${
          categories.map(
            category => `

              <option
                value="${category.id}"
                ${
                  product.categoryId ===
                  category.id
                    ? "selected"
                    : ""
                }
              >

                ${esc(
                  category.name
                )}

              </option>

            `
          ).join("")
        }

      </select>

    </label>


    <label>

      السعر (₪)

      <input
        id="fPrice"
        type="number"
        min="0"
        step="0.01"
        required
        value="${product.price ?? ""}"
      >

    </label>


    <label>

      الوصف

      <textarea
        id="fDescription"
        placeholder="وصف مختصر"
      >${esc(
        product.description || ""
      )}</textarea>

    </label>


    <label>

      رابط صورة الصنف

      <input
        id="fImage"
        value="${esc(
          product.image || ""
        )}"
        placeholder="https://..."
      >

    </label>


    <label>

      أو اختر صورة من الجهاز

      <input
        id="fFile"
        type="file"
        accept="image/*"
      >

      <span class="hint">
        سيتم تصغير وضغط الصورة تلقائياً.
      </span>

    </label>


    <img
      id="preview"
      class="preview"
      src="${esc(
        img(product.image)
      )}"
    >


    <label class="check">

      <input
        id="fAvailable"
        type="checkbox"
        ${
          product.available !== false
            ? "checked"
            : ""
        }
      >

      الصنف متوفر

    </label>


    <label class="check">

      <input
        id="fFeatured"
        type="checkbox"
        ${
          product.featured
            ? "checked"
            : ""
        }
      >

      ⭐ الأكثر طلباً

    </label>


    <label class="check">

      <input
        id="fOffer"
        type="checkbox"
        ${
          product.offer
            ? "checked"
            : ""
        }
      >

      🔥 عرض خاص

    </label>


    <button
      class="primary"
      type="submit"
    >
      حفظ
    </button>

  `;

}


/* =====================================================
   IMAGE PREVIEW
===================================================== */

function bindPreview() {

  const file =
    $("fFile");

  const url =
    $("fImage");

  const preview =
    $("preview");


  if (file && preview) {

    file.onchange = () => {

      if (
        file.files &&
        file.files[0]
      ) {

        preview.src =
          URL.createObjectURL(
            file.files[0]
          );

      }

    };

  }


  if (url && preview) {

    url.oninput = () => {

      const value =
        url.value.trim();


      if (value) {

        preview.src = value;

      }

    };

  }

}


/* =====================================================
   CLOSE MODAL
===================================================== */

function closeModal() {

  if ($("modal")) {

    $("modal")
      .classList
      .add("hidden");

  }


  if ($("entityForm")) {

    $("entityForm")
      .innerHTML = "";

  }


  editingId =
    null;

  editingType =
    null;

}


/* =====================================================
   SAVE CATEGORY / PRODUCT
===================================================== */

if ($("entityForm")) {

  $("entityForm").addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const saveButton =
        $("entityForm")
          .querySelector(
            'button[type="submit"]'
          );


      try {

        let image =
          $("fImage")?.value.trim() ||
          "";


        const file =
          $("fFile")?.files?.[0];


        if (file) {

          if (saveButton) {

            saveButton.disabled = true;

            saveButton.textContent =
              "جاري ضغط الصورة...";

          }


          toast(
            "جاري تصغير وضغط الصورة..."
          );


          image =
            await compressImage(file);


          if (!image) {

            throw new Error(
              "تعذر تجهيز الصورة."
            );

          }

        }


        /* ==============================
           CATEGORY
        ============================== */

        if (
          editingType ===
          "category"
        ) {

          const name =
            $("fName")
              .value
              .trim();


          if (!name) {

            alert(
              "اكتب اسم القسم أولاً."
            );

            return;

          }


          const data = {

            name,

            image,

            updatedAt:
              serverTimestamp()

          };


          if (editingId) {

            await updateDoc(

              doc(
                db,
                "categories",
                editingId
              ),

              data

            );

          } else {

            await addDoc(

              collection(
                db,
                "categories"
              ),

              {

                ...data,

                createdAt:
                  serverTimestamp()

              }

            );

          }

        }


        /* ==============================
           PRODUCT
        ============================== */

        else {

          const name =
            $("fName")
              .value
              .trim();


          const categoryId =
            $("fCategory")
              .value;


          const price =
            Number(
              $("fPrice")
                .value
            );


          if (!name) {

            alert(
              "اكتب اسم الصنف أولاً."
            );

            return;

          }


          if (!categoryId) {

            alert(
              "اختر القسم."
            );

            return;

          }


          if (isNaN(price)) {

            alert(
              "أدخل السعر."
            );

            return;

          }


          const data = {

            name,

            categoryId,

            price,

            description:
              $("fDescription")
                .value
                .trim(),

            image,

            available:
              $("fAvailable")
                .checked,

            featured:
              $("fFeatured")
                .checked,

            offer:
              $("fOffer")
                .checked,

            updatedAt:
              serverTimestamp()

          };


          if (editingId) {

            await updateDoc(

              doc(
                db,
                "products",
                editingId
              ),

              data

            );

          } else {

            await addDoc(

              collection(
                db,
                "products"
              ),

              {

                ...data,

                createdAt:
                  serverTimestamp()

              }

            );

          }

        }


        closeModal();


        await loadAll();


        toast(
          "تم الحفظ بنجاح ✅"
        );


      } catch (error) {

        console.error(
          "Save error:",
          error
        );


        alert(
          "حدث خطأ أثناء الحفظ:\n" +
          error.message
        );


      } finally {

        if (saveButton) {

          saveButton.disabled =
            false;

          saveButton.textContent =
            "حفظ";

        }

      }

    }
  );

}


/* =====================================================
   EDIT CATEGORY
===================================================== */

window.editCategory = id => {

  const category =
    categories.find(
      item =>
        item.id === id
    );


  if (!category) {

    toast(
      "القسم غير موجود"
    );

    return;

  }


  openCategoryModal(
    category
  );

};


/* =====================================================
   EDIT PRODUCT
===================================================== */

window.editProduct = id => {

  const product =
    products.find(
      item =>
        item.id === id
    );


  if (!product) {

    toast(
      "الصنف غير موجود"
    );

    return;

  }


  openProductModal(
    product
  );

};


/* =====================================================
   DELETE CATEGORY
===================================================== */

window.deleteCategory =
  async id => {

    if (
      !confirm(
        "هل تريد حذف القسم؟"
      )
    ) return;


    try {

      await deleteDoc(

        doc(
          db,
          "categories",
          id
        )

      );


      await loadAll();


      toast(
        "تم حذف القسم"
      );


    } catch (error) {

      console.error(error);

      alert(
        "تعذر حذف القسم:\n" +
        error.message
      );

    }

  };


/* =====================================================
   DELETE PRODUCT
===================================================== */

window.deleteProduct =
  async id => {

    if (
      !confirm(
        "هل تريد حذف الصنف؟"
      )
    ) return;


    try {

      await deleteDoc(

        doc(
          db,
          "products",
          id
        )

      );


      await loadAll();


      toast(
        "تم حذف الصنف"
      );


    } catch (error) {

      console.error(error);

      alert(
        "تعذر حذف الصنف:\n" +
        error.message
      );

    }

  };


/* =====================================================
   LOAD RESTAURANT SETTINGS
===================================================== */

async function loadSettings() {

  try {

    const snapshot =
      await getDoc(

        doc(
          db,
          "settings",
          "restaurant"
        )

      );


    const data =
      snapshot.exists()
        ? snapshot.data()
        : {};


    if ($("restaurantName")) {

      $("restaurantName").value =
        data.restaurantName ||
        "CaféMenu";

    }


    if ($("tagline")) {

      $("tagline").value =
        data.tagline ||
        "منيو إلكتروني";

    }


    if ($("heroTitle")) {

      $("heroTitle").value =
        data.heroTitle ||
        "طعم يستحق التجربة";

    }


    if ($("description")) {

      $("description").value =
        data.description ||
        "اكتشف أشهى الوجبات والحلويات والمشروبات في مكان واحد.";

    }


    if ($("heroImage")) {

      $("heroImage").value =
        data.heroImage ||
        "";

    }


    if ($("logoUrl")) {

      $("logoUrl").value =
        data.logoUrl ||
        "";

    }


    if ($("whatsapp")) {

      $("whatsapp").value =
        data.whatsapp ||
        "";

    }


    if ($("phone")) {

      $("phone").value =
        data.phone ||
        "";

    }


    if ($("address")) {

      $("address").value =
        data.address ||
        "";

    }


    if ($("hours")) {

      $("hours").value =
        data.hours ||
        "";

    }


  } catch (error) {

    console.error(
      "Settings load error:",
      error
    );

  }

}


/* =====================================================
   SAVE RESTAURANT SETTINGS
===================================================== */

if ($("settingsForm")) {

  $("settingsForm").addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      try {

        const data = {

          restaurantName:
            $("restaurantName")?.value.trim() || "",

          tagline:
            $("tagline")?.value.trim() || "",

          heroTitle:
            $("heroTitle")?.value.trim() || "",

          description:
            $("description")?.value.trim() || "",

          heroImage:
            $("heroImage")?.value.trim() || "",

          logoUrl:
            $("logoUrl")?.value.trim() || "",

          whatsapp:
            $("whatsapp")?.value.trim() || "",

          phone:
            $("phone")?.value.trim() || "",

          address:
            $("address")?.value.trim() || "",

          hours:
            $("hours")?.value.trim() || "",

          updatedAt:
            serverTimestamp()

        };


        await setDoc(

          doc(
            db,
            "settings",
            "restaurant"
          ),

          data,

          {
            merge: true
          }

        );


        toast(
          "تم حفظ إعدادات المطعم ✅"
        );


      } catch (error) {

        console.error(
          "Settings save error:",
          error
        );


        alert(
          "حدث خطأ أثناء حفظ الإعدادات:\n" +
          error.message
        );

      }

    }
  );

}


/* =====================================================
   LOAD DESIGN SETTINGS
===================================================== */

async function loadDesignSettings() {

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


  const data =
    designSnap.exists()
      ? designSnap.data()
      : {};


  if ($("primaryColor")) {

    $("primaryColor").value =
      data.primaryColor ||
      "#111111";

  }


  if ($("buttonColor")) {

    $("buttonColor").value =
      data.buttonColor ||
      "#111111";

  }


  /*
    ملاحظة:
    heroTitle و heroImage موجودان في
    إعدادات المطعم وليس التصميم،
    حتى لا يصير تعارض بين النموذجين.
  */


  if ($("heroDescription")) {

    $("heroDescription").value =
      data.heroDescription ||
      "";

  }

}


/* =====================================================
   LOAD DESIGN
===================================================== */

async function loadDesign() {

  try {

    await loadDesignSettings();

  } catch (error) {

    console.error(
      "Design settings error:",
      error
    );

  }

}


/* =====================================================
   SAVE DESIGN
===================================================== */

if ($("designForm")) {

  $("designForm").addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      try {

        const data = {

          primaryColor:
            $("primaryColor")?.value ||
            "#111111",

          buttonColor:
            $("buttonColor")?.value ||
            "#111111",

          heroDescription:
            $("heroDescription")?.value.trim() ||
            "",

          updatedAt:
            serverTimestamp()

        };


        await setDoc(

          doc(
            db,
            "settings",
            "design"
          ),

          data,

          {
            merge: true
          }

        );


        toast(
          "تم حفظ التخصيص ✅"
        );


      } catch (error) {

        console.error(
          "Design save error:",
          error
        );


        alert(
          "حدث خطأ أثناء حفظ التخصيص:\n" +
          error.message
        );

      }

    }
  );

}


/* =====================================================
   HERO IMAGE PREVIEW
===================================================== */

const heroFile =
  $("heroFile");


const heroPreview =
  $("heroPreview");


const heroImage =
  $("heroImage");


if (
  heroFile &&
  heroPreview
) {

  heroFile.onchange = () => {

    const file =
      heroFile.files?.[0];


    if (!file) return;


    heroPreview.src =
      URL.createObjectURL(file);

  };

}


if (
  heroImage &&
  heroPreview
) {

  heroImage.oninput = () => {

    const url =
      heroImage.value.trim();


    if (url) {

      heroPreview.src =
        url;

    }

  };

}
