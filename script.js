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
const toolButtons = document.querySelectorAll('.toolButton');

const infoPanel = document.getElementById('info-panel');
const closeInfoPanelBtn = document.querySelector('#info-panel .close');
const colorBlock1 = document.querySelector('.color-block-1');
const colorBlock2 = document.querySelector('.color-block-2');

let image = new Image(); // Инициализируем переменную image
let canvasHeight = 0;
let canvasWidth = 0;

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
  const roundedWidth = Math.round(width);
  const roundedHeight = Math.round(height);
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

let newWidth, newHeight;

// Обработчик события для чекбокса "Заблокировать пропорции"
document.getElementById('lockAspectRatio').addEventListener('change', () => {
  const lockAspectRatio = document.getElementById('lockAspectRatio').checked;
  const unitsSelect = document.getElementById('unitsSelect');
  const widthInput = document.getElementById('widthInput');
  const heightInput = document.getElementById('heightInput');

  if (lockAspectRatio) {
    heightInput.disabled = true;
    if (unitsSelect.value === 'px') {
      if (widthInput.value !== '') {
        newWidth = parseInt(widthInput.value);
        newHeight = Math.ceil(newWidth * (image.naturalHeight / image.naturalWidth));
        heightInput.value = newHeight;
      }
    } else if (unitsSelect.value === '%') {
      // При выборе процентов и нажатии на блокировку пропорций, ширина и высота становятся равными
      widthInput.value = heightInput.value = Math.round(Math.max(parseInt(widthInput.value), parseInt(heightInput.value)));
    }
  } else {
    heightInput.disabled = false;
  }
});

// Функция для обновления размера изображения
function updateImageSize() {
  let scale = zoomSlider.value / 100;
  const originalAspectRatio = image.naturalWidth / image.naturalHeight;
  const lockAspectRatio = document.getElementById('lockAspectRatio').checked;
  const unitsSelect = document.getElementById('unitsSelect');

  if (unitsSelect.value === 'px') {
    if (newWidth && newHeight) {
      if (lockAspectRatio) {
        newHeight = Math.ceil(newWidth / originalAspectRatio);
      }
      image.width = newWidth;
      image.height = newHeight;
      setCanvasSize(newWidth * scale, newHeight * scale);
      drawImage(image);
      showSize(newWidth, newHeight);
      document.getElementById('newSize').textContent = `${newWidth}px x ${newHeight}px`;
    }
  } else if (unitsSelect.value === '%') {
    if (newWidth && newHeight) {
      if (lockAspectRatio) {
        newHeight = newWidth; // При заблокированных пропорциях и выборе процентов, высота равна ширине
      }
      newWidth = Math.ceil(image.naturalWidth * (newWidth / 100));
      newHeight = Math.ceil(image.naturalHeight * (newHeight / 100));
      image.width = newWidth;
      image.height = newHeight;
      setCanvasSize(newWidth * scale, newHeight * scale);
      drawImage(image);
      showSize(newWidth, newHeight);
      document.getElementById('newSize').textContent = `${Math.round(newWidth / image.naturalWidth * 100)}% x ${Math.round(newHeight / image.naturalHeight * 100)}%`;
    }
  }
}

// Функция для преобразования пикселей в проценты
function pixelsToPercent(pixels, originalSize) {
  return Math.round((pixels / originalSize) * 100);
}

// Обработчик события изменения выбора единиц измерения
document.getElementById('unitsSelect').addEventListener('change', () => {
  const unitsSelect = document.getElementById('unitsSelect');
  const widthInput = document.getElementById('widthInput');
  const heightInput = document.getElementById('heightInput');

  if (unitsSelect.value === 'px') {
    widthInput.value = image.naturalWidth;
    heightInput.value = image.naturalHeight;
  } else if (unitsSelect.value === '%') {
    widthInput.value = pixelsToPercent(image.naturalWidth, image.naturalWidth);
    heightInput.value = pixelsToPercent(image.naturalHeight, image.naturalHeight);
  }
});

// Обработчик события для кнопки "Показать"
document.getElementById('showButton').addEventListener('click', () => {
  const selectedOption = displayOptionSelect.value;
  const width = parseInt(widthInput.value);
  const height = parseInt(heightInput.value);

  if (width && height) {
    updateImageSize();
  }

  if (selectedOption === 'nearestNeighbor') {
    resizeImageNearestNeighbor(width,height);
  } 

  resizeDialog.close();
});

