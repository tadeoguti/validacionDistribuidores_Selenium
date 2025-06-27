const { Builder} = require("selenium-webdriver");
const firefox = require("selenium-webdriver/firefox");
const fs = require("fs");
const path = require("path");
const resemble = require("resemblejs");
const ExcelJS = require("exceljs");
/*
  Para usar este script es necesario validar si se tiene instalado las dependencias: canvas, resemblejs y exceljs.  
  
  Para instalar los paquetes hay que ejecutar lo siguientes comandos estando en la misma ubicación del archivo package.json. 
    npm install canvas
    npm install resemblejs
    npm install exceljs
*/


// Página base para comparar
const basePageUrl = "https://qa.liv61.netcar.com.mx/";

// Listado de URLs a comparar
const urlsToCompare = [
  "https://www.lincoln.mx/",
  "https://qa.distribuidores.liv61.netcar.com.mx/",
  "https://lincolnmty.mx/",
  "https://demo.liv61.netcar.com.mx/",
  "https://demo.distribuidores.liv61.netcar.com.mx/",
  "https://qa.ford-mx.netcar.com.mx/",
  "https://qa.liv61.netcar.com.mx/",
];

(async function main() {
  try {
    console.log("🔍 Iniciando Proceso de Comparación de páginas...");
    console.log("═══════════════════════════════════════");
    console.log(
      "📂 Validando carpetas necesarias en caso de no existir se crean las carpetas 📂"
    );
    //Tomar ruta actual y agregar resultados_comparacion
    const BASE_DIR = path.resolve(__dirname, "resultados_comparacion");
    // Crear carpeta principal de salida si no existe
    await folders(BASE_DIR);
    // Obtener la fecha actual en formato YYYY-MM-DD
    const dateStr = new Date().toISOString().split("T")[0];
    //Valida carpetas de hoy y cuenta cuantas existen con esa fecha.
    const todayFolders = fs
      .readdirSync(BASE_DIR)
      .filter((file) => file.startsWith(dateStr)).length;
    //Nombramos la nueva carpeta con fecha de hoy y nueva version de resultados.
    const folderName = `${dateStr}_v${todayFolders + 1}`; // Ej: "2025-06-15_v1"
    /*
      Rutas de salida para las capturas de pantalla y resultados
     */
    const RESULT_DIR = path.resolve(BASE_DIR, folderName);
    const OUTPUT_DIR = path.resolve(RESULT_DIR, "screenshots");
    const outPut_diff = path.resolve(RESULT_DIR, "ImgsDiferencias");
    const EXCEL_FILE = path.resolve(
      RESULT_DIR,
      `resultados_${folderName}.xlsx`
    );

    // Crear subcarpetas para resultados y capturas de pantalla
    await folders(RESULT_DIR);
    await folders(OUTPUT_DIR);
    await folders(outPut_diff);
    console.log("═══════════════════════════════════════");
    console.log(`⚙️ 🌐  Configurando navegador firefox en modo headless...`);
    // Configurar Firefox
    let options = new firefox.Options();
    options.addArguments("-headless");

    let driver = await new Builder()
      .forBrowser("firefox")
      .setFirefoxOptions(options)
      .build();

    const results = [];
    console.log(`🧪📋 Urls a Comparar: ${urlsToCompare.length}`);

    for (let i = 0; i < urlsToCompare.length; i++) {
      const currentUrl = urlsToCompare[i];
      const baseFile = path.join(OUTPUT_DIR, `base_${i + 1}.png`);
      const compareFile = path.join(OUTPUT_DIR, `compare_${i + 1}.png`);
      const baseFileDiff = path.join(outPut_diff, `diff_${i + 1}.png`);
      console.log("═══════════════════════════════════════");
      console.log(
        `⚙️-🔢 Comparación ${i + 1} de total ${urlsToCompare.length} `
      );
      console.log(`📸 Tomando captura de sitio base: ${basePageUrl}`);
      await takeScreenshot(driver, basePageUrl, baseFile);

      console.log(`📸 Tomando captura de la página a Comparar: ${currentUrl}`);
      await takeScreenshot(driver, currentUrl, compareFile);

      console.log(
        `🔍 🖼️  Comparando imágenes entre ${basePageUrl} y ${currentUrl}...`
      );
      //Comparar imágenes visualmente
      const visualSimilarity = await compareVisualTesting(
        baseFile,
        compareFile,
        baseFileDiff
      );

      // Guardar resultado
      results.push({
        baseUrl: basePageUrl,
        url: currentUrl,
        visualSimilarity,
        nameImgDiff: `diff_${i + 1}.png`,
      });
    }
    // Guardar resultados en Excel
    await saveExcel(results, EXCEL_FILE);
    await driver.quit();
  } catch (error) {
    console.error("❌ Error: ", error);
    await driver.quit();
  }
})();

