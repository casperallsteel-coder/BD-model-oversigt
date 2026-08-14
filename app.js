import { getSizes, addSize, deleteSize, getInlets, addInlet, deleteInlet, getConfigs, addConfig, deleteConfig, findConfigs } from './db.js';

const SVG_INLETS = {
    // 301 Pear (Apple-like) - approximate
    '301': `<path d="M 50 10 C 35 10 30 35 25 50 C 20 65 30 90 50 90 C 70 90 80 65 75 50 C 70 35 65 10 50 10 Z" fill="currentColor"/>`,
    // 302 Bag - approximate
    '302': `<path d="M 30 20 L 25 80 C 25 90 35 95 50 95 C 65 95 75 90 75 80 L 70 20 Z M 45 10 L 55 10 L 55 20 L 45 20 Z" fill="currentColor"/>`,
    // 304 Milk carton
    '304': `<rect x="30" y="30" width="40" height="55" fill="currentColor"/><polygon points="30,30 50,15 70,30" fill="currentColor"/>`,
    // 305 Bottle
    '305': `<rect x="35" y="40" width="30" height="50" rx="5" fill="currentColor"/><rect x="42" y="10" width="16" height="30" fill="currentColor"/>`,
    // 312 Diamond
    '312': `<polygon points="50,15 85,50 50,85 15,50" fill="currentColor"/>`,
    // 313 Rectangle
    '313': `<rect x="25" y="15" width="50" height="70" fill="currentColor"/>`,
    // 314 Slot (narrow)
    '314': `<rect x="40" y="10" width="20" height="80" rx="3" fill="currentColor"/>`,
    // 316 Oval
    '316': `<ellipse cx="50" cy="50" rx="25" ry="40" fill="currentColor"/>`,
    // 317 Circle
    '317': `<circle cx="50" cy="50" r="35" fill="currentColor"/>`,
    // 318 Square
    '318': `<rect x="20" y="20" width="60" height="60" fill="currentColor"/>`,
    // 319 Hexagon
    '319': `<polygon points="50,15 80,32 80,68 50,85 20,68 20,32" fill="currentColor"/>`,
    // Special: Rektangle 210x150
    'Rektangle 210x150': `<rect x="20" y="25" width="60" height="50" fill="currentColor"/>`,
    // Special: Trekant H130
    'Trekant H130': `<polygon points="50,15 15,80 85,80" fill="currentColor"/>`,
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
            loadAdminData(); // Refresh dropdowns
        }
    }

    btnNavUser.addEventListener('click', () => switchView('user'));
    btnNavAdmin.addEventListener('click', () => switchView('admin'));

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

        const matchedConfigs = await findConfigs(rooms, selectedInlets);

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
                    
                    const svgShape = SVG_INLETS[inletId] || SVG_INLETS['default'];
                    
                    visualHtml += `
                        <div style="width: ${widthPercent}%; border-right: ${borderRight}; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: ${bgCol}; position: relative;">
                            <svg viewBox="0 0 100 100" style="width: 45px; height: 45px; color: #222222; margin-bottom: 0.2rem;">
                                ${svgShape}
                            </svg>
                            <span style="font-weight:700; color:var(--primary-color); font-size:0.9rem;">${inletId}</span>
                            <span style="font-size:0.7rem; color:var(--text-muted);">${fractionStr}</span>
                        </div>
                    `;
                }

                html += `
                <div class="card-form" style="margin-bottom: 2rem; border-color: var(--primary-color); border-width: 2px;">
                    <h2 style="color: var(--primary-color); margin-bottom: 1rem;">Fundet Løsning</h2>
                    
                    <div style="display: flex; width: 100%; height: 80px; border: 2px solid var(--text-main); border-radius: 8px; margin-bottom: 2rem; overflow: hidden; background-color: var(--bg-color);">
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
                            <p style="font-size: 1.1rem;">${config.color || 'Standard'}</p>
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
    
    document.getElementById('a-search-configs').addEventListener('input', (e) => {
        configSearchTerm = e.target.value.toLowerCase();
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
    renderUserInletDropdowns();
});
