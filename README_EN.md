[🇺🇦 Українська](README.md) | [🇬🇧 English](README-EN.md)

# 📘 SPA-Router  
🧭 Lightweight SPA router in JavaScript — no dependencies, supports history and hash modes, route parameters, query parameters, scroll restoration, and link delegation.

---

# 📦 SPA Router Usage Guide

This router supports two modes:  
- `history` — good for clean URLs (`/page/1`)  
- `hash` — works even on static servers without configuration (`#/page/1`)

---

## 🔧 Initialization

```js
Router.config({
  mode: 'history', // or 'hash'
  root: '/app/'    // if the app is not at the site root
}).listen();
```

---

## ➡️ Route Setup

Adding:

```js
Router.add(/^$/, () => {
  console.log('Home page');
});

Router.add(/^about$/, () => {
  console.log('About us');
});

Router.add(/^user\/(\\d+)$/, function(id) {
  console.log(`User profile with ID: ${id}`);
  console.log('Query:', this.query);
});
```

Removing:

```js
Router.remove(/^about$/);
```

Resetting all routes:

```js
Router.flush();
```

---

## 🧭 Navigation

```js
Router.navigate('about');          // Go to /about
Router.navigate('user/42?tab=1');  // Go to /user/42?tab=1
Router.navigate('home', false);    // Replace history instead of adding a new entry
```

---

## 🔁 Link Delegation

Works with elements like:

```html
<a href="/about" data-route>About us</a>
```

Automatically intercepts the click and calls `Router.navigate()`.

---

## 🔄 Scroll Behavior

- Scroll position is saved during navigation (`history` mode)
- If the URL contains `#section`, the page scrolls to the corresponding element:

```html
<a href="/docs#section2" data-route>Section 2</a>
```

---

## 📜 Scroll Restoration Support

Scroll position is preserved during navigation using `history.replaceState({ scroll })`.

---

## ⚙️ Getting Query Parameters

```js
const params = Router.getParams(); // { tab: '1', sort: 'name' }
```

Inside a handler:

```js
Router.add(/^page$/, function() {
  console.log(this.query); // Example: { filter: 'active' }
});
```

---

## 🔼 Updating URL Parameters

```js
Router.update('page', 2); // Changes the URL to ?page=2 without reloading
```

---

## ↩️ Resetting the Router

```js
Router.flush(); // Clears routes, mode, and root
```

---

## 🔍 How `check()` Works

The `check()` method is the core of the router. It:

1. Gets the current path via `getFragment()`
2. Checks it against each route regex
3. If there's a match:
   - Calls the corresponding handler
   - Passes URL parameters (e.g., ID) to it
   - Inside the handler, `this.query` contains query parameters
4. If there's a `#hash`, scrolls to the element with the matching `id`

```js
Router.check(); // Manually triggers a route check
```

This method is automatically called on navigation and URL changes.

---

## ✅ Full Example

```js
Router.config({ mode: 'history', root: '/' }).listen();

Router
  .add(/^$/, () => app.innerHTML = '<h1>Home</h1>')
  .add(/^about$/, () => app.innerHTML = '<h1>About</h1>')
  .add(/^user\/(\\d+)$/, function(id) {
    app.innerHTML = `<h1>User #${id}</h1><p>Query: ${JSON.stringify(this.query)}</p>`;
  });
```

HTML:

```html
<nav>
  <a href="/" data-route>Home</a>
  <a href="/about" data-route>About</a>
  <a href="/user/10?tab=info" data-route>User 10</a>
</nav>

<div id="app"></div>
```

---

## ⚠️ Notes

- In `history` mode, the server must return `index.html` for any route (SPA fallback).
- This is not needed for `hash` mode.
- If `path === this.getFragment()`, navigation is skipped.

---

## 🛠 Fallback Mode on Server (e.g., nginx)

```nginx
location / {
    try_files $uri /index.html;
}
```