/*
  Toma una captura de pantalla de una URL y la guarda en un archivo
 */
async function takeScreenshot(driver, url, filePath) {
  try {
    await driver.get(url.trim());
    await delay(3000); // Esperar 2 segundos para que la página cargue completamente
    const image = await driver.takeScreenshot();
    fs.writeFileSync(filePath, image, "base64");
  } catch (error) {
    console.error("❌ Error al tomar captura de pantalla:", error);
  }
}

/*
  Guardado de imagen de diferencias
 */
async function saveImgDiff(filePath, bufferData) {
  try {
    await delay(2000); // Esperar 2 segundos antes de guardar la imagen
    fs.writeFileSync(filePath, bufferData);
  } catch (error) {
    console.error("❌ Error al guardar la imagen de diferencias:", error);
  }
}

/*
  Compara la Visualmente las dos capturas de pantalla
 */
async function compareVisualTesting(baseFile, compareFile, baseFileDiff) {
  try {
    // Comparar imágenes
    let visualSimilarity = 0;
    resemble(baseFile)
      .compareTo(compareFile)
      .onComplete((data) => {
        visualSimilarity = (100 - parseFloat(data.misMatchPercentage)).toFixed(
          2
        );

        // Obtener la imagen con las diferencias resaltadas
        const diffImage = data.getBuffer(); // Obtiene los datos binarios de la imagen
        // Guardar la imagen de diferencias
        saveImgDiff(baseFileDiff, diffImage);

         console.log(`💾 🖼️  Imagen de diferencias guardada en: ${baseFileDiff}`);
      });
    console.log(`🎯 👀  Similitud visual: ${visualSimilarity}%`);

    await delay(1000);
    return visualSimilarity;
  } catch (error) {
    console.error("❌ Error al comparar visualmente:", error);
    return "Error al comparar";
  }
}
/*
  Funcion para guardar los resultados en un archivo Excel
 */
async function saveExcel(ResultsData, EXCEL_FILE) {
  try {
    // Guardar resultados en Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Comparaciones");

    worksheet.columns = [
      { header: "Página Base", key: "baseUrl", width: 40 },
      { header: "URL Comparada", key: "url", width: 50 },
      { header: "Similitud Visual (%)", key: "visualSimilarity", width: 20 },
      {header: "Nombre de Imagen de Diferencias",key: "nameImgDiff",width: 35,}
    ];

    ResultsData.forEach((result) => {
      worksheet.addRow(result);
    });

    await workbook.xlsx.writeFile(EXCEL_FILE);
    console.log("═══════════════════════════════════════");
    console.log("✅ Proceso de Comparaciones Finalizado.");
    console.log(`💾 Resultados guardados en: `);
    console.log(`📄  ${EXCEL_FILE}`);
  } catch (error) {
    console.error("❌ Error al guardar el archivo Excel:", error);
  }
}
/*
  Funcion para hacer tiempos de espera
 */
async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
/*
  Funcion para validar si existe la carpeta o la crea
 */
async function folders(path) {
  try {
    await delay(2000); // Esperar 2 segundos antes de crear la carpeta
    if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
    console.log(`📂 Carpeta creada o ya existe en: ${path}`);
  } catch (error) {
    console.error("❌ Error al crear la carpeta:", error);
  }
}
