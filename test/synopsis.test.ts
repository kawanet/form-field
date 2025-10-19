import "./jsdom-helper.ts"
import {strict as assert} from "node:assert"
import {describe, it} from "node:test"
import {formField} from "../src/index.ts"

describe("synopsis", async () => {
    const {ELE} = await import("html-ele")

    // language=HTML
    const form = (ELE`
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
    `)

    // mock implementation for testing
    const console = {log: ((v: string | boolean) => assert.ok(v))}
    const submitForm = (): void => null
    const sessionStorage = {getItem: (name: string): string => null, setItem: (name: string, value: string): void => null}

    it("Get/set value", () => {
        // import {formField} from "form-field";

        // const form = document.querySelector("form")

        const nickname = formField({form, name: "nickname"})

        console.log(nickname.value) // current value

        nickname.value = "Bob" // update value
    })

    it("Bind to object property", () => {
        interface Context {
            nickname: string
            email: string
            favo: string
        }

        const context = {} as Context

        formField({form, name: "nickname", bindTo: context})

        console.log(context.nickname) // reads from form field

        context.nickname = "John" // updates form field
    })

    it("Handle changes", () => {
        formField({
            form,
            name: "email",
            onWrite: ({name, value}) => sessionStorage.setItem(name, value),
            onChange: ({name, value}) => submitForm(),
            defaults: [sessionStorage.getItem("email")],
        })
    })

    it("Work with checkboxes, radio and select options", () => {
        const favo = formField({form, name: "favo"})

        favo.toggle("tech") // toggle checkbox

        favo.toggle("travel", true)

        favo.toggle("trading", false)

        console.log(favo.has("travel")) // check if selected
    })
})
