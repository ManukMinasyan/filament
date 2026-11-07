import { test } from 'node:test'
import assert from 'node:assert/strict'

globalThis.window = { addEventListener: () => {} }

const { default: dropdown } =
    await import('../../packages/support/resources/js/components/dropdown.js')

const makeTrigger = ({ isConnected }) => ({
    isConnected,
    removedAttributes: [],
    removeAttribute(name) {
        this.removedAttributes.push(name)
    },
})

const makeDropdown = ({ activeTrigger, triggers }) => {
    const triggerContainer = {
        contains: (element) => triggers.includes(element),
    }

    return Object.assign(dropdown(), {
        $root: {
            querySelector: () => triggerContainer,
            querySelectorAll: () => triggers,
        },
        activeTrigger,
        shouldCheckTriggerVisibility: false,
    })
}

test('a detached dropdown keeps the ARIA attributes of the trigger it picks again', () => {
    const trigger = makeTrigger({ isConnected: false })
    const component = makeDropdown({
        activeTrigger: trigger,
        triggers: [trigger],
    })

    assert.equal(component.getTrigger(), trigger)
    assert.deepEqual(trigger.removedAttributes, [])
})

test('a replaced trigger loses the ARIA attributes the dropdown gave it', () => {
    const previousTrigger = makeTrigger({ isConnected: false })
    const trigger = makeTrigger({ isConnected: true })
    const component = makeDropdown({
        activeTrigger: previousTrigger,
        triggers: [trigger],
    })

    assert.equal(component.getTrigger(), trigger)
    assert.deepEqual(previousTrigger.removedAttributes, [
        'aria-controls',
        'aria-expanded',
        'aria-haspopup',
    ])
    assert.deepEqual(trigger.removedAttributes, [])
})
