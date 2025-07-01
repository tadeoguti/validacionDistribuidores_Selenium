const { Builder, By, until } = require("selenium-webdriver");
const firefox = require("selenium-webdriver/firefox");
const fs = require('fs');

(async function main() {
    //Configuración del navegador y driver General para que cada función tenga acceso
    console.log(`⚙️ 🌐  Configurando navegador firefox en modo headless...`);
    //console.log(`⚙️ 🌐  Configurando navegador firefox en modo visual...`);

    //Configurar el navegador de manera oculta
    let options = new firefox.Options();
    options.addArguments("-headless");
    const driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).build();
    //abrir el navegador visualmente
    //const driver = await new Builder().forBrowser("firefox").build();

    // Página base para comparar
    const basePageUrl = "https://demo.liv61.netcar.com.mx/"; 
    
    //Identificar clase del menu general del Sitio Base
    const classPrincipalMenu = "navbar-nav";
    //Identificar las opciones del menu
    const classItemsMenu = "nav-item"; //los items totales
    const classDropdownItems = "dropdown-item";
    //Identificar el area donde esta la accioon de redireccionamiento
    const classLinkOpcionMenu = "nav-link";
    //identificar el texto de la opcion del Menu principal
    const classTextoOpcionMenu = "link-text"; // Este me servira
    //Identificar las opciones del subMenu (Propietarios)
    const classListPropietarios = "list-sub";

    // Listado de URLs a comparar
    const urlsToCompare = [
    "https://lincolnsurmanbc.mx",
    "https://lincolncancun.mx",
    "https://lincolnpasacondesa.mx",
    "https://lincolncountryaguascalientes.mx",
    "https://lincolncountryguadalajara.mx",
    "https://demo.lincolncountryqueretaro.netcar.com.mx",
    "https://lincolndisauto.mx",
    "https://lincolnprodauto.mx",
    "https://lincolnhermosillo.mx",
    "https://lincolnleyenda.mx",
    "https://lincolninterlomasgp.mx",
    "https://lincolnlaguna.mx",
    "https://lincolnleon.mx",
    "https://lincolnmty.mx",
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
    const optionsMenuBase = [],optionsMenuToCompare = [], results = [];

    console.log("═══════════════════════════════════════");
    await delay(2000);

    console.log(`Validación del Link Base: ${basePageUrl}`);
    //Obtener El menu, opciones y links del sitio base.
    await processMainMenuItems(classPrincipalMenu,`class`,basePageUrl);
    console.log("═══════════════════════════════════════");
    console.log(`Validación de los Links a Comparar: `);
    //Obtener el menu, opciones y links de los sitios a comparar
    await checkUrlsToCompare(classPrincipalMenu,`class`,urlsToCompare);

    console.log("═══════════════════════════════════════");
    console.log(`Guardando en .json los arreglos SitioBase y SitioToCompare...`);
    //console.log(optionsMenuBase);
    //let groupedMenuBase = await groupBySite(optionsMenuBase);
    await saveArray(optionsMenuBase,`SitioBase`);
    //await saveArray(groupedMenuBase,`SitioBase2`);
    console.log(` `);
    //console.log(`Agrupando resultados del sitio a comparar...`);
    let groupedMenuToCompare = await groupBySite(optionsMenuToCompare);
    await saveArray(groupedMenuToCompare,`SitioToCompare-Agrupado`);
    await saveArray(optionsMenuToCompare,`SitioToCompare`);
    console.log("═══════════════════════════════════════");
    console.log(`Total de registros del Sitio Base: ${optionsMenuBase.length}`);
    console.log(`Total de registros del Sitio a Comparar: ${optionsMenuToCompare.length}`);
    console.log("═══════════════════════════════════════");

    console.log(`Comparando los Menus...`);
    //let compareResults = await compareArrays(groupedMenuBase, groupedMenuToCompare);
    //let compareResults = await compareArrays(optionsMenuBase, optionsMenuToCompare);

    console.log("═══════════════════════════════════════");
    console.log(`Resultados de la comparación:`);
    //console.log(compareResults);
   /* if (compareResults && compareResults.length > 0) {
        await saveArray(compareResults, `ResultadosComparacion`);
        console.log("✅ Resultados guardados en ResultadosComparacion.json");
    } else {
        console.warn("⚠️ No hay resultados para guardar");
    }*/
    //await saveArray(compareResults,`ResultadosComparacion`);    

    console.log("═══════════════════════════════════════");
    console.log("");
    const TotalUrls_Base = await contarUrls(optionsMenuBase);
    const TotalUrls_Compare = await contarUrls(optionsMenuToCompare);    
    console.log(`Total de URLs en el Sitio Base: ${TotalUrls_Base.length}`);
    console.log(TotalUrls_Base);
    console.log(`Total de URLs en el Sitio a Comparar: ${TotalUrls_Compare.length}`);
    console.log(TotalUrls_Compare);


    console.log("═══════════════════════════════════════");

    await closeNavegador();
    
  /*
  Funcion para hacer tiempos de espera
 */
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
        console.error(`❌ Error al encontrar el elemento ${item} (${tipo}):`,error.message);
        //Guardar datos al array que corresponde  
        if (url === basePageUrl) {
            //Guardado de las opciones del Menu de Sitio Base                                
            optionsMenuBase.push({
                url: url,
                optionMenu:  `Menu Principal de este sitio No Coincide con lo introducido `,
                linkOptionMenu: ``,
                subOptionMenu: ``,
                linkSuboptionMenu: ``,
            });
        }else {
            //Guardado de las opciones del Menu del sitio a Comparar 
            optionsMenuToCompare.push({
                url: url,
                optionMenu:  `Menu Principal de este sitio No Coincide con el sitio Base`,
                linkOptionMenu: ``,
                subOptionMenu: ``,
                linkSuboptionMenu: ``,
            });
        }  
        return null;
    }
  }

  async function processMainMenuItems(item, type, url) {
      try {
        await driver.get(url);
        await delay(5000);
        console.log("- Validando el Menu Principal - ");
        let menu = await findItem(item,type,url);
        if (menu !== null) {
            let opcionesPrincipales = await menu.findElements(By.className(classItemsMenu));
            let linksPrincipales = await menu.findElements(By.className(classLinkOpcionMenu));
            
            await listLinksMenu(linksPrincipales,opcionesPrincipales,url);
        }else{
            console.log(`❌❌El MENU PRINCIPAL NO HACE MATCH CON LA CLASE DEL SITIO BASE - Menu= ${menu}`);    
        }
        
      } catch (error) {
        console.log("❌Error al Identificar el Menu: ", error);
      }
    }

    async function listLinksMenu(linksPrincipales,opcionesPrincipales,url) {
        try {
            console.log(`Listado de Opciones Principales del menu: `); 
            for (let i = 0; i < linksPrincipales.length; i++) {
                let linkPrincipal = linksPrincipales[i];
                let linkPrincipalclasses = await linkPrincipal.getAttribute('class');
                let linkPrincipalhref = await linkPrincipal.getAttribute('href');
                let LinkPrincipalText = (await linkPrincipal.getText()).trim();
                
                console.log(` # ${i + 1} - ${LinkPrincipalText} y href: ${linkPrincipalhref}`);
                //console.log(`Clases del elemento ${i + 1}: ${linkPrincipalclasses}`);

                if(linkPrincipalclasses.includes('dropdown')){
                    //console.log(`Opción #${i + 1} es un dropdown`);
                    await linkPrincipal.click();
                    
                    let subOptions = await opcionesPrincipales[i].findElements(By.className(classDropdownItems));
                    console.log(`La Opcion #${i +1}  Tiene ${subOptions.length} subopciones:`);

                    for (let j = 0; j < subOptions.length; j++) {
                        let subOption = subOptions[j];

                        if (subOption) {
                            try {
                                let subOptionText = (await subOption.getText()).trim();
                                let subOptionLink = await subOption.getAttribute('href');
                                console.log(` ${j+1}- ${subOptionText || '[Texto vacío]'} -> ${subOptionLink}`);
                                console.log(` `); 
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
                                console.log(`✅ SubOpcion #${j + 1} -> OK ✅`);
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
                    console.log(`✅ Opcion #${i + 1} -> OK ✅`);
                    console.log(` `);
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
            console.log(`Revisión de diferencias en los menus`);
            for (let i = 0; i < urls.length; i++) {
                let currentUrl = urls[i];
                console.log("═══════════════════════════════════════");
                console.log(`⚙️-🔢 Comparación ${i + 1} de total ${urls.length} `);
                console.log(`url del sitio a comparar -> ${currentUrl}`);
                //Obtener el menu del sitio a comparar 
                await processMainMenuItems(item,type,currentUrl);   
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
                const sitio = item.url.trim(); 
                if (!acc[sitio]) {
                    acc[sitio] = [];
                }
                acc[sitio].push(item);
                return acc;
            }, {});
        } catch (error) {
            console.error("❌ Error al agrupar por sitio:", error);
            return {};
        }
     
    }

    async function extractPath(url) {
        try {
            const urlObj = new URL(url.trim());
            return urlObj.pathname;
        } catch (e) {
            console.error("❌ Error al extraer el path de la URL:", e);
            // Si ocurre un error, retornar la URL original
            return url.trim();
        }        
    }

    async function compareItems(base, compare) {
        try {
            let matches = 0;
            const expectedFields = 4;

            if (base.optionMenu.trim() === compare.optionMenu.trim()) matches++;
            if (extractPath(base.linkOptionMenu) === extractPath(compare.linkOptionMenu)) matches++;
            if (base.subOptionMenu.trim() === compare.subOptionMenu.trim()) matches++;
            if (extractPath(base.linkSuboptionMenu) === extractPath(compare.linkSuboptionMenu)) matches++;

            const matchRate = ((matches / expectedFields) * 100).toFixed(2);

            return {
                url_compare: compare.url,
                matches,
                porcentaje: `${matchRate}%`,
                detalle: {
                    optionMenu: base.optionMenu === compare.optionMenu,
                    linkOptionMenu: extractPath(base.linkOptionMenu) === extractPath(compare.linkOptionMenu),
                    subOptionMenu: base.subOptionMenu.trim() === compare.subOptionMenu.trim(),
                    linkSuboptionMenu: extractPath(base.linkSuboptionMenu) === extractPath(compare.linkSuboptionMenu)
                }
            };
        } catch (error) {
            console.error("❌ Error al comparar registros:", error);
            return false;
        }
    }

   /* async function compareArrays(baseArray, compareArray) {
        try {
            for (let i = 0; i < baseArray.length; i++) {
                const itemBase = baseArray[i];
                const itemCompare = compareArray[i];

                if(!itemCompare) {
                    console.log(`❌ No se encontró el elemento de comparación para el índice ${i}`);
                    results.push({
                        indice: i,
                        url_compare: itemCompare.url,
                        matches: 0,
                        porcentaje: "0%",
                        detalle: {
                            optionMenu: false,
                            linkOptionMenu: false,
                            subOptionMenu: false,
                            linkSuboptionMenu: false
                        }
                    });
                    continue;
                }
                const result = compareItems(itemBase, itemCompare);
                results.push({
                    indice: i,
                    url_compare: itemCompare.url,
                    matches: result.matches,
                    porcentaje: result.porcentaje,
                    detalle: result.detalle
                });
            }
            //return results;
            return {
                resultadosPorRegistro: results,
                totalComparaciones: results.length
            };
        } catch (error) {
            console.error("❌ Error al comparar arreglos:", error);
        }
    }*/
   
    async function compareArrays(baseArray, compareArray) {
        try {
            const totalurl_Base = await contarUrls(baseArray);
            const totalurl_Compare = await contarUrls(compareArray);

            for (let i = 0; i < totalurl_Compare.length; i++) {                
                
                for (let j = 0; j < baseArray.length; j++) {
                    let itemBase = baseArrayrray[j];
                    let itemCompare = compareArray[j];
                    
                }
            }
            
        } catch (error) {
            console.error("❌ Error al comparar arreglos:", error);
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
        

})();
