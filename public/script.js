// public/script.js  (drop-in)

// Grab existing elements by ID (gagamit ng kung alin ang meron)
const fileInput       = document.getElementById('imageInput');
const analyzeBtn      = document.getElementById('analyzeImageBtn');
const videoEl         = document.getElementById('videoPreview') || document.getElementById('video');
const imageEl         = document.getElementById('imagePreview');   // <img> preview kung meron
const startCamBtn     = document.getElementById('startCameraBtn');
const captureBtn      = document.getElementById('captureBtn');
const resultImg       = document.getElementById('result') || document.getElementById('annotatedImage');
const resultList      = document.getElementById('resultList') || document.getElementById('resultsSection');

const hiddenCanvas = document.createElement('canvas');

// ---------- helpers ----------
async function postToDetectFromBlob(blob) {
  const fd = new FormData();
  fd.append('image', blob, 'frame.jpg');  // <-- field name MUST be 'image'
  const res = await fetch('/api/detect', { method: 'POST', body: fd });

  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} ${text}`);

  let data;
  try { data = JSON.parse(text); } catch { throw new Error(text); }

  if (data.error) throw new Error(data.error);
  renderResults(data);
  return data;
}

function renderResults(data) {
  if (resultImg && data.image) {
    resultImg.src = `data:image/jpeg;base64,${data.image}`;
    resultImg.style.display = 'block';
  }
  if (resultList) {
    const dets = data.detections || [];
    resultList.innerHTML = dets.length
      ? dets.map(d => `<li>${d.label} — ${(d.conf * 100).toFixed(1)}%</li>`).join('')
      : '<li>No detections</li>';
  }
}

async function dataURLtoBlob(dataURL) {
  const r = await fetch(dataURL);
  return await r.blob();
}

// ---------- Upload flow ----------
if (fileInput) {
  fileInput.addEventListener('change', async () => {
    const f = fileInput.files?.[0];
    if (!f) return;
    // show preview kung may imageEl
    if (imageEl) imageEl.src = URL.createObjectURL(f);
    try { await postToDetectFromBlob(f); }
    catch (e) { alert('Failed to analyze image.\n' + (e.message || e)); }
  });
}

// ---------- Camera start ----------
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoEl) videoEl.srcObject = stream;
  } catch (e) {
    alert('Cannot access camera.\n' + (e.message || e));
  }
}
if (startCamBtn) startCamBtn.addEventListener('click', startCamera);
if (videoEl && !startCamBtn) startCamera(); // auto start if no button

// ---------- Capture from camera ----------
if (captureBtn && videoEl) {
  captureBtn.addEventListener('click', async () => {
    if (!videoEl.videoWidth) return alert('Camera not ready yet.');
    hiddenCanvas.width = videoEl.videoWidth;
    hiddenCanvas.height = videoEl.videoHeight;
    hiddenCanvas.getContext('2d').drawImage(videoEl, 0, 0);
    const blob = await new Promise(r => hiddenCanvas.toBlob(r, 'image/jpeg', 0.92));
    if (imageEl) imageEl.src = hiddenCanvas.toDataURL('image/jpeg', 0.92); // show preview
    try { await postToDetectFromBlob(blob); }
    catch (e) { alert('Failed to analyze image.\n' + (e.message || e)); }
  });
}

// ---------- Explicit Analyze button ----------
if (analyzeBtn) {
  analyzeBtn.addEventListener('click', async () => {
    try {
      // 1) prefer file input
      if (fileInput?.files?.[0]) {
        await postToDetectFromBlob(fileInput.files[0]);
        return;
      }
      // 2) else use preview image (dataURL) if available
      if (imageEl?.src?.startsWith('data:')) {
        const blob = await dataURLtoBlob(imageEl.src);
        await postToDetectFromBlob(blob);
        return;
      }
      // 3) else capture current video frame
      if (videoEl?.videoWidth) {
        hiddenCanvas.width = videoEl.videoWidth;
        hiddenCanvas.height = videoEl.videoHeight;
        hiddenCanvas.getContext('2d').drawImage(videoEl, 0, 0);
        const blob = await new Promise(r => hiddenCanvas.toBlob(r, 'image/jpeg', 0.92));
        await postToDetectFromBlob(blob);
        return;
      }
      alert('No image to analyze. Upload a photo or start the camera.');
    } catch (e) {
      alert('Failed to analyze image.\n' + (e.message || e));
    }
  });
}
