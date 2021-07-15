import Promise, { forEach } from "../../utils/promise";

/**
 Edit all elements matching a selector
 */

function editHTMLElement($, selector, fn) {
    const $elements = $(selector);

    return forEach($elements, (el) => {
        const $el = $(el);
        return fn($el);
    });
}

export default editHTMLElement;
