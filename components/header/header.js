window.SPECTACULAR_HEADER_COMPONENT = {
    render(container) {
        container.innerHTML = `
            <header class="site-header navbar navbar-expand-lg">
                <div class="container-fluid">
                    <a class="navbar-brand site-brand" href="index.html">
                        <span aria-hidden="true">🏰</span>
                        <span>Spectacular Settlements Generator</span>
                    </a>
                    <nav class="site-navigation nav nav-pills justify-content-center" aria-label="Main navigation" data-i18n-aria>
                        <a class="nav-link" href="index.html" data-i18n>Home</a>
                        <a class="nav-link" href="pages/capitals.html" data-i18n>Capitals</a>
                        <a class="nav-link" href="pages/cities.html" data-i18n>Cities</a>
                        <a class="nav-link" href="pages/towns.html" data-i18n>Towns</a>
                        <a class="nav-link" href="pages/villages.html" data-i18n>Villages</a>
                        <div class="dropdown">
                            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" data-i18n>Fortresses</a>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="pages/keep.html" data-i18n>Keep</a></li>
                                <li><a class="dropdown-item" href="pages/castle.html" data-i18n>Castle</a></li>
                                <li><a class="dropdown-item" href="pages/stronghold.html" data-i18n>Stronghold</a></li>
                            </ul>
                        </div>
                        <a class="nav-link" href="pages/trading-post.html" data-i18n>Trading Posts</a>
                        <a class="nav-link" href="pages/extras.html" data-i18n>Extras</a>
                        <a class="nav-link gcity-home-button" data-gcity-home data-i18n hidden>← Back to G-City</a>
                    </nav>
                </div>
            </header>`;

        return ["js/i18n.js", "js/lang/pt-book.js"];
    }
};
