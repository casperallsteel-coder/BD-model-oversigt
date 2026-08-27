import { getSizes, addSize, deleteSize, getInlets, addInlet, deleteInlet, getConfigs, addConfig, deleteConfig, findConfigs, auth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from './db.js';

const IMAGE_INLETS = {
    '301': 'img/301.png', '302': 'img/302.png', '303': 'img/303.png', '304': 'img/304.png', '305': 'img/305.png',
    '306': 'img/306.png', '307': 'img/307.png', '308': 'img/308.png', '309': 'img/309.png', '310': 'img/310.png', '311': 'img/311.png',
    // 400-serien genbruger 300-seriens billeder
    '401': 'img/301.png', '402': 'img/302.png', '403': 'img/303.png', '404': 'img/304.png', '405': 'img/305.png',
    '406': 'img/306.png', '407': 'img/307.png', '408': 'img/308.png', '409': 'img/309.png', '410': 'img/310.png',
    // Special
    'Pizza': 'img/Pizza.png',
    'pizza': 'img/Pizza.png',
    'Figurer Mad _Old': 'img/Figurer Mad _Old.png',
    'figurer mad _old': 'img/Figurer Mad _Old.png'
};

const SVG_INLETS = {
    // 312 Diamond
    '312': `<polygon points="50,15 85,50 50,85 15,50" fill="currentColor"/>`,
    // 313 Rectangle
    '313': `<rect x="25" y="15" width="50" height="70" fill="currentColor"/>`,
    // 314 Slot (narrow)
    '314': `<rect x="40" y="10" width="20" height="80" rx="3" fill="currentColor"/>`,
    // 315 Very narrow slot
    '315': `<rect x="45" y="10" width="10" height="80" rx="2" fill="currentColor"/>`,
    // 316 Oval
    '316': `<ellipse cx="50" cy="50" rx="25" ry="40" fill="currentColor"/>`,
    // 317 Circle
    '317': `<circle cx="50" cy="50" r="35" fill="currentColor"/>`,
    // 318 Square
    '318': `<rect x="20" y="20" width="60" height="60" fill="currentColor"/>`,
    // 319 Hexagon
    '319': `<polygon points="50,15 80,32 80,68 50,85 20,68 20,32" fill="currentColor"/>`,
    // 320 Large Circle
    '320': `<circle cx="50" cy="50" r="42" fill="currentColor"/>`,
    // 321 Large Square
    '321': `<rect x="10" y="10" width="80" height="80" fill="currentColor"/>`,
    // Special: Rektangel 210x150
    'Rektangel 210x150': `<rect x="20" y="25" width="60" height="50" fill="currentColor"/>`,
    'Rektangel 210×150': `<rect x="20" y="25" width="60" height="50" fill="currentColor"/>`,
    // Special: Trekant H130
    'Trekant H130': `<polygon points="50,15 15,80 85,80" fill="currentColor"/>`,
    // Special: Rektangel 250x110
    'Rektangel 250x110': `<rect x="30" y="15" width="40" height="70" fill="currentColor"/>`,
    'Rektangel 250×110': `<rect x="30" y="15" width="40" height="70" fill="currentColor"/>`,
    // Special: Rektangel 210x110 (Samme form som 313)
    'Rektangel 210x110': `<rect x="25" y="15" width="50" height="70" fill="currentColor"/>`,
    'Rektangel 210×110': `<rect x="25" y="15" width="50" height="70" fill="currentColor"/>`,
    // Special: Rektangel 150x100 (Samme form som 313)
    'Rektangel 150x100': `<rect x="25" y="15" width="50" height="70" fill="currentColor"/>`,
    'Rektangel 150×100': `<rect x="25" y="15" width="50" height="70" fill="currentColor"/>`,
    // Special: Rektangel 220x120 (Samme form som 313)
    'Rektangel 220x120': `<rect x="25" y="15" width="50" height="70" fill="currentColor"/>`,
    'Rektangel 220×120': `<rect x="25" y="15" width="50" height="70" fill="currentColor"/>`,
    // Special: Pant Mempran (317 cirkel med et plus i midten)
    'Pant Mempran': `<circle cx="50" cy="50" r="35" fill="currentColor"/><line x1="50" y1="25" x2="50" y2="75" stroke="white" stroke-width="4"/><line x1="25" y1="50" x2="75" y2="50" stroke="white" stroke-width="4"/>`,
    'Pant Membran': `<circle cx="50" cy="50" r="35" fill="currentColor"/><line x1="50" y1="25" x2="50" y2="75" stroke="white" stroke-width="4"/><line x1="25" y1="50" x2="75" y2="50" stroke="white" stroke-width="4"/>`,
    // Special: Rombe H220 (Samme form som 312)
    'Rombe H220': `<polygon points="50,15 85,50 50,85 15,50" fill="currentColor"/>`,
    // Special: Oval H220 (Samme form som 316)
    'Oval H220': `<ellipse cx="50" cy="50" rx="25" ry="40" fill="currentColor"/>`,
    // Låg på Låget (Åben / Lukket) - illustreret som blå klapper
    'Åben': `<rect x="0" y="0" width="100" height="35" fill="#6366f1"/><circle cx="50" cy="67" r="25" fill="none" stroke="#222" stroke-width="2" stroke-dasharray="4,4"/>`,
    'åben': `<rect x="0" y="0" width="100" height="35" fill="#6366f1"/><circle cx="50" cy="67" r="25" fill="none" stroke="#222" stroke-width="2" stroke-dasharray="4,4"/>`,
    'Lukket': `<rect x="0" y="0" width="100" height="100" fill="#6366f1"/>`,
    'lukket': `<rect x="0" y="0" width="100" height="100" fill="#6366f1"/>`,
    // Special: Kvadrat 190x190 (Samme form som 318)
    'Kvadrat 190x190': `<rect x="20" y="20" width="60" height="60" fill="currentColor"/>`,
    'Kvadrat 190×190': `<rect x="20" y="20" width="60" height="60" fill="currentColor"/>`,
    // Special: Rektangel 310x190 (Samme form som 313, roteret 90 grader)
    'Rektangel 310x190': `<rect x="15" y="25" width="70" height="50" fill="currentColor"/>`,
    'Rektangel 310×190': `<rect x="15" y="25" width="70" height="50" fill="currentColor"/>`,
    // Special: Rombe H200 (Samme form som 312)
    'Rombe H200': `<polygon points="50,15 85,50 50,85 15,50" fill="currentColor"/>`,
    // Special: Oval H200 (Samme form som 316)
    'Oval H200': `<ellipse cx="50" cy="50" rx="25" ry="40" fill="currentColor"/>`,
    // Default fallback (just a dashed circle)
    'default': `<circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="4" stroke-dasharray="6,6"/>`
};

document.addEventListener('DOMContentLoaded', async () => {
    // === Navigation ===
    const btnNavUser = document.getElementById('btn-nav-user');
    const btnNavAdmin = document.getElementById('btn-nav-admin');
    const viewUser = document.getElementById('view-user');
    const viewAdmin = document.getElementById('view-admin');

    function switchView(viewId) {
        if (viewId === 'user') {
            viewUser.classList.add('active');
            viewAdmin.classList.remove('active');
            btnNavUser.style.color = 'var(--primary-color)';
            btnNavUser.style.fontWeight = '600';
            btnNavAdmin.style.color = '#9ca3af';
            btnNavAdmin.style.fontWeight = '500';
        } else {
            viewAdmin.classList.add('active');
            viewUser.classList.remove('active');
            btnNavAdmin.style.color = 'var(--primary-color)';
            btnNavAdmin.style.fontWeight = '600';
            btnNavUser.style.color = '#9ca3af';
            btnNavUser.style.fontWeight = '500';
            if (auth.currentUser) {
                loadAdminData(); // Refresh dropdowns if logged in
            }
        }
    }

    btnNavUser.addEventListener('click', () => switchView('user'));
    btnNavAdmin.addEventListener('click', () => switchView('admin'));

    // === Auth Logic ===
    const btnLogin = document.getElementById('btn-login');
    const btnLogout = document.getElementById('btn-logout');
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const loginError = document.getElementById('login-error');
    const adminLoginContainer = document.getElementById('admin-login-container');
    const adminContentContainer = document.getElementById('admin-content-container');

    onAuthStateChanged(auth, (user) => {
        if (user) {
            adminLoginContainer.style.display = 'none';
            adminContentContainer.style.display = 'block';
            btnLogout.style.display = 'block';
            if (viewAdmin.classList.contains('active')) {
                loadAdminData();
            }
        } else {
            adminLoginContainer.style.display = 'block';
            adminContentContainer.style.display = 'none';
            btnLogout.style.display = 'none';
        }
    });

    btnLogin.addEventListener('click', async () => {
        const email = loginEmail.value.trim();
        const password = loginPassword.value;
        if (!email || !password) {
            loginError.textContent = "Indtast venligst e-mail og adgangskode.";
            loginError.style.display = 'block';
            return;
        }
        try {
            await signInWithEmailAndPassword(auth, email, password);
            loginError.style.display = 'none';
            loginEmail.value = '';
            loginPassword.value = '';
        } catch (error) {
            console.error("Login fejl:", error);
            loginError.textContent = "Forkert e-mail eller adgangskode.";
            loginError.style.display = 'block';
        }
    });

    btnLogout.addEventListener('click', async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logud fejl:", error);
        }
    });

    // === User View Logic ===
    const uRoomsSelect = document.getElementById('u-rooms');
    const uInletsContainer = document.getElementById('u-inlets-container');
    const btnFindConfig = document.getElementById('btn-find-config');
    const resWrapper = document.getElementById('u-results-wrapper');
    const notFoundContainer = document.getElementById('u-not-found-container');
    const btnCreateProposal = document.getElementById('btn-create-proposal');

    async function renderUserInletDropdowns() {
        const rooms = parseInt(uRoomsSelect.value);
        const inlets = await getInlets();
        
        let html = '';
        for (let i = 1; i <= rooms; i++) {
            html += `
                <div class="form-group" style="flex: 1; min-width: 200px;">
                    <label>Rum ${i}</label>
                    <select class="u-inlet-select" data-index="${i}">
                        <option value="">-- Vælg Indkast --</option>
                        ${inlets.map(inl => `<option value="${inl.id}">${inl.id} - ${inl.name}</option>`).join('')}
                    </select>
                </div>
            `;
        }
        uInletsContainer.innerHTML = html;
        resWrapper.innerHTML = '';
        notFoundContainer.classList.add('hidden');
    }

    uRoomsSelect.addEventListener('change', renderUserInletDropdowns);

    btnFindConfig.addEventListener('click', async () => {
        const rooms = uRoomsSelect.value;
        const selects = document.querySelectorAll('.u-inlet-select');
        const selectedInlets = Array.from(selects).map(s => s.value);
        
        const filterSize = document.getElementById('u-filter-size').value;
        const filterNone = document.getElementById('u-filter-none').checked;
        const filterWheels = document.getElementById('u-filter-wheels').checked;
        const filterWeight = document.getElementById('u-filter-weight').checked;
        const filterGas = document.getElementById('u-filter-gas').checked;

        const filters = {
            size: filterSize,
            none: filterNone,
            wheels: filterWheels,
            weight: filterWeight,
            gas: filterGas
        };

        const matchedConfigs = await findConfigs(rooms, selectedInlets, filters);

        if (matchedConfigs.length > 0) {
            let html = '';
            
            matchedConfigs.forEach(config => {
                let optionsText = [
                    `Hjul: ${config.wheels ? 'Ja' : 'Nej'}`,
                    `Vægtklods: ${config.weight ? 'Ja' : 'Nej'}`,
                    `Gasdæmper: ${config.gas ? 'Ja' : 'Nej'}`
                ].join(', ');
                if (config.other) {
                    optionsText += `<br><strong>Andet:</strong> ${config.other}`;
                }

                // Generate visual
                let visualHtml = '';
                for (let i = 0; i < config.rooms; i++) {
                    const fractionStr = config.roomFractions ? config.roomFractions[i] : '1/' + config.rooms;
                    const inletId = config.inlets[i];
                    let widthPercent = 100 / config.rooms;
                    
                    if (fractionStr && fractionStr.includes('/')) {
                        const parts = fractionStr.split('/');
                        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[1] !== '0') {
                            widthPercent = (parseFloat(parts[0]) / parseFloat(parts[1])) * 100;
                        }
                    }

                    const borderRight = (i === config.rooms - 1) ? 'none' : '2px solid var(--text-main)';
                    const bgCol = (i % 2 === 0) ? '#ffffff' : '#f9fafb';
                    
                    let shapeHtml = '';
                    if (IMAGE_INLETS[inletId]) {
                        shapeHtml = `<img src="${IMAGE_INLETS[inletId]}" style="width: 65px; height: 65px; object-fit: contain; margin-bottom: 0.5rem; margin-top: 0.5rem;" alt="${inletId}">`;
                    } else {
                        const svgShape = SVG_INLETS[inletId] || SVG_INLETS['default'];
                        shapeHtml = `
                            <svg viewBox="0 0 100 100" style="width: 65px; height: 65px; color: #222222; margin-bottom: 0.5rem; margin-top: 0.5rem;">
                                ${svgShape}
                            </svg>`;
                    }
                    
                    visualHtml += `
                        <div style="width: ${widthPercent}%; border-right: ${borderRight}; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: ${bgCol}; position: relative;">
                            ${shapeHtml}
                            <span style="font-weight:700; color:var(--primary-color); font-size:0.9rem;">${inletId}</span>
                            <span style="font-size:0.7rem; color:var(--text-muted);">${fractionStr}</span>
                        </div>
                    `;
                }

                html += `
                <div class="card-form" style="margin-bottom: 2rem; border-color: var(--primary-color); border-width: 2px;">
                    <h2 style="color: var(--primary-color); margin-bottom: 1rem;">Fundet Løsning</h2>
                    
                    <div style="display: flex; width: 100%; height: 130px; border: 2px solid var(--text-main); border-radius: 8px; margin-bottom: 2rem; overflow: hidden; background-color: var(--bg-color);">
                        ${visualHtml}
                    </div>

                    <div class="detail-grid">
                        <div class="info-group">
                            <h3>Stel Størrelse</h3>
                            <p style="font-weight: 600; font-size: 1.3rem;">${config.size}</p>
                        </div>
                        <div class="info-group">
                            <h3>Antal Rum</h3>
                            <p>${config.rooms} rum</p>
                        </div>
                        <div class="info-group">
                            <h3>Montage Varenummer (Færdig)</h3>
                            <p style="font-family: monospace; font-size: 1.2rem;">${config.montageItem || '-'}</p>
                        </div>
                        <div class="info-group">
                            <h3>Låg 1 Varenummer</h3>
                            <p style="font-family: monospace; font-size: 1.2rem;">${config.lidItem || '-'}</p>
                        </div>
                        ${config.lidItem2 ? `
                        <div class="info-group">
                            <h3>Låg 2 Varenummer</h3>
                            <p style="font-family: monospace; font-size: 1.2rem;">${config.lidItem2}</p>
                        </div>
                        ` : ''}
                        <div class="info-group">
                            <h3>Farve / Overflade</h3>
                            <p style="font-size: 1.1rem;">${config.color ? config.color : '<span style="color:var(--text-muted); font-style:italic;">Vælg farve...</span>'}</p>
                        </div>
                        <div class="info-group">
                            <h3>Tilvalg</h3>
                            <p style="font-size: 1rem;">${optionsText}</p>
                        </div>
                    </div>
                </div>
                `;
            });
            
            resWrapper.innerHTML = html;
            notFoundContainer.classList.add('hidden');
        } else {
            resWrapper.innerHTML = '';
            notFoundContainer.classList.remove('hidden');
        }
    });

    btnCreateProposal.addEventListener('click', () => {
        // Skift til admin og forudfyld
        const rooms = uRoomsSelect.value;
        const selects = document.querySelectorAll('.u-inlet-select');
        const selectedInlets = Array.from(selects).map(s => s.value);

        switchView('admin');
        document.getElementById('a-config-rooms').value = rooms;
        renderAdminInletDropdowns().then(() => {
            const adminSelects = document.querySelectorAll('.a-inlet-select');
            adminSelects.forEach((sel, idx) => {
                sel.value = selectedInlets[idx];
            });
        });
    });

    // === Admin View Logic ===

    const aConfigSizeSelect = document.getElementById('a-config-size');
    const aConfigRoomsSelect = document.getElementById('a-config-rooms');
    const aConfigInletsContainer = document.getElementById('a-config-inlets-container');
    const aConfigMontageInput = document.getElementById('a-config-montage');
    const aConfigLidInput = document.getElementById('a-config-lid');
    const aConfigLid2Input = document.getElementById('a-config-lid-2');
    const aConfigColorInput = document.getElementById('a-config-color');
    const aConfigOtherInput = document.getElementById('a-config-other');
    const btnSaveConfig = document.getElementById('btn-save-config');

    async function loadAdminData() {
        const sizes = await getSizes();
        const sizeOptions = sizes.map(s => `<option value="${s}">${s}</option>`).join('');
        
        aConfigSizeSelect.innerHTML = `<option value="">-- Vælg Størrelse --</option>` + sizeOptions;
        
        const filterSizeSelect = document.getElementById('a-filter-size');
        if (filterSizeSelect) {
            filterSizeSelect.innerHTML = `<option value="">Alle Størrelser</option>` + sizeOptions;
        }
        
        const deleteSizeSelect = document.getElementById('a-delete-size-select');
        if (deleteSizeSelect) {
            deleteSizeSelect.innerHTML = `<option value="">-- Vælg for at slette --</option>` + sizeOptions;
        }
        
        await renderAdminInletDropdowns();
        await renderConfigsList();
    }

    async function renderAdminInletDropdowns() {
        const rooms = parseInt(aConfigRoomsSelect.value);
        const inlets = await getInlets();
        const inletOptions = inlets.map(inl => `<option value="${inl.id}">${inl.id} - ${inl.name}</option>`).join('');
        
        const deleteInletSelect = document.getElementById('a-delete-inlet-select');
        if (deleteInletSelect) {
            deleteInletSelect.innerHTML = `<option value="">-- Vælg for at slette --</option>` + inletOptions;
        }

        let html = '';
        for (let i = 1; i <= rooms; i++) {
            html += `
                <div class="form-row" style="align-items: center; margin-bottom: 0.5rem;">
                    <span style="font-weight: 500; width: 60px;">Rum ${i}:</span>
                    <select class="a-inlet-select form-group" style="margin-bottom: 0; flex: 2;" data-index="${i}">
                        <option value="">-- Vælg Indkast --</option>
                        ${inletOptions}
                    </select>
                    <input type="text" class="a-inlet-fraction form-group" style="margin-bottom: 0; flex: 1;" placeholder="F.eks. 1/3" value="1/${rooms}">
                </div>
            `;
        }
        aConfigInletsContainer.innerHTML = html;
    }

    aConfigRoomsSelect.addEventListener('change', renderAdminInletDropdowns);

    // Admin forms - add size
    const btnAddSize = document.getElementById('btn-add-size');
    const inputNewSize = document.getElementById('a-new-size');
    btnAddSize.addEventListener('click', async () => {
        const sizeName = inputNewSize.value.trim();
        if (sizeName) {
            await addSize(sizeName);
            inputNewSize.value = '';
            await loadAdminData();
            alert("Størrelse tilføjet");
        }
    });

    const btnDeleteSize = document.getElementById('btn-delete-size');
    const selectDeleteSize = document.getElementById('a-delete-size-select');
    if (btnDeleteSize) {
        btnDeleteSize.addEventListener('click', async () => {
            const size = selectDeleteSize.value;
            if (size) {
                if(confirm(`Er du sikker på at du vil slette størrelsen "${size}"?`)) {
                    await deleteSize(size);
                    await loadAdminData();
                }
            }
        });
    }

    // Admin forms - add inlet
    const btnAddInlet = document.getElementById('btn-add-inlet');
    const inputNewInletId = document.getElementById('a-new-inlet-id');
    const inputNewInletName = document.getElementById('a-new-inlet-name');
    btnAddInlet.addEventListener('click', async () => {
        const id = inputNewInletId.value.trim();
        const name = inputNewInletName.value.trim();
        if (id && name) {
            await addInlet(id, name);
            inputNewInletId.value = '';
            inputNewInletName.value = '';
            await renderAdminInletDropdowns();
            alert("Indkast tilføjet");
        }
    });

    const btnDeleteInlet = document.getElementById('btn-delete-inlet');
    const selectDeleteInlet = document.getElementById('a-delete-inlet-select');
    if (btnDeleteInlet) {
        btnDeleteInlet.addEventListener('click', async () => {
            const inletId = selectDeleteInlet.value;
            if (inletId) {
                if(confirm(`Er du sikker på at du vil slette indkast "${inletId}"?`)) {
                    await deleteInlet(inletId);
                    await renderAdminInletDropdowns();
                }
            }
        });
    }

    let currentEditId = null;
    let configSearchTerm = '';
    let configFilterSize = '';
    let configFilterRooms = '';
    
    document.getElementById('a-search-configs').addEventListener('input', (e) => {
        configSearchTerm = e.target.value.toLowerCase();
        renderConfigsList();
    });

    document.getElementById('a-filter-size').addEventListener('change', (e) => {
        configFilterSize = e.target.value;
        renderConfigsList();
    });
    
    document.getElementById('a-filter-rooms').addEventListener('change', (e) => {
        configFilterRooms = e.target.value;
        renderConfigsList();
    });

    btnSaveConfig.addEventListener('click', async () => {
        const size = aConfigSizeSelect.value;
        const rooms = parseInt(aConfigRoomsSelect.value);
        const montage = aConfigMontageInput.value.trim();
        const lid = aConfigLidInput.value.trim();
        const lid2 = aConfigLid2Input.value.trim();
        const color = aConfigColorInput.value.trim();
        const other = aConfigOtherInput.value.trim();
        
        const wheels = document.getElementById('a-config-wheels').checked;
        const weight = document.getElementById('a-config-weight').checked;
        const gas = document.getElementById('a-config-gas').checked;
        
        const selects = document.querySelectorAll('.a-inlet-select');
        const selectedInlets = Array.from(selects).map(s => s.value);

        const fractions = document.querySelectorAll('.a-inlet-fraction');
        const selectedFractions = Array.from(fractions).map(f => f.value.trim());

        if (!size) return alert("Vælg stel størrelse");
        if (selectedInlets.some(v => v === '')) return alert("Vælg indkast til alle rum");
        if (!montage || !lid) return alert("Angiv i det mindste montage og låg 1 varenummer");

        const config = {
            id: currentEditId,
            size: size,
            rooms: rooms,
            inlets: selectedInlets,
            roomFractions: selectedFractions,
            montageItem: montage,
            lidItem: lid,
            lidItem2: lid2,
            color: color,
            other: other,
            wheels: wheels,
            weight: weight,
            gas: gas
        };

        await addConfig(config);
        alert(currentEditId ? "BD Station opdateret!" : "BD Station gemt i databasen!");
        
        currentEditId = null;
        
        // Ryd formen
        aConfigMontageInput.value = '';
        aConfigLidInput.value = '';
        aConfigLid2Input.value = '';
        aConfigColorInput.value = '';
        aConfigOtherInput.value = '';
        document.getElementById('a-config-wheels').checked = false;
        document.getElementById('a-config-weight').checked = false;
        document.getElementById('a-config-gas').checked = false;
        aConfigSizeSelect.value = '';
        aConfigRoomsSelect.value = '3';
        renderAdminInletDropdowns();
        renderConfigsList();
    });

    async function renderConfigsList() {
        const container = document.getElementById('a-configs-list-container');
        const configs = await getConfigs();
        
        const filteredConfigs = configs.filter(c => {
            if (configFilterSize && c.size !== configFilterSize) return false;
            if (configFilterRooms && c.rooms.toString() !== configFilterRooms) return false;
            
            if (!configSearchTerm) return true;
            return c.size.toLowerCase().includes(configSearchTerm) ||
                   (c.montageItem && c.montageItem.toLowerCase().includes(configSearchTerm)) ||
                   (c.lidItem && c.lidItem.toLowerCase().includes(configSearchTerm)) ||
                   c.inlets.some(i => i.toLowerCase().includes(configSearchTerm));
        });

        if (filteredConfigs.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted);">Ingen matchende stationer fundet.</p>';
            return;
        }

        let html = '';
        filteredConfigs.forEach((c) => {
            const inletsText = c.inlets.join(' | ');
            const fractionsText = c.roomFractions ? c.roomFractions.join(' | ') : Array(c.rooms).fill(`1/${c.rooms}`).join(' | ');
            
            const optionsArr = [];
            if (c.wheels) optionsArr.push('Hjul');
            if (c.weight) optionsArr.push('Vægtklods');
            if (c.gas) optionsArr.push('Gasdæmper');
            
            let optionsText = optionsArr.length > 0 ? optionsArr.join(', ') : 'Ingen';
            if (c.other) {
                optionsText += `<br><strong>Andet:</strong> ${c.other}`;
            }

            html += `
                <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 1rem; display: flex; justify-content: space-between; align-items: center; background-color: var(--bg-color);">
                    <div>
                        <strong style="color: var(--primary-color); font-size: 1.1rem;">${c.size}</strong> (${c.rooms} rum)
                        <div style="font-size: 0.9rem; color: var(--text-main); margin-top: 0.2rem;"><strong>Indkast:</strong> ${inletsText}</div>
                        <div style="font-size: 0.9rem; color: var(--text-main); margin-top: 0.2rem;"><strong>Inddeling:</strong> ${fractionsText}</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.2rem;"><strong>Tilvalg:</strong> ${optionsText}</div>
                        <div style="font-size: 0.85rem; margin-top: 0.4rem; padding-top: 0.4rem; border-top: 1px dashed #ccc;">
                            Montage: <span style="font-family:monospace;">${c.montageItem || '-'}</span> | 
                            Låg 1: <span style="font-family:monospace;">${c.lidItem || '-'}</span>
                            ${c.lidItem2 ? ` | Låg 2: <span style="font-family:monospace;">${c.lidItem2}</span>` : ''} |
                            Farve: <span>${c.color || 'Standard'}</span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="secondary-button btn-edit-config" data-id="${c.id}" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">Ret</button>
                        <button class="danger-button btn-delete-config" data-id="${c.id}" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">Slet</button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;

        // Add event listeners
        document.querySelectorAll('.btn-delete-config').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                const c = configs.find(x => x.id === id);
                if (c && confirm(`Er du sikker på at du vil slette ${c.size} med indkast ${c.inlets.join(', ')}?`)) {
                    await deleteConfig(id);
                    renderConfigsList();
                }
            });
        });

        document.querySelectorAll('.btn-edit-config').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                const c = configs.find(x => x.id === id);
                if (!c) return;
                
                currentEditId = c.id;
                
                aConfigSizeSelect.value = c.size;
                aConfigRoomsSelect.value = c.rooms.toString();
                
                await renderAdminInletDropdowns();
                
                const selects = document.querySelectorAll('.a-inlet-select');
                const fractions = document.querySelectorAll('.a-inlet-fraction');
                
                c.inlets.forEach((inl, i) => {
                    if (selects[i]) selects[i].value = inl;
                });
                
                if (c.roomFractions) {
                    c.roomFractions.forEach((frac, i) => {
                        if (fractions[i]) fractions[i].value = frac;
                    });
                }
                
                aConfigMontageInput.value = c.montageItem || '';
                aConfigLidInput.value = c.lidItem || '';
                aConfigLid2Input.value = c.lidItem2 || '';
                aConfigColorInput.value = c.color || '';
                aConfigOtherInput.value = c.other || '';
                
                document.getElementById('a-config-wheels').checked = !!c.wheels;
                document.getElementById('a-config-weight').checked = !!c.weight;
                document.getElementById('a-config-gas').checked = !!c.gas;

                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }

    // Init User view
    async function initUserView() {
        const sizes = await getSizes();
        const uFilterSize = document.getElementById('u-filter-size');
        if (uFilterSize) {
            uFilterSize.innerHTML = `<option value="">Alle Størrelser</option>` + sizes.map(s => `<option value="${s}">${s}</option>`).join('');
        }
        await renderUserInletDropdowns();
    }
    initUserView();
});

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
