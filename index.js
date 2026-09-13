/* =====================================================
   HÀM CHUNG: HIỆN / ẨN MẬT KHẨU
===================================================== */

function togglePassword(inputId, button) {

    const input = document.getElementById(inputId);

    if (!input) {
        return;
    }

    if (input.type === "password") {

        input.type = "text";

        button.textContent = "🙈";

    } else {

        input.type = "password";

        button.textContent = "👁";
    }
}


/* =====================================================
   XÁC ĐỊNH VAI TRÒ
===================================================== */

function getRoleFromEmail(email) {

    email = email.trim().toLowerCase();

    if (email.endsWith("@vwa.edu")) {

        return "Giảng viên";

    }

    if (email.endsWith("@hpn.edu")) {

        return "Sinh viên";

    }

    return null;
}


/* =====================================================
   HIỂN THỊ VAI TRÒ KHI NHẬP EMAIL
===================================================== */

function detectRole() {

    const emailInput =
        document.getElementById("registerEmail");

    const roleDisplay =
        document.getElementById("roleDisplay");

    const roleText =
        document.getElementById("roleText");

    const roleIcon =
        document.getElementById("roleIcon");

    if (
        !emailInput ||
        !roleDisplay ||
        !roleText ||
        !roleIcon
    ) {
        return;
    }


    const email = emailInput.value;

    const role = getRoleFromEmail(email);


    if (role === "Giảng viên") {

        roleDisplay.style.display = "flex";

        roleText.textContent = "Giảng viên";

        roleIcon.textContent = "👨‍🏫";

    }

    else if (role === "Sinh viên") {

        roleDisplay.style.display = "flex";

        roleText.textContent = "Sinh viên";

        roleIcon.textContent = "🎓";

    }

    else {

        roleDisplay.style.display = "none";
    }
}


/* =====================================================
   ĐĂNG KÝ
===================================================== */

function register() {

    const nameInput =
        document.getElementById("registerName");

    const emailInput =
        document.getElementById("registerEmail");

    const passwordInput =
        document.getElementById("registerPassword");

    const confirmInput =
        document.getElementById("confirmPassword");

    const termsInput =
        document.getElementById("agreeTerms");


    /* Nếu đang ở trang khác */
    if (!nameInput) {
        return;
    }


    const name = nameInput.value.trim();

    const email = emailInput.value.trim().toLowerCase();

    const password = passwordInput.value;

    const confirmPassword = confirmInput.value;

    const role = getRoleFromEmail(email);


    /* =========================
       XÓA LỖI CŨ
    ========================= */

    clearRegisterErrors();


    /* =========================
       KIỂM TRA HỌ TÊN
    ========================= */

    if (name === "") {

        showError(
            "registerNameError",
            "Vui lòng nhập họ và tên."
        );

        return;
    }


    /* =========================
       KIỂM TRA EMAIL
    ========================= */

    if (email === "") {

        showError(
            "registerEmailError",
            "Vui lòng nhập email trường."
        );

        return;
    }


    if (!role) {

        showError(
            "registerEmailError",
            "Email phải có đuôi @hpn.edu hoặc @vwa.edu."
        );

        return;
    }


    /* =========================
       KIỂM TRA MẬT KHẨU
    ========================= */

    if (password.length < 6) {

        showError(
            "registerPasswordError",
            "Mật khẩu phải có ít nhất 6 ký tự."
        );

        return;
    }


    /* =========================
       XÁC NHẬN MẬT KHẨU
    ========================= */

    if (password !== confirmPassword) {

        showError(
            "confirmPasswordError",
            "Mật khẩu xác nhận không khớp."
        );

        return;
    }


    /* =========================
       ĐIỀU KHOẢN
    ========================= */

    if (!termsInput.checked) {

        showMessage(
            "registerMessage",
            "Bạn cần đồng ý với điều khoản sử dụng.",
            "error"
        );

        return;
    }


    /* =========================
       TẠO USER
    ========================= */

    const users =
        JSON.parse(
            localStorage.getItem("canteenUsers")
        ) || [];


    /* Kiểm tra email đã tồn tại */

    const existed =
        users.some(
            user => user.email === email
        );


    if (existed) {

        showError(
            "registerEmailError",
            "Email này đã được đăng ký."
        );

        return;
    }


    /* =========================
       TẠO TÀI KHOẢN
    ========================= */

    const newUser = {

        name: name,

        email: email,

        password: password,

        role: role
    };


    users.push(newUser);


    localStorage.setItem(
        "canteenUsers",
        JSON.stringify(users)
    );


    /* =========================
       THÔNG BÁO
    ========================= */

    showMessage(
        "registerMessage",
        "Đăng ký thành công! Đang chuyển đến trang đăng nhập...",
        "success"
    );


    setTimeout(function () {

        window.location.href = "index.html";

    }, 1500);
}


