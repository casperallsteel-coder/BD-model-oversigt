import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getDatabase, ref, get, set, push, remove } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCEA2VB2mkcxJ9BE3cTUnXoGIXPm0UfToQ",
    authDomain: "allsteel-bd-configurator.firebaseapp.com",
    databaseURL: "https://allsteel-bd-configurator-default-rtdb.firebaseio.com",
    projectId: "allsteel-bd-configurator",
    storageBucket: "allsteel-bd-configurator.firebasestorage.app",
    messagingSenderId: "622195142459",
    appId: "1:622195142459:web:412271f4d541c6935a911e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { auth, signInWithEmailAndPassword, signOut, onAuthStateChanged };

function getPath(base, model) {
    return (!model || model === 'BD') ? base : `${model.toLowerCase()}_${base}`;
}

function sanitizeKey(str) {
    return str.replace(/[.#$\[\]\/]/g, '_');
}

// --- Sizes ---
export async function getSizes(model = 'BD') {
    const snapshot = await get(ref(db, getPath('sizes', model)));
    const sizes = [];
    if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
            sizes.push(childSnapshot.val().name);
        });
    }
    return sizes.sort();
}

export async function addSize(sizeName, model = 'BD') {
    const safeKey = sanitizeKey(sizeName);
    await set(ref(db, getPath('sizes', model) + '/' + safeKey), { name: sizeName });
}

export async function deleteSize(sizeName, model = 'BD') {
    const safeKey = sanitizeKey(sizeName);
    await remove(ref(db, getPath('sizes', model) + '/' + safeKey));
}

// --- Inlets ---
export async function getInlets(model = 'BD') {
    const snapshot = await get(ref(db, getPath('inlets', model)));
    const inlets = [];
    if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
            inlets.push(childSnapshot.val());
        });
    }
    return inlets.sort((a, b) => a.id.localeCompare(b.id));
}

export async function addInlet(id, name, model = 'BD') {
    const safeKey = sanitizeKey(id);
    await set(ref(db, getPath('inlets', model) + '/' + safeKey), { id, name });
}

export async function deleteInlet(inletId, model = 'BD') {
    const safeKey = sanitizeKey(inletId);
    await remove(ref(db, getPath('inlets', model) + '/' + safeKey));
}

// --- Options (Tilvalg) ---
const DEFAULT_BD_OPTIONS = ['Hjul', 'Vægtklods', 'Gasdæmper'];

export async function getOptions(model = 'BD') {
    const snapshot = await get(ref(db, getPath('options', model)));
    const options = [];
    if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
            options.push(childSnapshot.val().name);
        });
    } else if (model === 'BD') {
        return [...DEFAULT_BD_OPTIONS];
    }
    return options;
}

export async function addOption(optionName, model = 'BD') {
    if (model === 'BD') {
        const snapshot = await get(ref(db, getPath('options', 'BD')));
        if (!snapshot.exists()) {
            for (const defOpt of DEFAULT_BD_OPTIONS) {
                const k = sanitizeKey(defOpt);
                await set(ref(db, getPath('options', 'BD') + '/' + k), { name: defOpt });
            }
        }
    }
    const safeKey = sanitizeKey(optionName);
    await set(ref(db, getPath('options', model) + '/' + safeKey), { name: optionName });
}

export async function deleteOption(optionName, model = 'BD') {
    if (model === 'BD') {
        const snapshot = await get(ref(db, getPath('options', 'BD')));
        if (!snapshot.exists()) {
            for (const defOpt of DEFAULT_BD_OPTIONS) {
                if (defOpt !== optionName) {
                    const k = sanitizeKey(defOpt);
                    await set(ref(db, getPath('options', 'BD') + '/' + k), { name: defOpt });
                }
            }
            return;
        }
    }
    const safeKey = sanitizeKey(optionName);
    await remove(ref(db, getPath('options', model) + '/' + safeKey));
}

export function configHasOption(config, optName) {
    if (config.options && typeof config.options[optName] !== 'undefined') {
        return !!config.options[optName];
    }
    if (optName === 'Hjul') return !!config.wheels;
    if (optName === 'Vægtklods') return !!config.weight;
    if (optName === 'Gasdæmper') return !!config.gas;
    return false;
}

export function configHasAnyOption(config, availableOptions = []) {
    if (config.wheels || config.weight || config.gas) return true;
    if (config.options) {
        if (Object.values(config.options).some(v => !!v)) return true;
    }
    return availableOptions.some(opt => configHasOption(config, opt));
}

// --- Configurations ---
export async function getConfigs(model = 'BD') {
    const snapshot = await get(ref(db, getPath('configs', model)));
    const configs = [];
    if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            data.id = childSnapshot.key;
            configs.push(data);
        });
    }
    return configs;
}

export async function addConfig(config, model = 'BD') {
    const path = getPath('configs', model);
    if (config.id) {
        await set(ref(db, path + '/' + config.id), config);
    } else {
        const newRef = push(ref(db, path));
        config.id = newRef.key;
        await set(newRef, config);
    }
}

export async function deleteConfig(id, model = 'BD') {
    await remove(ref(db, getPath('configs', model) + '/' + id));
}

export async function findConfigs(rooms, inletsArray, filters = {}, model = 'BD') {
    const configs = await getConfigs(model);
    const availableOptions = await getOptions(model);

    return configs.filter(c => {
        if (parseInt(c.rooms) !== parseInt(rooms)) return false;

        for (let i = 0; i < inletsArray.length; i++) {
            if (inletsArray[i] !== "" && c.inlets[i] !== inletsArray[i]) {
                return false;
            }
        }

        if (filters.size && c.size !== filters.size) return false;

        if (filters.none) {
            if (configHasAnyOption(c, availableOptions)) return false;
        } else if (filters.selectedOptions && filters.selectedOptions.length > 0) {
            for (const reqOpt of filters.selectedOptions) {
                if (!configHasOption(c, reqOpt)) return false;
            }
        }

        return true;
    });
}
