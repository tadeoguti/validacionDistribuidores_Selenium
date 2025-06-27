const { Builder, By, until } = require("selenium-webdriver");
const firefox = require("selenium-webdriver/firefox");

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
    "https://qa.liv61.netcar.com.mx/",
    "https://qa.distribuidores.liv61.netcar.com.mx/",
    "https://lincolnmty.mx/",
    "https://demo.liv61.netcar.com.mx/",
    "https://demo.distribuidores.liv61.netcar.com.mx/",
    "https://qa.ford-mx.netcar.com.mx/",
    "https://www.lincoln.mx/",
    ];
    const optionsMenuBase = [], menuLinksBase =[],optionsMenuToCompare = [], menuLinksToComapre =[] ;

    console.log("═══════════════════════════════════════");
    await delay(2000);
    
    const results = [];
    console.log(`Validación del Link Base: ${basePageUrl}`);
    await processMainMenuItems(basePageUrl);
    console.log(`🧪📋 Urls a Comparar: ${urlsToCompare.length}`);
    //await checkMenuDifferencesBetweenSites();

    console.log(`Imprimir menu base`);
    console.log(optionsMenuBase);
    

    
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
  async function processMainMenuItems(url) {
      try {
        await driver.get(url);
        await delay(2000);
        console.log("Validación del menu ");
        let menuPrincipal = await driver.findElement(By.className(classPrincipalMenu));
        let opcionesPrincipales = await menuPrincipal.findElements(By.className(classItemsMenu));
        let linksPrincipales = await menuPrincipal.findElements(By.className(classLinkOpcionMenu));
        
        
        //await listOptionsMenu(opcionesPrincipales);
        await listLinksMenu(linksPrincipales,opcionesPrincipales,url);
        

        await closeNavegador();

      } catch (error) {
        console.log("Error al Identificar el Menu: ", error);
        
      }
    }

    async function listOptionsMenu(opcionesPrincipales) {
        try {
            console.log(`Listado de Opciones Principales del menu:`);
            for (let i = 0; i < opcionesPrincipales.length; i++) {
                let optionPrincipal = opcionesPrincipales[i];
                let OptionPrincipalClasses = await optionPrincipal.getAttribute('class');
                let optionPrincipalText = (await optionPrincipal.getText()).trim();
                console.log(` # ${i + 1} - ${optionPrincipalText}`);
                
                console.log(`Clases del elemento ${i + 1}: ${OptionPrincipalClasses}`);

                if(OptionPrincipalClasses.includes('dropdown')){
                    console.log(`Opción #${i + 1} es un dropdown`);
                    await optionPrincipal.click();

                    let subOptions = await optionPrincipal.findElements(By.className(classDropdownItems));
                    console.log(`  Tiene ${subOptions.length} subopciones:`);

                    for (let j = 0; j < subOptions.length; j++) {
                        let subOption = subOptions[j];

                        if (subOption) {
                            try {
                                
                                let subOptionText = (await subOption.getText()).trim();
                                console.log(`    - ${subOptionText || '[Texto vacío]'}`);
                                console.log(` `);   
                            } catch (error) {
                                console.error(`    - Error obteniendo texto de subopción #${j + 1}:`, err.message);
                            }
                        }else {
                            console.log(`    - Subopción #${j + 1} es undefined`);
                        }
                    }
                    await optionPrincipal.click();
                }else {
                    console.log(`Opción #${i + 1} es una opción Simple`);
                    console.log(` `);
                }
            }
        } catch (error) {
            console.log('Error en listado de Opciones del Menu: ', error);
        }
    }

    async function listLinksMenu(linksPrincipales,opcionesPrincipales,url) {
        try {
            console.log(`Listado de Links Principales del menu:`); 
            for (let i = 0; i < linksPrincipales.length; i++) {
                let linkPrincipal = linksPrincipales[i];
                let linkPrincipalclasses = await linkPrincipal.getAttribute('class');
                let linkPrincipalhref = await linkPrincipal.getAttribute('href');
                let LinkPrincipalText = (await linkPrincipal.getText()).trim();
                
                console.log(` # ${i + 1} - ${LinkPrincipalText} y href: ${linkPrincipalhref}`);

                console.log(`Clases del elemento ${i + 1}: ${linkPrincipalclasses}`);

                if(linkPrincipalclasses.includes('dropdown')){
                    console.log(`Opción #${i + 1} es un dropdown`);
                    await linkPrincipal.click();
                    
                    let subOptions = await opcionesPrincipales[i].findElements(By.className(classDropdownItems));
                    console.log(`  Tiene ${subOptions.length} subopciones:`);

                    for (let j = 0; j < subOptions.length; j++) {
                        let subOption = subOptions[j];

                        if (subOption) {
                            try {
                                let subOptionText = (await subOption.getText()).trim();
                                let subOptionLink = await subOption.getAttribute('href');
                                console.log(`    - ${subOptionText || '[Texto vacío]'} -> ${subOptionLink}`);
                                console.log(` `);   
                                if (url === basePageUrl) {
                                    console.log(`Guardar opciones del menu de Sitio Base`);
                                    // Guardar Opciones Principales del Menu
                                    optionsMenuBase.push({
                                        optionMenu:  LinkPrincipalText,
                                        subOptionMenu: subOptionText,
                                        linkSuboptionMenu: subOptionLink
                                    });

                                }else {
                                    console.log(`Guardar opciones del menu de Sitio a Comparar`);

                                }  
                            } catch (error) {
                                console.error(`    - Error obteniendo texto de subopción #${j + 1}:`, err.message);
                            }
                        }else {
                            console.log(`    - Subopción #${j + 1} es undefined`);
                        }
                        
                        
                    }
                    await linkPrincipal.click();
                }else {
                    console.log(`Opción #${i + 1} es una opción Simple`);
                    console.log(` `);
                    if (url === basePageUrl) {
                        console.log(`Guardar opciones del menu de Sitio Base`);
                        // Guardar Opciones Principales del Menu
                        optionsMenuBase.push({
                            optionMenu:  LinkPrincipalText,
                            linkOptionMenu: linkPrincipalhref
                        });

                    }else {
                        console.log(`Guardar opciones del menu de Sitio a Comparar`);

                    }  
                }
               
                
            }

        } catch (error) {
            console.log('Error en listado de Links del Menu: ', error);
        }
        
    }
    async function checkMenuDifferencesBetweenSites() {
        try {
            console.log(`Revisión de diferencias en los menus`);
            for (let i = 0; i < urlsToCompare.length; i++) {
                let currentUrl = urlsToCompare[i];
                console.log("═══════════════════════════════════════");
                console.log(`⚙️-🔢 Comparación ${i + 1} de total ${urlsToCompare.length} `);
                


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
                optionsMenu.push({
                    baseUrl: basePageUrl,
                    url: currentUrl,
                    visualSimilarity,
                    nameImgDiff: `diff_${i + 1}.png`,
                });

   
            }

            
        } catch (error) {
            
        }
    }

})();
