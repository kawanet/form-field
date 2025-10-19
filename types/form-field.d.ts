/**
 * form-field - Unified interface for HTML form fields with synchronized binding to object properties
 */
declare namespace formField {
    type FieldElement = HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement | HTMLSelectElement

    type ItemElement = HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement | HTMLOptionElement

    type StringKeys<T> = [T] extends [undefined]
        ? string
        : { [K in keyof T]: K extends string ? (T[K] extends string ? K : never) : never }[keyof T];

    type OnWrite<T> = FormFieldOptions<T>["onWrite"]

    type OnChange<T> = FormFieldOptions<T>["onChange"]

    interface FormFieldOptions<T = any> {
        /**
         * form element or container element which includes field elements
         */
        form: HTMLFormElement | FieldElement | ParentNode

        /**
         * name of the field element
         */
        name: StringKeys<T>

        /**
         * Object to synchronize form values.
         * Only properties matching field names obtained via item() will have getters/setters defined.
         * The getter always references the value of the DOM field,
         * and the setter updates the DOM and triggers onWrite.
         * Other properties are not affected.
         */
        bindTo?: T

        /**
         * Called when the value is changed by user interaction,
         * or when assigning to a bound object's property.
         * Fires before onChange.
         */
        onWrite?: (field: FormField<T>) => void

        /**
         * Called when the value is changed by user interaction (change event).
         * Not triggered by setter assignments. Fires after onWrite.
         */
        onChange?: (item: FormField<T>) => void

        /**
         * delimiter for multiple values (for checkboxes, multi-select)
         */
        delim?: string

        /**
         * Default values to attempt at initialization (in order).
         * For checkbox/radio/select fields, tries the first value; if no matching option exists,
         * falls back to the next value, and so on until a match is found.
         */
        defaults?: string[]
    }

    interface FormField<T = any> {
        readonly options: FormFieldOptions<T>

        /**
         * name of the field element (input, select, textarea)
         */
        readonly name: StringKeys<T>

        /**
         * getter/setter of the value
         * setter triggers onWrite handler
         */
        value: string

        /**
         * rebind the field element (input, select, textarea)
         */
        reload(): void

        /**
         * list of all items (including disabled items)
         * - for checkbox, radio, select: returns all options
         * - for other types: returns all item(s)
         */
        items(): FormItem[]

        /**
         * list of active items (excluding disabled items)
         * - for checkbox, radio: returns checked and not-disabled items
         * - for select: returns selected and not-disabled options
         * - for other types: returns all not-disabled item(s)
         */
        current(): FormItem[]

        /**
         * select/deselect an option (for checkbox, multi-select)
         */
        toggle(value: string, checked?: boolean): boolean

        /**
         * check if an option is selected (for checkbox, multi-select)
         */
        has(value: string): boolean
    }

    interface FormItem<E extends ItemElement = ItemElement> {
        /**
         * underlying HTML element (input, option, textarea)
         */
        readonly node: E

        /**
         * getter/setter of the `value` property
         * setter triggers onWrite handler
         */
        value: string

        /**
         * method to set the `value` property silently
         * does not trigger onWrite handler
         */
        setValue(value: string): void

        /**
         * whether the option is checkable (radio, checkbox, select)
         */
        readonly checkable: boolean

        /**
         * whether the option is selected (radio, checkbox, select)
         * setter triggers onWrite handler
         */
        checked?: boolean

        /**
         * method to set the `checked` property silently
         * does not trigger onWrite handler
         */
        setChecked(checked: boolean): void

        /**
         * getter/setter of the `disabled` property
         */
        disabled?: boolean

        /**
         * text content of the option
         */
        readonly label?: string
    }
}

export type FormField<T = any> = formField.FormField<T>

export type FormFieldOptions<T = any> = formField.FormFieldOptions<T>

export const formField: <T = any>(options: FormFieldOptions<T>) => FormField<T>
