const mainMenu = document.getElementById("menu-main");
const fortressesMenu = document.getElementById("menu-fortresses");
const menuDescription = document.querySelector(".menu-description");
const MAIN_DESCRIPTION = "Choose a settlement type to generate:";
const FORTRESS_DESCRIPTION = "Choose the fortress type to generate:";

function showFortresses(visible) {
    mainMenu.classList.toggle("d-none", visible);
    fortressesMenu.classList.toggle("d-none", !visible);
    menuDescription.dataset.i18nKey = visible ? FORTRESS_DESCRIPTION : MAIN_DESCRIPTION;
    menuDescription.textContent = I18N.t(menuDescription.dataset.i18nKey);
}

menuDescription.dataset.i18nKey = MAIN_DESCRIPTION;

document.getElementById("fortresses-open").addEventListener("click", event => {
    event.preventDefault();
    showFortresses(true);
});
document.getElementById("fortresses-back").addEventListener("click", () => showFortresses(false));
