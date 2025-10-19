import "./jsdom-helper.ts"
import { strict as assert } from "node:assert"
import { describe, it } from "node:test"
import { formField } from "../src/index.ts"

describe("item-at-of", async () => {
    const { ELE } = await import("html-ele")

    // language=HTML
    const form = (ELE`
      <form>
        <input type="checkbox" name="roles" value="admin">
        <input type="checkbox" name="roles" value="editor" checked>
        <input type="checkbox" name="roles" value="editor" disabled>

        <select name="color">
          <option value="red">Red</option>
          <option value="blue" selected>Blue</option>
          <option value="green">Green</option>
        </select>
      </form>
    `)

    it("select: itemAt and itemOf", () => {
        const colorField = formField({ form, name: "color" })
        const first = colorField.itemAt(0)
        assert.ok(first)
        assert.equal(first!.value, "red")

        const outOfRange = colorField.itemAt(999)
        assert.equal(outOfRange, undefined)

        const green = colorField.itemOf("green")
        assert.ok(green)
        assert.equal(green!.value, "green")
    })

    it("checkbox: itemOf (duplicates/dynamic DOM tests omitted)", () => {
        const rolesField = formField({ form, name: "roles" })

        const editor = rolesField.itemOf("editor")
        assert.ok(editor)
        assert.equal(editor!.value, "editor")

        // non-existent value returns undefined
        assert.equal(rolesField.itemOf("missing"), undefined)
    })
})