import cv2
from matplotlib import pyplot as plt
import numpy as np
import imutils
import easyocr
import os


# Mesmo deixando a imagem perfeita para identificacao nas imagens 9 , 30 , 1, 13, 5, image4, 18, 21
#o algoritimo do EasyOCR nao consegue identificar as placas corretamente na maioria das vezes
#tentamos utilizar o Tesseract, mas o resultado foi ainda pior

def find_Plate(img):
    # Ler a imagem, converter para escala de cinza e aplicar desfoque
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    plt.imshow(cv2.cvtColor(gray, cv2.COLOR_BGR2RGB))

    # Aplicar filtro e encontrar bordas para localização
    bfilter = cv2.bilateralFilter(gray, 11, 17, 17)  # Redução de ruído
    edged = cv2.Canny(bfilter, 30, 200)  # Detecção de bordas
    plt.imshow(cv2.cvtColor(edged, cv2.COLOR_BGR2RGB))

    # Encontrar contornos e aplicar máscara
    keypoints = cv2.findContours(edged.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    contours = imutils.grab_contours(keypoints)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:10]
    location = None
    for contour in contours:
        approx = cv2.approxPolyDP(contour, 10, True)
        if len(approx) == 4:
            location = approx
            break

    if location is None:
        print("Não foi possível encontrar contornos que correspondam a uma placa.")
    else:
        mask = np.zeros(gray.shape, np.uint8)
        new_image = cv2.drawContours(mask, [location], 0, 255, -1)
        new_image = cv2.bitwise_and(img, img, mask=mask)
        plt.imshow(cv2.cvtColor(new_image, cv2.COLOR_BGR2RGB))

        (x, y) = np.where(mask == 255)
        (x1, y1) = (np.min(x), np.min(y))
        (x2, y2) = (np.max(x), np.max(y))
        cropped_image = gray[x1:x2 + 1, y1:y2 + 1]

        # APLICAR BINARIZAÇÃO EM cropped_image
        _, binary_image = cv2.threshold(cropped_image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        plt.imshow(binary_image, cmap='gray')

        # DILATAÇÃO
        kernel = np.ones((2, 2), np.uint8)
        dilated_image = cv2.dilate(binary_image, kernel, iterations=1)
        plt.imshow(dilated_image, cmap='gray')

        # APLICAR EROSÃO
        kernel = np.ones((3, 3), np.uint8)
        eroded_image = cv2.erode(dilated_image, kernel, iterations=1)
        plt.imshow(eroded_image, cmap='gray')

        # REDIMENSIONAR IMAGEM ERODIDA 4X
        resized_image = cv2.resize(eroded_image, None, fx=20, fy=20, interpolation=cv2.INTER_CUBIC)
        plt.imshow(resized_image, cmap='gray')

        # Usar EasyOCR para ler o texto
        reader = easyocr.Reader(['en'])
        result = reader.readtext(eroded_image)

        if result:
            text = result[0][-2]
            font = cv2.FONT_HERSHEY_SIMPLEX
            print(text)
            res = cv2.putText(img, text=text, org=(approx[0][0][0], approx[1][0][1] + 60), fontFace=font, fontScale=1,
                              color=(0, 255, 0), thickness=2, lineType=cv2.LINE_AA)
            res = cv2.rectangle(img, tuple(approx[0][0]), tuple(approx[2][0]), (0, 255, 0), 3)
            plt.imshow(cv2.cvtColor(res, cv2.COLOR_BGR2RGB))

        else:
            print("Não foi possível ler nenhum texto na imagem.")
        return resized_image


# Lista para armazenar todas as placas identificadas
plates = []

directory = './images'

# Listar todos os arquivos no diretório
files = os.listdir(directory)

# Iterar sobre os arquivos
for file in files:
    # Verificar se é um arquivo de imagem
    if file.endswith(('.jpg', '.jpeg', '.png')):
        # Ler a imagem
        img_path = os.path.join(directory, file)
        img = cv2.imread(img_path)
        plate = find_Plate(img)
        if plate is not None:
            plates.append(plate)

# Verificar se há placas identificadas
if plates:
    # Calcular quantas imagens serão exibidas por linha
    num_images = len(plates)
    images_per_row = 3
    num_rows = (num_images + images_per_row - 1) // images_per_row

    # Criar uma única figura do Matplotlib
    fig, axes = plt.subplots(num_rows, images_per_row, figsize=(15, 10))
    fig.subplots_adjust(hspace=0.3, wspace=0.3)
    axes = axes.flatten()

    # Iterar sobre as imagens e exibi-las nas subplots
    for i, (plate, ax) in enumerate(zip(plates, axes)):
        ax.imshow(plate, cmap='gray')
        ax.set_title(f'Placa {i + 1}')
        ax.axis('off')

    # Ocultar subplots vazias, caso existam
    for ax in axes[len(plates):]:
        ax.axis('off')

    plt.show()
else:
    print("Nenhuma placa foi identificada.")
