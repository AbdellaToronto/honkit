import Immutable from "immutable";
import jsonschema from "jsonschema";
import jsonSchemaDefaults from "json-schema-defaults";
import Promise, { reduce } from "../utils/promise";
import error from "../utils/error";
import mergeDefaults from "../utils/mergeDefaults";

/**
 Validate one plugin for a book and update book's confiration

 @param {Book}
 @param {Plugin}
 @return {Book}
 */
function validatePluginConfig(book, plugin) {
    let config = book.getConfig();
    const packageInfos = plugin.getPackage();

    const configKey = ["pluginsConfig", plugin.getName()].join(".");

    let pluginConfig = config.getValue(configKey, {}).toJS();

    const schema = (packageInfos.get("gitbook") || Immutable.Map()).toJS();
    if (!schema) return book;

    // Normalize schema
    schema.id = `/${configKey}`;
    schema.type = "object";

    // Validate and throw if invalid
    const v = new jsonschema.Validator();
    const result = v.validate(pluginConfig, schema, {
        // @ts-expect-error: https://github.com/tdegrunt/jsonschema/issues/340
        propertyName: configKey,
    });

    // Throw error
    if (result.errors.length > 0) {
        throw new error.ConfigurationError(new Error(result.errors[0].stack));
    }

    // Insert default values
    const defaults = jsonSchemaDefaults(schema);
    pluginConfig = mergeDefaults(pluginConfig, defaults);

    // Update configuration
    config = config.setValue(configKey, pluginConfig);

    // Return new book
    return book.set("config", config);
}

/**
 Validate a book configuration for plugins and
 returns an update configuration with default values.

 @param {Book}
 @param {OrderedMap<String:Plugin>}
 @return {Promise<Book>}
 */

function validateConfig(book, plugins) {
    return reduce(
        plugins,
        (newBook, plugin) => {
            return validatePluginConfig(newBook, plugin);
        },
        book
    );
}

export default validateConfig;
