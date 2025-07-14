[🇬🇧 English](README_EN.md) | [🇺🇦 Українська](README.md)

# 📘 SPA-Router
 🧭 Легкий SPA-роутер на JavaScript — без залежностей, з підтримкою history і hash режимів, параметрів маршруту, query-параметрів, збереження прокрутки та делегування посилань.

---

# 📦 Інструкція з використання SPA-роутера

Цей роутер підтримує два режими:  
- `history` — гарний для "чистих" URL (`/page/1`)  
- `hash` — працює навіть на статичних серверах без налаштування (`#/page/1`)



## 🔧 Ініціалізація

```js
Router.config({
  mode: 'history', // або 'hash'
  root: '/app/'    // якщо застосунок не в корені сайту
}).listen();
```



## ➡️ Налаштування маршрутів
Додавання:

```js
Router.add(/^$/, () => {
  console.log('Головна сторінка');
});

Router.add(/^about$/, () => {
  console.log('Про нас');
});

Router.add(/^user\/(\d+)$/, function(id) {
  console.log(`Профіль користувача з ID: ${id}`);
  console.log('Query:', this.query);
});
```

Видалення:

```js
Router.remove(/^about$/);
```

Скидання всіх маршрутів:

```js
Router.flush();
```

---

## 🧭 Навігація

```js
Router.navigate('about');          // Перейти до /about
Router.navigate('user/42?tab=1');  // Перейти до /user/42?tab=1
Router.navigate('home', false);    // Замінити історію, а не додавати новий запис
```

---

## 🔁 Делегування посилань

Працює з елементами типу:

```html
<a href="/about" data-route>Про нас</a>
```

Автоматично перехоплює клік і викликає `Router.navigate()`.

---

## 🔄 Прокрутка

- Позиція прокрутки зберігається при переходах (`history` mode)
- Якщо в URL є `#section`, буде прокрутка до відповідного елемента:

```html
<a href="/docs#section2" data-route>Секція 2</a>
```

---

## 📜 Підтримка scroll restoration

Під час навігації зберігається позиція прокрутки через `history.replaceState({ scroll })`.

---

## ⚙️ Отримання query-параметрів

```js
const params = Router.getParams(); // { tab: '1', sort: 'name' }
```

Усередині обробника:

```js
Router.add(/^page$/, function() {
  console.log(this.query); // Наприклад: { filter: 'active' }
});
```

---

## 🔼 Оновлення параметрів у URL

```js
Router.update('page', 2); // Змінить URL на ?page=2 без перезавантаження
```

---

##  ↩️ Скидання роутера

```js
Router.flush(); // Очищає маршрути, режим і root
```

---

## 🔍 Як працює `check()`

Метод `check()` — це ядро роутера. Він:

1. Отримує поточний шлях через `getFragment()`
2. Перевіряє його на відповідність кожному регулярному виразу маршруту
3. Якщо є збіг:
   - Викликає відповідний обробник
   - Передає йому параметри з URL (наприклад, ID)
   - Всередині обробника доступний `this.query` — об'єкт query-параметрів
4. Якщо є `#hash`, виконує прокрутку до елемента з відповідним `id`

```js
Router.check(); // вручну викликає перевірку маршруту
```

Цей метод викликається автоматично при переходах і зміні URL.

---

## ✅ Приклад повного використання

```js
Router.config({ mode: 'history', root: '/' }).listen();

Router
  .add(/^$/, () => app.innerHTML = '<h1>Головна</h1>')
  .add(/^about$/, () => app.innerHTML = '<h1>Про нас</h1>')
  .add(/^user\/(\d+)$/, function(id) {
    app.innerHTML = `<h1>Користувач #${id}</h1><p>Query: ${JSON.stringify(this.query)}</p>`;
  });
```

HTML:

```html
<nav>
  <a href="/" data-route>Головна</a>
  <a href="/about" data-route>Про нас</a>
  <a href="/user/10?tab=info" data-route>Користувач 10</a>
</nav>

<div id="app"></div>
```

---


## ⚠️ Зауваження

- У режимі `history` сервер має повертати `index.html` для будь-якого шляху (SPA fallback).
- Для `hash` режиму це не потрібно.
- Якщо `path === this.getFragment()` — перехід не виконується.

---

## 🛠 Режим fallback на сервері (наприклад, nginx)

```nginx
location / {
    try_files $uri /index.html;
}
```
