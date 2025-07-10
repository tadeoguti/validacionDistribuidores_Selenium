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
    "https://www.lincoln.mx/",
    "https://lincolncancun.mx",
    "https://lincolnpasacondesa.mx",
    "https://demo.lincolncountryqueretaro.netcar.com.mx",
    "https://lincolnmty.mx",
    /*"https://lincolncountryaguascalientes.mx",
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
    "https://lincolnzapatazonaesmeralda.mx/"*/
    ];
    const optionsMenuBase = [],optionsMenuToCompare = [], results = [],resultados = [] ;

    console.log("═══════════════════════════════════════");
    await delay(2000);

    console.log(`Validación del Link Base: ${basePageUrl}`);
    //Obtener El menu, opciones y links del sitio base.
    await processMainMenuItems(classPrincipalMenu,`class`,basePageUrl);
    console.log("═══════════════════════════════════════");
    console.log(`Validación de los Links a Comparar `);
    //Obtener el menu, opciones y links de los sitios a comparar
    await checkUrlsToCompare(classPrincipalMenu,`class`,urlsToCompare);

    console.log("═══════════════════════════════════════");
    console.log(`Guardando en .json los arreglos SitioBase y SitioToCompare...`);
    //console.log(optionsMenuBase);
    let groupedMenuBase = await groupBySite(optionsMenuBase);
    await saveArray(optionsMenuBase,`SitioBase`);
    await saveArray(groupedMenuBase,`SitioBase2`);
    console.log(` `);
    //console.log(`Agrupando resultados del sitio a comparar...`);
    let groupedMenuToCompare = await groupBySite(optionsMenuToCompare);
    await saveArray(optionsMenuToCompare,`SitioToCompare`);
    await saveArray(groupedMenuToCompare,`SitioToCompare-Agrupado`);
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
    console.log("Impresión de los arrays base y a comparar");
    console.log("");
    const TotalUrls_Base = await contarUrls(optionsMenuBase);
    const TotalUrls_Compare = await contarUrls(optionsMenuToCompare);    
    console.log(`Total de URLs en el Sitio Base y la cantidad de objetos en su menu: ${TotalUrls_Base.length}`);
    console.log(TotalUrls_Base);
    console.log("═══════════════════════════════════════");
    console.log(`Total de URLs Comparadas y la cantidad de objetos en su menu: ${TotalUrls_Compare.length}`);
    console.log(TotalUrls_Compare);

    console.log("═══════════════════════════════════════");
    console.log(`Total de Objetos en el menu del Sitio Base: ${TotalUrls_Base[0].Total}`);
    console.log(`${TotalUrls_Compare.length} URLs a comparar`);

    console.log("═══════════════════════════════════════");
    //console.log(`Comparando los objetos del menu del Sitio Base con los del Sitio a Comparar...`);
    //await compareObjects(groupedMenuBase, groupedMenuToCompare);
    console.log(`Comparando los Arrays del menu del Sitio Base con los del Sitio a Comparar...`);
    await compareArrays(optionsMenuBase, optionsMenuToCompare);

    console.log("═══════════════════════════════════════");
    console.log(`Total de Comparaciones realizadas: ${resultados.length}`);
    console.log("results: ", resultados);
    await saveArray(resultados, `ResultadosComparacionFinal`);
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
        console.error(`❌ Error al encontrar el elemento ${item} - (${tipo}) - ${url} :`,error.message);
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
                    optionMenu:  ``,
                    linkOptionMenu: ``,
                    subOptionMenu: ``,
                    linkSuboptionMenu: ``,
                });
            }
        }
        
      } catch (error) {
        console.log("❌Error al Identificar el Menu: Posible error Sitio Caido");
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
                optionMenu:  ``,
                linkOptionMenu: ``,
                subOptionMenu: ``,
                linkSuboptionMenu: ``,
            });
        }
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
                               // console.log(`✅ SubOpcion #${j + 1} -> OK ✅`);
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
            console.log(`Obtener los menus de los sitios a comparar...`);
            for (let i = 0; i < urls.length; i++) {
                let currentUrl = urls[i];
                console.log("═══════════════════════════════════════");
                console.log(`⚙️-🔢 Revisión del menu del sitio a comparar ${i + 1} de ${urls.length} `);
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
        const agrupados = await groupBySite(compareArray);

        for (const [url, grupo] of Object.entries(agrupados)) {
            if (grupo.length === 1) {
            resultados.push({
                url,
                porcentajeCoincidencia: "0%",
                mensaje: "Solo un registro para esta URL - no se puede comparar",
                faltantesEnBase: baseArray,
                extrasEnCompare: grupo
            });
            continue;
            }

            let matchesCount = 0;
            const faltantesEnBase = [];
            const extrasEnCompare = [];
            console.log(`Comparando URL: ${url}`);
            console.log(`Total de registros a comparar: ${grupo.length}`);
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
            let matchesTotal= (matchesCount - extrasEnCompare.length);
            const porcentaje = ((matchesTotal / baseArray.length) * 100).toFixed(2) + "%";
                        
            resultados.push({
            url,
            porcentajeCoincidencia: porcentaje,
            faltantesEnBase,
            extrasEnCompare,
            mensaje: "Comparación realizada"
            });
        }

        return resultados;
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
        

})();
// Nota: Este código es un ejemplo y puede requerir ajustes según la estructura real de los sitios web y sus menús.