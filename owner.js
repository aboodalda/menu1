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
   INITIALIZE
===================================================== */

const app =
  initializeApp(firebaseConfig);

const auth =
  getAuth(app);

const db =
  getFirestore(app);


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

  const element =
    $("toast");

  if (!element) return;

  element.textContent =
    message;

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


    const reader =
      new FileReader();


    reader.onload = event => {

      const image =
        new Image();


      image.onload = () => {

        let width =
          image.width;

        let height =
          image.height;


        const MAX_SIZE = 900;


        if (
          width > MAX_SIZE ||
          height > MAX_SIZE
        ) {

          if (width > height) {

            height =
              Math.round(
                height *
                (MAX_SIZE / width)
              );

            width =
              MAX_SIZE;

          } else {

            width =
              Math.round(
                width *
                (MAX_SIZE / height)
              );

            height =
              MAX_SIZE;

          }

        }


        const canvas =
          document.createElement(
            "canvas"
          );


        canvas.width =
          width;

        canvas.height =
          height;


        const ctx =
          canvas.getContext("2d");


        ctx.imageSmoothingEnabled =
          true;

        ctx.imageSmoothingQuality =
          "high";


        ctx.fillStyle =
          "#ffffff";

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


        let quality =
          0.72;


        let dataUrl =
          canvas.toDataURL(
            "image/webp",
            quality
          );


        if (
          !dataUrl.startsWith(
            "data:image/webp"
          )
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
            dataUrl.startsWith(
              "data:image/webp"
            )
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


        if (
          dataUrl.length > 600000
        ) {

          const smallCanvas =
            document.createElement(
              "canvas"
            );


          const ratio =
            700 /
            Math.max(
              width,
              height
            );


          smallCanvas.width =
            Math.max(
              1,
              Math.round(
                width * ratio
              )
            );


          smallCanvas.height =
            Math.max(
              1,
              Math.round(
                height * ratio
              )
            );


          const smallCtx =
            smallCanvas.getContext(
              "2d"
            );


          smallCtx.fillStyle =
            "#ffffff";


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
            !dataUrl.startsWith(
              "data:image/webp"
            )
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
          new Error(
            "تعذر قراءة الصورة."
          )
        );

      };


      image.src =
        event.target.result;

    };


    reader.onerror = () => {

      reject(
        new Error(
          "تعذر قراءة الملف."
        )
      );

    };


    reader.readAsDataURL(file);

  });

}


/* =====================================================
   LOGIN
===================================================== */

$("loginForm").addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    $("loginError").textContent =
      "";

    try {

      await signInWithEmailAndPassword(

        auth,

        $("loginEmail").value.trim(),

        $("loginPassword").value

      );

    } catch (error) {

      console.error(error);

      $("loginError").textContent =
        "بيانات الدخول غير صحيحة أو حدث خطأ.";

    }

  }
);


/* =====================================================
   LOGOUT
===================================================== */

$("logoutBtn").onclick =
  () => signOut(auth);


/* =====================================================
   AUTH STATE
===================================================== */

onAuthStateChanged(
  auth,
  async user => {

    if (user) {

      $("loginScreen")
        .classList
        .add("hidden");

      $("app")
        .classList
        .remove("hidden");


      await loadAll();

    } else {

      $("app")
        .classList
        .add("hidden");

      $("loginScreen")
        .classList
        .remove("hidden");

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
        .forEach(item =>
          item.classList.remove(
            "active"
          )
        );


      button.classList.add(
        "active"
      );


      document
        .querySelectorAll(".page")
        .forEach(page =>
          page.classList.add(
            "hidden"
          )
        );


      const page =
        $(button.dataset.page + "Page");


      if (page) {

        page.classList.remove(
          "hidden"
        );

      }


      $("pageTitle").textContent =
        button.textContent
          .replace(/^[^ ]+ /, "");

    };

  });


/* =====================================================
   BUTTONS
===================================================== */

$("quickCategory").onclick =
  () => openCategoryModal();

$("quickProduct").onclick =
  () => openProductModal();

$("addCategoryBtn").onclick =
  () => openCategoryModal();

$("addProductBtn").onclick =
  () => openProductModal();

$("closeModal").onclick =
  closeModal;


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

  $("categoryCount").textContent =
    categories.length;


  $("productCount").textContent =
    products.length;


  $("availableCount").textContent =
    products.filter(
      p =>
        p.available !== false
    ).length;


  $("featuredCount").textContent =
    products.filter(
      p =>
        p.featured === true
    ).length;


  /* =================================
     CATEGORIES
  ================================= */

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


  /* =================================
     PRODUCTS
  ================================= */

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


