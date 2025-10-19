# form-field

Unified interface for HTML form fields with synchronized binding to object properties

[![Node.js CI](https://github.com/kawanet/form-field/workflows/Node.js%20CI/badge.svg)](https://github.com/kawanet/form-field/actions/)
[![npm version](https://img.shields.io/npm/v/form-field)](https://www.npmjs.com/package/form-field)
[![gzip size](https://img.badgesize.io/https://cdn.jsdelivr.net/npm/form-field/dist/form-field.min.js?compression=gzip)](https://cdn.jsdelivr.net/npm/form-field/dist/form-field.min.js)

## SYNOPSIS

#### Value access

```js
import {formField} from "form-field"

const form = document.querySelector("form")

const nickname = formField({form, name: "nickname"})

console.log(nickname.value) // current value

nickname.value = "Bob" // update value
```

#### Property binding

```typescript
interface Context {
    nickname: string
    email: string
    favo: string
}

const context = {} as Context

formField({form, name: "nickname", bindTo: context})

console.log(context.nickname) // reads from form field

context.nickname = "John" // updates form field
```

#### Multiple selections

```js
const favo = formField({form, name: "favo"})

favo.toggle("tech") // toggle checkbox

favo.toggle("travel", true)

favo.toggle("trading", false)

console.log(favo.has("travel")) // check if selected
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

## LINKS

- https://www.npmjs.com/package/form-field
- https://github.com/kawanet/form-field
