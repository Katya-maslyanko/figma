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
const AppB = document.getElementById('apply-filter');
const toolButtons = document.querySelectorAll('.toolButton');

const infoPanel = document.getElementById('info-panel');
const closeInfoPanelBtn = document.querySelector('#info-panel .close');
const colorBlock1 = document.querySelector('.color-block-1');
const colorBlock2 = document.querySelector('.color-block-2');

let image = new Image(); // Инициализируем переменную image
let canvasHeight = 0;
let canvasWidth = 0;
let originalImageData; // Глобальная переменная для хранения оригинальных данных изображения

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
      // Инициализация originalImageData
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = image.width;
      tempCanvas.height = image.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(image, 0, 0);
      originalImageData = tempCtx.getImageData(0, 0, image.width, image.height);

      drawImage(image);
      update(); // Вызов функции update() после загрузки изображения
      initColorCorrection(); // Вызов функции initColorCorrection() после загрузки изображения
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
      // Инициализация originalImageData
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = image.width;
      tempCanvas.height = image.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(image, 0, 0);
      originalImageData = tempCtx.getImageData(0, 0, image.width, image.height);

      drawImage(image);

      drawChart(originalImageData.data);
      initColorCorrection(); // Вызов функции initColorCorrection() после загрузки изображения
      initFilterApplication(); // Вызов функции для инициализации применения фильтров
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

//Инструмент кривая
const curveButton = document.getElementById('curvesToolButton');
const modal_curve = document.getElementById('curvesModal');
const firstInCoordInput = document.getElementById('first_in_coord_input');
const firstOutCoordInput = document.getElementById('first_out_coord_input');
const secondInCoordInput = document.getElementById('second_in_coord_input');
const secondOutCoordInput = document.getElementById('second_out_coord_input');
const previewButton = document.getElementById('color-correction-checkbox');
const submitButton = document.getElementById('submit_color_correction_button');
const resetButton = document.getElementById('reset_color_correction_button');
const colorCorrectionInputs = document.getElementsByClassName('color_correction_input');
let redMass = new Array(256).fill(0);
let greenMass = new Array(256).fill(0);
let blueMass = new Array(256).fill(0);
let chart;
let chartCTX;

const canvasHelper = document.createElement('canvas');
canvasHelper.width = canvas.width;
canvasHelper.height = canvas.height;

curveButton.addEventListener('click', () => {
  console.log("curveButton Отработал1")
  modal_curve.style.display = 'block';
  const imageCanvas = document.getElementById('imageCanvas');
  const imageContext = imageCanvas.getContext('2d');
  const imageData = imageContext.getImageData(0, 0, imageCanvas.width, imageCanvas.height).data;
  chart = document.getElementById('chart')
  chartCTX = chart.getContext('2d');
  calcRGB(imageData)
  drawChart(imageData)
  console.log("curveButton Отработал")
});

function calcRGB(imageData) {
  redMass = new Array(256).fill(0);
  greenMass = new Array(256).fill(0);
  blueMass = new Array(256).fill(0);
  for (let i = 0; i < imageData.length; i += 4) {
    redMass[imageData[i]]++;
    greenMass[imageData[i + 1]]++;
    blueMass[imageData[i + 2]]++;
    
  }
}

Array.from(closeModalBtns).forEach(btn => {
  btn.addEventListener('click', () => {
    modal_curve.style.display = 'none';
  });
});

// Создание экземпляра объекта AnyChart

let correctedImageData;
let bufferData;
let isPreviewChecked = false; 
let originalFirstInCoord = 0;
let originalFirstOutCoord = 0;
let originalSecondInCoord = 255;
let originalSecondOutCoord = 255;
let imageData;

