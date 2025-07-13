const { Builder, By, until } = require("selenium-webdriver");
const firefox = require("selenium-webdriver/firefox");
const fs = require('fs');
const path = require("path");
const resemble = require("resemblejs");
const ExcelJS = require("exceljs");
//const { take, get } = require("lodash");


(async function main() { 
  try {
    // Crear carpetas principales de salida
    const BASE_DIR = path.resolve(__dirname, "resultados_comparacion");
    await folders(BASE_DIR);
    const dateStr = new Date().toISOString().split("T")[0];
    const todayFolders = fs.readdirSync(BASE_DIR).filter((file) => file.startsWith(dateStr)).length;
    const folderName = `${dateStr}_v${todayFolders + 1}`;
    const RESULT_DIR = path.resolve(BASE_DIR, folderName);
    await folders(RESULT_DIR);

    //Configurar el navegador de manera oculta
    let options = new firefox.Options();
    options.addArguments("-headless");
    const driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).build();

    // Configuración de variables
    //* Página base para comparar
    const basePageUrl = "https://demo.liv61.netcar.com.mx/";   
    //* Listado de URLs a comparar
    const urlsToCompare = [
    "https://lincolnsurmanbc.mx",
    //"https://www.lincoln.mx/",
    "https://lincolncancun.mx",
    "https://lincolnpasacondesa.mx",
    "https://demo.lincolncountryqueretaro.netcar.com.mx",
    "https://lincolnmty.mx",
    "https://lincolncountryaguascalientes.mx",
    "https://lincolncountryguadalajara.mx",
    "https://lincolndisauto.mx",
    "https://lincolnprodauto.mx",
    "https://lincolnhermosillo.mx",
    "https://lincolnleyenda.mx",
    "https://lincolninterlomasgp.mx",
    "https://lincolnlaguna.mx",
    "https://lincolnleon.mx",
    
    "https://lincolnmtylindavista.com",
    "https://lincolnpasajuarez.mx",
    "https://lincolnjaliscomotors.mx",
    "https://lincolnpicacho.mx",
    "https://lincolnpuebla.mx",
    "https://lincolnsaltillo.mx",
    "https://lincolnmylsa.mx",
    "https://lincolnatcsa.mx",
    "https://www.lincolnveracruz.mx",
    "https://lincolnyucatan.mx",
    "https://lincolnzapatazonaesmeralda.mx/"
    ];
    //* Configuración de identificadores para el menu del sitio base
    //* Identificar clase del menu general del Sitio Base
    const classPrincipalMenu = "navbar-nav";
    //Identificar las opciones del menu
    const classItemsMenu = "nav-item"; //los items totales
    const classDropdownItems = "dropdown-item";
    //Identificar el area donde esta la accioon de redireccionamiento
    const classLinkOpcionMenu = "nav-link";
   
    //Arrays para almacenar los resultados
    const optionsMenuBase = [],optionsMenuToCompare = [], visualResults = [],menuResults = [] ;


    console.log("═══════════════════════════════════════════════════════════════");
    console.log(`- Validando Menu Principal - Sitio Base - ${basePageUrl} -`);
    //*Obtener El menu, opciones y links del sitio base.
    await processMainMenuItem(classPrincipalMenu,`class`,basePageUrl);
    console.log("═══════════════════════════════════════════════════════════════");
    console.log(`Validación Menu Principal de los sitios a comparar `);
    //Obtener el menu, opciones y links de los sitios a comparar
    await checkUrlsToCompare(classPrincipalMenu,`class`,urlsToCompare);
    console.log("═══════════════════════════════════════════════════════════════");
    //console.log(`Total de registros del Sitio Base: ${optionsMenuBase.length}`);
    //console.log(`Total de registros del Sitio a Comparar: ${optionsMenuToCompare.length}`);
    //console.log("═══════════════════════════════════════");
    //const TotalUrls_Base = await contarUrls(optionsMenuBase);
    //const TotalUrls_Compare = await contarUrls(optionsMenuToCompare);    
    //console.log(`Total de URLs en el Sitio Base y la cantidad de objetos en su menu: ${TotalUrls_Base.length}`);
    //console.log(TotalUrls_Base);
    //console.log("═══════════════════════════════════════");
    //console.log(`Total de URLs Comparadas y la cantidad de objetos en su menu: ${TotalUrls_Compare.length}`);
    //console.log(TotalUrls_Compare);

    console.log("═══════════════════════════════════════════════════════════════");
    console.log("🔍 Iniciando Proceso de Comparación Menus de Sitios...");
    await compareArrays(optionsMenuBase, optionsMenuToCompare);
    //console.log("═══════════════════════════════════════");
    //console.log(`Total de Comparaciones realizadas: ${menuResults.length}`);
    //console.log("resultados: ", menuResults);
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("🔍 Iniciando Proceso de Comparación Visual de Sitios...");
    await visualTest(optionsMenuBase,optionsMenuToCompare);
    console.log("═══════════════════════════════════════════════════════════════");
    const excelPath = path.join(RESULT_DIR, `Resultados_Comparacion_${folderName}.xlsx`);
    //await saveExcel(menuResults, excelPath);
    await saveExcels(menuResults, visualResults, excelPath);
    console.log("───────────────────────────────────────────────────────────────");
    // console.log(`Array de MenuResults: `);
    // console.log(menuResults);
    // console.log("───────────────────────────────────────────────────────────────");
    // console.log(`Array VisualResults : `)
    // console.log(visualResults);
    // console.log("───────────────────────────────────────────────────────────────");

    console.log("═══════════════════════════════════════════════════════════════");
    console.log("───────────────────────────────────────────────────────────────");
    console.log("📋 RESUMEN FINAL COMPARACIÓN MENU POR LINK:");
    menuResults.forEach((r, idx) => {
      console.log(`🔢 ${idx + 1}. Sitio Comparado: ${r.url}`);
      console.log(`   📍 Página Base: ${r.baseUrl}`);
      console.log(`   📊 Similitud en Menu: ${r.porcentajeCoincidencia} %`);
      console.log(`   📋 Observaciones: ${r.mensajeMenu}`);
      console.log("───────────────────────────────────────────────────────────────");
    });
    console.log("───────────────────────────────────────────────────────────────");
    console.log("📋 RESUMEN FINAL COMPARACIÓN VISUAL POR LINK:");
    visualResults
    .filter(r => r.visualMensaje === "Similitud total promedio de todas las vistas del sitio")
    .forEach((r, idx) => {
      console.log(`🔢 ${idx + 1}. Sitio Comparado: ${r.url}`);
      console.log(`   📍 Página Base: ${r.baseUrl}`);
      console.log(`   📊 Similitud en Visual: ${r.visualSimilarity} %`);
      console.log(`   📋 Observaciones: ${r.visualMensaje}`);
      console.log("───────────────────────────────────────────────────────────────");
    });


    await closeNavegador();


    //Seccion de funciones 
    async function folders(dirPath) {
      try {
        await delay(2000);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
          console.log(`📁 Carpeta creada: ${dirPath}`);
        } else {
          console.log(`📂 Carpeta ya existente: ${dirPath}`);
        }
      } catch (error) {
        console.error("❌ Error al crear la carpeta:", error);
      }
    }

    async function delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function closeNavegador() {
    console.log("Cerrando el navegador...");
    await driver.quit();
    }

    async function findItem(item, tipo,url) {
      try {
        await delay(2000);
        // Buscar el elemento según el tipo
        let element;
        if (tipo === "class") {
            element = await driver.wait(until.elementLocated(By.className(item)),5000);
            //elemento = await driver.findElement(By.className(item));
        } else if (tipo === "id") {
            element = await driver.wait(until.elementLocated(By.id(item)), 5000);
            //elemento = await driver.findElement(By.id(item));
        } else if (tipo === "xpath") {
            element = await driver.wait(until.elementLocated(By.xpath(item)),5000);
            //elemento = await driver.findElement(By.xpath(item));
        } else {
            throw new Error(`Tipo de selector no soportado: ${tipo}`);
        }
        //Utilizar scroll para que el elemento esté visible
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});",element);
        // Esperar que sea visible (usando el elemento ya encontrado)
        await driver.wait(until.elementIsVisible(element), 5000);
        return element;
      } catch (error) {
          console.log(`-------------------------------------------------------------------`);
          console.error(`❌  No se encontro el Elemento buscado (Menu Principal), se regresará el valor "null" `);
          
          //Guardar datos al array que corresponde  
          if (url === basePageUrl) {
            console.log(`Validar que el Menu Principal coincida con la clase introducida en la variable "classPrincipalMenu" `);
            //Guardado de las opciones del Menu de Sitio Base                                
            optionsMenuBase.push({
                url: url,
                optionMenu:  ``,
                linkOptionMenu: ``,
                subOptionMenu: ``,
                linkSuboptionMenu: ``,
                mensaje: `Menu Principal de este sitio No Coincide con la clase introducida en la variable "classPrincipalMenu" `
            });
          }else {
            console.log(`Posible error: Sitio con diferente estructura en el Menu Principal o Sitio caído`);
            //Guardado de las opciones del Menu del sitio a Comparar 
            optionsMenuToCompare.push({
                url: url,
                optionMenu: ``,
                linkOptionMenu: ``,
                subOptionMenu: ``,
                linkSuboptionMenu: ``,
            });
          }
          console.log(`-------------------------------------------------------------------`);
          return null;
        }
    }

    async function processMainMenuItem(item, type, url) {
      try {
        await driver.get(url);
        await delay(2500);
        let menu = await findItem(item,type,url);
        if (menu !== null) {
          let opcionesPrincipales = await menu.findElements(By.className(classItemsMenu));
          let linksPrincipales = await menu.findElements(By.className(classLinkOpcionMenu));
          await listLinksMenu(linksPrincipales,opcionesPrincipales,url);
        }        
      } catch (error) {
          console.log(`-------------------------------------------------------------------`);
          console.log(`❌ No se pudo identificar las Opciones principales y links del Menu: ${url} -`);
            //Guardar datos al array que corresponde  
          if (url === basePageUrl) {
            console.log(` Validar que los valores de las variables "classItemsMenu" y "classLinkOpcionMenu" sea los correctos que tiene el sitio Base `);
            //Guardado de las opciones del Menu de Sitio Base                                
            optionsMenuBase.push({
                url: url,
                optionMenu:  ``,
                linkOptionMenu: ``,
                subOptionMenu: ``,
                linkSuboptionMenu: ``,
                mensaje: `Menu Principal de este sitio No Coincide con lo introducido`
            });
          }else {
            console.log(` Posible error: Sitio con diferente estructura en el Menu Principal o Sitio caído`);
            //Guardado de las opciones del Menu del sitio a Comparar 
            optionsMenuToCompare.push({
                url: url,
                optionMenu:  ``,
                linkOptionMenu: ``,
                subOptionMenu: ``,
                linkSuboptionMenu: ``,
            });
          }
          console.log(`-------------------------------------------------------------------`);
        }
    }

    async function listLinksMenu(linksPrincipales,opcionesPrincipales,url) {
        try {
          console.log(`Validando las Opciones Principales del menu `); 
          for (let i = 0; i < linksPrincipales.length; i++) {
            let linkPrincipal = linksPrincipales[i];
            let linkPrincipalclasses = await linkPrincipal.getAttribute('class');
            let linkPrincipalhref = await linkPrincipal.getAttribute('href');
            let LinkPrincipalText = (await linkPrincipal.getText()).trim();
            
            //console.log(` # ${i + 1} - ${LinkPrincipalText} y href: ${linkPrincipalhref}`);

            if(linkPrincipalclasses.includes('dropdown')){
              await linkPrincipal.click();
              let subOptions = await opcionesPrincipales[i].findElements(By.className(classDropdownItems));
              //console.log(`La Opcion #${i +1}  Tiene ${subOptions.length} subopciones:`);

              for (let j = 0; j < subOptions.length; j++) {
                let subOption = subOptions[j];

                if (subOption) {
                  try {
                    let subOptionText = (await subOption.getText()).trim();
                    let subOptionLink = await subOption.getAttribute('href');
                    //console.log(` ${j+1}- ${subOptionText || '[Texto vacío]'} -> ${subOptionLink}`);
                    //console.log(` `); 
                    //Guardar datos al array que corresponde  
                    if (url === basePageUrl) {
                      //Guardado de las opciones del Menu de Sitio Base                                
                      optionsMenuBase.push({
                          url: url,
                          optionMenu:  LinkPrincipalText,
                          linkOptionMenu: ``,
                          subOptionMenu: subOptionText,
                          linkSuboptionMenu: subOptionLink
                      });
                    }else {
                      //Guardado de las opciones del Menu del sitio a Comparar 
                      optionsMenuToCompare.push({
                          url: url,
                          optionMenu:  LinkPrincipalText,
                          linkOptionMenu: ``,
                          subOptionMenu: subOptionText,
                          linkSuboptionMenu: subOptionLink
                      });
                    }  
                  } catch (error) {
                      console.error(`    - Error obteniendo texto de subopción #${j + 1}:`, err.message);
                  }
                }else {
                    console.log(`    - SubOpción #${j + 1} es undefined`);
                } 
              }
              await linkPrincipal.click();
            }else {
              //console.log(`Opción #${i + 1} es una opción Simple`);
              //console.log(`✅ Opcion #${i + 1} -> OK ✅`);
              //console.log(` `);
              //Guardado de las opciones del Menu 
              if (url === basePageUrl) {
                  //Guardado de las opciones del Menu de Sitio Base
                  optionsMenuBase.push({
                      url: url,
                      optionMenu:  LinkPrincipalText,
                      linkOptionMenu: linkPrincipalhref,
                      subOptionMenu: ``,
                      linkSuboptionMenu: ``
                  });
              }else {
                  //Guardado de las opciones del Menu del sitio a Comparar 
                  optionsMenuToCompare.push({
                      url: url,
                      optionMenu:  LinkPrincipalText,
                      linkOptionMenu: linkPrincipalhref,
                      subOptionMenu: ``,
                      linkSuboptionMenu: ``
                  });
              }  
            }
          }

        } catch (error) {
            console.log('❌Error en listado de Links del Menu: ', error);
        }  
    }

    async function checkUrlsToCompare(item,type,urls) {
        try {
            console.log(`📋 Total de Urls a Comparar: ${urls.length}`);
            console.log(`Obtener los menus de los sitios a comparar...`);
            for (let i = 0; i < urls.length; i++) {
                let currentUrl = urls[i];
                console.log("════════════════════════════════════════════════════════════");
                console.log(`⚙️-🔢 Validando Menu del sitio a comparar ${i + 1} de ${urls.length} `);
                console.log(`url del sitio a comparar -> ${currentUrl}`);
                //Obtener el menu del sitio a comparar 
                await processMainMenuItem(item,type,currentUrl);   
            }
            
        } catch (error) {
            console.log('❌Error Revision diferencias de Links del Menu: ', error);
        }
    }

    async function saveArray(array,fileName) {
        try {
            const filePath = `${fileName}.json`;
            const dataJSON = JSON.stringify(array,null,2);
            fs.writeFileSync(filePath,dataJSON,'utf-8');
            console.log(`Archivo guardado en: ${filePath}`);
        } catch (error) {
            console.log('❌Error en guardar datos de array: ', error);
        }
    }

    async function groupBySite(array) {
        try {
            return array.reduce((acc, item) => {
                // Limpiar la URL para usarla como clave
                const sitio = item.url.trim(); 

                // Crear una copia del item sin el campo 'url'
                const { url, ...itemSinUrl } = item;
                // Inicializar el grupo si no existe
                if (!acc[sitio]) {
                    acc[sitio] = [];
                }
                // Agregar el item sin 'url' al grupo correspondiente
                acc[sitio].push(itemSinUrl);
                return acc;
            }, {});
        } catch (error) {
            console.error("❌ Error al agrupar por sitio:", error);
            return {};
        }
    } 

    async function compareArrays(baseArray, compareArray) {
      try {
        const agrupados = await groupBySite(compareArray);
        for (const [url, grupo] of Object.entries(agrupados)) {
          if (grupo.length === 1) {
            console.log(`Comparando Sitio: ${url}`);
            console.log(`----------------------------------------`);
            console.log(``);
            menuResults.push({
              baseUrl: basePageUrl,
              url,
              porcentajeCoincidencia: "0%",
              mensajeMenu: "Sitio con diferente estructura en el Menu Principal o Sitio caído",
              faltantesEnBase: baseArray
              });
            continue;
          }

          let matchesCount = 0;
          const faltantesEnBase = [];
          const extrasEnCompare = [];
          console.log(`Comparando Sitio: ${url}`);
          console.log(`------------------------------------------`);
          console.log(``);
          //console.log(`Total de registros a comparar: ${grupo.length}`);
          baseArray.forEach(baseItem => {
            const baseKey = `${baseItem.optionMenu.trim()}|${urlPath(baseItem.linkOptionMenu)}|${baseItem.subOptionMenu.trim()}|${urlPath(baseItem.linkSuboptionMenu)}`;
            const encontrado = grupo.some(compareItem => {
                const compareKey = `${compareItem.optionMenu.trim()}|${urlPath(compareItem.linkOptionMenu)}|${compareItem.subOptionMenu.trim()}|${urlPath(compareItem.linkSuboptionMenu)}`;
                return baseKey === compareKey;
              });
            if (encontrado) {
                matchesCount++;
            } else {
                faltantesEnBase.push(baseItem);
            }
          });

          grupo.forEach(compareItem => {
            const compareKey = `${compareItem.optionMenu.trim()}|${urlPath(compareItem.linkOptionMenu)}|${compareItem.subOptionMenu.trim()}|${urlPath(compareItem.linkSuboptionMenu)}`;
            const existeEnBase = baseArray.some(baseItem => {
              const baseKey = `${baseItem.optionMenu.trim()}|${urlPath(baseItem.linkOptionMenu)}|${baseItem.subOptionMenu.trim()}|${urlPath(baseItem.linkSuboptionMenu)}`;
              return baseKey === compareKey;
            });
            if (!existeEnBase) {
              extrasEnCompare.push(compareItem);
            }
          });
          const matchesTotal = (matchesCount - extrasEnCompare.length);
          const porcentaje = ((matchesTotal / baseArray.length) * 100).toFixed(2) + "%";
          menuResults.push({
            baseUrl: basePageUrl,
            url,
            porcentajeCoincidencia: porcentaje,
            faltantesEnBase,
            extrasEnCompare,
            mensajeMenu: "Comparación de Menus realizada"
          });
        }
        return menuResults;
        
      } catch (error) {
        console.error("❌ Error en la comparación de arrays:", error);
        
      }

    }
      
    async function urlPath(url) {
          try {
            return new URL(url.trim()).pathname;
        } catch {
            return url?.trim() || "";
        }
    }

    async function contarUrls(data) {
        try {
            const contador = {};

            for (const item of data) {
            
                const url = item.url ? item.url.trim() : 'URL vacía';
                if (!contador[url]) {
                    contador[url] = 0;
                }
                contador[url]++;
            }
            // Convertir objeto en array de objetos { url, Total }
            const total = Object.keys(contador).map(url => ({
                url,
                Total: contador[url]
            }));
            return total;

        } catch (error) {
            console.error("❌ Error al contar URLs:", error);
            return [];
            
        }
    }   

    async function saveExcels(menuResults, visualResults, filePath) {
      try {
        const workbook = new ExcelJS.Workbook();
        // Hoja Comparaciones de Menú
        const sheetMenu = workbook.addWorksheet("Comparaciones Menu");
        sheetMenu.columns = [
          { header: "Página Base", key: "baseUrl", width: 40 },
          { header: "URL Comparada", key: "url", width: 50 },
          { header: "Similitud en Menu (%)", key: "porcentajeCoincidencia", width: 30 },
          { header: "Observaciones Menu", key: "mensajeMenu", width: 60 },
        ];
        menuResults.forEach((r) => sheetMenu.addRow(r));

        // Hoja Comparaciones Visuales
        const sheetVisual = workbook.addWorksheet("Comparaciones Visuales");
        sheetVisual.columns = [
          { header: "Página Base", key: "baseUrl", width: 60 },
          { header: "URL Comparada", key: "url", width: 60 },
          //{ header: "Opción Menu", key: "optionMenu", width: 30 },
          //{ header: "Subopción Menu", key: "subOptionMenu", width: 30 },
          { header: "Similitud Visual (%)", key: "visualSimilarity", width: 20 },
          { header: "Observaciones Visual", key: "visualMensaje", width: 60 },
          { header: "Nombre de Imagen de Diferencias", key: "nameImgDiff", width: 50 },
          
        ];
        visualResults.forEach((v) => sheetVisual.addRow(v));

        await workbook.xlsx.writeFile(filePath);
        console.log("✅ Comparaciones guardadas en Excel:", filePath);
      } catch (error) {
        console.error("❌ Error al guardar Excel:", error);
      }
    }

    async function visualTest(arrayBase, arrayCompare) {
      try {
        let index = 0;
        const TotalUrls_Compare = await contarUrls(optionsMenuToCompare);   
        const agrupados = await groupBySite(arrayCompare);
        for (const [url, grupo] of Object.entries(agrupados)) {
          let totalSimilitud = 0;
          let totalComparaciones = 0;
          let folderSlug = new URL(url).hostname.replace(/\./g, "_");
          let urlBase = new URL(basePageUrl).hostname.replace(/\./g, "_");
          let currentDir = path.join(RESULT_DIR, `${String(index + 1).padStart(2, '0')}_${folderSlug}`);
          let screenshotDir = path.join(currentDir, "Capturas_Pantalla");
          let diffDir = path.join(currentDir, "Errores_Visuales");
          await folders(currentDir);
          await folders(screenshotDir);
          await folders(diffDir);
          if (grupo.length === 1) {
            visualResults.push({
              baseUrl: basePageUrl,
              url,
              optionMenu: '',
              subOptionMenu: '',
              visualSimilarity: "0%",
              nameImgDiff: "",
              visualMensaje: "Sitio con diferente estructura en el Menu Principal o Sitio caído"
              });
            console.log(`❌ Sitio con diferente estructura en el Menu Principal o Sitio caído -> ${url}`);
            console.log("════════════════════════════════════════════════════════════");
            index++;
            continue;
          }
          console.log(`-------------------------------------------------------`);
          console.log(`🔍 Realizando prueba visual Home de los sitios...`);
          console.log(`⚙️-🔢 Validando Visual del sitio a comparar ${index + 1} de ${TotalUrls_Compare.length} `);
          console.log(`url del sitio a comparar -> ${url}`);
          console.log("-------------------------------------------------------");
          //Captura de pantalla del home
          let pathBaseFileHome = path.join(screenshotDir, `Captura_HomeBase_${urlBase}.png`);
          let pathCompareFileHome = path.join(screenshotDir, `Captura_HomeComparativa_${folderSlug}.png`);
          let pathHomeFileDiff = path.join(diffDir, `Diferencia_Visual_Home_${folderSlug}.png`);

          await screenShot(driver, basePageUrl, pathBaseFileHome);
          await screenShot(driver, url, pathCompareFileHome);

          let homeSimilarity = await compareVisualTesting(pathBaseFileHome, pathCompareFileHome, pathHomeFileDiff);
          visualResults.push({
            baseUrl: basePageUrl,
            url,
            optionMenu: '',
            subOptionMenu: '',
            visualSimilarity: homeSimilarity,
            nameImgDiff: path.basename(pathHomeFileDiff),
            visualMensaje: "Comparación visual de Home realizada"
          });
          totalSimilitud += parseFloat(homeSimilarity);
          totalComparaciones++;
          //Captura y comparación de los menus
          console.log(`🔍 Realizando prueba visual del Menu de los sitios...`);
          for (const baseItem of arrayBase) {
            const baseKey = `${baseItem.optionMenu.trim()}|${urlPath(baseItem.linkOptionMenu)}|${baseItem.subOptionMenu.trim()}|${urlPath(baseItem.linkSuboptionMenu)}`;
          
            const compareItem = grupo.find(compareItem => {
              const compareKey = `${compareItem.optionMenu.trim()}|${urlPath(compareItem.linkOptionMenu)}|${compareItem.subOptionMenu.trim()}|${urlPath(compareItem.linkSuboptionMenu)}`;
              return baseKey === compareKey;
            });

            if (!compareItem) continue;

            if (!baseItem.linkOptionMenu && !compareItem.linkOptionMenu) {
              //! Captura de pantalla de la Sub opción del menu
              console.log(`Capturando pantalla de la opción del menu -> ${baseItem.optionMenu.trim()} - ${baseItem.subOptionMenu.trim()}`);
              let pathBaseSubOptionMenu = path.join(screenshotDir, `Captura_SubMenu_${sanitizeFileName(baseItem.subOptionMenu.trim())}_Base.png`);
              let pathCompareSubOptionMenu = path.join(screenshotDir, `Captura_SubMenu_${sanitizeFileName(compareItem.subOptionMenu.trim())}_Comparativa.png`);
              let pathSubOptionFileDiff = path.join(diffDir, `Diferencia_Subopcion_${sanitizeFileName(baseItem.subOptionMenu.trim())}.png`); 
              
              if (baseItem.linkSuboptionMenu.includes("#") && compareItem.linkSuboptionMenu.includes("#")) {
                let urlCorrectSubOptionBase = await getUrlCorrect(baseItem.linkSuboptionMenu,baseItem.optionMenu.trim(),baseItem.subOptionMenu.trim());
                let urlCorrectSubOptionCompare = await getUrlCorrect(compareItem.linkSuboptionMenu, compareItem.optionMenu.trim(), compareItem.subOptionMenu.trim());

                await screenShot(driver, urlCorrectSubOptionBase, pathBaseSubOptionMenu);
                await screenShot(driver, urlCorrectSubOptionCompare, pathCompareSubOptionMenu);

                let subOptionSimilarity = await compareVisualTesting(pathBaseSubOptionMenu, pathCompareSubOptionMenu, pathSubOptionFileDiff);
                visualResults.push({
                  baseUrl: urlCorrectSubOptionBase,
                  url: urlCorrectSubOptionCompare,
                  optionMenu: compareItem.optionMenu.trim(),
                  subOptionMenu: compareItem.subOptionMenu.trim(),
                  visualSimilarity: subOptionSimilarity,
                  nameImgDiff: path.basename(pathSubOptionFileDiff),
                  visualMensaje: "Comparación visual de Subopción realizada"
                });
                totalSimilitud += parseFloat(subOptionSimilarity);
                totalComparaciones++;
                continue;
              }
              
              await screenShot(driver, baseItem.linkSuboptionMenu, pathBaseSubOptionMenu);
              await screenShot(driver, compareItem.linkSuboptionMenu, pathCompareSubOptionMenu);

              let subOptionSimilarity = await compareVisualTesting(pathBaseSubOptionMenu, pathCompareSubOptionMenu, pathSubOptionFileDiff);
              visualResults.push({
                baseUrl: baseItem.linkSuboptionMenu,
                url: compareItem.linkSuboptionMenu,
                optionMenu: compareItem.optionMenu.trim(),
                subOptionMenu: compareItem.subOptionMenu.trim(),
                visualSimilarity: subOptionSimilarity,
                nameImgDiff: path.basename(pathSubOptionFileDiff),
                visualMensaje: "Comparación visual de Subopción realizada"
              });
              totalSimilitud += parseFloat(subOptionSimilarity);
              totalComparaciones++;
              continue;
            } else {
               //! Captura de pantalla de la opción del menu
              console.log(` Capturando pantalla de la opción del menu: ${baseItem.optionMenu.trim()}`);
              let pathBaseOptionMenu = path.join(screenshotDir, `Captura_Menu_${sanitizeFileName(baseItem.optionMenu.trim())}_Base.png`);
              let pathCompareOptionMenu = path.join(screenshotDir, `Captura_Menu_${sanitizeFileName(compareItem.optionMenu.trim())}_Comparativa.png`);
              let pathMenuFileDiff = path.join(diffDir, `Diferencia_Menu_${sanitizeFileName(baseItem.optionMenu.trim())}.png`);

              if (baseItem.linkOptionMenu.includes("#") && compareItem.linkOptionMenu.includes("#")) {
                let urlCorrectOptionBase = await getUrlCorrect(baseItem.linkOptionMenu, baseItem.optionMenu.trim(), baseItem.subOptionMenu.trim());
                let urlCorrectOptionCompare = await getUrlCorrect(compareItem.linkOptionMenu, compareItem.optionMenu.trim(), compareItem.subOptionMenu.trim());

                await screenShot(driver, urlCorrectOptionBase, pathBaseOptionMenu);
                await screenShot(driver, urlCorrectOptionCompare, pathCompareOptionMenu);

                let menuSimilarity = await compareVisualTesting(pathBaseOptionMenu, pathCompareOptionMenu, pathMenuFileDiff);
                visualResults.push({
                  baseUrl: urlCorrectOptionBase,
                  url: urlCorrectOptionCompare,
                  optionMenu: compareItem.optionMenu.trim(),
                  subOptionMenu: compareItem.subOptionMenu.trim(),
                  visualSimilarity: menuSimilarity,
                  nameImgDiff: path.basename(pathMenuFileDiff),
                  visualMensaje: "Comparación visual de Menú realizada"
                });
                totalSimilitud += parseFloat(menuSimilarity);
                totalComparaciones++;
                continue;
              }

              await screenShot(driver, baseItem.linkOptionMenu, pathBaseOptionMenu);
              await screenShot(driver, compareItem.linkOptionMenu, pathCompareOptionMenu);

              let menuSimilarity = await compareVisualTesting(pathBaseOptionMenu, pathCompareOptionMenu, pathMenuFileDiff);
              visualResults.push({
                baseUrl: baseItem.linkOptionMenu,
                url: compareItem.linkOptionMenu,
                optionMenu: compareItem.optionMenu.trim(),
                subOptionMenu: compareItem.subOptionMenu.trim(),
                visualSimilarity: menuSimilarity,
                nameImgDiff: path.basename(pathMenuFileDiff),
                visualMensaje: "Comparación visual de Menú realizada"
              });
              totalSimilitud += parseFloat(menuSimilarity);
              totalComparaciones++;
              continue;
            }
          }
          if (totalComparaciones > 0) {
            let averageSimilarity = (totalSimilitud / totalComparaciones).toFixed(2);
            console.log(`📊 Similitud promedio visual para ${url}: ${averageSimilarity}%`);
            console.log("════════════════════════════════════════════════════════════");
            visualResults.push({
              baseUrl: basePageUrl,
              url,
              optionMenu: '',
              subOptionMenu: '',
              visualSimilarity: averageSimilarity,
              nameImgDiff: '',
              visualMensaje: "Similitud total promedio de todas las vistas del sitio"
            });
          } else {
            console.log(`❌ No se encontraron comparaciones visuales para ${url}`);
          }
          index++;   
        }        
      } catch (error) {
        console.error("❌ Error en la prueba visual:", error);
        }
    }

    async function screenShot(driver, url, filePath) {
      try {
        await driver.get(url.trim());
        await delay(1500);
        const totalheight = await driver.executeScript(`return document.body.scrollHeight`);
        await driver.manage().window().setRect({ width: 1920, height: totalheight });
        //await delay(1500);

        /*await driver.executeScript(`
          return new Promise(resolve => {
            let totalHeight = document.body.scrollHeight;
            window.scrollTo(0, 0);
            let currentY = 0;
            let interval = setInterval(() => {
              window.scrollBy(0, 500);
              currentY += 500;
              if (currentY >= totalHeight) {
                clearInterval(interval);
                resolve();
              }
            }, 100);
          });
        `);*/
        await delay(1000);
        const image = await driver.takeScreenshot();
        fs.writeFileSync(filePath, image, "base64");
      } catch (error) {
        console.error("❌ Error al tomar captura de pantalla:", error);
      }
    }
    
    async function compareVisualTesting(baseFile, compareFile, pathFileDiff) {
      try {
        return await new Promise((resolve) => {
          resemble(baseFile)
            .compareTo(compareFile)
            .ignoreNothing()
            .outputSettings({
              errorColor: { red: 255, green: 0, blue: 255 },
              errorType: "flat",
              transparency: 0.1,
              largeImageThreshold: 0,
              useCrossOrigin: false
            })
            .onComplete((data) => {
              const visualSimilarity = (100 - parseFloat(data.misMatchPercentage)).toFixed(2);
              const diffImage = data.getBuffer();
              fs.writeFileSync(pathFileDiff, diffImage);

              console.log(`💾 🖼️  Imagen de diferencias guardada en: ${pathFileDiff}`);
              console.log(`🎯 👀  Similitud visual: ${visualSimilarity}%`);
              console.log("------------------------------------------------");
              //console.log(`🔗 Finalizó comparación para: ${currentUrl}`);
              //console.log("═══════════════════════════════════════════════════════════════\n");
              resolve(visualSimilarity);
            });
        });
      } catch (error) {
        console.error("❌ Error al comparar visualmente:", error);
        return "Error al comparar";
      }
    }
  
    function sanitizeFileName(name) {
      return name.replace(/[^a-z0-9]/gi, "_");
    }

    async function getUrlCorrect(url,opcionPrincipalMenu,opcionSubMenu) {
      try {
        await driver.get(url);
        await delay(2500);
        const menu = await findItem(classPrincipalMenu,`class`,url);
        const opcionesPrincipales = await menu.findElements(By.className(classItemsMenu));
        const linksPrincipales = await menu.findElements(By.className(classLinkOpcionMenu));
        await listLinksMenu(linksPrincipales,opcionesPrincipales,url);

        for (let i = 0; i < linksPrincipales.length; i++) {
          let linkPrincipal = linksPrincipales[i];
          let linkPrincipalclasses = await linkPrincipal.getAttribute('class');
          //let linkPrincipalhref = await linkPrincipal.getAttribute('href');
          let LinkPrincipalText = (await linkPrincipal.getText()).trim();

          if (!opcionSubMenu) {
            //!! Proceso para obtener link real de opción principal
            if(opcionPrincipalMenu === LinkPrincipalText){
              await linkPrincipal.click();
              await driver.wait( async () => {
                const urlNew = await driver.getCurrentUrl();
                return urlNew !== url;
              },5000);

              const urlCorrect = await driver.getCurrentUrl();
              console.log('📍 Nueva URL Del Menu Principal:', urlCorrect);
              return urlCorrect;
            }
            continue;
          }else{
            //!! Proceso para obtener link real de una subopcion 
            if(linkPrincipalclasses.includes('dropdown')){
              await linkPrincipal.click();
              let subOptions = await opcionesPrincipales[i].findElements(By.className(classDropdownItems));
              //console.log(`La Opcion #${i +1}  Tiene ${subOptions.length} subopciones:`);
              for (let j = 0; j < subOptions.length; j++) {
                let subOption = subOptions[j];

                if (subOption) {
                  try {
                    let subOptionText = (await subOption.getText()).trim();
                    if(opcionPrincipalMenu === LinkPrincipalText  && opcionSubMenu === subOptionText ){
                      await subOption.click();
                      await driver.wait( async () => {
                        const urlNew = await driver.getCurrentUrl();
                        return urlNew !== url;
                      },5000);

                      const urlCorrect = await driver.getCurrentUrl();
                      console.log('📍 Nueva URL de SubOpcion Menu:', urlCorrect);
                      return urlCorrect;
                    }
                    continue;  
                  } catch (error) {
                      console.error(`    - Error obteniendo la Nueva url de subopción ${opcionPrincipalMenu} - ${opcionSubMenu} :`, err.message);
                  }
                }
              }
            }
          }
        }   
      } catch (error) {
        console.error("❌ Error en getUrlCorrect:", error);
        
      }
    }
    
  } catch (error) {
    console.error("❌ Error en el proceso:", error);
    await driver.quit();
  }
})();

