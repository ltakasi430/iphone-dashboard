/* Separate ES5 photo-background module for Safari on iOS 10. */
(function () {
  "use strict";
  var PHOTO_KEY = "pocket-desk-background-v1";
  var OPTS_KEY = "pocket-desk-background-options-v1";
  var photo = "";
  var appliedPhoto = null;
  var options = { brightness: 70, blur: 0, position: "center", framing: "iris" };
  function el(id) { return document.getElementById(id); }
  function clamp(value, min, max, fallback) {
    var n = Number(value);
    return isFinite(n) && n >= min && n <= max ? n : fallback;
  }
  function status(message, error) {
    el("backgroundStatus").textContent = message;
    el("backgroundStatus").className = error ? "background-status error" : "background-status";
  }
  function read() {
    try {
      var stored = window.localStorage.getItem(PHOTO_KEY);
      if (stored && stored.indexOf("data:image/jpeg;base64,") === 0 && stored.length < 1200000) { photo = stored; }
      var saved = JSON.parse(window.localStorage.getItem(OPTS_KEY) || "null");
      if (saved && typeof saved === "object") {
        options.brightness = clamp(saved.brightness, 10, 100, 70);
        options.blur = clamp(saved.blur, 0, 16, 0);
        if (saved.framing === "iris" || saved.framing === "normal") { options.framing = saved.framing; }
        if (saved.position === "top" || saved.position === "center" || saved.position === "bottom") {
          options.position = saved.position;
        }
      }
    } catch (e) { /* Storage may be unavailable in private browsing. */ }
  }
  function saveOptions() {
    try { window.localStorage.setItem(OPTS_KEY, JSON.stringify(options)); }
    catch (e) { status("このブラウザでは設定を保存できません。", true); }
  }
  function updateControls() {
    el("backgroundBrightness").value = options.brightness;
    el("backgroundBlur").value = options.blur;
    el("backgroundPosition").value = options.position;
    el("backgroundFraming").value = options.framing;
    el("backgroundPosition").disabled = options.framing === "iris";
    el("backgroundBrightnessValue").textContent = options.brightness + "%";
    el("backgroundBlurValue").textContent = options.blur + "px";
  }
  function paint() {
    var art = el("backgroundArt");
    var veil = el("backgroundVeil");
    var preview = el("backgroundPreview");
    if (photo) {
      if (appliedPhoto !== photo) {
        var url = 'url("' + photo + '")';
        art.style.backgroundImage = url;
        preview.style.backgroundImage = url;
        appliedPhoto = photo;
      }
      document.documentElement.classList.add("photo-active");
      art.style.display = "block";
      veil.style.display = "block";
      preview.textContent = "";
      if (options.framing === "iris") {
        /* Crop/zoom to keep Iris on the right of the narrow calendar. */
        art.style.backgroundSize = "auto 120%";
        art.style.backgroundPosition = "center top";
      } else {
        art.style.backgroundSize = "cover";
        art.style.backgroundPosition = "center " + options.position;
      }
      art.style.webkitFilter = "blur(" + options.blur + "px)";
      art.style.filter = "blur(" + options.blur + "px)";
      veil.style.backgroundColor = "rgba(0,0,0," + ((100 - options.brightness) / 100) + ")";
    } else {
      document.documentElement.classList.remove("photo-active");
      art.style.display = "none";
      veil.style.display = "none";
      art.style.backgroundImage = "";
      preview.style.backgroundImage = "";
      preview.textContent = "背景未設定";
      appliedPhoto = null;
    }
    el("removeBackground").disabled = !photo;
    updateControls();
  }
  function chooseBackground(file) {
    el("backgroundFile").value = "";
    if (!file) { return; }
    if (file.type && file.type.indexOf("image/") !== 0) { status("画像ファイルを選んでください。", true); return; }
    if (file.size && file.size > 12 * 1024 * 1024) { status("12MB以下の画像を選んでください。", true); return; }
    if (!window.FileReader) { status("このブラウザでは画像を読み込めません。", true); return; }
    status("画像を軽量化しています…", false);
    var reader = new FileReader();
    reader.onerror = function () { status("画像を読み込めませんでした。", true); };
    reader.onload = function () {
      var picture = new Image();
      picture.onerror = function () { status("JPEGまたはPNG画像で試してください。", true); };
      picture.onload = function () {
        try {
          var width = picture.naturalWidth || picture.width;
          var height = picture.naturalHeight || picture.height;
          if (!width || !height) { throw new Error("invalid image dimensions"); }
          var scale = Math.min(1, 1000 / Math.max(width, height));
          var canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(width * scale));
          canvas.height = Math.max(1, Math.round(height * scale));
          var context = canvas.getContext("2d");
          if (!context) { throw new Error("canvas unavailable"); }
          context.fillStyle = "#091420";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(picture, 0, 0, canvas.width, canvas.height);
          var jpeg = canvas.toDataURL("image/jpeg", 0.74);
          if (jpeg.length > 650000) { jpeg = canvas.toDataURL("image/jpeg", 0.55); }
          if (jpeg.length > 650000) { jpeg = canvas.toDataURL("image/jpeg", 0.38); }
          if (jpeg.length > 1000000 || jpeg.indexOf("data:image/jpeg;base64,") !== 0) {
            throw new Error("image size not supported");
          }
          /* Persist first; keep the prior background unchanged if quota is exceeded. */
          try { window.localStorage.setItem(PHOTO_KEY, jpeg); }
          catch (storageError) {
            status("画像を保存できません。小さめの写真を選ぶか、Safariの保存容量を確認してください。", true);
            return;
          }
          photo = jpeg;
          paint();
          status("背景画像を保存しました。次の起動でも表示されます。", false);
        } catch (e) {
          status("画像を処理できませんでした。別のJPEG・PNG画像を試してください。", true);
        }
      };
      picture.src = reader.result;
    };
    try { reader.readAsDataURL(file); }
    catch (e) { status("画像を読み込めませんでした。", true); }
  }
  function removePhoto() {
    try { window.localStorage.removeItem(PHOTO_KEY); }
    catch (e) { status("背景画像を削除できませんでした。", true); return false; }
    photo = "";
    el("backgroundFile").value = "";
    paint();
    status("背景画像を削除しました。", false);
    return true;
  }
  function init() {
    read();
    paint();
    el("backgroundFile").addEventListener("change", function () {
      chooseBackground(this.files && this.files[0]);
    }, false);
    el("backgroundBrightness").addEventListener("input", function () {
      options.brightness = clamp(this.value, 10, 100, 70);
      saveOptions(); paint();
    }, false);
    el("backgroundBlur").addEventListener("input", function () {
      options.blur = clamp(this.value, 0, 16, 0);
      saveOptions(); paint();
    }, false);
    el("backgroundFraming").addEventListener("change", function () {
      options.framing = this.value === "normal" ? "normal" : "iris";
      saveOptions(); paint();
    }, false);
    el("backgroundPosition").addEventListener("change", function () {
      options.position = this.value;
      saveOptions(); paint();
    }, false);
    el("removeBackground").addEventListener("click", removePhoto, false);
    el("resetSettings").addEventListener("click", function () {
      if (!removePhoto()) { return; }
      options = { brightness: 70, blur: 0, position: "center", framing: "iris" };
      saveOptions(); paint();
    }, false);
  }
  init();
}());