function resizeImageNearestNeighbor(width,height) {
  console.log("Its alive!")
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  stCanv = document.getElementById("imageCanvas");
  imageWidth = stCanv.width;
  imageHeight = stCanv.height;
  for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
          console.log("AAAAAAA")
          const srcX = Math.round(x * (imageWidth / width)); //flor
          const srcY = Math.round(y * (imageHeight / height));
          const pixel = this.getPixel(srcX, srcY);
          ctx.fillStyle = `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`;
          ctx.fillRect(x, y, 1, 1);
      }
  }

  // // Обновляем холст с измененным изображением
  // // setCanvasSize(width, height);
  // ctx.drawImage(canvas, 0, 0, width, height);

}

function getPixel(x, y) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 1;
  canvas.height = 1;
  ctx.drawImage(image, x, y, 1, 1, 0, 0, 1, 1);
  const data = ctx.getImageData(0, 0, 1, 1).data;
  return { r: data[0], g: data[1], b: data[2] };
}


// Обработчик события для поля ввода ширины
widthInput.addEventListener('input', () => {
  newWidth = parseInt(widthInput.value);
  const lockAspectRatio = document.getElementById('lockAspectRatio').checked;
  const originalAspectRatio = image.naturalWidth / image.naturalHeight;

  if (lockAspectRatio) {
    newHeight = Math.ceil(newWidth * (image.naturalHeight / image.naturalWidth));
    heightInput.value = newHeight;
  }
});

// Обработчик события для поля ввода ширины
widthInput.addEventListener('input', () => {
  newWidth = parseInt(widthInput.value);
  const lockAspectRatio = document.getElementById('lockAspectRatio').checked;
  const originalAspectRatio = image.naturalWidth / image.naturalHeight;
  const unitsSelect = document.getElementById('unitsSelect');

  if (lockAspectRatio) {
    if (unitsSelect.value === 'px') {
      newHeight = Math.ceil(newWidth / originalAspectRatio);
      heightInput.value = newHeight;
    } else if (unitsSelect.value === '%') {
      newHeight = newWidth;
      heightInput.value = newHeight;
    }
  }
});

// По процентам lockAspectRatio

// Обработчик события для кнопки "Сохранить"
document.getElementById('saveButton').addEventListener('click', () => {
  const canvasDataUrl = canvas.toDataURL(); // Получение Base64-представления изображения
  const link = document.createElement('a');
  link.href = canvasDataUrl;
  link.download = 'image.png'; // Название файла, который будет сохранен
  link.click();
});

// Функция для переключения активного инструмента по клику
function toggleTool() {
  if (!this.classList.contains('active')) {
    toolButtons.forEach(button => button.classList.remove('active'));
    this.classList.add('active');
    if (this.id === 'pipetteToolButton') {
      infoPanel.style.display = 'block';
    } else {
      infoPanel.style.display = 'none';
    }
  }
}

// Добавляем обработчики событий для кнопок инструментов
toolButtons.forEach(button => button.addEventListener('click', toggleTool));

