const API = "/api";
const state = {
  token: localStorage.getItem("cg_token"),
  user: JSON.parse(localStorage.getItem("cg_user") || "null"),
  products: [],
  categories: [],
  cart: null,
};
const $ = (s) => document.querySelector(s);
const money = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";
function toast(m, good = true) {
  const t = $("#toast");
  t.textContent = m;
  t.className = good ? "show good" : "show";
  setTimeout(() => (t.className = ""), 2800);
}
async function api(path, opt = {}) {
  opt.headers = { ...(opt.headers || {}), "Content-Type": "application/json" };
  if (state.token) opt.headers.Authorization = "Bearer " + state.token;
  const r = await fetch(API + path, opt);
  let d = {};
  try {
    d = await r.json();
  } catch {}
  if (!r.ok) throw new Error(d.message || "Có lỗi xảy ra");
  return d;
}
function saveAuth(d) {
  state.token = d.token;
  state.user = d.user;
  localStorage.setItem("cg_token", d.token);
  localStorage.setItem("cg_user", JSON.stringify(d.user));
}
function logout() {
  localStorage.removeItem("cg_token");
  localStorage.removeItem("cg_user");
  state.token = null;
  state.user = null;
  location.hash = "#/login";
}
function header(active = "home") {
  return `<header class="topbar"><div class="container" style="display:flex;align-items:center;width:100%"><a class="brand" href="#/"><span class="brand-icon">🍴</span>CANTEEN <b style="color:#f56616">GO</b></a><nav class="nav"><a class="${active === "home" ? "active" : ""}" href="#/">Trang chủ</a><a class="${active === "menu" ? "active" : ""}" href="#/menu">Thực đơn</a><a class="${active === "orders" ? "active" : ""}" href="#/orders">Đơn hàng</a><a class="${active === "profile" ? "active" : ""}" href="#/profile">Liên hệ</a></nav><div class="top-actions"><a class="pill" href="#/cart">🛒 Giỏ hàng <span id="cart-count"></span></a>${state.user ? `<button class="btn btn-outline" onclick="logout()">Đăng xuất</button>` : `<a class="btn btn-green" href="#/login">Đăng nhập</a>`}</div></div></header>`;
}
function footer() {
  return `<footer class="footer"><div class="container footer-grid"><div><div class="brand"><span class="brand-icon">🍴</span>CANTEEN <b style="color:#f56616">GO</b></div><p>Hệ thống quản lý và đặt món Canteen Go dành cho sinh viên, giảng viên và nhân viên.</p><p>📍 Học viện Phụ nữ Việt Nam</p></div><div><h4>Canteen Go</h4><p>Thực đơn</p><p>Đơn hàng</p><p>Thanh toán</p></div><div><h4>Hỗ trợ</h4><p>Hướng dẫn sử dụng</p><p>Chính sách</p><p>Liên hệ hỗ trợ</p></div></div></footer>`;
}
function requireLogin() {
  if (!state.user) {
    location.hash = "#/login";
    return false;
  }
  return true;
}
async function loadBase() {
  state.categories = await api("/categories");
  state.products = await api("/products");
}
function home() {
  return `${header("home")}<section class="hero"><div class="container"><h1>Chào bạn, ${state.user?.full_name?.split(" ").slice(-1)[0] || "A"}! Hôm nay ăn gì nào?</h1><p>Đặt món nhanh – chọn giờ nhận – không cần xếp hàng.</p><div class="search"><input id="hero-search" placeholder="Tìm kiếm món ăn, đồ uống yêu thích..."><button class="btn btn-green" onclick="goSearch()">Tìm kiếm</button></div></div></section><main class="container"><section class="section"><div class="section-head"><h2>Khám phá danh mục</h2></div><div class="categories">${state.categories.map((c) => `<button class="cat" onclick="location.hash='#/menu?category=${c.id}'"><span>${c.icon}</span><b>${c.name}</b></button>`).join("")}</div></section><section class="section"><div class="section-head"><h2>Món ăn nổi bật hôm nay</h2><a href="#/menu" style="color:var(--green);font-size:13px">Xem tất cả →</a></div><div class="products">${state.products.slice(0, 4).map(productCard).join("")}</div></section></main>${footer()}`;
}
function goSearch() {
  const v = $("#hero-search").value.trim();
  location.hash = "#/menu" + (v ? "?search=" + encodeURIComponent(v) : "");
}
function productCard(p) {
  return `<article class="card"><img class="food-img" src="${p.image_url}" onerror="this.src='assets/food-rice.svg'"><div class="card-body"><span class="tag ${p.status !== "AVAILABLE" ? "red" : ""}">${p.status === "AVAILABLE" ? "Còn hàng" : "Hết hàng"}</span><h3>${p.name}</h3><div class="price">${money(p.price)}</div><p>${p.description || "Món ăn thơm ngon, phục vụ mỗi ngày tại Canteen."}</p><div class="card-actions"><button class="btn btn-orange" style="flex:1" onclick="detail(${p.id})">Thêm vào giỏ</button><button class="btn btn-outline" onclick="detail(${p.id})">Chi tiết</button></div></div></article>`;
}
async function menu() {
  const u = new URL(location.href),
    search = u.searchParams.get("search") || "",
    cat = u.searchParams.get("category") || "";
  let ps = await api(
    "/products?search=" +
      encodeURIComponent(search) +
      "&category=" +
      encodeURIComponent(cat),
  );
  return `${header("menu")}<main class="container section"><div class="section-head"><div><h2>Thực đơn ${cat ? "– " + (state.categories.find((x) => x.id == cat)?.name || "") : ""}</h2><p style="color:var(--muted);font-size:13px">Tìm thấy ${ps.length} món</p></div></div><div class="grid2"><div class="panel"><b>Bộ lọc tìm kiếm</b><div class="form-group"><input class="form-control" id="menu-search" value="${search}" placeholder="Tên món..."></div><div class="form-group"><label>Danh mục</label><select class="form-control" id="menu-cat"><option value="">Tất cả</option>${state.categories.map((c) => `<option value="${c.id}" ${cat == c.id ? "selected" : ""}>${c.icon} ${c.name}</option>`).join("")}</select></div><button class="btn btn-green" onclick="applyFilter()">Áp dụng bộ lọc</button></div><div class="products">${ps.length ? ps.map(productCard).join("") : `<div class="empty">Không tìm thấy món phù hợp.</div>`}</div></div></main>${footer()}`;
}
function applyFilter() {
  const s = $("#menu-search").value.trim(),
    c = $("#menu-cat").value;
  location.hash =
    "#/menu?" +
    (s ? "search=" + encodeURIComponent(s) + "&" : "") +
    (c ? "category=" + c : "");
}
async function detail(id) {
  if (!state.user) {
    toast("Vui lòng đăng nhập để đặt món");
    location.hash = "#/login";
    return;
  }
  const p = await api("/products/" + id);
  showModal(
    `<div class="modal-head"><h3>Chi tiết món ăn</h3><button onclick="closeModal()">✕</button></div><div class="grid2" style="margin-top:16px"><img src="${p.image_url}" class="food-img" style="height:260px;border-radius:12px"><div><span class="tag">${p.category_name}</span><h2>${p.name}</h2><div class="price" style="font-size:24px">${money(p.price)}</div><p>${p.description}</p><p><b>Tồn kho:</b> ${p.stock} suất</p><label>Số lượng</label><div class="qty" style="margin:8px 0;justify-content:flex-start"><button onclick="changeModalQty(-1)">−</button><b id="modal-qty">1</b><button onclick="changeModalQty(1)">+</button></div><button class="btn btn-orange" style="width:100%" ${p.status !== "AVAILABLE" ? "disabled" : ""} onclick="addCart(${p.id})">Thêm vào giỏ</button></div></div>`,
  );
  window.modalQty = 1;
  window.modalProduct = id;
}
function changeModalQty(x) {
  window.modalQty = Math.max(1, window.modalQty + x);
  $("#modal-qty").textContent = window.modalQty;
}
async function addCart(id, qty = window.modalQty || 1) {
  try {
    await api("/cart/items", {
      method: "POST",
      body: JSON.stringify({ product_id: id, quantity: qty }),
    });
    toast("Đã thêm món vào giỏ");
    closeModal();
    updateCartCount();
  } catch (e) {
    toast(e.message, false);
  }
}
async function updateCartCount() {
  if (!state.user) return;
  try {
    const c = await api("/cart");
    const n = c.items.reduce((s, x) => s + x.quantity, 0);
    const el = $("#cart-count");
    if (el) el.textContent = n ? `(${n})` : "";
  } catch {}
}
async function cart() {
  if (!requireLogin()) return "";
  const c = await api("/cart");
  state.cart = c;
  return `${header()}<main class="container section"><h2>Giỏ hàng của bạn</h2><div class="cart-layout" style="margin-top:18px"><div>${c.items.length ? c.items.map((x) => `<div class="cart-item"><img src="${x.image_url}"><div><b>${x.name}</b><div class="price">${money(x.price)}</div></div><div class="qty"><button onclick="updateCart(${x.id},${x.quantity - 1})">−</button><b>${x.quantity}</b><button onclick="updateCart(${x.id},${x.quantity + 1})">+</button><button onclick="deleteCart(${x.id})" style="color:#ef4444">🗑</button></div></div>`).join("") : `<div class="panel empty">🛒<br>Giỏ hàng đang trống.<br><a href="#/menu" class="btn btn-green" style="display:inline-block;margin-top:12px">Xem thực đơn</a></div>`}</div><aside class="summary"><h3>Tóm tắt đơn hàng</h3><div class="summary-row"><span>Tạm tính</span><b>${money(c.total)}</b></div><div class="summary-row"><span>Phí dịch vụ</span><span>0đ</span></div><div class="total"><div class="summary-row"><span>Tổng cộng</span><b>${money(c.total)}</b></div></div>${c.items.length ? `<button class="btn btn-orange" style="width:100%;margin-top:12px" onclick="location.hash='#/checkout'">Tiếp tục đặt hàng →</button>` : ""}</aside></div></main>${footer()}`;
}
async function updateCart(id, q) {
  try {
    await api("/cart/items/" + id, {
      method: "PUT",
      body: JSON.stringify({ quantity: q }),
    });
    render();
  } catch (e) {
    toast(e.message, false);
  }
}
async function deleteCart(id) {
  await api("/cart/items/" + id, { method: "DELETE" });
  render();
}
async function checkout() {
  if (!requireLogin()) return "";
  const slots = await api("/pickup-slots"),
    c = await api("/cart");
  return `${header()}<main class="container section"><h2>Thông tin đặt hàng</h2><div class="checkout-layout" style="margin-top:18px"><div><div class="panel"><h3>📍 Địa điểm nhận hàng</h3><label class="cat active"><input type="radio" checked> Canteen VWA – Tầng 1</label></div><div class="panel" style="margin-top:14px"><h3>🕐 Chọn khung giờ nhận món</h3><select id="pickup" class="form-control">${slots.map((s) => `<option value="${s.id}">${new Date(s.slot_date).toLocaleDateString("vi-VN")} · ${s.start_label} – ${s.end_label} · còn ${s.capacity - s.booked_count} chỗ</option>`).join("")}</select></div><div class="panel" style="margin-top:14px"><h3>💳 Phương thức thanh toán</h3><label class="cat active"><input type="radio" name="pay" value="EWALLET_SIMULATED" checked> Ví điện tử giả lập (demo)</label><label class="cat" style="margin-top:8px"><input type="radio" name="pay" value="BANK_SIMULATED"> Chuyển khoản giả lập</label></div></div><aside class="summary"><h3>Tóm tắt đơn hàng</h3>${c.items.map((x) => `<div class="summary-row"><span>${x.name} × ${x.quantity}</span><b>${money(x.line_total)}</b></div>`).join("")}<div class="total"><div class="summary-row"><span>Tổng cộng</span><b>${money(c.total)}</b></div></div><button class="btn btn-orange" style="width:100%" onclick="placeOrder()">Xác nhận đặt món · ${money(c.total)}</button></aside></div></main>${footer()}`;
}
async function placeOrder() {
  try {
    const o = await api("/orders", {
      method: "POST",
      body: JSON.stringify({ pickup_slot_id: Number($("#pickup").value) }),
    });
    location.hash = "#/payment/" + o.id;
  } catch (e) {
    toast(e.message, false);
  }
}
async function payment(id) {
  const o = await api("/orders/" + id);
  return `${header()}<main class="container section"><div class="panel" style="max-width:760px;margin:auto"><h2>Thanh toán đơn hàng</h2><p>Mã đơn: <b>${o.order_code}</b></p>${o.items.map((x) => `<div class="summary-row"><span>${x.product_name} × ${x.quantity}</span><b>${money(x.line_total)}</b></div>`).join("")}<div class="total"><div class="summary-row"><span>Tổng thanh toán</span><b>${money(o.total_amount)}</b></div></div><div class="cat active" style="margin-top:15px">💚 Thanh toán giả lập – hệ thống sẽ ghi nhận kết quả demo</div><button class="btn btn-green" style="width:100%;margin-top:14px" onclick="payNow(${id},'SUCCESS')">Thanh toán thành công</button><button class="btn btn-red" style="width:100%;margin-top:8px" onclick="payNow(${id},'FAILED')">Mô phỏng thanh toán thất bại</button></div></main>${footer()}`;
}
async function payNow(id, result) {
  try {
    const d = await api("/payments/" + id, {
      method: "POST",
      body: JSON.stringify({ method: "EWALLET_SIMULATED", result }),
    });
    if (d.success) {
      toast("Thanh toán thành công");
      location.hash = "#/orders";
    } else toast("Thanh toán thất bại – bạn có thể thử lại", false);
  } catch (e) {
    toast(e.message, false);
  }
}
async function orders() {
  if (!requireLogin()) return "";
  const os = await api("/orders/my");
  return `${header("orders")}<main class="container section"><div class="section-head"><h2>Lịch sử đặt món</h2></div>${os.length ? os.map((o) => `<div class="panel" style="margin-bottom:12px"><div class="summary-row"><b>${o.order_code}</b><span class="status ${["CANCELLED", "REJECTED"].includes(o.status) ? "danger" : o.status === "PENDING_PAYMENT" ? "warn" : ""}">${statusVN(o.status)}</span></div><p style="color:var(--muted);font-size:12px">${new Date(o.placed_at).toLocaleString("vi-VN")} · Nhận: ${o.pickup_time}</p><div>${o.items.map((x) => `<span style="font-size:12px;margin-right:14px">${x.product_name} × ${x.quantity}</span>`).join("")}</div><div class="summary-row"><b>Tổng</b><b class="price">${money(o.total_amount)}</b></div><div style="display:flex;gap:8px;flex-wrap:wrap">${o.status === "PENDING_PAYMENT" ? `<button class="btn btn-orange" onclick="location.hash='#/payment/${o.id}'">Thanh toán</button><button class="btn btn-red" onclick="cancelOrder(${o.id})">Hủy đơn</button>` : ""}<button class="btn btn-outline" onclick="viewOrder(${o.id})">Xem chi tiết</button>${o.status === "COMPLETED" ? `<button class="btn btn-green" onclick="reviewOrder(${o.id})">Đánh giá</button>` : ""}</div></div>`).join("") : `<div class="panel empty">Bạn chưa có đơn hàng nào.</div>`}</main>${footer()}`;
}
function statusVN(s) {
  return (
    {
      PENDING_PAYMENT: "Chờ thanh toán",
      PENDING: "Chờ xử lý",
      CONFIRMED: "Đã xác nhận",
      PREPARING: "Đang chuẩn bị",
      READY: "Sẵn sàng nhận",
      COMPLETED: "Đã giao/đã nhận",
      CANCELLED: "Đã hủy",
      REJECTED: "Đã từ chối",
    }[s] || s
  );
}
async function cancelOrder(id) {
  try {
    await api("/orders/" + id + "/cancel", { method: "POST" });
    toast("Đã hủy đơn");
    render();
  } catch (e) {
    toast(e.message, false);
  }
}
async function viewOrder(id) {
  const o = await api("/orders/" + id);
  showModal(
    `<div class="modal-head"><h3>${o.order_code}</h3><button onclick="closeModal()">✕</button></div><div class="timeline">${["PENDING", "CONFIRMED", "PREPARING", "READY", "COMPLETED"].map((s, i) => `<div class="step ${["PENDING", "CONFIRMED", "PREPARING", "READY", "COMPLETED"].indexOf(o.status) >= i ? "done" : ""}"><div class="dot">${i + 1}</div><span>${statusVN(s)}</span></div>`).join("")}</div>${o.items.map((x) => `<div class="summary-row"><span>${x.product_name} × ${x.quantity}</span><b>${money(x.line_total)}</b></div>`).join("")}<div class="total">Tổng: ${money(o.total_amount)}</div>${o.rejection_reason ? `<p style="color:#dc2626">Lý do từ chối: ${o.rejection_reason}</p>` : ""}`,
  );
}
async function reviewOrder(id) {
  const o = await api("/orders/" + id);
  showModal(
    `<div class="modal-head"><h3>Đánh giá món ăn</h3><button onclick="closeModal()">✕</button></div>${o.items.map((x) => `<div class="panel" style="margin-top:12px"><b>${x.product_name}</b><div class="form-group"><select class="form-control review-rating" data-product="${x.product_id}"><option value="5">★★★★★ – Rất tốt</option><option value="4">★★★★☆ – Tốt</option><option value="3">★★★☆☆ – Bình thường</option><option value="2">★★☆☆☆ – Chưa tốt</option><option value="1">★☆☆☆☆ – Kém</option></select></div><textarea class="form-control review-comment" data-product="${x.product_id}" placeholder="Nhận xét của bạn..."></textarea></div>`).join("")}<button class="btn btn-green" style="width:100%;margin-top:12px" onclick="submitReviews(${id})">Gửi đánh giá</button>`,
  );
}
async function submitReviews(orderId) {
  document.querySelectorAll(".review-rating").forEach(async (el) => {
    const pid = el.dataset.product,
      comment = document.querySelector(
        `.review-comment[data-product="${pid}"]`,
      ).value;
    await api("/reviews", {
      method: "POST",
      body: JSON.stringify({
        order_id: orderId,
        product_id: pid,
        rating: Number(el.value),
        comment,
      }),
    });
  });
  closeModal();
  toast("Đã gửi đánh giá");
}
async function profile() {
  if (!requireLogin()) return "";
  const u = state.user;
  return `${header("profile")}<main class="container section"><div class="grid2"><div class="panel"><h3>${u.full_name}</h3><p class="hint">${u.role === "CUSTOMER" ? (u.customer_type === "TEACHER" ? "Giảng viên" : "Sinh viên") : "Nhân viên Canteen"}</p><p>📧 ${u.email}</p><p>📱 ${u.phone || "Chưa cập nhật"}</p><button class="btn btn-green" onclick="editProfile()">Thông tin cá nhân</button></div><div class="panel"><h3>Đổi mật khẩu bảo mật</h3><div class="form-group"><input id="oldpass" class="form-control" type="password" placeholder="Mật khẩu hiện tại"></div><div class="form-group"><input id="newpass" class="form-control" type="password" placeholder="Mật khẩu mới"></div><button class="btn btn-green" onclick="changePassword()">Cập nhật mật khẩu</button></div></div></main>${footer()}`;
}
async function editProfile() {
  showModal(
    `<div class="modal-head"><h3>Chỉnh sửa thông tin cá nhân</h3><button onclick="closeModal()">✕</button></div><div class="form-group"><label>Họ tên</label><input id="pf-name" class="form-control" value="${state.user.full_name}"></div><div class="form-group"><label>Số điện thoại</label><input id="pf-phone" class="form-control" value="${state.user.phone || ""}"></div><div class="form-group"><label>MSSV</label><input id="pf-code" class="form-control" value="${state.user.student_code || ""}"></div><button class="btn btn-green" onclick="saveProfile()">Lưu thay đổi</button>`,
  );
}
async function saveProfile() {
  const u = await api("/users/profile", {
    method: "PUT",
    body: JSON.stringify({
      full_name: $("#pf-name").value,
      phone: $("#pf-phone").value,
      student_code: $("#pf-code").value,
    }),
  });
  state.user = { ...state.user, ...u };
  localStorage.setItem("cg_user", JSON.stringify(state.user));
  closeModal();
  toast("Đã cập nhật thông tin");
  render();
}
async function changePassword() {
  try {
    await api("/users/password", {
      method: "PUT",
      body: JSON.stringify({
        old_password: $("#oldpass").value,
        new_password: $("#newpass").value,
      }),
    });
    toast("Đổi mật khẩu thành công");
  } catch (e) {
    toast(e.message, false);
  }
}
function login() {
  return `<div class="auth-wrap"><div class="auth"><div class="brand" style="justify-content:center;font-size:18px"><span class="brand-icon">🍴</span>CANTEEN <b style="color:#f56616">GO</b></div><h1>Đăng nhập</h1><p class="sub">Đặt món nhanh – nhận món đúng giờ</p><div class="role-tabs"><button class="active" id="r-customer" onclick="setLoginRole('CUSTOMER')">Khách hàng</button><button id="r-staff" onclick="setLoginRole('STAFF')">Nhân viên</button><button id="r-admin" onclick="setLoginRole('ADMIN')">Admin</button></div><div class="form-group"><label>Email</label><input id="login-email" class="form-control" value="student@vwa.edu.vn"></div><div class="form-group"><label>Mật khẩu</label><input id="login-pass" class="form-control" type="password" value="123456"></div><button class="btn btn-green" onclick="doLogin()">Đăng nhập</button><button class="btn btn-outline" style="width:100%;margin-top:8px" onclick="location.hash='#/register'">Tạo tài khoản khách hàng</button><div class="login-demo"><b>Tài khoản demo</b><br>Khách: student@vwa.edu.vn / 123456<br>Giảng viên: teacher@vwa.edu.vn / 123456<br>Staff: staff@canteen.vn / 123456<br>Admin: admin@canteen.vn / 123456</div></div></div>`;
}
window.loginRole = "CUSTOMER";
function setLoginRole(r) {
  window.loginRole = r;
  ["CUSTOMER", "STAFF", "ADMIN"].forEach((x) =>
    $("#r-" + x.toLowerCase()).classList.toggle("active", x === r),
  );
  if (r === "STAFF") $("#login-email").value = "staff@canteen.vn";
  else if (r === "ADMIN") $("#login-email").value = "admin@canteen.vn";
  else $("#login-email").value = "student@vwa.edu.vn";
}
async function doLogin() {
  try {
    saveAuth(
      await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: $("#login-email").value,
          password: $("#login-pass").value,
          role: window.loginRole,
        }),
      }),
    );
    toast("Đăng nhập thành công");
    location.hash =
      state.user.role === "ADMIN"
        ? "#/admin"
        : state.user.role === "STAFF"
          ? "#/staff"
          : "#/";
  } catch (e) {
    toast(e.message, false);
  }
}
function register() {
  return `<div class="auth-wrap"><div class="auth"><div class="brand" style="justify-content:center;font-size:18px"><span class="brand-icon">🍴</span>CANTEEN <b style="color:#f56616">GO</b></div><h1>Tạo tài khoản</h1><p class="sub">Đăng ký tài khoản khách hàng</p><div class="role-tabs"><button class="active" id="student" onclick="setReg('STUDENT')">Sinh viên</button><button id="teacher" onclick="setReg('TEACHER')">Giảng viên</button><button id="external" onclick="setReg('EXTERNAL')">Ngoài đơn vị</button></div><div class="form-group"><label>Họ và tên</label><input id="rg-name" class="form-control"></div><div class="form-group"><label>Email</label><input id="rg-email" class="form-control"></div><div id="mssv-group" class="form-group"><label>MSSV</label><input id="rg-code" class="form-control"></div><div class="form-group"><label>Số điện thoại</label><input id="rg-phone" class="form-control"></div><div class="form-group"><label>Mật khẩu</label><input id="rg-pass" class="form-control" type="password"></div><button class="btn btn-green" onclick="doRegister()">Đăng ký</button><button class="btn btn-outline" style="width:100%;margin-top:8px" onclick="location.hash='#/login'">Đã có tài khoản? Đăng nhập</button></div></div>`;
}
window.regType = "STUDENT";
function setReg(t) {
  window.regType = t;
  ["student", "teacher", "external"].forEach((x) =>
    $("#" + x).classList.toggle("active", x.toUpperCase() === t),
  );
  $("#mssv-group").style.display = t === "EXTERNAL" ? "none" : "block";
}
async function doRegister() {
  try {
    saveAuth(
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          full_name: $("#rg-name").value,
          email: $("#rg-email").value,
          student_code: $("#rg-code").value,
          phone: $("#rg-phone").value,
          password: $("#rg-pass").value,
          customer_type: window.regType,
        }),
      }),
    );
    toast("Tạo tài khoản thành công");
    location.hash = "#/";
  } catch (e) {
    toast(e.message, false);
  }
}
function adminShell(active, title, body) {
  return `<div class="admin-layout"><aside class="sidebar"><div class="side-brand"><div class="brand"><span class="brand-icon">🍴</span><span class="brand-text">CANTEEN <b style="color:#f56616">GO</b></span></div></div><div class="side-menu">${[
    ["dashboard", "Tổng quan", "📊"],
    ["products", "Quản lý món", "🍱"],
    ["categories", "Quản lý danh mục", "◈"],
    ["orders", "Quản lý đơn hàng", "🧾"],
    ["users", "Người dùng & TK", "👥"],
    ["inventory", "Kho & nguồn cung", "📦"],
    ["reports", "Báo cáo & thống kê", "📈"],
  ]
    .map(
      (x) =>
        `<button class="${active === x[0] ? "active" : ""}" onclick="adminPage('${x[0]}')">${x[2]} <span class="label">${x[1]}</span></button>`,
    )
    .join(
      "",
    )}<button onclick="logout()">↪ <span class="label">Đăng xuất</span></button></div></aside><main class="admin-main"><div class="admin-head"><div><h1>${title}</h1><span class="hint">Canteen Go · Quản trị hệ thống</span></div><button class="btn btn-green" onclick="adminPage('products')">+ Thêm món</button></div>${body}</main></div>`;
}
async function admin() {
  return adminDashboard();
}
async function adminDashboard() {
  const r = await api("/admin/reports");
  return adminShell(
    "dashboard",
    "Tổng quan Canteen",
    `<div class="stats"><div class="stat"><small>Doanh thu hôm nay</small><b>${money(r.summary.revenue)}</b><span class="status">↑ Hoạt động</span></div><div class="stat"><small>Tổng đơn hàng</small><b>${r.summary.orders}</b><span class="status">Đơn</span></div><div class="stat"><small>Khách hàng</small><b>${r.summary.customers}</b><span class="status">Người dùng</span></div><div class="stat"><small>Món đang quản lý</small><b>${r.stock.total_products}</b><span class="status ${r.stock.sold_out ? "danger" : ""}">${r.stock.sold_out || 0} hết hàng</span></div></div><div class="grid2" style="margin-top:16px"><div class="panel"><div class="section-head"><b>Doanh thu 7 ngày gần nhất</b><span class="hint">VNĐ</span></div><div class="chart">${r.revenue.map((x) => `<div class="bar" style="height:${Math.max(15, Math.min(160, (Number(x.revenue) / Math.max(1, ...r.revenue.map((y) => Number(y.revenue)))) * 160))}px"><span>${new Date(x.day).toLocaleDateString("vi-VN", { weekday: "short" })}</span></div>`).join("")}</div></div><div class="panel"><div class="section-head"><b>Trạng thái đơn hôm nay</b></div><div style="display:flex;justify-content:center"><div class="donut"></div></div><p class="hint">${r.statuses.map((x) => `${statusVN(x.status)}: ${x.count}`).join(" · ")}</p></div></div><div class="table-card"><table class="table"><thead><tr><th>Món bán chạy</th><th>Đã bán</th><th>Doanh thu</th></tr></thead><tbody>${r.best.map((x) => `<tr><td>${x.product_name}</td><td>${x.quantity}</td><td>${money(x.revenue)}</td></tr>`).join("")}</tbody></table></div>`,
  );
}
async function adminPage(p) {
  if (!state.user || state.user.role !== "ADMIN")
    return (location.hash = "#/login");
  let html = "";
  if (p === "dashboard") html = await adminDashboard();
  if (p === "products") html = await adminProducts();
  if (p === "categories") html = await adminCategories();
  if (p === "orders") html = await adminOrders();
  if (p === "users") html = await adminUsers();
  if (p === "inventory") html = await adminInventory();
  if (p === "reports") html = await adminReports();
  $("#app").innerHTML = html;
}
async function adminProducts() {
  const ps = await api("/products");
  return adminShell(
    "products",
    "Quản lý món",
    `<div class="toolbar"><input id="ap-search" class="form-control" style="max-width:320px" placeholder="Tìm món..."><button class="btn btn-green" onclick="adminProductForm()">+ Thêm món mới</button></div><div class="table-card"><table class="table"><thead><tr><th>Món ăn</th><th>Danh mục</th><th>Giá</th><th>Tồn</th><th>Trạng thái</th><th></th></tr></thead><tbody>${ps.map((p) => `<tr><td><b>${p.name}</b></td><td>${p.category_name}</td><td>${money(p.price)}</td><td>${p.stock}</td><td><span class="status ${p.status !== "AVAILABLE" ? "danger" : ""}">${p.status === "AVAILABLE" ? "Hoạt động" : p.status === "SOLD_OUT" ? "Hết hàng" : "Ẩn"}</span></td><td><button class="btn btn-outline" onclick='adminProductForm(${JSON.stringify(p)})'>Sửa</button> <button class="btn btn-red" onclick="hideProduct(${p.id})">Xóa</button></td></tr>`).join("")}</tbody></table></div>`,
  );
}
function adminProductForm(p = {}) {
  showModal(
    `<div class="modal-head"><h3>${p.id ? "Sửa món" : "Thêm món mới"}</h3><button onclick="closeModal()">✕</button></div><div class="grid2"><div class="form-group"><label>Tên món</label><input id="pm-name" class="form-control" value="${p.name || ""}"></div><div class="form-group"><label>Danh mục</label><select id="pm-cat" class="form-control">${state.categories.map((c) => `<option value="${c.id}" ${p.category_id == c.id ? "selected" : ""}>${c.name}</option>`).join("")}</select></div><div class="form-group"><label>Giá</label><input id="pm-price" type="number" class="form-control" value="${p.price || ""}"></div><div class="form-group"><label>Tồn kho</label><input id="pm-stock" type="number" class="form-control" value="${p.stock || 0}"></div></div><div class="form-group"><label>Mô tả</label><textarea id="pm-desc" class="form-control">${p.description || ""}</textarea></div><div class="form-group"><label>Ảnh (URL hoặc assets/food-rice.svg)</label><input id="pm-img" class="form-control" value="${p.image_url || "assets/food-rice.svg"}"></div><div class="form-group"><label>Trạng thái</label><select id="pm-status" class="form-control"><option value="AVAILABLE">Còn hàng</option><option value="SOLD_OUT" ${p.status === "SOLD_OUT" ? "selected" : ""}>Hết hàng</option><option value="HIDDEN" ${p.status === "HIDDEN" ? "selected" : ""}>Ẩn</option></select></div><button class="btn btn-green" onclick='saveProduct(${p.id || 0})'>Lưu món</button>`,
  );
}
async function saveProduct(id) {
  const d = {
    name: $("#pm-name").value,
    category_id: Number($("#pm-cat").value),
    price: Number($("#pm-price").value),
    stock: Number($("#pm-stock").value),
    description: $("#pm-desc").value,
    image_url: $("#pm-img").value,
    status: $("#pm-status").value,
  };
  try {
    await api("/admin/products" + (id ? "/" + id : ""), {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(d),
    });
    closeModal();
    toast("Đã lưu món");
    adminPage("products");
  } catch (e) {
    toast(e.message, false);
  }
}
async function hideProduct(id) {
  await api("/admin/products/" + id, { method: "DELETE" });
  toast("Đã ẩn món");
  adminPage("products");
}
async function adminCategories() {
  const cs = await api("/categories");
  return adminShell(
    "categories",
    "Quản lý danh mục",
    `<div class="table-card"><table class="table"><thead><tr><th>#</th><th>Danh mục</th><th>Mô tả</th><th>Trạng thái</th><th></th></tr></thead><tbody>${cs.map((c) => `<tr><td>${c.id}</td><td>${c.icon} <b>${c.name}</b></td><td>${c.description || ""}</td><td><span class="status">Hoạt động</span></td><td><button class="btn btn-outline" onclick='editCategory(${JSON.stringify(c)})'>Sửa</button></td></tr>`).join("")}</tbody></table></div><button class="btn btn-green" style="margin-top:12px" onclick="editCategory()">+ Thêm danh mục</button>`,
  );
}
function editCategory(c = {}) {
  showModal(
    `<div class="modal-head"><h3>${c.id ? "Sửa danh mục" : "Thêm danh mục"}</h3><button onclick="closeModal()">✕</button></div><div class="form-group"><label>Tên danh mục</label><input id="cat-name" class="form-control" value="${c.name || ""}"></div><div class="form-group"><label>Icon</label><input id="cat-icon" class="form-control" value="${c.icon || "🍽️"}"></div><div class="form-group"><label>Mô tả</label><input id="cat-desc" class="form-control" value="${c.description || ""}"></div><button class="btn btn-green" onclick="saveCategory(${c.id || 0})">Lưu</button>`,
  );
}
async function saveCategory(id) {
  try {
    await api("/admin/categories" + (id ? "/" + id : ""), {
      method: id ? "PUT" : "POST",
      body: JSON.stringify({
        name: $("#cat-name").value,
        icon: $("#cat-icon").value,
        description: $("#cat-desc").value,
        status: "ACTIVE",
      }),
    });
    closeModal();
    toast("Đã lưu danh mục");
    loadBase().then(() => adminPage("categories"));
  } catch (e) {
    toast(e.message, false);
  }
}
async function adminOrders() {
  const os = await api("/staff/orders");
  return adminShell(
    "orders",
    "Quản lý đơn hàng",
    `<div class="toolbar"><input id="ao-search" class="form-control" placeholder="Mã đơn / tên khách"><select id="ao-status" class="form-control"><option value="">Tất cả trạng thái</option>${["PENDING", "CONFIRMED", "PREPARING", "READY", "COMPLETED", "REJECTED"].map((s) => `<option value="${s}">${statusVN(s)}</option>`).join("")}</select><button class="btn btn-green" onclick="adminPage('orders')">Lọc</button></div><div class="table-card"><table class="table"><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Thời gian nhận</th><th>Tổng</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>${os.map((o) => `<tr><td><b>${o.order_code}</b></td><td>${o.full_name}</td><td>${o.pickup_time}</td><td>${money(o.total_amount)}</td><td><span class="status">${statusVN(o.status)}</span></td><td><button class="btn btn-outline" onclick="staffOrderDetail(${o.id})">Chi tiết</button></td></tr>`).join("")}</tbody></table></div>`,
  );
}
async function staffOrderDetail(id) {
  const o = await api("/orders/" + id);
  showModal(
    `<div class="modal-head"><h3>Chi tiết ${o.order_code}</h3><button onclick="closeModal()">✕</button></div><p><b>Khách:</b> ${o.full_name} · ${o.phone || ""}</p>${o.items.map((x) => `<div class="summary-row"><span>${x.product_name} × ${x.quantity}</span><b>${money(x.line_total)}</b></div>`).join("")}<div class="total">${money(o.total_amount)}</div><div class="toolbar" style="margin-top:12px"><button class="btn btn-green" onclick="staffStatus(${id},'CONFIRMED')">Xác nhận</button><button class="btn btn-orange" onclick="staffStatus(${id},'PREPARING')">Đang chuẩn bị</button><button class="btn btn-green" onclick="staffStatus(${id},'READY')">Sẵn sàng nhận</button><button class="btn btn-green" onclick="staffStatus(${id},'COMPLETED')">Đã giao</button><button class="btn btn-red" onclick="rejectOrder(${id})">Từ chối</button></div>`,
  );
}
async function staffStatus(id, s) {
  try {
    await api("/staff/orders/" + id + "/status", {
      method: "PATCH",
      body: JSON.stringify({ status: s }),
    });
    closeModal();
    toast("Đã cập nhật trạng thái");
    adminPage("orders");
  } catch (e) {
    toast(e.message, false);
  }
}
function rejectOrder(id) {
  const r = prompt("Nhập lý do từ chối đơn:");
  if (r) staffStatusReason(id, r);
}
async function staffStatusReason(id, r) {
  await api("/staff/orders/" + id + "/status", {
    method: "PATCH",
    body: JSON.stringify({ status: "REJECTED", rejection_reason: r }),
  });
  closeModal();
  toast("Đã từ chối đơn");
  adminPage("orders");
}
async function adminUsers() {
  const us = await api("/admin/users");
  return adminShell(
    "users",
    "Người dùng & Tài khoản",
    `<div class="table-card"><table class="table"><thead><tr><th>Họ tên</th><th>Email</th><th>Loại</th><th>Vai trò</th><th>Trạng thái</th><th></th></tr></thead><tbody>${us.map((u) => `<tr><td>${u.full_name}</td><td>${u.email}</td><td>${u.customer_type || "-"}</td><td>${u.role}</td><td><span class="status ${u.status === "LOCKED" ? "danger" : ""}">${u.status}</span></td><td>${u.role !== "ADMIN" ? `<button class="btn btn-outline" onclick="toggleUser(${u.id},'${u.status === "ACTIVE" ? "LOCKED" : "ACTIVE"}')">${u.status === "ACTIVE" ? "Khóa" : "Mở khóa"}</button>` : ""}</td></tr>`).join("")}</tbody></table></div><button class="btn btn-green" style="margin-top:12px" onclick="newUser()">+ Tạo tài khoản</button>`,
  );
}
async function toggleUser(id, status) {
  await api("/admin/users/" + id + "/status", {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  toast("Đã cập nhật tài khoản");
  adminPage("users");
}
function newUser() {
  showModal(
    `<div class="modal-head"><h3>Tạo tài khoản</h3><button onclick="closeModal()">✕</button></div><div class="form-group"><label>Họ tên</label><input id="nu-name" class="form-control"></div><div class="form-group"><label>Email</label><input id="nu-email" class="form-control"></div><div class="form-group"><label>Vai trò</label><select id="nu-role" class="form-control"><option>CUSTOMER</option><option>STAFF</option><option>ADMIN</option></select></div><div class="form-group"><label>Mật khẩu</label><input id="nu-pass" class="form-control" value="123456"></div><button class="btn btn-green" onclick="saveNewUser()">Tạo</button>`,
  );
}
async function saveNewUser() {
  try {
    await api("/admin/users", {
      method: "POST",
      body: JSON.stringify({
        full_name: $("#nu-name").value,
        email: $("#nu-email").value,
        role: $("#nu-role").value,
        password: $("#nu-pass").value,
      }),
    });
    closeModal();
    toast("Đã tạo tài khoản");
    adminPage("users");
  } catch (e) {
    toast(e.message, false);
  }
}
async function adminInventory() {
  const it = await api("/admin/inventory");
  return adminShell(
    "inventory",
    "Quản lý kho & nguồn cung",
    `<div class="stats"><div class="stat"><small>Tổng mặt hàng</small><b>${it.length}</b></div><div class="stat"><small>Tổng tồn</small><b>${it.reduce((s, x) => s + x.quantity, 0)}</b></div><div class="stat"><small>Sắp hết</small><b>${it.filter((x) => x.quantity < 10).length}</b></div><div class="stat"><small>Hết hàng</small><b>${it.filter((x) => x.quantity === 0).length}</b></div></div><div class="table-card"><table class="table"><thead><tr><th>Món</th><th>Tồn kho</th><th>Đơn vị</th><th>Nguồn hàng</th><th>Hạn sử dụng</th><th></th></tr></thead><tbody>${it.map((x) => `<tr><td>${x.name}</td><td><b>${x.quantity}</b></td><td>${x.unit}</td><td>${x.supplier || "-"}</td><td>${x.expiry_date ? new Date(x.expiry_date).toLocaleDateString("vi-VN") : "-"}</td><td><button class="btn btn-outline" onclick='editInventory(${JSON.stringify(x)})'>Cập nhật</button></td></tr>`).join("")}</tbody></table></div>`,
  );
}
function editInventory(x) {
  showModal(
    `<div class="modal-head"><h3>Cập nhật tồn kho</h3><button onclick="closeModal()">✕</button></div><p><b>${x.name}</b></p><div class="form-group"><label>Số lượng</label><input id="iv-q" type="number" class="form-control" value="${x.quantity}"></div><div class="form-group"><label>Đơn vị</label><input id="iv-unit" class="form-control" value="${x.unit}"></div><div class="form-group"><label>Nguồn hàng</label><input id="iv-sup" class="form-control" value="${x.supplier || ""}"></div><div class="form-group"><label>Hạn sử dụng</label><input id="iv-exp" type="date" class="form-control" value="${x.expiry_date ? String(x.expiry_date).slice(0, 10) : ""}"></div><button class="btn btn-green" onclick="saveInventory(${x.id})">Lưu</button>`,
  );
}
async function saveInventory(id) {
  await api("/admin/inventory/" + id, {
    method: "PUT",
    body: JSON.stringify({
      quantity: Number($("#iv-q").value),
      unit: $("#iv-unit").value,
      supplier: $("#iv-sup").value,
      expiry_date: $("#iv-exp").value,
    }),
  });
  closeModal();
  toast("Đã cập nhật kho");
  adminPage("inventory");
}
async function adminReports() {
  const r = await api("/admin/reports");
  return adminShell(
    "reports",
    "Báo cáo & Thống kê",
    `<div class="stats"><div class="stat"><small>Doanh thu</small><b>${money(r.summary.revenue)}</b></div><div class="stat"><small>Tổng đơn</small><b>${r.summary.orders}</b></div><div class="stat"><small>Khách hàng</small><b>${r.summary.customers}</b></div><div class="stat"><small>Tồn kho</small><b>${r.stock.total_stock}</b></div></div><div class="panel" style="margin-top:16px"><b>Xu hướng doanh thu 7 ngày</b><div class="chart">${r.revenue.map((x) => `<div class="bar" style="height:${Math.max(15, (Number(x.revenue) / Math.max(1, ...r.revenue.map((y) => Number(y.revenue)))) * 160)}px"><span>${new Date(x.day).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}</span></div>`).join("")}</div></div><div class="table-card"><table class="table"><thead><tr><th>Top món bán chạy</th><th>Số lượng</th><th>Doanh thu</th></tr></thead><tbody>${r.best.map((x) => `<tr><td>${x.product_name}</td><td>${x.quantity}</td><td>${money(x.revenue)}</td></tr>`).join("")}</tbody></table></div>`,
  );
}
async function staff() {
  const os = await api("/staff/orders");
  return `<div class="admin-layout"><aside class="sidebar"><div class="side-brand"><div class="brand"><span class="brand-icon">🍴</span><span class="brand-text">CANTEEN <b style="color:#f56616">GO</b></span></div></div><div class="side-menu"><button class="active">🧾 <span class="label">Đơn hàng</span></button><button onclick="location.hash='#/profile'">👤 <span class="label">Tài khoản</span></button><button onclick="logout()">↪ <span class="label">Đăng xuất</span></button></div></aside><main class="admin-main"><div class="admin-head"><div><h1>Quản lý đơn hàng</h1><span class="hint">Xin chào ${state.user.full_name}</span></div></div><div class="stats"><div class="stat"><small>Chờ xử lý</small><b>${os.filter((x) => x.status === "PENDING").length}</b></div><div class="stat"><small>Đang chuẩn bị</small><b>${os.filter((x) => x.status === "PREPARING").length}</b></div><div class="stat"><small>Sẵn sàng nhận</small><b>${os.filter((x) => x.status === "READY").length}</b></div><div class="stat"><small>Đã hoàn tất</small><b>${os.filter((x) => x.status === "COMPLETED").length}</b></div></div><div class="table-card"><table class="table"><thead><tr><th>Mã đơn</th><th>Khách</th><th>Nhận món</th><th>Tổng</th><th>Trạng thái</th><th></th></tr></thead><tbody>${os.map((o) => `<tr><td><b>${o.order_code}</b></td><td>${o.full_name}</td><td>${o.pickup_time}</td><td>${money(o.total_amount)}</td><td><span class="status">${statusVN(o.status)}</span></td><td><button class="btn btn-green" onclick="staffOrderDetail(${o.id})">Xử lý</button></td></tr>`).join("")}</tbody></table></div></main></div>`;
}
function showModal(html) {
  let m = document.createElement("div");
  m.id = "modal";
  m.className = "modal-back";
  m.innerHTML = `<div class="modal">${html}</div>`;
  document.body.appendChild(m);
}
function closeModal() {
  $("#modal")?.remove();
}
async function render() {
  try {
    const h = location.hash.slice(1) || "/";
    let view;
    if (h === "/login") view = login();
    else if (h === "/register") view = register();
    else if (h === "/cart") view = await cart();
    else if (h === "/checkout") view = await checkout();
    else if (h.startsWith("/payment/")) view = await payment(h.split("/")[2]);
    else if (h === "/orders") view = await orders();
    else if (h === "/profile") view = await profile();
    else if (h === "/menu" || h.startsWith("/menu?")) view = await menu();
    else if (h === "/staff") {
      if (state.user?.role !== "STAFF") return (location.hash = "#/login");
      view = await staff();
    } else if (h === "/admin") {
      if (state.user?.role !== "ADMIN") return (location.hash = "#/login");
      view = await adminDashboard();
    } else view = home();
    $("#app").innerHTML = view;
    updateCartCount();
  } catch (e) {
    $("#app").innerHTML =
      `<div class="empty">Có lỗi: ${e.message}<br><a href="#/">Quay lại</a></div>`;
  }
}
window.addEventListener("hashchange", render);
window.addEventListener("load", async () => {
  try {
    await loadBase();
  } catch (e) {}
  render();
});


