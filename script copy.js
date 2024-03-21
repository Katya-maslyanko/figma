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
const ctx = imageCanvas.getContext('2d', { willReadFrequently: true });
const zoomSlider = document.getElementById('zoomSlider');
const originalSize = document.getElementById('originalSize');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const displayOptionSelect = document.getElementById('displayOptionSelect');

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
  widthInput.value = image.width;
  heightInput.value = image.height;
  zoomSlider.value = 100;
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

//Устанавливает размер холста путем изменения его ширины и высоты
function setCanvasSize(width, height) {
  // const scale = zoomSlider.value / 100;
  canvas.width = width;
  canvas.height = height;
  showSize(width, height);
}

//Рисует изображение на холсте
function drawImage(image) {
  const scale = zoomSlider.value / 100;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;
  const offsetX = (canvas.width - scaledWidth) / 2;
  const offsetY = (canvas.height - scaledHeight) / 2;

  ctx.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);
}

//Отображает информацию о размере изображения на странице
function showSize(width, height) {
  const roundedWidth = width.toFixed(1);
  const roundedHeight = height.toFixed(1);
  sizeInfo.textContent = `${roundedWidth}px x ${roundedHeight}px`;
}

//Отображает информацию о выбранном пикселе изображения на холсте
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

// Обработчик события для кнопки "Показать"
document.getElementById('showButton').addEventListener('click', () => {
  const selectedOption = displayOptionSelect.value;
  const width = parseInt(widthInput.value);
  const height = parseInt(heightInput.value);

  if (width && height) {
    updateImageSize();
  }

  resizeDialog.close();
});

function nearestNeighborScaling(newWidth, newHeight) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = newWidth;
  canvas.height = newHeight;
  for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
          const srcX = Math.round(x * (this.imageWidth / newWidth));
          const srcY = Math.round(y * (this.imageHeight / newHeight));
          const pixel = this.getPixel(srcX, srcY);
          ctx.fillStyle = `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`;
          ctx.fillRect(x, y, 1, 1);
      }
  }
  let start_image = canvas.toDataURL('image/jpeg');
  localStorage.setItem("start_image", start_image);
}

function getPixel(x, y) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 1;
  canvas.height = 1;
  ctx.drawImage(this.image, x, y, 1, 1, 0, 0, 1, 1);
  const data = ctx.getImageData(0, 0, 1, 1).data;
  return { r: data[0], g: data[1], b: data[2] };
}

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