// Функция для отрисовки гистограмм и линии цветовой коррекции
function drawChart() {
  let firstIn = parseInt(firstInCoordInput.value);
  let firstOut = chart.height - parseInt(firstOutCoordInput.value);
  let secondIn = parseInt(secondInCoordInput.value);
  let secondOut = chart.height - parseInt(secondOutCoordInput.value);

  chartCTX.clearRect(0, 0, chart.width, chart.height);

  const barWidth = chart.width / 256;

  chartCTX.fillStyle = 'red';
  for (let i = 0; i < redMass.length; i++) {
    const barHeight = (redMass[i] / Math.max(...redMass)) * chart.height;
    chartCTX.fillRect(i * barWidth, chart.height - barHeight, barWidth, barHeight);
  }

  chartCTX.fillStyle = 'green';
  for (let i = 0; i < greenMass.length; i++) {
    const barHeight = (greenMass[i] / Math.max(...greenMass)) * chart.height;
    chartCTX.fillRect(i * barWidth, chart.height - barHeight, barWidth, barHeight);
  }

  chartCTX.fillStyle = 'blue';
  for (let i = 0; i < blueMass.length; i++) {
    const barHeight = (blueMass[i] / Math.max(...blueMass)) * chart.height;
    chartCTX.fillRect(i * barWidth, chart.height - barHeight, barWidth, barHeight);
  }

  chartCTX.strokeStyle = 'black';
  chartCTX.lineWidth = 2;
  chartCTX.beginPath();
  chartCTX.moveTo(0, firstOut);
  chartCTX.lineTo(firstIn, firstOut);
  chartCTX.lineTo(secondIn, secondOut);
  chartCTX.lineTo(chart.width, secondOut);
  chartCTX.stroke();

  chartCTX.fillStyle = 'black';
  chartCTX.beginPath();
  chartCTX.arc(firstIn, firstOut, 5, 0, 2 * Math.PI);
  chartCTX.fill();

  chartCTX.beginPath();
  chartCTX.arc(secondIn, secondOut, 5, 0, 2 * Math.PI);
  chartCTX.fill();
}

  // Обработчик событий для кнопки "Сброс"
  resetButton.onclick = () => {
    previewButton.checked = isPreviewChecked;
    firstInCoordInput.value = '0';
    firstOutCoordInput.value = '0';
    secondInCoordInput.value = '255';
    secondOutCoordInput.value = '255';
    previewButton.checked = false;
    drawChart()
    console.log("Вот мы и попали туда куда не надо")
    applyColorCorrection(imageData);
  };
  console.log("draw chart")
  previewButton.addEventListener('change', () => {
    isPreviewChecked = previewButton.checked;
    console.log("Попали в превью для кривой")
    const imageCanvas = document.getElementById('imageCanvas');
    const imageContext = imageCanvas.getContext('2d');
    let imageData = imageContext.getImageData(0, 0, imageCanvas.width, imageCanvas.height).data;
    if (isPreviewChecked) {
      bufferData = imageData.slice()
      console.log("Это буфферизированная дата",imageData)
      applyColorCorrection(bufferData, true);
      // const newImageData = new ImageData(new Uint8ClampedArray(correctedImageData), canvas.width, canvas.height);
      // ctx.putImageData(newImageData, 0, 0);
    } else {
      console.log("bufferData = imageData.slice()")
      const newImageData = new ImageData(new Uint8ClampedArray(bufferData.slice()), canvas.width, canvas.height);
      ctx.putImageData(newImageData, 0, 0);
      // drawChart(imageData, correctedImageData);
    }
  });
  
  [firstInCoordInput, firstOutCoordInput, secondInCoordInput, secondOutCoordInput].forEach(input => {
    input.onchange = () => {
      if (checkCoordinates()) {
        drawChart()
        if (isPreviewChecked) {
          console.log("Аэплай произошел")
          applyColorCorrection(bufferData, true);
          const newImageData = new ImageData(correctedImageData, canvas.width, canvas.height);
          ctx.putImageData(newImageData, 0, 0);
        }
      }
    };
  });  
 
  submitButton.addEventListener('click', () => {
    const imageCanvas = document.getElementById('imageCanvas');
    const imageContext = imageCanvas.getContext('2d');
    const imageData = imageContext.getImageData(0, 0, imageCanvas.width, imageCanvas.height).data;
    if (isPreviewChecked){
      correctedImageData = imageData;
      const newImageData = new ImageData(correctedImageData, canvas.width, canvas.height);
      ctx.putImageData(newImageData, 0, 0);
      firstInCoordInput.value = '0';
      firstOutCoordInput.value = '0';
      secondInCoordInput.value = '255';
      secondOutCoordInput.value = '255';
      previewButton.checked = false;
      modal_curve.style.display = 'none';
      // const newImageData = new ImageData(new Uint8ClampedArray(bufferData.slice()), canvas.width, canvas.height);
      // ctx.putImageData(newImageData, 0, 0);
      return
    };
    applyColorCorrection(imageData, false);
    modal_curve.style.display = 'none';
    firstInCoordInput.value = '0';
    firstOutCoordInput.value = '0';
    secondInCoordInput.value = '255';
    secondOutCoordInput.value = '255';
    drawChart()
    // Обновляем холст с исправленным imageData
    const newImageData = new ImageData(correctedImageData, canvas.width, canvas.height);
    ctx.putImageData(newImageData, 0, 0);
  });
