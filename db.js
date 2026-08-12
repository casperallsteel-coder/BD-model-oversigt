// db.js
// Dette modul håndterer al database-interaktion.
// Lige nu bruger den localStorage, men fordi funktionerne er asynkrone (async/await),
// kan de direkte udskiftes med Firebase kald uden at skulle ændre resten af appen.

const DB_KEY_SIZES = 'bd_sizes';
const DB_KEY_INLETS = 'bd_inlets';
const DB_KEY_CONFIGS = 'bd_configs';

// --- Initialize default data if empty ---
function initDefaults() {
    if (!localStorage.getItem(DB_KEY_SIZES)) {
        localStorage.setItem(DB_KEY_SIZES, JSON.stringify(["BD XL (69x35)", "BD XXL (85x35)", "BD2 L + XL (119x35)"]));
    }
    if (!localStorage.getItem(DB_KEY_INLETS)) {
        localStorage.setItem(DB_KEY_INLETS, JSON.stringify([
            { id: "302", name: "Figure Rest" },
            { id: "303", name: "Figure Papir" },
            { id: "304", name: "Figure Plast" },
            { id: "301", name: "Figure Mad" },
            { id: "310", name: "Figure Pant" },
            { id: "317", name: "Rund 150 (Pant)" }
        ]));
    }
    if (!localStorage.getItem(DB_KEY_CONFIGS)) {
        localStorage.setItem(DB_KEY_CONFIGS, JSON.stringify([]));
    }
}
initDefaults();

// --- Sizes ---
export async function getSizes() {
    return JSON.parse(localStorage.getItem(DB_KEY_SIZES) || '[]');
}

export async function addSize(sizeName) {
    const sizes = await getSizes();
    if (!sizes.includes(sizeName)) {
        sizes.push(sizeName);
        localStorage.setItem(DB_KEY_SIZES, JSON.stringify(sizes));
    }
}

export async function deleteSize(sizeName) {
    let sizes = await getSizes();
    sizes = sizes.filter(s => s !== sizeName);
    localStorage.setItem(DB_KEY_SIZES, JSON.stringify(sizes));
}

// --- Inlets ---
export async function getInlets() {
    return JSON.parse(localStorage.getItem(DB_KEY_INLETS) || '[]');
}

export async function addInlet(id, name) {
    const inlets = await getInlets();
    inlets.push({ id, name });
    localStorage.setItem(DB_KEY_INLETS, JSON.stringify(inlets));
}

export async function deleteInlet(inletId) {
    let inlets = await getInlets();
    inlets = inlets.filter(i => i.id !== inletId);
    localStorage.setItem(DB_KEY_INLETS, JSON.stringify(inlets));
}

// --- Configurations ---
export async function getConfigs() {
    return JSON.parse(localStorage.getItem(DB_KEY_CONFIGS) || '[]');
}

export async function addConfig(config) {
    const configs = await getConfigs();
    
    if (config.id) {
        // Updating existing
        const index = configs.findIndex(c => c.id === config.id);
        if (index >= 0) {
            configs[index] = config;
        } else {
            configs.push(config);
        }
    } else {
        // Creating new
        config.id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
        configs.push(config);
    }
    
    localStorage.setItem(DB_KEY_CONFIGS, JSON.stringify(configs));
}

export async function deleteConfig(id) {
    let configs = await getConfigs();
    configs = configs.filter(c => c.id !== id);
    localStorage.setItem(DB_KEY_CONFIGS, JSON.stringify(configs));
}

export async function findConfigs(inletsArray) {
    // inletsArray is an array of inlet IDs, e.g., ["302", "303", "310"]
    const configs = await getConfigs();
    
    // Returner ALLE configs der matcher
    return configs.filter(c => JSON.stringify(c.inlets) === JSON.stringify(inletsArray));
}