/* =====================================================
   CATEGORY MODAL
===================================================== */

function openCategoryModal(
  item = null
) {

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

function openProductModal(
  item = null
) {

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


  if (file) {

    file.onchange =
      () => {

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


  if (url) {

    url.oninput =
      () => {

        if (
          url.value.trim()
        ) {

          preview.src =
            url.value.trim();

        }

      };

  }

}


/* =====================================================
   CLOSE MODAL
===================================================== */

function closeModal() {

  $("modal")
    .classList
    .add("hidden");


  $("entityForm")
    .innerHTML = "";


  editingId =
    null;

  editingType =
    null;

}


/* =====================================================
   SAVE CATEGORY / PRODUCT
===================================================== */

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


      /* ==============================
         IMAGE FROM DEVICE
      ============================== */

      if (file) {

        if (saveButton) {

          saveButton.disabled =
            true;

          saveButton.textContent =
            "جاري ضغط الصورة...";

        }


        toast(
          "جاري تصغير وضغط الصورة..."
        );


        image =
          await compressImage(
            file
          );


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


        if (
          isNaN(price)
        ) {

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


/* =====================================================
   EDIT CATEGORY
===================================================== */

window.editCategory =
  id => {

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

window.editProduct =
  id => {

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


    $("restaurantName").value =
      data.restaurantName ||
      "CaféMenu";


    $("tagline").value =
      data.tagline ||
      "منيو إلكتروني";


    $("heroTitle").value =
      data.heroTitle ||
      "طعم يستحق التجربة";


    $("description").value =
      data.description ||
      "اكتشف أشهى الوجبات والحلويات والمشروبات في مكان واحد.";


    $("heroImage").value =
      data.heroImage ||
      "";


    $("logoUrl").value =
      data.logoUrl ||
      "";


    $("whatsapp").value =
      data.whatsapp ||
      "";


    $("phone").value =
      data.phone ||
      "";


    $("address").value =
      data.address ||
      "";


    $("hours").value =
      data.hours ||
      "";

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

$("settingsForm").addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    try {

      const data = {

        restaurantName:
          $("restaurantName")
            .value
            .trim(),

        tagline:
          $("tagline")
            .value
            .trim(),

        heroTitle:
          $("heroTitle")
            .value
            .trim(),

        description:
          $("description")
            .value
            .trim(),

        heroImage:
          $("heroImage")
            .value
            .trim(),

        logoUrl:
          $("logoUrl")
            .value
            .trim(),

        whatsapp:
          $("whatsapp")
            .value
            .trim(),

        phone:
          $("phone")
            .value
            .trim(),

        address:
          $("address")
            .value
            .trim(),

        hours:
          $("hours")
            .value
            .trim(),

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
/* =========================================
   تخصيص المنيو
========================================= */

async function loadDesignSettings() {

  const designRef = doc(
    db,
    "settings",
    "design"
  );

  const designSnap = await getDoc(designRef);

  const data = designSnap.exists()
    ? designSnap.data()
    : {};

  $("primaryColor").value =
    data.primaryColor || "#111111";

  $("buttonColor").value =
    data.buttonColor || "#111111";

  $("heroTitle").value =
    data.heroTitle || "";

  $("heroDescription").value =
    data.heroDescription || "";

  $("heroImage").value =
    data.heroImage || "";
}


/* تحميل التخصيص عند تسجيل الدخول */

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


/* حفظ التخصيص */

$("designForm").addEventListener(
  "submit",
  async e => {

    e.preventDefault();

    try {

      await setDoc(
        doc(db, "settings", "design"),
        {

          primaryColor:
            $("primaryColor").value,

          buttonColor:
            $("buttonColor").value,

          heroTitle:
            $("heroTitle").value.trim(),

          heroDescription:
            $("heroDescription").value.trim(),

          heroImage:
            $("heroImage").value.trim(),

          updatedAt:
            serverTimestamp()

        },
        {
          merge: true
        }
      );

      toast("تم حفظ التخصيص ✅");

    } catch (error) {

      console.error(error);

      alert(
        "حدث خطأ أثناء حفظ التخصيص:\n" +
        error.message
      );

    }

  }
);
/* =========================================
   معاينة صورة الغلاف
========================================= */

const heroFile = $("heroFile");
const heroPreview = $("heroPreview");
const heroImage = $("heroImage");

if (heroFile) {

  heroFile.onchange = () => {

    const file = heroFile.files[0];

    if (!file) return;

    heroPreview.src =
      URL.createObjectURL(file);

  };

}

if (heroImage) {

  heroImage.oninput = () => {

    const url =
      heroImage.value.trim();

    if (url) {

      heroPreview.src = url;

    }

  };

  }
