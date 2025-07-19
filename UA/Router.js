/**
 * SPA Router v1.0.1
 * -----------------
 * Легкий роутер для односторінкових застосунків з підтримкою:
 * - History та hash режимів
 * - Параметрів маршруту та query-параметрів
 * - Делегування посилань та збереження прокрутки
 *
 * Використання:
 *   Router.config({ mode: 'history', root: '/' }).listen().delegateLinks();
 *
 * Автор: Rozenrod (https://github.com/rozenrod)
 * Ліцензія: MIT
 */

const Router = {
    routes: [], // Список маршрутів (шаблон + обробник)
    mode: 'history', // Режим: 'history' або 'hash'
    root: '/', // Корінь додатку

    // Налаштування роутера
    config({ mode = 'hash', root = '/' } = {}) {
        const cleanRoot = '/' + this.clearSlashes(root) + '/';
        // Якщо браузер підтримує history API та mode === 'history' — використовуємо його
        this.mode = (mode === 'history' && history.pushState) ? 'history' : 'hash';
        // Захист від абсолютних URL (наприклад, http://...)
        this.root = cleanRoot.startsWith('http') ? '/' : cleanRoot;
        return this;
    },

    // Прибирає слеші на початку та в кінці шляху
    clearSlashes(path) {
        return path.toString().replace(/^\/+|\/+$/g, '');
    },

    // Отримує поточний фрагмент (частину URL після root або після #)
    getFragment() {
        let fragment = '';
        if (this.mode === 'history') {
            fragment = decodeURI(location.pathname + location.search);
            fragment = fragment.replace(this.root, '').split('?')[0];
        } else {
            fragment = location.hash.slice(1).split('?')[0];
        }
        return this.clearSlashes(fragment);
    },

    // Отримує query-параметри з URL
    getParams() {
        let query = this.mode === 'history' ? location.search : location.hash.split('?')[1] || '';
        const params = {};
        new URLSearchParams(query).forEach((v, k) => params[k] = v);
        return params;
    },

    // Додає новий маршрут
    add(re, handler, options) {
        if (typeof re === 'function') {
            handler = re;
            re = '';
        }
        this.routes.push({ re, handler, options });
        return this;
    },

    // Видаляє маршрут за функцією або шаблоном
    remove(param) {
        this.routes = this.routes.filter(r =>
            r.handler !== param && r.re.toString() !== param.toString()
        );
        return this;
    },

    // Очищує усі маршрути та скидає режим
    flush() {
        this.routes = [];
        this.mode = 'hash';
        this.root = '/';
        return this;
    },

    // Перевіряє фрагмент та викликає відповідний обробник маршруту
    check(fragment = this.getFragment()) {
        const query = this.getParams();
        for (const { re, handler } of this.routes) {
            const match = (fragment || 'home').match(re);
            if (match) {
                handler.apply({ query }, match.slice(1));

                // Прокрутка до елемента з id, якщо є #hash
                if (location.hash.length > 1) {
                    const el = document.getElementById(location.hash.slice(1));
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                }

                return this;
            }
        }
        return this;
    },

    // Слухає зміни URL
    listen() {
        const onChange = (e) => {
            this.check();

            // Витягуємо позицію прокрутки зі стану історії
            const pos = e?.state?.scroll;
            if (pos) {
                setTimeout(() => {
                    window.scrollTo(pos.x, pos.y);
                }, 50);
            }
        };
        if (this.mode === 'history') {
            window.addEventListener('popstate', onChange);
        } else {
            window.addEventListener('hashchange', onChange);
        }
        return this;
    },

    // Делегування кліків по посиланнях з data-route
    delegateLinks() {
        window.addEventListener('click', (e) => {
            const target = e.target.closest('[data-route]');
            if (!target || !target.href) return;

            const path = target.href.replace(location.origin, '');
            if (path === this.getFragment()) return;

            e.preventDefault();
            this.navigate(path); // Викликає навігацію без перезавантаження сторінки
        });
        return this;
    },

    // Навігація до нового шляху (push або replace)
    navigate(path = '', push = true) {
        const scroll = { x: window.scrollX, y: window.scrollY };
        history.replaceState({ scroll }, '', location.href);

        if (this.mode === 'history') {
            const url = new URL(path, location.origin);
            const relativePath = url.pathname + url.search + url.hash;
            history[push ? 'pushState' : 'replaceState']({}, '', relativePath);
        } else {
            location.hash = this.clearSlashes(path);
        }

        if(push == true) {
            window.scrollTo(0, 0); // Скидуємо прокрутку при переході
            this.check();
        }
        return this;
    },

    // Оновлює query-параметр у поточному URL
    update(key, value) {
        const params = new URLSearchParams(location.search);
        params.set(key, value);
        const newUrl = location.origin + location.pathname + '?' + params.toString();
        history.replaceState({ position: window.pageYOffset }, '', newUrl);
    }
};