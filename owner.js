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


/* =========================================
   FIREBASE
========================================= */

const firebaseConfig = {
  apiKey: "AIzaSyCsS0rR0wOz3mGBszmtKwPXQZi4pFVcukA",
  authDomain: "cafemenu-3ff9a.firebaseapp.com",
  projectId: "cafemenu-3ff9a",
  storageBucket: "cafemenu-3ff9a.firebasestorage.app",
  messagingSenderId: "52378316579",
  appId: "1:52378316579:web:8512b57f8a9c6f64b8a696",
  measurementId: "G-7DEMS2C6DY"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);



/* =========================================
   GLOBAL
========================================= */

let categories = [];

let products = [];

let editingId = null;

let editingType = null;


const $ = id =>
  document.getElementById(id);


const placeholder =
  "https://placehold.co/900x600?text=CafeMenu";



/* =========================================
   ESCAPE HTML
========================================= */

function esc(v) {

  return String(v ?? "")
    .replace(/[&<>"']/g, m => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[m]));

}



function toast(text) {

  $("toast").textContent = text;

  $("toast").classList.add("show");

  setTimeout(() => {

    $("toast").classList.remove("show");

  }, 2200);

}



function img(v) {

  return v || placeholder;

}



/* =========================================
   IMAGE COMPRESSION
========================================= */

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


    reader.onload = e => {

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

            width = MAX_SIZE;

          } else {

            width =
              Math.round(
                width *
                (MAX_SIZE / height)
              );

            height = MAX_SIZE;

          }

        }


        const canvas =
          document.createElement(
            "canvas"
          );


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


        if (dataUrl.length > 600000) {

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
        e.target.result;

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



/* =========================================
   LOGIN
========================================= */

$("loginForm").addEventListener(
  "submit",
  async e => {

    e.preventDefault();

    $("loginError").textContent = "";


    try {

      await signInWithEmailAndPassword(
        auth,
        $("loginEmail").value,
        $("loginPassword").value
      );

    } catch (err) {

      console.error(err);

      $("loginError").textContent =
        "بيانات الدخول غير صحيحة أو حدث خطأ.";

    }

  }
);



$("logoutBtn").onclick =
  () => signOut(auth);



/* =========================================
   AUTH STATE
========================================= */

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



/* =========================================
   NAVIGATION
========================================= */

document
  .querySelectorAll(".nav")
  .forEach(btn => {

    btn.onclick = () => {

      document
        .querySelectorAll(".nav")
        .forEach(x =>
          x.classList.remove(
            "active"
          )
        );


      btn.classList.add(
        "active"
      );


      document
        .querySelectorAll(".page")
        .forEach(x =>
          x.classList.add(
            "hidden"
          )
        );


      $(btn.dataset.page + "Page")
        .classList
        .remove("hidden");


      $("pageTitle").textContent =
        btn.textContent.replace(
          /^[^ ]+ /,
          ""
        );

    };

  });



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



/* =========================================
   LOAD ALL
========================================= */

async function loadAll() {

  categories =
    (
      await getDocs(
        collection(
          db,
          "categories"
        )
      )
    )
      .docs
      .map(d => ({
        id: d.id,
        ...d.data()
      }));


  products =
    (
      await getDocs(
        collection(
          db,
          "products"
        )
      )
    )
      .docs
      .map(d => ({
        id: d.id,
        ...d.data()
      }));


  render();


  await loadSettings();

}



/* =========================================
   RENDER
========================================= */

function render() {

  $("categoryCount").textContent =
    categories.length;


  $("productCount").textContent =
    products.length;


  $("availableCount").textContent =
    products.filter(
      p => p.available !== false
    ).length;


  $("featuredCount").textContent =
    products.filter(
      p => p.featured === true
    ).length;



  $("categoriesGrid").innerHTML =

    categories.length

      ? categories.map(c => `

        <article class="card">

          <img
            class="card-image"
            src="${esc(img(c.image))}"
            onerror="this.src='${placeholder}'"
          >

          <div class="card-body">

            <h4>
              ${esc(c.name)}
            </h4>

            <p>
              ${
                products.filter(
                  p =>
                    p.categoryId === c.id
                ).length
              }
              أصناف
            </p>

            <div class="card-actions">

              <button
                class="dark"
                onclick="editCategory('${c.id}')"
              >
                تعديل
              </button>

              <button
                class="danger"
                onclick="deleteCategory('${c.id}')"
              >
                حذف
              </button>

            </div>

          </div>

        </article>

      `).join("")

      : `

        <div class="empty">

          لا توجد أقسام.
          أضف أول قسم.

        </div>

      `;



  $("productsGrid").innerHTML =

    products.length

      ? products.map(p => `

        <article class="card">

          <img
            class="card-image"
            src="${esc(img(p.image))}"
            onerror="this.src='${placeholder}'"
          >

          <div class="card-body">

            <h4>

              ${esc(p.name)}

              <span class="price">

                ${Number(p.price || 0)}
                ₪

              </span>

            </h4>


            <p>
              ${esc(
                p.description ||
                "بدون وصف"
              )}
            </p>


            <span
              class="badge ${
                p.available !== false
                  ? "badge-on"
                  : "badge-off"
              }"
            >

              ${
                p.available !== false
                  ? "متوفر"
                  : "غير متوفر"
              }

            </span>


            ${
              p.featured
                ? `
                  <span class="badge badge-on">
                    ⭐ مميز
                  </span>
                `
                : ""
            }


            ${
              p.offer
                ? `
                  <span class="badge badge-on">
                    🔥 عرض
                  </span>
                `
                : ""
            }


            <div
              class="card-actions"
              style="margin-top:10px"
            >

              <button
                class="dark"
                onclick="editProduct('${p.id}')"
              >
                تعديل
              </button>


              <button
                class="danger"
                onclick="deleteProduct('${p.id}')"
              >
                حذف
              </button>

            </div>

          </div>

        </article>

      `).join("")

      : `

        <div class="empty">

          لا توجد أصناف.
          أضف أول صنف.

        </div>

      `;

}



/* =========================================
   CATEGORY MODAL
========================================= */

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
        value="${esc(item?.name || "")}"
        placeholder="مثال: الحلويات"
      >

    </label>


    <label>

      رابط صورة القسم

      <input
        id="fImage"
        value="${esc(item?.image || "")}"
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
      src="${esc(img(item?.image))}"
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



/* =========================================
   PRODUCT MODAL
========================================= */

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



function productForm(p) {

  return `

    <label>

      اسم الصنف

      <input
        id="fName"
        required
        value="${esc(p.name || "")}"
        placeholder="مثال: كريب نوتيلا"
      >

    </label>


    <label>

      القسم

      <select
        id="fCategory"
        required
      >

        ${categories.map(c => `

          <option
            value="${c.id}"
            ${
              p.categoryId === c.id
                ? "selected"
                : ""
            }
          >

            ${esc(c.name)}

          </option>

        `).join("")}

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
        value="${p.price ?? ""}"
      >

    </label>


    <label>

      الوصف

      <textarea
        id="fDescription"
        placeholder="وصف مختصر"
      >${esc(
        p.description || ""
      )}</textarea>

    </label>


    <label>

      رابط صورة الصنف

      <input
        id="fImage"
        value="${esc(p.image || "")}"
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
      src="${esc(img(p.image))}"
    >


    <label class="check">

      <input
        id="fAvailable"
        type="checkbox"
        ${
          p.available !== false
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
          p.featured
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
          p.offer
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



/* =========================================
   IMAGE PREVIEW
========================================= */

function bindPreview() {

  const file =
    $("fFile");

  const url =
    $("fImage");

  const preview =
    $("preview");


  if (file) {

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


  if (url) {

    url.oninput = () => {

      if (
        url.value.trim()
      ) {

        preview.src =
          url.value.trim();

      }

    };

  }

}



/* =========================================
   MODAL CLOSE
========================================= */

function closeModal() {

  $("modal")
    .classList
    .add("hidden");


  $("entityForm").innerHTML =
    "";

}



/* =========================================
   SAVE CATEGORY / PRODUCT
========================================= */

$("entityForm").addEventListener(
  "submit",
  async e => {

    e.preventDefault();


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

      }



      /* CATEGORY */

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



      /* PRODUCT */

      else {

        const name =
          $("fName")
            .value
            .trim();


        const categoryId =
          $("fCategory").value;


        const price =
          Number(
            $("fPrice").value
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


    } catch (err) {

      console.error(err);


      alert(
        "حدث خطأ أثناء الحفظ:\n" +
        err.message
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



/* =========================================
   EDIT / DELETE
========================================= */

window.editCategory =
  id =>
    openCategoryModal(
      categories.find(
        x => x.id === id
      )
    );


window.editProduct =
  id =>
    openProductModal(
      products.find(
        x => x.id === id
      )
    );



window.deleteCategory =
  async id => {

    if (
      !confirm(
        "هل تريد حذف القسم؟"
      )
    ) return;


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

  };



window.deleteProduct =
  async id => {

    if (
      !confirm(
        "هل تريد حذف الصنف؟"
      )
    ) return;


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

  };



/* =========================================
   RESTAURANT SETTINGS
========================================= */

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


    const d =
      snapshot.exists()
        ? snapshot.data()
        : {};


    $("restaurantName").value =
      d.name ||
      d.restaurantName ||
      "CaféMenu";


    $("heroTitle").value =
      d.heroTitle ||
      "طعم يستحق التجربة";


    $("description").value =
      d.description ||
      "اكتشف أشهى الوجبات والحلويات والمشروبات في مكان واحد.";


    $("whatsapp").value =
      d.whatsapp || "";


    $("phone").value =
      d.phone || "";


    $("address").value =
      d.address || "";


    $("hours").value =
      d.hours || "";


    $("logoUrl").value =
      d.logo ||
      d.logoUrl ||
      "";


    $("heroImage").value =
      d.heroImage ||
      "";


    $("primaryColor").value =
      d.primaryColor ||
      "#111111";


    $("primaryColorText").value =
      d.primaryColor ||
      "#111111";


    $("secondaryColor").value =
      d.secondaryColor ||
      "#f59e0b";


    $("secondaryColorText").value =
      d.secondaryColor ||
      "#f59e0b";


    updateImagePreview(
      "logoPreview",
      $("logoUrl").value
    );


    updateImagePreview(
      "heroPreview",
      $("heroImage").value
    );


  } catch (error) {

    console.error(
      "Settings load error:",
      error
    );

  }

}



/* =========================================
   IMAGE PREVIEW SETTINGS
========================================= */

function updateImagePreview(
  id,
  url
) {

  const element =
    $(id);


  if (!element) return;


  if (url) {

    element.src =
      url;

  }

}



/* =========================================
   LOGO FILE
========================================= */

$("logoFile").addEventListener(
  "change",
  async () => {

    const file =
      $("logoFile")
        .files?.[0];


    if (!file) return;


    try {

      toast(
        "جاري تجهيز الشعار..."
      );


      const image =
        await compressImage(
          file
        );


      $("logoUrl").value =
        image;


      $("logoPreview").src =
        image;


      toast(
        "تم تجهيز الشعار ✅"
      );


    } catch (error) {

      alert(
        error.message
      );

    }

  }
);



/* =========================================
   HERO FILE
========================================= */

$("heroFile").addEventListener(
  "change",
  async () => {

    const file =
      $("heroFile")
        .files?.[0];


    if (!file) return;


    try {

      toast(
        "جاري تجهيز صورة الغلاف..."
      );


      const image =
        await compressImage(
          file
        );


      $("heroImage").value =
        image;


      $("heroPreview").src =
        image;


      toast(
        "تم تجهيز صورة الغلاف ✅"
      );


    } catch (error) {

      alert(
        error.message
      );

    }

  }
);



/* =========================================
   URL PREVIEW
========================================= */

$("logoUrl").addEventListener(
  "input",
  () => {

    updateImagePreview(
      "logoPreview",
      $("logoUrl").value.trim()
    );

  }
);



$("heroImage").addEventListener(
  "input",
  () => {

    updateImagePreview(
      "heroPreview",
      $("heroImage").value.trim()
    );

  }
);



/* =========================================
   COLORS
========================================= */

$("primaryColor").addEventListener(
  "input",
  () => {

    $("primaryColorText").value =
      $("primaryColor").value;

  }
);


$("primaryColorText").addEventListener(
  "input",
  () => {

    const value =
      $("primaryColorText")
        .value
        .trim();


    if (
      /^#[0-9A-Fa-f]{6}$/
        .test(value)
    ) {

      $("primaryColor").value =
        value;

    }

  }
);



$("secondaryColor").addEventListener(
  "input",
  () => {

    $("secondaryColorText").value =
      $("secondaryColor").value;

  }
);


$("secondaryColorText").addEventListener(
  "input",
  () => {

    const value =
      $("secondaryColorText")
        .value
        .trim();


    if (
      /^#[0-9A-Fa-f]{6}$/
        .test(value)
    ) {

      $("secondaryColor").value =
        value;

    }

  }
);



/* =========================================
   SAVE SETTINGS
========================================= */

$("settingsForm").addEventListener(
  "submit",
  async e => {

    e.preventDefault();


    const button =
      $("settingsForm")
        .querySelector(
          'button[type="submit"]'
        );


    try {

      if (button) {

        button.disabled =
          true;

        button.textContent =
          "جاري الحفظ...";

      }


      let logo =
        $("logoUrl")
          .value
          .trim();


      let heroImage =
        $("heroImage")
          .value
          .trim();



      /* ===============================
         LOGO FILE
      =============================== */

      const logoFile =
        $("logoFile")
          .files?.[0];


      if (logoFile) {

        toast(
          "جاري ضغط الشعار..."
        );


        logo =
          await compressImage(
            logoFile
          );

      }



      /* ===============================
         HERO FILE
      =============================== */

      const heroFile =
        $("heroFile")
          .files?.[0];


      if (heroFile) {

        toast(
          "جاري ضغط صورة الغلاف..."
        );


        heroImage =
          await compressImage(
            heroFile
          );

      }



      /* ===============================
         COLORS
      =============================== */

      const primaryColor =
        $("primaryColor")
          .value;


      const secondaryColor =
        $("secondaryColor")
          .value;



      /* ===============================
         SAVE
      =============================== */

      await setDoc(

        doc(
          db,
          "settings",
          "restaurant"
        ),

        {

          name:
            $("restaurantName")
              .value
              .trim(),

          restaurantName:
            $("restaurantName")
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

          logo:

            logo,

          logoUrl:

            logo,

          heroImage:

            heroImage,

          primaryColor:

            primaryColor,

          secondaryColor:

            secondaryColor,

          updatedAt:
            serverTimestamp()

        },

        {
          merge: true
        }

      );


      toast(
        "تم حفظ إعدادات المطعم بنجاح ✅"
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


    } finally {

      if (button) {

        button.disabled =
          false;

        button.textContent =
          "💾 حفظ إعدادات المطعم";

      }

    }

  }
);
