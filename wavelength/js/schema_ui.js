
import { schemaDocs, mockUsers } from './schema_data.js';

// State
let currentSection = 'overview';
let mode = 'schema'; // 'schema' or 'example'
let currentUserIndex = 0;

// DOM Elements
const sidebar = document.getElementById('sidebar');
const contentTitle = document.getElementById('content-title');
const contentDesc = document.getElementById('content-desc');
const codeBlock = document.getElementById('code-block');
const modeToggle = document.getElementById('mode-toggle');
const userSelector = document.getElementById('user-selector');
const userSelectorContainer = document.getElementById('user-selector-container');
const diagramContainer = document.getElementById('diagram-container');

// Initialize
function init() {
    renderSidebar();
    setupEventListeners();
    renderContent();
}

// Render Sidebar
function renderSidebar() {
    sidebar.innerHTML = '';
    Object.keys(schemaDocs).forEach(key => {
        const item = document.createElement('div');
        item.className = `p-3 cursor-pointer rounded-lg transition-colors ${currentSection === key ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`;
        item.innerText = schemaDocs[key].title;
        item.onclick = () => {
            currentSection = key;
            renderSidebar(); // Re-render to update active state
            renderContent();
        };
        sidebar.appendChild(item);
    });

    // Add "Coming Soon" section at the bottom
    const comingSoon = document.createElement('div');
    comingSoon.className = "mt-8 p-3 text-xs uppercase tracking-widest text-slate-600 font-bold border-t border-slate-800 pt-4";
    comingSoon.innerText = "Future Modules";
    sidebar.appendChild(comingSoon);

    const matchingItem = document.createElement('div');
    matchingItem.className = "p-3 cursor-pointer rounded-lg text-slate-500 hover:text-slate-300 transition-colors";
    matchingItem.innerText = "Matching Algorithms";
    matchingItem.onclick = () => alert("Coming Soon: Two-Tower Models & Graph ML layers.");
    sidebar.appendChild(matchingItem);
}

// Setup Event Listeners
function setupEventListeners() {
    // Mode Toggle
    const buttons = modeToggle.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.onclick = () => {
            mode = btn.dataset.mode;
            updateModeUI();
            renderContent();
        };
    });

    // User Selector
    userSelector.innerHTML = '';
    mockUsers.forEach((user, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.innerText = user.name;
        userSelector.appendChild(option);
    });
    userSelector.onchange = (e) => {
        currentUserIndex = parseInt(e.target.value);
        renderContent();
    };

    updateModeUI();
}

function updateModeUI() {
    const buttons = modeToggle.querySelectorAll('button');
    buttons.forEach(btn => {
        if (btn.dataset.mode === mode) {
            btn.className = "px-4 py-1 rounded bg-neon-cyan text-black font-bold transition-all";
        } else {
            btn.className = "px-4 py-1 rounded text-slate-400 hover:text-white transition-all";
        }
    });

    if (mode === 'example') {
        userSelectorContainer.classList.remove('hidden');
    } else {
        userSelectorContainer.classList.add('hidden');
    }
}

// Render Main Content
function renderContent() {
    const doc = schemaDocs[currentSection];

    // Title & Desc
    contentTitle.innerText = doc.title;
    contentDesc.innerText = doc.description;

    // Diagram (Special for Overview)
    if (currentSection === 'overview' && doc.diagram) {
        diagramContainer.classList.remove('hidden');
        diagramContainer.innerHTML = `<div class="font-mono text-sm text-neon-cyan p-4 border border-neon-cyan/30 rounded bg-neon-cyan/5 text-center">${doc.diagram}</div>`;
    } else {
        diagramContainer.classList.add('hidden');
    }

    // Code Block
    let codeContent = '';

    if (mode === 'schema') {
        // Show Type Definition
        codeContent = doc.typeDefinition || "// No type definition available.";
        if (currentSection === 'overview') codeContent = doc.content; // Special case for overview text
    } else {
        // Show Example Data
        if (currentSection === 'overview') {
            codeContent = "// Select a specific section to view data.";
        } else if (currentSection === 'user_profile_v1') {
            codeContent = JSON.stringify(mockUsers[currentUserIndex].data, null, 2);
        } else {
            // Extract specific section from mock user
            const data = mockUsers[currentUserIndex].data[currentSection];
            codeContent = data ? JSON.stringify(data, null, 2) : "// Data not present for this user.";
        }
    }

    // Syntax Highlight (Simple regex based)
    codeBlock.innerHTML = syntaxHighlight(codeContent);
}

// Simple JSON Syntax Highlighter
function syntaxHighlight(json) {
    if (typeof json !== 'string') return json;

    // Basic escaping
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // If it's not JSON (like the Typescript definitions), just return it colored simply
    if (!json.startsWith('{') && !json.startsWith('[')) {
        return `<span class="text-slate-300">${json}</span>`;
    }

    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'text-orange-400'; // number
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'text-neon-pink'; // key
            } else {
                cls = 'text-green-400'; // string
            }
        } else if (/true|false/.test(match)) {
            cls = 'text-blue-400'; // boolean
        } else if (/null/.test(match)) {
            cls = 'text-slate-500'; // null
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

// Run
init();
