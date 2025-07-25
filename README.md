
# 🧪 Validación de Distribuidores - Comparación Estructural y Visual

Este proyecto automatiza la comparación de sitios web de distribuidores contra una página base, evaluando tanto la estructura del menú como su apariencia visual.

---

## 🧰 Tecnologías Utilizadas

- **Node.js**
- **Selenium WebDriver (Firefox - Headless)**
- **Resemble.js**
- **ExcelJS**
- **fs / path (módulos nativos de Node)**

---

## ⚙️ Requisitos Previos

### 🔹 Software Requerido

| Software       | Descripción                                       | Enlace de descarga                  |
|----------------|---------------------------------------------------|-------------------------------------|
| Node.js        | Entorno de ejecución de JavaScript                | [🔗 Node.js](https://nodejs.org)    |
| Firefox        | Navegador utilizado para pruebas headless         | [🔗 Firefox](https://mozilla.org)   |
| Geckodriver    | Controlador WebDriver para Firefox                | [🔗 Geckodriver](https://github.com/mozilla/geckodriver/releases) |

> ⚠️ Asegúrate de agregar `geckodriver` al PATH del sistema operativo si usas Windows.

---

## 📦 Instalación del Proyecto

### 1. Clona o crea una carpeta del proyecto

```bash
mkdir validador-distribuidores
cd validador-distribuidores
```

Agrega dentro el archivo `validacionDistribuidores_v4.js`.

---

### 2. Inicializa el proyecto

```bash
npm init -y
```

---

### 3. Instala las dependencias necesarias

```bash
npm install selenium-webdriver resemblejs exceljs
```

---

## 🚀 Cómo Ejecutar

Una vez instaladas las dependencias, ejecuta:

```bash
node validacionDistribuidores_v4.js
```

---

## 🔍 ¿Qué hace este script?

1. **Obtiene el menú** de una página base.
2. **Recorre varias URLs** de sitios distribuidores y extrae sus menús.
3. **Compara menús** para detectar diferencias estructurales.
4. **Captura pantallas y compara visualmente** las páginas (menús y submenús).
5. **Genera un archivo Excel** con los resultados.

---

## 🧪 Resultados

- Carpeta `resultados_comparacion/` se crea automáticamente.
- Dentro se genera una subcarpeta por fecha, ejemplo: `2025-07-14_v1/`
- Se incluyen:
  - Capturas de pantalla del sitio base y cada sitio comparado.
  - Imágenes resaltando diferencias visuales.
  - Un archivo Excel con los resultados.

```bash
resultados_comparacion/
└── 2025-07-14_v1/
    ├── Resultados_Comparacion_2025-07-14_v1.xlsx
    ├── 01_lincolnsurmanbc_mx/
    │   ├── Capturas_Pantalla/
    │   └── Errores_Visuales/
    └── ...
```

---

## 📝 Personalización

- Puedes modificar la página base en la variable:
  ```js
  const basePageUrl = "https://demo.liv61.netcar.com.mx/";
  ```

- Las URLs de distribuidores están en el arreglo `urlsToCompare`.

- Las clases CSS del menú se ajustan en estas variables:
  ```js
  const classPrincipalMenu = "navbar-nav";
  const classItemsMenu = "nav-item";
  const classLinkOpcionMenu = "nav-link";
  const classDropdownItems = "dropdown-item";
  ```

---

## 🛠️ Compatibilidad

Este script fue desarrollado para funcionar en:

- Sistemas operativos: Windows, Linux y macOS
- Node.js v16 o superior
- Firefox actualizado
- Internet activo (necesario para navegar los sitios)

---

## 🧑‍💻 Autor

Desarrollado por el equipo de QA / Automatización.

---

## 📬 Soporte

Para dudas o mejoras, contacta al equipo de desarrollo o al responsable de QA.