/* =====================================================
   ĐĂNG NHẬP
===================================================== */

function login() {

    const emailInput =
        document.getElementById("loginEmail");

    const passwordInput =
        document.getElementById("loginPassword");


    if (!emailInput) {
        return;
    }


    const email =
        emailInput.value.trim().toLowerCase();

    const password =
        passwordInput.value;


    /* Xóa lỗi */

    clearLoginErrors();


    /* =========================
       EMAIL
    ========================= */

    if (email === "") {

        showError(
            "loginEmailError",
            "Vui lòng nhập email."
        );

        return;
    }


    /* =========================
       KIỂM TRA DOMAIN
    ========================= */

    const role = getRoleFromEmail(email);


    if (!role) {

        showError(
            "loginEmailError",
            "Email phải thuộc @hpn.edu hoặc @vwa.edu."
        );

        return;
    }


    /* =========================
       MẬT KHẨU
    ========================= */

    if (password === "") {

        showError(
            "loginPasswordError",
            "Vui lòng nhập mật khẩu."
        );

        return;
    }


    /* =========================
       TÌM USER
    ========================= */

    const users =
        JSON.parse(
            localStorage.getItem("canteenUsers")
        ) || [];


    const user =
        users.find(
            item =>
                item.email === email &&
                item.password === password
        );


    /* =========================
       ĐĂNG NHẬP THÀNH CÔNG
    ========================= */

    if (user) {

        localStorage.setItem(
            "currentUser",
            JSON.stringify(user)
        );


        showMessage(
            "loginMessage",
            "Đăng nhập thành công!",
            "success"
        );


        /*
         * Sau này thay bằng:
         *
         * window.location.href =
         * "dashboard.html";
         */

        setTimeout(function () {

            if (user.role === "Giảng viên") {

                window.location.href =
                    "teacher.html";

            } else {

                window.location.href =
                    "student.html";
            }

        }, 1000);


    } else {

        showMessage(
            "loginMessage",
            "Email hoặc mật khẩu không chính xác.",
            "error"
        );
    }
}


/* =====================================================
   HIỂN THỊ LỖI
===================================================== */

function showError(elementId, message) {

    const element =
        document.getElementById(elementId);

    if (!element) {
        return;
    }

    element.textContent = message;
}


/* =====================================================
   HIỂN THỊ MESSAGE
===================================================== */

function showMessage(
    elementId,
    message,
    type
) {

    const element =
        document.getElementById(elementId);

    if (!element) {
        return;
    }

    element.textContent = message;

    if (type === "success") {

        element.style.color = "#16a34a";

    } else {

        element.style.color = "#dc2626";
    }
}


/* =====================================================
   XÓA LỖI ĐĂNG KÝ
===================================================== */

function clearRegisterErrors() {

    const ids = [

        "registerNameError",
        "registerEmailError",
        "registerPasswordError",
        "confirmPasswordError"
    ];


    ids.forEach(function (id) {

        const element =
            document.getElementById(id);

        if (element) {

            element.textContent = "";
        }
    });


    const message =
        document.getElementById("registerMessage");

    if (message) {

        message.textContent = "";
    }
}


/* =====================================================
   XÓA LỖI ĐĂNG NHẬP
===================================================== */

function clearLoginErrors() {

    const ids = [

        "loginEmailError",
        "loginPasswordError"
    ];


    ids.forEach(function (id) {

        const element =
            document.getElementById(id);

        if (element) {

            element.textContent = "";
        }
    });


    const message =
        document.getElementById("loginMessage");

    if (message) {

        message.textContent = "";
    }
}


/* =====================================================
   QUÊN MẬT KHẨU
===================================================== */

function forgotPassword() {

    alert(
        "Chức năng quên mật khẩu sẽ được phát triển ở phiên bản tiếp theo."
    );
}