// Добавляем обработчик события для активации инструментов с помощью горячих клавиш
window.addEventListener('keydown', event => {
  if (event.key === 'h') { // Если нажата клавиша 'R'
    toolButtons.forEach(button => {
      if (button.id === 'handToolButton') {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  } else if (event.key === 'p') { // Если нажата клавиша 'P'
    toolButtons.forEach(button => {
      if (button.id === 'pipetteToolButton') {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }
});

// Обработчик события click для кнопки закрытия информационной панели
closeInfoPanelBtn.addEventListener('click', () => {
  infoPanel.style.display = 'none';
});


// Обработчик события для кнопки "Пипетка" (продолжение)
pipetteToolButton.addEventListener('click', () => {
  // Переключаем активный инструмент
  toolButtons.forEach(button => {
    if (button.id === 'pipetteToolButton') {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });

  // Отображаем информационную панель
  infoPanel.style.display = 'block';
});

let previousPixelData; // Переменная для хранения предыдущих данных пикселя

canvas.addEventListener('click', event => {
  const ctx = canvas.getContext('2d');
  const pixelData = ctx.getImageData(event.offsetX, event.offsetY, 1, 1).data;
  const rgb = [pixelData[0], pixelData[1], pixelData[2]];

  const xyz = rgbToXyz(pixelData[0], pixelData[1], pixelData[2]);
  const lab = xyzToLab(xyz.X, xyz.Y, xyz.Z);

  if (!event.shiftKey) {
    // Код для обработки обычного клика
    // Сохраняем значения pixelData
    previousPixelData = pixelData;

    colorBlock1.style.backgroundColor = `rgb(${rgb.join(',')})`;
    // document.getElementById('rgb-value').textContent = `${pixelData[0]} ${pixelData[1]} ${pixelData[2]}`;
    document.getElementById('rgb-value-r').textContent = `${pixelData[0]}`;
    document.getElementById('rgb-value-g').textContent = `${pixelData[1]}`;
    document.getElementById('rgb-value-b').textContent = `${pixelData[2]}`;

    // document.getElementById('xyz-value').textContent = `${xyz.X.toFixed(2)} ${xyz.Y.toFixed(2)} ${xyz.Z.toFixed(2)}`;

    document.getElementById('xyz-value-x').textContent = `${xyz.X.toFixed(2)}`;
    document.getElementById('xyz-value-y').textContent = `${xyz.Y.toFixed(2)}`;
    document.getElementById('xyz-value-z').textContent = `${xyz.Z.toFixed(2)}`;

    // document.getElementById('lab-value').textContent = `${lab.L.toFixed(2)} ${lab.a.toFixed(2)} ${lab.b.toFixed(2)}`;

    document.getElementById('lab-value-l').textContent = `${lab.L.toFixed(2)}`;
    document.getElementById('lab-value-a').textContent = `${lab.a.toFixed(2)}`;
    document.getElementById('lab-value-b').textContent = `${lab.b.toFixed(2)}`;

    document.getElementById('x-coord-1').textContent = event.offsetX;
    document.getElementById('y-coord-1').textContent = event.offsetY;
  } else {
    // Код для обработки клика с зажатой клавишей Shift
    if (!previousPixelData) {
      // Если предыдущие данные пикселя не существуют, выходим из функции
      return;
    }

    const rgb1 = [previousPixelData[0], previousPixelData[1], previousPixelData[2]]; // Используем предыдущие данные для первого цвета
    const rgb2 = rgb; // Используем текущие данные для второго цвета

    const xyz1 = rgbToXyz(rgb1[0], rgb1[1], rgb1[2]);
    const xyz2 = rgbToXyz(rgb2[0], rgb2[1], rgb2[2]);
    const lab1 = xyzToLab(xyz1.X, xyz1.Y, xyz1.Z);
    const lab2 = xyzToLab(xyz2.X, xyz2.Y, xyz2.Z);

    colorBlock2.style.backgroundColor = `rgb(${rgb2.join(',')})`;

    // document.getElementById('rgb-value-2').textContent = `${rgb2[0]} ${rgb2[1]} ${rgb2[2]}`;
    document.getElementById('rgb-value-r2').textContent = `${pixelData[0]}`;
    document.getElementById('rgb-value-g2').textContent = `${pixelData[1]}`;
    document.getElementById('rgb-value-b2').textContent = `${pixelData[2]}`;

    // document.getElementById('xyz-value-2').textContent = `${xyz2.X.toFixed(2)} ${xyz2.Y.toFixed(2)} ${xyz2.Z.toFixed(2)}`;
    document.getElementById('xyz-value-x2').textContent = `${xyz.X.toFixed(2)}`;
    document.getElementById('xyz-value-y2').textContent = `${xyz.Y.toFixed(2)}`;
    document.getElementById('xyz-value-z2').textContent = `${xyz.Z.toFixed(2)}`;

    // document.getElementById('lab-value-2').textContent = `${lab2.L.toFixed(2)} ${lab2.a.toFixed(2)} ${lab2.b.toFixed(2)}`;
    document.getElementById('lab-value-l2').textContent = `${lab.L.toFixed(2)}`;
    document.getElementById('lab-value-a2').textContent = `${lab.a.toFixed(2)}`;
    document.getElementById('lab-value-b2').textContent = `${lab.b.toFixed(2)}`;

    document.getElementById('x-coord-2').textContent = event.offsetX;
    document.getElementById('y-coord-2').textContent = event.offsetY;

    const contrast = calculateContrast(rgb1, rgb2).toFixed(1);
    document.getElementById('contrast-value').textContent = contrast;
    
    if (contrast < 4.5) {
      document.getElementById('contrast-status').textContent = 'Недостаточный контраст';
    } else {
      document.getElementById('contrast-status').textContent = '';
    }    
  }
});

function rgbToXyz(red, green, blue) {
  let r = red / 255;
  let g = green / 255;
  let b = blue / 255;

  if (r > 0.04045) {
    r = Math.pow((r + 0.055) / 1.055, 2.4);
  } else {
    r = r / 12.92;
  }

  if (g > 0.04045) {
    g = Math.pow((g + 0.055) / 1.055, 2.4);
  } else {
    g = g / 12.92;
  }

  if (b > 0.04045) {
    b = Math.pow((b + 0.055) / 1.055, 2.4);
  } else {
    b = b / 12.92;
  }

  r = r * 100;
  g = g * 100;
  b = b * 100;

  const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
  const z = r * 0.0193339 + g * 0.119192 + b * 0.9503041;

  return { X: x, Y: y, Z: z };
}

function xyzToLab(x, y, z) {
  const ref_X = 95.047;
  const ref_Y = 100.000;
  const ref_Z = 108.883;

  const x2 = x / ref_X;
  const y2 = y / ref_Y;
  const z2 = z / ref_Z;

  const fx = x2 > 0.008856 ? Math.pow(x2, 1 / 3) : (903.3 * x2 + 16) / 116;
  const fy = y2 > 0.008856 ? Math.pow(y2, 1 / 3) : (903.3 * y2 + 16) / 116;
  const fz = z2 > 0.008856 ? Math.pow(z2, 1 / 3) : (903.3 * z2 + 16) / 116;

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);

  return { L, a, b };
}

let rgb1, rgb2;

function calculateContrast(rgb1, rgb2) {
  console.log("RGB1:", rgb1);
  console.log("RGB2:", rgb2);
  const luminance1 = this.calculateLuminance(rgb1);
  const luminance2 = this.calculateLuminance(rgb2);
  const contrast = (Math.max(luminance1, luminance2) + 0.05) / (Math.min(luminance1, luminance2) + 0.05);
  return contrast;
}

function calculateLuminance(rgb) {
    const [r, g, b] = rgb;
    const linearR = r <= 10 ? r / 3294 : Math.pow((r / 255 + 0.055) / 1.055, 2.4);
    const linearG = g <= 10 ? g / 3294 : Math.pow((g / 255 + 0.055) / 1.055, 2.4);
    const linearB = b <= 10 ? b / 3294 : Math.pow((b / 255 + 0.055) / 1.055, 2.4);
    return 0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB;
}

let canvasOffsetX = 0; // Горизонтальное смещение изображения на холсте
let canvasOffsetY = 0; // Вертикальное смещение изображения на холсте

handToolButton.addEventListener('click', () => {
  toggleTool.call(handToolButton);
  canvasHeight = document.getElementById('canvasWrapper').offsetHeight
  canvasWidth = document.getElementById('canvasWrapper').offsetWidth
  console.log(document.getElementById('canvasWrapper').offsetHeight)
  if (handToolButton.classList.contains('active')) {
    window.addEventListener('keydown', handleKeyDown);
  } else {
    window.removeEventListener('keydown', handleKeyDown);
  }
});

function handleKeyDown(event) {
  const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  if (arrowKeys.includes(event.key)) {
    event.preventDefault(); // Предотвращаем прокрутку страницы при использовании стрелок
  
    const moveStep = 10; // Шаг перемещения
    
    switch (event.key) {
      case 'ArrowUp':
        canvasOffsetY -= moveStep;
        if (canvasOffsetY < -20){
          canvasOffsetY = -20
        }
        break;
      case 'ArrowDown':
        canvasOffsetY += moveStep;
        if (canvasOffsetY > (canvasHeight - canvas.height) - 20){
          canvasOffsetY = (canvasHeight - canvas.height) - 20
        }
        console.log(canvasHeight)
        console.log(canvas.height)
        break;
      case 'ArrowLeft':
        canvasOffsetX -= moveStep;
        if (canvasOffsetX < -430){
          canvasOffsetX = -430
        }
        break;
      case 'ArrowRight':
        canvasOffsetX += moveStep;
        if (canvasOffsetX > (canvasWidth - canvas.width) - 440){
          canvasOffsetX = (canvasWidth - canvas.width) - 440
        }
        break;
    }
    
    // Обновляем положение изображения на холсте
    canvas.style.transform = `translate(${canvasOffsetX}px, ${canvasOffsetY}px)`;
    
    // Прокручиваем контейнер холста, чтобы показать измененное положение изображения
    const canvasContainer = document.getElementById('canvasWrapper');
    canvasContainer.scrollTop -= moveStep; // Прокрутка вверх
    canvasContainer.scrollLeft -= moveStep; // Прокрутка влево
    // И так далее, в зависимости от направления перемещения
  }
}