import { hit, getPropertyInChain } from '../helpers';

/**
 * Removes properties from the results of JSON.parse call
 * @param {Source} source
 * @param {string} propsToRemove list of space-separated properties to remove
 * @param {string} [obligatoryProps] list of space-separated properties
 * which must be all present for the pruning to occur
 */

export function jsonPrune(source, propsToRemove, obligatoryProps) {
    const log = console.log.bind(console);
    const prunePaths = propsToRemove !== undefined && propsToRemove !== ''
        ? propsToRemove.split(/ +/)
        : [];
    const needlePaths = obligatoryProps !== undefined && obligatoryProps !== ''
        ? obligatoryProps.split(/ +/)
        : [];
    function isPruningNeeded(root) {
        for (let i = 0; i < needlePaths.length; i += 1) {
            const needlePath = needlePaths[i];
            const details = getPropertyInChain(root, needlePath);
            const nestedPropName = needlePath.split('').pop();
            if (details.base[nestedPropName] === undefined) return false;
        }
        return true;
    }

    const nativeParse = JSON.parse;

    const parseWrapper = (...args) => {
        const r = nativeParse.apply(window, args);
        if (prunePaths.length === 0) {
            log(window.location.hostname, r);
            return r;
        }
        hit(source);
        if (isPruningNeeded(r) === false) {
            return r;
        }
        prunePaths.forEach((path) => {
            const ownerObj = getPropertyInChain(r, path);
            delete ownerObj.base[ownerObj.prop];
        });
        return r;
    };

    JSON.parse = parseWrapper;
}


jsonPrune.names = [
    'json-prune',
    'json-prune.js',
    'ubo-json-prune.js',
];

jsonPrune.injections = [hit, getPropertyInChain];
