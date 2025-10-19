# form-field

Unified interface for HTML form fields with synchronized binding to object properties

[![Node.js CI](https://github.com/kawanet/form-field/workflows/Node.js%20CI/badge.svg)](https://github.com/kawanet/form-field/actions/)
[![npm version](https://img.shields.io/npm/v/form-field)](https://www.npmjs.com/package/form-field)
[![gzip size](https://img.badgesize.io/https://cdn.jsdelivr.net/npm/form-field/dist/form-field.min.js?compression=gzip)](https://cdn.jsdelivr.net/npm/form-field/dist/form-field.min.js)

- Unified getter/setter for text inputs, checkboxes, radio buttons, and select elements
- Two-way binding between form fields and object properties (synchronized updates in both directions)
- Built-in change detection with `onChange` and `onWrite` callbacks
- Small browser build: [form-field.min.js](https://cdn.jsdelivr.net/npm/form-field/dist/form-field.min.js) under 4KB minified, under 2KB gzipped
- Full TypeScript support - [form-field.d.ts](https://github.com/kawanet/form-field/blob/main/types/form-field.d.ts) for detailed specifications

## SYNOPSIS

```js
import {formField} from "form-field"

const form = document.querySelector("form")

const nickname = formField({form, name: "nickname"})

console.log(nickname.value) // current value

nickname.value = "Bob" // update value
```

#### HTML

```html

<form>
    <ul>
        <li>Nickname: <input type="text" name="nickname" value="Alice"></li>
        <li>Email: <input type="email" name="email"></li>
        <li>Favorites:
            <label><input type="checkbox" name="favo" value="tech">Tech</label>
            <label><input type="checkbox" name="favo" value="travel">Travel</label>
            <label><input type="checkbox" name="favo" value="trading">Trading</label>
        </li>
    </ul>
</form>
```

#### Property binding

```typescript
interface Context {
    nickname: string
    email: string
    favo: string
}

const ctx = {} as Context

formField({form, name: "nickname", bindTo: ctx})

console.log(ctx.nickname) // reads from form field

ctx.nickname = "John" // updates form field
```

#### Multiple selections

```js
const favo = formField({form, name: "favo", delim: ","})

favo.toggle("tech") // toggle checkbox

favo.toggle("travel", true)

favo.toggle("trading", false)

console.log(favo.has("travel")) // check if selected

// Shortcut to item by index. Equivalent to items().at(index))
const firstItem = favo.itemAt(0)
console.log(firstItem.checked)

// Shortcut to item by value. Equivalent to items().find(v => v.value === value)
const travelItem = favo.itemOf("travel")
console.log(travelItem.checked)
```

#### Change handling and defaults

```js
formField({
    form,
    name: "email",
    onWrite: ({name, value}) => sessionStorage.setItem(name, value),
    onChange: ({name, value}) => submitForm(),
    defaults: [sessionStorage.getItem("email")]
})
```

## LINKS

- https://www.npmjs.com/package/form-field
- https://github.com/kawanet/form-field
