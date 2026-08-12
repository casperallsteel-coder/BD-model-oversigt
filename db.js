import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getDatabase, ref, get, set, push, remove, child } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

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

// --- Sizes ---
export async function getSizes() {
    const snapshot = await get(ref(db, 'sizes'));
    const sizes = [];
    if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
            sizes.push(childSnapshot.val().name);
        });
    }
    return sizes.sort();
}

export async function addSize(sizeName) {
    // Sanitér navnet lidt, da visse tegn (som '.', '#', '$', '[', or ']') ikke er tilladt i RTDB keys
    const safeKey = sizeName.replace(/[.#$\[\]]/g, '_');
    await set(ref(db, 'sizes/' + safeKey), { name: sizeName });
}

export async function deleteSize(sizeName) {
    const safeKey = sizeName.replace(/[.#$\[\]]/g, '_');
    await remove(ref(db, 'sizes/' + safeKey));
}

// --- Inlets ---
export async function getInlets() {
    const snapshot = await get(ref(db, 'inlets'));
    const inlets = [];
    if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
            inlets.push(childSnapshot.val());
        });
    }
    return inlets.sort((a, b) => a.id.localeCompare(b.id));
}

export async function addInlet(id, name) {
    const safeKey = id.replace(/[.#$\[\]]/g, '_');
    await set(ref(db, 'inlets/' + safeKey), { id, name });
}

export async function deleteInlet(inletId) {
    const safeKey = inletId.replace(/[.#$\[\]]/g, '_');
    await remove(ref(db, 'inlets/' + safeKey));
}

// --- Configurations ---
export async function getConfigs() {
    const snapshot = await get(ref(db, 'configs'));
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

export async function addConfig(config) {
    if (config.id) {
        // Updating existing
        await set(ref(db, 'configs/' + config.id), config);
    } else {
        // Creating new
        const newRef = push(ref(db, 'configs'));
        config.id = newRef.key;
        await set(newRef, config);
    }
}

export async function deleteConfig(id) {
    await remove(ref(db, 'configs/' + id));
}

export async function findConfigs(inletsArray) {
    const configs = await getConfigs();
    return configs.filter(c => JSON.stringify(c.inlets || []) === JSON.stringify(inletsArray));
}