let chartData = [];

let isPreview = true;

// Функция для применения градационного преобразования без предварительного просмотра
function applyColorCorrection(imageData, isPreview = false) {
  const canvas = document.getElementById('imageCanvas');
  const ctx = canvas.getContext('2d');
  const width = Math.floor(canvas.width);
  const height = Math.floor(canvas.height);
  const buffer = new Uint8ClampedArray(width * height * 4);
  let firstIn = parseInt(firstInCoordInput.value);
  let firstOut = parseInt(firstOutCoordInput.value);
  let secondIn = parseInt(secondInCoordInput.value);
  let secondOut = parseInt(secondOutCoordInput.value);

  for (let i = 0; i < imageData.length; i += 4) {
    buffer[i] = applyColorCorrectionForChannel(imageData[i], firstIn, firstOut, secondIn, secondOut);
    buffer[i + 1] = applyColorCorrectionForChannel(imageData[i + 1], firstIn, firstOut, secondIn, secondOut);
    buffer[i + 2] = applyColorCorrectionForChannel(imageData[i + 2], firstIn, firstOut, secondIn, secondOut);
    buffer[i + 3] = 255;
  }

  const newImageData = new ImageData(buffer, width, height);

  if (isPreview) {
    ctx.putImageData(newImageData, 0, 0);
  } else {
    ctx.putImageData(newImageData, 0, 0);
    correctedImageData = new Uint8ClampedArray(buffer);
    drawChart(imageData.slice(), correctedImageData.slice());
  }
}

function applyColorCorrectionForChannel(value, firstIn, firstOut, secondIn, secondOut) {
  if (value <= firstIn) {
    return firstOut;
  } else if (value >= secondIn) {
    return secondOut;
  } else {
    return ((secondOut - firstOut) / (secondIn - firstIn)) * (value - firstIn) + firstOut;
  }
}

// Функция для проверки координат точек
function checkCoordinates() {
  const firstIn = parseInt(firstInCoordInput.value);
  const firstOut = parseInt(firstOutCoordInput.value);
  const secondIn = parseInt(secondInCoordInput.value);
  const secondOut = parseInt(secondOutCoordInput.value);

  if (
    isNaN(firstIn) ||
    isNaN(firstOut) ||
    isNaN(secondIn) ||
    isNaN(secondOut) ||
    firstIn < 0 ||
    firstIn > 255 ||
    firstOut < 0 ||
    firstOut > 255 ||
    secondIn < 0 ||
    secondIn > 255 ||
    secondOut < 0 ||
    secondOut > 255 ||
    firstIn >= secondIn
  ) {
    alert('Некорректные координаты точек. Диапазон допустимых значений [0:255], входное значение первой точки должно быть меньше входного значения второй.');
    return false;
  }

  return true;
}

// Инициализация
function initColorCorrection() {
  if (originalImageData) {
    const imageDataArray = originalImageData.data;
    drawChart(imageDataArray);
  } else {
    console.warn('Изображение не загружено');
  }
}

//Инструмент размытие
const blurButton = document.getElementById('blurToolButton');
const modal_blur = document.getElementById('blurModal');
const filterSelect = document.getElementById('filter_select');
const applyBtn = document.getElementById('applyBtn');
const resetFilterButton = document.getElementById('reset_filter_button');
const filterPreviewCheckbox = document.getElementById('filter_offcanvas_checkbox');
const kernelInputs = document.querySelectorAll('.kernel_input');
const matrixInputs = document.querySelectorAll('.matrix input');
const divInput = document.getElementById('div');
const offsetInput = document.getElementById('offset');

// Обработчики событий
blurButton.addEventListener('click', () => {
  modal_blur.style.display = 'block';
});

Array.from(closeModalBtns).forEach(btn => {
  btn.addEventListener('click', () => {
    modal_blur.style.display = 'none';
  });
});

// Новая функция для инициализации применения фильтров
function initFilterApplication() {
  // Обработчик события на кнопку "Применить"
  document.getElementById('apply-filter').addEventListener('click', applyFilter);

  // Обработчик события на кнопку "Сбросить"
  document.getElementById('reset_filter_offcanvas_button').addEventListener('click', resetFilter);

  // Обработчик изменения выбора фильтра
  document.getElementById('filter_select').addEventListener('change', function() {
    const values = this.value.split(' ');
    for (let i = 0; i < 9; i++) {
      document.getElementById(`kernel${Math.floor(i / 3) + 1}${(i % 3) + 1}`).value = values[i];
    }
    // Не применяем фильтр сразу при изменении select
  });
}


