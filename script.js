// Получаем элементы DOM
const openModalBtn = document.getElementById('openModal');
const resizeDialog = document.getElementById('resizeDialog');
const showDialogBtn = document.getElementById('showDialog');
const deleteBtn = document.getElementById('deleteBtn');
const modal = document.getElementById('modal');
const closeModalBtns = document.getElementsByClassName('close');
const submitBtn = document.getElementById('submitBtn');
const uploadFile = document.getElementById('uploadFile');
const inputUrl = document.getElementById('inputUrl');
const canvas = document.getElementById('imageCanvas');
const colorInfo = document.getElementById('colorInfo');
const colorCircle = document.getElementById('colorCircle');
const sizeInfo = document.getElementById('sizeInfo');
const coordsInfo = document.getElementById('coordsInfo');
const footer = document.getElementById('footer');
const canvasWrapper = document.getElementById('canvasWrapper');
const imageCanvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const zoomSlider = document.getElementById('zoomSlider');
const originalSize = document.getElementById('originalSize');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');

let image = new Image(); // Инициализируем переменную image

// Обработчики событий
openModalBtn.addEventListener('click', () => {
  modal.style.display = 'block';
});

Array.from(closeModalBtns).forEach(btn => {
  btn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
});

window.addEventListener('click', event => {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
});

// Обработчики событий для изменения изображения
showDialogBtn.addEventListener('click', () => {
  resizeDialog.showModal();
});

document.querySelector('#resizeDialog .close').addEventListener('click', () => {
  resizeDialog.close();
});

const handleModalClick = ({ currentTarget, target }) => {
  const isClickedOnBackdrop = target === currentTarget;

  if (isClickedOnBackdrop) {
    currentTarget.close();
  }
}

resizeDialog.addEventListener("click", handleModalClick);

submitBtn.addEventListener('click', () => {
  const imgInfo = {
    imgUrl: inputUrl.value,
    file: uploadFile.files[0],
  };
  if (imgInfo.imgUrl) {
    loadImageFromUrl(imgInfo.imgUrl);
  } else if (imgInfo.file) {
    loadImageFromFile(imgInfo.file);
  }
  modal.style.display = 'none';
  uploadFile.value = '';
  inputUrl.value = '';
});

canvas.addEventListener('mousemove', showInfo);

zoomSlider.addEventListener('input', () => {
  const scale = zoomSlider.value / 100;
  setCanvasSize(image.width * scale, image.height * scale);
  drawImage(image);
});

// Функции
function loadImageFromUrl(imgUrl) {
  image.onload = () => {
    setCanvasSize(image.width, image.height);
    showSize(image.width, image.height);
    originalSize.textContent = `${image.width}px x ${image.height}px`;
    widthInput.value = image.width;
    heightInput.value = image.height;
    zoomSlider.value = 100; // Установка начального значения ползунка при загрузке изображения
    drawImage(image);
  };

  image.onerror = () => {
    alert('Ошибка загрузки изображения');
  };

  image.crossOrigin = 'Anonymous';
  image.src = imgUrl;
}

function loadImageFromFile(file) {
  const reader = new FileReader();

  reader.onload = event => {
    image.onload = () => {
      setCanvasSize(image.width, image.height);
      drawImage(image);
      showSize(image.width, image.height);
      originalSize.textContent = `${image.width}px x ${image.height}px`;
      widthInput.value = image.width;
      heightInput.value = image.height;
      zoomSlider.value = 100; // Установка начального значения ползунка при загрузке изображения
      drawImage(image);
    };

    image.onerror = () => {
      alert('Ошибка загрузки изображения');
    };


    image.crossOrigin = 'Anonymous'
    image.src = event.target.result;
  };

  reader.readAsDataURL(file);
}

function setCanvasSize(width, height) {
  const scale = zoomSlider.value / 100;
  canvas.width = width * scale;
  canvas.height = height * scale;
}

function drawImage(image) {
  const scale = zoomSlider.value / 100; // Получение текущего значения ползунка
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Очистка холста перед отрисовкой
  ctx.drawImage(image, 0, 0, canvas.width * scale, canvas.height * scale);
}

function showSize(width, height) {
  sizeInfo.textContent = `${width}px x ${height}px`;
}

function showInfo(event) {
  const ctx = canvas.getContext('2d');
  const pixelData = ctx.getImageData(event.offsetX, event.offsetY, 1, 1).data;
  const rgb = `${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}`;

  colorInfo.textContent = rgb;
  colorCircle.style.background = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
  coordsInfo.textContent = `X: ${event.offsetX}px, Y: ${event.offsetY}px`;
}

// Функция для обновления размера изображения
function updateImageSize() {
  let width = parseInt(widthInput.value);
  let height = parseInt(heightInput.value);
  let scale = zoomSlider.value / 100;

  if (document.getElementById('unitsSelect').value === 'px') {
    if (width && height) {
      if (document.getElementById('lockAspectRatio').checked) {
        const aspectRatio = image.width / image.height;
        if (width / height > aspectRatio) {
          height = Math.ceil(width / aspectRatio);
        } else {
          width = Math.ceil(height * aspectRatio);
        }
      }
      image.width = width;
      image.height = height;
      setCanvasSize(width * scale, height * scale);
      drawImage(image);
      showSize(width, height);
      document.getElementById('newSize').textContent = `${width}px x ${height}px`;
    }
  } else if (document.getElementById('unitsSelect').value === '%') {
    if (width && height && image.width && image.height) {
      if (document.getElementById('lockAspectRatio').checked) {
        const aspectRatio = image.width / image.height;
        if (width / height > aspectRatio) {
          height = Math.ceil(width / aspectRatio);
        } else {
          width = Math.ceil(height * aspectRatio);
        }
      }
      width = Math.ceil(image.width * (width / 100));
      height = Math.ceil(image.height * (height / 100));
      image.width = width;
      image.height = height;
      setCanvasSize(width * scale, height * scale);
      drawImage(image);
      showSize(width, height);
      document.getElementById('newSize').textContent = `${width}px x ${height}px`;
    }
  }
}

// Обработчик события для кнопки "Отобразить"
document.getElementById('showButton').addEventListener('click', () => {
  updateImageSize();
  resizeDialog.close();
});

// Обработчик события для чекбокса "Заблокировать пропорции"
document.getElementById('lockAspectRatio').addEventListener('change', () => {
  const lockAspectRatio = document.getElementById('lockAspectRatio');
  widthInput.disabled = lockAspectRatio.checked;
  heightInput.disabled = lockAspectRatio.checked;

  if (lockAspectRatio.checked) {
    const aspectRatio = image.width / image.height;
    if (widthInput.value !== '') {
      heightInput.value = Math.ceil(parseInt(widthInput.value) / aspectRatio);
    } else if (heightInput.value !== '') {
      widthInput.value = Math.ceil(parseInt(heightInput.value) * aspectRatio);
    }
  }
});

// Обработчик события для кнопки "Сохранить"
document.getElementById('saveButton').addEventListener('click', () => {
  const canvasDataUrl = canvas.toDataURL(); // Получение Base64-представления изображения
  const link = document.createElement('a');
  link.href = canvasDataUrl;
  link.download = 'image.png'; // Название файла, который будет сохранен
  link.click();
});