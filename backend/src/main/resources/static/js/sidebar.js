// Sidebar loader (existing)
(async () => {
    try {
        const resp = await fetch('/sidebar.html');
        if (!resp.ok) return; // fallback: keep existing sidebar
        const html = await resp.text();
        if (!html) return; // empty response, fallback
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newNav = doc.querySelector('nav.sidebar');
        if (!newNav) return; // no sidebar markup, fallback
        const oldNav = document.querySelector('nav.sidebar');
        if (!oldNav) return; // nothing to replace, abort
        // Replace old sidebar with fetched one
        oldNav.replaceWith(newNav);
        // Highlight active link based on current pathname
        const currentPath = location.pathname;
        newNav.querySelectorAll('a').forEach(link => {
            // Normalize href (may be absolute or relative)
            const linkHref = new URL(link.getAttribute('href'), location.origin).pathname;
            link.classList.toggle('active', linkHref === currentPath);
        });
    } catch (e) {
        // any error -> keep existing sidebar silently
        console.error('Sidebar loader error:', e);
    }
})();

// --- SPA Router (Phase 1) ---
const routeMap = new Map([
    ['/', 'index.js'],
    ['/index.html', 'index.js'],
    ['/topology.html', 'topology.js'],
    ['/framing.html', 'framing.js'],
    ['/character-stuffing.html', 'characterStuffing.js'],
    ['/bit-stuffing.html', 'bitStuffing.js'],
    ['/crc.html', 'crc.js'],
    ['/encryption.html', 'encryption.js'],
    ['/arq.html', 'arq.js'],
    ['/sliding-window.html', 'slidingWindow.js'],
    ['/go-back-n.html', 'goBackN.js'],
    ['/dijkstra.html', 'dijkstra.js'],
    ['/routing.html', 'routing.js'],
    ['/transport.html', 'transport.js'],
    ['/distance-vector.html', 'distanceVector.js'],
    ['/tcp.html', 'tcp.js'],
    ['/udp.html', 'udp.js']
]);

let navigationToken = 0;
let currentModule = null;
let currentMain = null;

function resolveModuleUrl(moduleFile) {
    // sidebar.js resides in /js/, modules in /js/pages/
    return new URL(`../pages/${moduleFile}`, import.meta.url).href;
}

async function safeDestroy(mod) {
    if (mod && typeof mod.destroy === 'function') {
        try {
            await mod.destroy();
        } catch (e) {
            console.error('Error during destroy:', e);
        }
    }
}

async function navigateTo(path) {
    const thisToken = ++navigationToken;
    const moduleFile = routeMap.get(path);
    if (!moduleFile) {
        console.warn('No module mapped for path', path);
        return;
    }
    const moduleUrl = resolveModuleUrl(moduleFile);
    const newMod = await import(moduleUrl);
    const oldMod = currentModule;
    // Cleanup old module
    if (oldMod) {
        await safeDestroy(oldMod);
        // Re‑check token after awaiting cleanup
        if (navigationToken !== thisToken) {
            // Stale navigation – clean up its own new module and exit
            await safeDestroy(newMod);
            return;
        }
    }
    // Commit new module
    currentModule = newMod;
    const mainEl = document.getElementById('content');
    if (mainEl) {
        mainEl.innerHTML = '';
        if (typeof newMod.init === 'function') {
            await newMod.init(mainEl);
        }
    }
    // Update history and active link only if still latest
    if (navigationToken === thisToken) {
        history.pushState(null, '', path);
        const nav = document.querySelector('nav.sidebar');
        if (nav) {
            nav.querySelectorAll('a').forEach(a => {
                const href = new URL(a.getAttribute('href'), location.origin).pathname;
                a.classList.toggle('active', href === path);
            });
        }
    } else {
        // Stale after init – clean up new module
        await safeDestroy(newMod);
    }
}

// Expose for tests
window._sidebarNavigate = navigateTo;