let bufferData1;

AppB.addEventListener('click', () => {
  applyFilter()
})

// Обработчик события на checkbox
filterPreviewCheckbox.addEventListener('change', () => {
    const imageCanvas = document.getElementById('imageCanvas');
    const imageContext = imageCanvas.getContext('2d');
    const imageDat = imageContext.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
  if (filterPreviewCheckbox.checked) {
    bufferData1 = imageDat.data.slice()
    console.log(bufferData1)
    // Применение фильтра
    const kernel = getKernelFromInput();
    let div = parseFloat(document.getElementById('div').value) || 1;
    const offset = parseInt(document.getElementById('offset').value) || 0;
    dta = processImage(imageDat, kernel, div, offset);
    console.log("dta",dta == imageDat.data)
    const newImageData2 = new ImageData(new Uint8ClampedArray(dta.slice()), canvas.width, canvas.height);
    imageContext.putImageData(newImageData2, 0, 0);
  } else {
    console.log('Z nemn', bufferData1 == imageDat.data)
    const newImageData = new ImageData(new Uint8ClampedArray(bufferData1.slice()), canvas.width, canvas.height);
    // Сброс предварительного просмотра
    imageContext.putImageData(newImageData, 0, 0);
  }
});

// Функция для сброса предварительного просмотра
function resetPreview() {
  // Если исходное изображение не сохранено, сохраняем его
  if (!originalImageData) {
    originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  // Отображаем исходное изображение на canvas
  ctx.putImageData(originalImageData, 0, 0);
}


// Функция для применения фильтра
function applyFilter() {
  console.log("Попали в применение фильтра")
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const kernel = getKernelFromInput();
  let div = parseFloat(document.getElementById('div').value) || 1;
  const offset = parseInt(document.getElementById('offset').value) || 0;
  dta = imageData.data;
  if (!filterPreviewCheckbox.checked){
    dta = processImage(imageData, kernel, div, offset);
  }
  filterPreviewCheckbox.checked = false;
  const newImageData2 = new ImageData(new Uint8ClampedArray(dta.slice()), canvas.width, canvas.height);
  ctx.putImageData(newImageData2, 0, 0);
  modal_blur.style.display = 'none';
}

// Функция для сброса фильтра
function resetFilter() {
  const kernel = [0, 0, 0, 0, 1, 0, 0, 0, 0];
  for (let i = 0; i < 9; i++) {
    document.getElementById(`kernel${Math.floor(i / 3) + 1}${(i % 3) + 1}`).value = kernel[i];
  }
  applyFilter();
}

// Получаем матрицу свертки из полей ввода
function getKernelFromInput() {
  return [
    parseFloat(document.getElementById('kernel11').value),
    parseFloat(document.getElementById('kernel12').value),
    parseFloat(document.getElementById('kernel13').value),
    parseFloat(document.getElementById('kernel21').value),
    parseFloat(document.getElementById('kernel22').value),
    parseFloat(document.getElementById('kernel23').value),
    parseFloat(document.getElementById('kernel31').value),
    parseFloat(document.getElementById('kernel32').value),
    parseFloat(document.getElementById('kernel33').value)
  ];
}



// Применяем фильтр на основе матрицы свертки
function processImage(imageData1, kernel, div, offset) {
  const width = imageData1.width;
  const height = imageData1.height;
  const data = imageData1.data;
  arr = new Array(imageData1.data.length).fill(0);

  const kernelSize = 3;
  const halfSize = Math.floor(kernelSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      for (let sy = 0; sy < kernelSize; sy++) {
        const yy = Math.min(height - 1, Math.max(0, y + sy - halfSize));
        for (let sx = 0; sx < kernelSize; sx++) {
          const xx = Math.min(width - 1, Math.max(0, x + sx - halfSize));
          const index = (yy * width + xx) * 4;
          r += data[index] * kernel[sy * kernelSize + sx];
          g += data[index + 1] * kernel[sy * kernelSize + sx];
          b += data[index + 2] * kernel[sy * kernelSize + sx];
        }
      }
      const index = (y * width + x) * 4;
      arr[index] = Math.min(255, Math.max(0, offset + (r / div)));
      arr[index + 1] = Math.min(255, Math.max(0, offset + (g / div)));
      arr[index + 2] = Math.min(255, Math.max(0, offset + (b / div)));
      arr[index + 3] = data[index + 3]
    }
  }
  return arr
}