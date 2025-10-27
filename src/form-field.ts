import type {formField as NS, FormField, FormFieldOptions} from "../types/html-form-field.d.ts"
import {formItemList} from "./form-item.ts"

type FieldEventHandler = (this: NS.FieldElement, ev: Event) => void

const DELIM = "," // or use Unit Separator `\x1F` instead

const isString = (v: any): v is string => ("string" === typeof v)

const noNullString = (v: any): string => (v == null) ? "" : isString(v) ? v : String(v)

const splitString = (v: string | string[], delim: string) => (v == null) ? [] : Array.isArray(v) ? v.map(noNullString) : noNullString(v).split(delim)

const isHTMLElement = (v: ParentNode): v is HTMLElement => ("function" === typeof (v as HTMLElement).matches)

export const formField: typeof NS = (options) => {
    return new FormBridgeImpl(options)
}

const getNodeList = <T>({form, name}: {form: ParentNode, name: NS.StringKeys<T>}): Iterable<NS.FieldElement> => {
    const safeName = JSON.stringify(name)
    if (!name) {
        throw new Error(`Invalid name=${safeName}`)
    }

    const selector = `input[name=${safeName}], textarea[name=${safeName}], button[name=${safeName}], select[name=${safeName}]`

    const nodeList = form.querySelectorAll<NS.FieldElement>(selector)
    if (!nodeList.length) {
        if (isHTMLElement(form) && form.matches(selector)) {
            return [form] as NS.FieldElement[]
        }

        throw new Error(`Not found: name=${safeName}`)
    }

    return nodeList
}

const updateEventListener = (nodeList: Iterable<NS.FieldElement>, handler: FieldEventHandler) => {
    for (const node of nodeList) {
        node.removeEventListener("change", handler)
        node.addEventListener("change", handler)
    }
}

const triggerOnWrite = <T>(field: FormField<T>) => {
    const onWrite = field.options.onWrite
    if (onWrite) onWrite(field)
}

const triggerOnChange = <T>(field: FormField<T>) => {
    const onChange = field.options.onChange
    if (onChange) onChange(field)
}

const applyBindTo = <T>(bindTo: T, name: NS.StringKeys<T>, field: FormField<T>) => {
    if (!bindTo) return // nothing to be bound

    delete bindTo[name as keyof T]

    const getValue = () => field.value

    const setValue = (value: string) => {
        field.value = value
    }

    Object.defineProperty(bindTo, name, {
        get: getValue,
        set: setValue,
        enumerable: true,
        configurable: true,
    })
}

class FormBridgeImpl<T = any> implements FormField<T> {
    readonly options: FormFieldOptions<T>
    readonly name: FormField<T>["name"]

    private _items: NS.FormItem[]
    private readonly _onChange: FieldEventHandler

    constructor(options: FormFieldOptions<T> = {} as FormFieldOptions<T>) {
        this.options = options
        const name = this.name = options.name
        applyBindTo(options.bindTo, name, this)

        const _onChange = this._onChange = () => {
            triggerOnWrite(this)
            triggerOnChange(this)
        }

        const nodeList = getNodeList(options)
        updateEventListener(nodeList, _onChange)
        this._items = formItemList(this, nodeList)

        const defaults = options.defaults
        if (defaults) {
            for (const v of defaults) {
                if (this.setValue(v)) break
            }
        }
    }

    get value() {
        const values = this.current().map(v => v.value)
        if (values.length > 1) {
            const delim = this.options.delim || DELIM
            return values.join(delim)
        } else {
            return values[0]
        }
    }

    set value(value: string) {
        this.setValue(value)
        triggerOnWrite(this)
    }

    protected setValue(value: string | string[]): boolean {
        const items = this.items()

        if (items.length === 1 && !items[0].checkable && isString(value)) {
            value = [value]
        }

        const delim = this.options.delim || DELIM
        const values = splitString(value, delim)
        let i = 0
        let assigned = 0

        for (const item of items) {
            if (item.checkable) {
                const checked = values.includes(item.value)
                if (checked) assigned++
                if (item.checked !== checked) {
                    item.setChecked(checked)
                }
            } else {
                const value = values[i++]
                const isNull = (value == null)
                item.setValue(isNull ? "" : value)
                if (!isNull) assigned++
            }
        }

        return !!assigned
    }

    current() {
        return this.items().filter(v => (!v.disabled && (!v.checkable || v.checked)))
    }

    reload(): void {
        const nodeList = getNodeList(this.options)
        const _onChange = this._onChange
        updateEventListener(nodeList, _onChange)
        this._items = formItemList(this, nodeList)
    }

    items(): NS.FormItem[] {
        return this._items
    }

    toggle(value: string, checked?: boolean): boolean {
        let result: boolean
        const delim = this.options.delim || DELIM
        const values = splitString(value, delim)

        for (const item of this.items()) {
            if (values.includes(item.value)) {
                if (checked != null) {
                    result = checked
                } else {
                    result = !item.checked
                }
                item.checked = result
            }
        }

        return result
    }

    has(value: string): boolean {
        return !!this.current().find(v => v.value === value)
    }

    /**
     * Shortcut to access an item by index (operates on items()).
     * Equivalent to items().at(index). Returns undefined if out of range.
     */
    itemAt(index: number): NS.FormItem | undefined {
        return this.items().at(index)
    }

    /**
     * Shortcut to access an item by value (operates on items()).
     * Returns the first FormItem whose value equals the given value, or undefined if not found.
     */
    itemOf(value: string): NS.FormItem | undefined {
        return this.items().find(v => v.value === value)
    }
}
