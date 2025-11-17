// State
let currentData = null;
let currentMode = localStorage.getItem('studyMode') || 'exam'; // Load saved mode or default to exam
let showTooltips = localStorage.getItem('showTooltips') === 'true'; // Default false unless explicitly set to true
let showPaths = localStorage.getItem('showPaths') === 'true'; // Default false unless explicitly set to true
let notesLibrary = [];

// DOM
const fileInput = document.getElementById('fileInput');
const importBtn = document.getElementById('importBtn');
const exportBtn = document.getElementById('exportBtn');
const topicTitle = document.getElementById('topicTitle');
const noteContent = document.getElementById('noteContent');
const studyModeButtons = document.querySelectorAll('.mode-btn');
const toggleTooltipsCheckbox = document.getElementById('toggleTooltips');
const togglePathsCheckbox = document.getElementById('togglePaths');

// Events
importBtn.addEventListener('click', () => {
    showLibraryView();
});
fileInput.addEventListener('change', handleImport);
exportBtn.addEventListener('click', exportMarkdown);

// Study mode controls
studyModeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        studyModeButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentMode = e.target.dataset.mode;
        
        // Save mode preference
        localStorage.setItem('studyMode', currentMode);
        
        // Update body class for mode-specific styling
        if (currentMode === 'exam') {
            document.body.classList.add('exam-mode');
            document.body.classList.remove('full-mode');
        } else {
            document.body.classList.add('full-mode');
            document.body.classList.remove('exam-mode');
        }
        
        render();
    });
});

// Auto-save on edit
noteContent.addEventListener('input', debounce(saveToLocalStorage, 1000));

// Toggle tooltips
toggleTooltipsCheckbox.addEventListener('change', (e) => {
    showTooltips = e.target.checked;
    localStorage.setItem('showTooltips', showTooltips);
    document.body.classList.toggle('tooltips-disabled', !showTooltips);
});

// Toggle paths
togglePathsCheckbox.addEventListener('change', (e) => {
    showPaths = e.target.checked;
    localStorage.setItem('showPaths', showPaths);
    render(); // Re-render to show/hide paths
});

// Import
function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            currentData = JSON.parse(event.target.result);
            loadJSON(currentData);
            saveToLocalStorage();
            showNotification('✅ Notes loaded successfully');
        } catch (error) {
            showNotification('❌ Invalid JSON file', 'error');
            console.error(error);
        }
    };
    reader.readAsText(file);
}

// Notification system
function showNotification(message, type = 'success') {
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = message;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.classList.add('fade-out');
        setTimeout(() => notif.remove(), 300);
    }, 2000);
}

// Load and process JSON data
function loadJSON(data) {
    currentData = data;
    
    // Calculate stats
    const content = data.content || [];
    const criticalCount = content.filter(b => b.exam_critical === true).length;
    
    currentData.stats = {
        total: content.length,
        critical: criticalCount,
        sections: content.filter(b => b.type === 'section').length,
        concepts: content.filter(b => b.type === 'concept').length,
        lists: content.filter(b => b.type === 'list').length,
        examples: content.filter(b => b.type === 'example').length
    };
    
    updateHeader();
    render();
}

// Update header display
function updateHeader() {
    const title = currentData.title || currentData.main_title || 'Study Notes';
    const topic = currentData.topic || currentData.document_info?.topic || '';
    
    topicTitle.textContent = topic ? `${title} - ${topic}` : title;
}

// Render
function render() {
    const dataArray = currentData?.content;
    if (!currentData || !dataArray) return;
    
    // In exam mode, only show exam-critical blocks
    let blocks = dataArray;
    if (currentMode === 'exam') {
        blocks = blocks.filter(block => block.exam_critical === true);
    }
    // In full mode, show everything
    
    // Build parent topic map for hover labels
    const topicMap = {};
    dataArray.forEach(block => {
        if (block.type === 'section' && block.title) {
            topicMap[block.id] = block.title;
        }
    });
    
    // Track rendered paths to avoid duplicates
    const renderedPaths = new Set();
    
    noteContent.innerHTML = blocks.map(block => renderBlock(block, topicMap, renderedPaths)).join('\n');
}

// Render individual block
function renderBlock(block, topicMap = {}, renderedPaths = new Set()) {
    const blockId = block.id || 0;
    const blockType = block.type || 'concept';
    const blockLevel = block.level || 1;
    const isExamMode = currentMode === 'exam';
    
    const marginText = block.note || '';
    const marginNote = marginText ? 
        `<span class="margin-note">${marginText}</span>` : '';
    
    // Get text based on current mode
    let textContent = isExamMode ? block.exam_text : block.full_text;
    if (!textContent) return ''; // Skip if no text
    
    // Highlight key sentence in both modes
    if (block.key_sentence) {
        textContent = highlightKeySentence(textContent, block.key_sentence);
    }
    
    const content = parseMarkdownBullets(textContent);
    const criticalClass = block.exam_critical ? 'exam-critical' : '';
    const levelClass = `level-${blockLevel}`;
    const examBadge = block.exam_critical ? '<span class="exam-badge">⚡</span>' : '';
    
    // Metadata attributes and indicator for hover tooltip
    const metadataAttrs = getMetadataAttributes(block);
    const metadataIndicator = getMetadataIndicator(block);
    
    // Get parent topic for hover label
    const parentTopic = block.parent && topicMap[block.parent] ? topicMap[block.parent] : '';
    const topicAttr = parentTopic ? `data-topic="${parentTopic}"` : '';
    
    // Extract parent path and current topic from full path
    let pathBadge = '';
    let topicHeading = '';
    if (block.path && block.path.includes(' > ')) {
        const pathParts = block.path.split(' > ');
        const parentPath = pathParts.slice(0, -1).join(' > ');
        const currentTopic = pathParts[pathParts.length - 1];
        
        // Only show on first occurrence of this topic
        if (!renderedPaths.has(currentTopic)) {
            renderedPaths.add(currentTopic);
            
            // Path badge only shows if showPaths is enabled
            if (showPaths && parentPath) {
                pathBadge = `<div class="path-badge">${escapeHtml(parentPath)}</div>`;
            }
            
            // Topic heading always shows
            topicHeading = `<h3 class="topic-heading">${escapeHtml(currentTopic)}</h3>`;
        }
    }
    
    switch(blockType) {
        case 'section':
            const sectionTitle = block.title || '';
            return `<div class="section-block ${criticalClass} ${levelClass}" data-id="${blockId}" ${topicAttr} ${metadataAttrs}>
                ${marginNote}
                ${pathBadge}
                ${topicHeading}
                <h${blockLevel} class="section-title">
                    ${examBadge}${formatText(sectionTitle)}${metadataIndicator}
                </h${blockLevel}>
                <div class="section-content">${content}</div>
            </div>`;
            
        case 'concept':
            return `<div class="concept-block ${criticalClass} ${levelClass}" data-id="${blockId}" ${topicAttr} ${metadataAttrs}>
                ${marginNote}
                ${pathBadge}
                ${topicHeading}
                ${metadataIndicator}
                <div class="concept-content">${content}</div>
            </div>`;
            
        case 'list':
            return renderList(block, blockId, marginNote, criticalClass, levelClass, topicAttr, metadataAttrs, metadataIndicator, pathBadge, topicHeading);
            
        case 'formula':
            return `<div class="formula-block ${criticalClass} ${levelClass}" data-id="${blockId}" ${topicAttr} ${metadataAttrs}>
                ${marginNote}
                ${pathBadge}
                ${topicHeading}
                ${metadataIndicator}
                <div class="formula-content">${content}</div>
            </div>`;
            
        case 'example':
            return `<div class="example-block ${criticalClass} ${levelClass}" data-id="${blockId}" ${topicAttr} ${metadataAttrs}>
                ${pathBadge}
                ${topicHeading}
                ${metadataIndicator}
                <div class="example-content">${content}</div>
            </div>`;
            
        default:
            return `<div class="generic-block ${criticalClass} ${levelClass}" data-id="${blockId}" ${topicAttr} ${metadataAttrs}>
                ${marginNote}
                ${pathBadge}
                ${topicHeading}
                ${metadataIndicator}
                ${content}
            </div>`;
    }
}

// Render list block
function renderList(block, blockId, marginNote, criticalClass, levelClass, topicAttr = '', metadataAttrs = '', metadataIndicator = '', pathBadge = '', topicHeading = '') {
    const items = block.items || [];
    const isExamMode = currentMode === 'exam';
    
    // Get intro text based on current mode
    let introText = isExamMode ? block.exam_text : block.full_text;
    
    // Highlight key sentence in intro text (both modes)
    if (block.key_sentence && introText) {
        introText = highlightKeySentence(introText, block.key_sentence);
    }
    
    const listHeader = introText ? 
        `<div class="list-intro">${parseMarkdownBullets(introText)}</div>` : '';
    
    // Parse items - format is "EXAM: ... | FULL: ..."
    const parsedItems = items.map(item => {
        if (item.includes('|')) {
            const parts = item.split('|').map(p => p.trim());
            if (parts.length === 2) {
                const examPart = parts[0].replace(/^EXAM:\s*/i, '').trim();
                const fullPart = parts[1].replace(/^FULL:\s*/i, '').trim();
                return isExamMode ? examPart : fullPart;
            }
        }
        return item; // Fallback if not in dual format
    });
    
    return `<div class="list-block ${criticalClass} ${levelClass}" data-id="${blockId}" ${topicAttr} ${metadataAttrs}>
        ${marginNote}
        ${pathBadge}
        ${topicHeading}
        ${metadataIndicator}
        ${listHeader}
        <ul class="content-bullets">
            ${parsedItems.map(item => `<li>${formatText(item)}</li>`).join('')}
        </ul>
    </div>`;
}

// Helper function to check if there's important content after a heading
function hasImportantContentAfter(blocks, headingIndex, filterType) {
    const heading = blocks[headingIndex];
    const headingLevel = getHeadingLevel(heading.type, heading);
    
    // Look ahead to find content before next heading of same or higher level
    for (let i = headingIndex + 1; i < blocks.length; i++) {
        const block = blocks[i];
        const blockLevel = getHeadingLevel(block.type, block);
        
        // Stop if we hit a heading of same or higher level
        if (blockLevel > 0 && blockLevel <= headingLevel) {
            break;
        }
        
        // Check if this block matches our filter
        if (filterType === 'critical' && block.importance === 'critical') {
            return true;
        }
        if (filterType === 'exam' && ['critical', 'important'].includes(block.importance)) {
            return true;
        }
    }
    
    return false;
}

function getHeadingLevel(type, block) {
    const blockType = block?.block_type || type;
    if (blockType === 'heading') return block?.level || 1;
    if (blockType === 'h1') return 1;
    if (blockType === 'h2') return 2;
    if (blockType === 'h3') return 3;
    return 0; // Not a heading
}

// Render table from pipe-delimited format
function renderTable(block, blockId, marginNote) {
    // Support old format (table_headers, table_rows) and new format (text with pipes)
    let headers, rows;
    
    if (block.table_headers && block.table_rows) {
        // Old format
        headers = block.table_headers.split(',').map(h => h.trim());
        rows = block.table_rows.map(row => 
            row.split(',').map(cell => cell.trim())
        );
    } else if (block.text) {
        // New format: pipe-delimited
        const lines = block.text.split('\n').filter(line => line.trim());
        if (lines.length === 0) {
            return `<p class="concept-block" data-id="${blockId}">${marginNote}[Table data missing]</p>`;
        }
        
        headers = lines[0].split('|').map(h => h.trim());
        rows = lines.slice(1).map(line => 
            line.split('|').map(cell => cell.trim())
        );
    } else {
        return `<p class="concept-block" data-id="${blockId}">${marginNote}[Table data missing]</p>`;
    }
    
    return `<div class="table-block" data-id="${blockId}">
        ${marginNote}
        <table>
            <thead>
                <tr>${headers.map(h => `<th>${formatText(h)}</th>`).join('')}</tr>
            </thead>
            <tbody>
                ${rows.map(row => 
                    `<tr>${row.map(cell => `<td>${formatText(cell)}</td>`).join('')}</tr>`
                ).join('')}
            </tbody>
        </table>
    </div>`;
}

// Render visual/diagram
function renderVisual(block, blockId, marginNote) {
    // Support old format (diagram_description, diagram_ascii) and new format (text)
    let description, ascii;
    
    if (block.diagram_description) {
        // Old format
        description = block.diagram_description;
        ascii = block.diagram_ascii || null;
    } else if (block.text) {
        // New format: text may contain description + ASCII art separated by \n\n
        const parts = block.text.split('\n\n');
        description = parts[0];
        ascii = parts.length > 1 ? parts.slice(1).join('\n\n') : null;
    } else {
        description = '[Visual description missing]';
        ascii = null;
    }
    
    return `<div class="visual-block" data-id="${blockId}">
        ${marginNote}
        <div class="visual-description">${formatText(description)}</div>
        ${ascii ? `<pre class="visual-ascii">${ascii}</pre>` : ''}
    </div>`;
}

// Format text with markdown and highlights
function formatText(text) {
    if (!text) return '';
    
    return text
        // Convert custom highlight tags to HTML
        .replace(/<mark-critical>(.*?)<\/mark-critical>/g, '<mark class="mark-critical">$1</mark>')
        .replace(/<mark-key>(.*?)<\/mark-key>/g, '<mark class="mark-key">$1</mark>')
        .replace(/<mark-important>(.*?)<\/mark-important>/g, '<mark class="key-sentence">$1</mark>')
        // Standard markdown
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
}

// Parse markdown bullets to HTML
function parseMarkdownBullets(text) {
    if (!text) return '';
    
    const lines = text.split('\n');
    let inList = false;
    let listType = '';
    let html = '';
    
    lines.forEach(line => {
        const trimmed = line.trim();
        
        // Check if line starts with bullet
        if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            if (!inList) {
                html += '<ul class="content-bullets">';
                inList = true;
                listType = 'ul';
            }
            const content = trimmed.substring(2);
            html += `<li>${formatText(content)}</li>`;
        }
        // Check for numbered list
        else if (/^\d+\.\s/.test(trimmed)) {
            if (!inList) {
                html += '<ol class="content-bullets">';
                inList = true;
                listType = 'ol';
            }
            const content = trimmed.replace(/^\d+\.\s/, '');
            html += `<li>${formatText(content)}</li>`;
        }
        else {
            if (inList) {
                html += `</${listType}>`;
                inList = false;
                listType = '';
            }
            if (trimmed) {
                html += `<p>${formatText(trimmed)}</p>`;
            }
        }
    });
    
    if (inList) {
        html += `</${listType}>`;
    }
    
    return html || formatText(text);
}

// Highlight key sentence within full text
function highlightKeySentence(fullText, keySentence) {
    if (!keySentence || !fullText || !fullText.includes(keySentence)) {
        return fullText;
    }
    
    // Replace the key sentence with highlighted version
    return fullText.replace(
        keySentence,
        `<mark class="key-sentence">${keySentence}</mark>`
    );
}

// Render breadcrumb path
function renderBreadcrumb(path) {
    if (!path) return '';
    
    const segments = path.split(' > ');
    const html = segments.map((segment, i) => {
        const isLast = i === segments.length - 1;
        return isLast ?
            `<span class="path-current">${segment}</span>` :
            `<span class="path-segment">${segment}</span><span class="path-separator">›</span>`;
    }).join('');
    
    return `<div class="breadcrumb-path">${html}</div>`;
}

// Render metadata as data attributes for hover tooltip
function getMetadataAttributes(block) {
    const attrs = [];
    
    if (block.simple_explanation) {
        attrs.push(`data-simple="${escapeHtml(block.simple_explanation)}"`);
    }
    if (block.analogy) {
        attrs.push(`data-analogy="${escapeHtml(block.analogy)}"`);
    }
    if (block.why_exists) {
        attrs.push(`data-why="${escapeHtml(block.why_exists)}"`);
    }
    
    return attrs.join(' ');
}

// Escape HTML for attributes
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Add metadata indicator icon (hidden - tooltips show on block hover)
function getMetadataIndicator(block) {
    return ''; // Indicator removed for cleaner paper appearance
}

// Initialize hover tooltips with improved UX
function initHoverTooltips() {
    let hideTimeout = null;
    let showTimeout = null;
    let currentBlockId = null;
    let isOverTooltip = false;
    let isOverBlock = false;
    
    // Helper to safely get closest element
    const getClosest = (element, selector) => {
        if (!element || !element.closest) return null;
        return element.closest(selector);
    };
    
    // Helper to check if we should hide
    const shouldHide = () => {
        return !isOverTooltip && !isOverBlock;
    };
    
    // Delegate event handling for better performance
    document.addEventListener('mouseenter', (e) => {
        if (!e.target) return;
        const blockEl = getClosest(e.target, '[data-simple], [data-analogy], [data-why]');
        if (blockEl) {
            isOverBlock = true;
            const blockId = blockEl.getAttribute('data-id');
            
            // Don't show tooltip if already showing for this block
            if (currentBlockId === blockId && document.querySelector('.metadata-tooltip')) {
                return;
            }
            
            clearTimeout(hideTimeout);
            clearTimeout(showTimeout);
            
            // Delay showing tooltip to prevent spam
            showTimeout = setTimeout(() => {
                currentBlockId = blockId;
                showTooltip(blockEl);
            }, 300);
        }
        
        // Check if entering tooltip
        const tooltipEl = getClosest(e.target, '.metadata-tooltip');
        if (tooltipEl) {
            isOverTooltip = true;
            clearTimeout(hideTimeout);
            clearTimeout(showTimeout);
        }
    }, true);
    
    document.addEventListener('mouseleave', (e) => {
        if (!e.target) return;
        
        const blockEl = getClosest(e.target, '[data-simple], [data-analogy], [data-why]');
        if (blockEl) {
            isOverBlock = false;
            clearTimeout(showTimeout);
            
            // Delay hiding to allow moving to tooltip
            hideTimeout = setTimeout(() => {
                if (shouldHide()) {
                    hideTooltip();
                    currentBlockId = null;
                }
            }, 300);
        }
        
        const tooltipEl = getClosest(e.target, '.metadata-tooltip');
        if (tooltipEl) {
            isOverTooltip = false;
            hideTimeout = setTimeout(() => {
                if (shouldHide()) {
                    hideTooltip();
                    currentBlockId = null;
                }
            }, 300);
        }
    }, true);
    
    // Touch support for mobile - click on indicator
    document.addEventListener('click', (e) => {
        if (!e.target) return;
        const indicator = getClosest(e.target, '.metadata-indicator');
        if (indicator) {
            e.preventDefault();
            e.stopPropagation();
            const blockEl = getClosest(indicator, '[data-simple], [data-analogy], [data-why]');
            if (blockEl) {
                const blockId = blockEl.getAttribute('data-id');
                const existing = document.querySelector('.metadata-tooltip');
                
                if (existing && currentBlockId === blockId) {
                    hideTooltip();
                    currentBlockId = null;
                } else {
                    currentBlockId = blockId;
                    showTooltip(blockEl);
                }
            }
        }
    });
    
    // Close tooltip when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target) return;
        if (!getClosest(e.target, '.metadata-tooltip') && !getClosest(e.target, '.metadata-indicator')) {
            if (document.querySelector('.metadata-tooltip')) {
                hideTooltip();
                currentBlockId = null;
            }
        }
    });
}

// Show tooltip with improved positioning and tabs
function showTooltip(blockEl) {
    // Check if tooltip already exists for this block
    const existingTooltip = document.querySelector('.metadata-tooltip');
    if (existingTooltip) {
        const existingBlockId = existingTooltip.getAttribute('data-block-id');
        const currentBlockId = blockEl.getAttribute('data-id');
        if (existingBlockId === currentBlockId) {
            return; // Already showing tooltip for this block
        }
        // Remove existing tooltip if it's for a different block
        hideTooltip();
    }
    
    const simple = blockEl.getAttribute('data-simple');
    const analogy = blockEl.getAttribute('data-analogy');
    const why = blockEl.getAttribute('data-why');
    
    if (!simple && !analogy && !why) return;
    
    const blockId = blockEl.getAttribute('data-id');
    
    // Build tabs array
    const tabs = [];
    if (simple) tabs.push({ type: 'simple', icon: '🎯', label: 'Simple', content: simple });
    if (analogy) tabs.push({ type: 'analogy', icon: '🔄', label: 'Analogy', content: analogy });
    if (why) tabs.push({ type: 'why', icon: '❓', label: 'Why', content: why });
    
    const tooltip = document.createElement('div');
    tooltip.className = 'metadata-tooltip';
    tooltip.setAttribute('data-block-id', blockId);
    tooltip.innerHTML = `
        <div class="tooltip-header">
            <div class="tooltip-tabs">
                ${tabs.map((tab, index) => `
                    <button class="tooltip-tab ${index === 0 ? 'active' : ''}" data-tab="${tab.type}">
                        <span class="tab-icon">${tab.icon}</span>
                        <span class="tab-label">${tab.label}</span>
                    </button>
                `).join('')}
            </div>
            <button class="tooltip-close" onclick="hideTooltip()" aria-label="Close">×</button>
        </div>
        <div class="tooltip-body">
            ${tabs.map((tab, index) => `
                <div class="tooltip-content ${index === 0 ? 'active' : ''}" data-content="${tab.type}">
                    <div class="tooltip-text">${tab.content}</div>
                    <button class="add-to-note-btn" data-block-id="${blockId}" data-type="${tab.type}">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M7 3v8M3 7h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        Add to my notes
                    </button>
                </div>
            `).join('')}
        </div>
    `;
    
    document.body.appendChild(tooltip);
    
    // Add tab switching handlers
    tooltip.querySelectorAll('.tooltip-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabType = tab.getAttribute('data-tab');
            
            // Update active tab
            tooltip.querySelectorAll('.tooltip-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active content
            tooltip.querySelectorAll('.tooltip-content').forEach(c => c.classList.remove('active'));
            tooltip.querySelector(`.tooltip-content[data-content="${tabType}"]`).classList.add('active');
        });
    });
    
    // Add click handlers for buttons
    tooltip.querySelectorAll('.add-to-note-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const blockId = btn.getAttribute('data-block-id');
            const type = btn.getAttribute('data-type');
            addToNote(blockId, type);
        });
    });
    
    // Position tooltip with smart placement
    positionTooltip(tooltip, blockEl);
    
    // Animate in
    requestAnimationFrame(() => {
        tooltip.classList.add('visible');
    });
}

// Smart tooltip positioning
function positionTooltip(tooltip, blockEl) {
    const rect = blockEl.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    
    const spacing = 16;
    let left, top;
    let placement = 'right'; // default
    
    // Try right side first
    if (rect.right + spacing + tooltipRect.width < viewportWidth - 20) {
        left = rect.right + spacing + scrollX;
        top = rect.top + scrollY;
        placement = 'right';
    }
    // Try left side
    else if (rect.left - spacing - tooltipRect.width > 20) {
        left = rect.left - spacing - tooltipRect.width + scrollX;
        top = rect.top + scrollY;
        placement = 'left';
    }
    // Fall back to below
    else {
        left = Math.max(20, Math.min(rect.left + scrollX, viewportWidth - tooltipRect.width - 20));
        top = rect.bottom + spacing + scrollY;
        placement = 'bottom';
    }
    
    // Adjust vertical position if tooltip goes off screen
    if (top + tooltipRect.height > viewportHeight + scrollY - 20) {
        if (placement === 'bottom') {
            top = rect.top - spacing - tooltipRect.height + scrollY;
        } else {
            top = Math.max(20 + scrollY, viewportHeight + scrollY - tooltipRect.height - 20);
        }
    }
    
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.setAttribute('data-placement', placement);
}

// Hide tooltip
function hideTooltip() {
    const existing = document.querySelector('.metadata-tooltip');
    if (existing) {
        existing.classList.remove('visible');
        setTimeout(() => {
            // Double check it's still not being hovered before removing
            if (existing.parentNode) {
                existing.remove();
            }
        }, 200);
    }
}

// Add metadata to note with better UX
function addToNote(blockId, type) {
    const blockEl = document.querySelector(`[data-id="${blockId}"]`);
    if (!blockEl) return;
    
    let text = '';
    let label = '';
    
    switch(type) {
        case 'simple':
            text = blockEl.getAttribute('data-simple');
            label = '🎯 Simple';
            break;
        case 'analogy':
            text = blockEl.getAttribute('data-analogy');
            label = '🔄 Analogy';
            break;
        case 'why':
            text = blockEl.getAttribute('data-why');
            label = '❓ Why';
            break;
    }
    
    if (!text) return;
    
    // Find or create a note area in the block
    let noteArea = blockEl.querySelector('.user-notes');
    if (!noteArea) {
        noteArea = document.createElement('div');
        noteArea.className = 'user-notes';
        noteArea.contentEditable = 'true';
        blockEl.appendChild(noteArea);
    }
    
    // Add the text as a labeled note
    const noteItem = document.createElement('div');
    noteItem.className = 'added-note';
    noteItem.innerHTML = `
        <span class="note-label">${label}</span>
        <span class="note-text">${text}</span>
    `;
    noteArea.appendChild(noteItem);
    
    // Visual feedback
    noteItem.classList.add('note-added-animation');
    
    // Show success notification
    showNotification(`✅ Added ${label} to your notes`);
    
    // Update button state
    const btn = document.querySelector(`.add-to-note-btn[data-block-id="${blockId}"][data-type="${type}"]`);
    if (btn) {
        btn.classList.add('added');
        btn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l4 4 6-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Added
        `;
        btn.disabled = true;
    }
    
    // Save to localStorage
    saveToLocalStorage();
}

// Make functions globally accessible
window.addToNote = addToNote;
window.hideTooltip = hideTooltip;

// Render metadata panel
function renderMetadataPanel(block) {
    if (!block.simple_explanation && !block.analogy && !block.why_exists) {
        return '';
    }
    
    return `
        <div class="metadata-panel collapsed" data-id="${block.id}">
            <button class="metadata-toggle" onclick="toggleMetadata(${block.id})">
                <span class="toggle-icon">▶</span>
                <span class="toggle-text">Understand Better</span>
            </button>
            <div class="metadata-content">
                ${block.simple_explanation ? `
                    <div class="metadata-item">
                        <div class="metadata-label">💡 Simple Explanation</div>
                        <div class="metadata-text">${parseMarkdownBullets(block.simple_explanation)}</div>
                    </div>
                ` : ''}
                ${block.analogy ? `
                    <div class="metadata-item">
                        <div class="metadata-label">🔄 Real-World Analogy</div>
                        <div class="metadata-text">${parseMarkdownBullets(block.analogy)}</div>
                    </div>
                ` : ''}
                ${block.why_exists ? `
                    <div class="metadata-item">
                        <div class="metadata-label">❓ Why This Exists</div>
                        <div class="metadata-text">${parseMarkdownBullets(block.why_exists)}</div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Toggle metadata panel
function toggleMetadata(id) {
    const panel = document.querySelector(`.metadata-panel[data-id="${id}"]`);
    if (!panel) return;
    
    panel.classList.toggle('collapsed');
    
    const icon = panel.querySelector('.toggle-icon');
    if (icon) {
        icon.textContent = panel.classList.contains('collapsed') ? '▶' : '▼';
    }
}

// Make toggleMetadata globally accessible
window.toggleMetadata = toggleMetadata;

// Alias for backward compatibility
function formatInlineMarkdown(text) {
    return formatText(text);
}

// Export to markdown
function exportMarkdown() {
    if (!currentData) return;
    
    const dataArray = currentData.content;
    if (!dataArray) return;
    
    let md = `# ${currentData.title}\n**${currentData.topic}**\n\n`;
    
    dataArray.forEach(block => {
        const indent = '  '.repeat((block.level || 1) - 1);
        const text = block.full_text; // Always export full version
        
        if (block.type === 'section') {
            md += `\n${'#'.repeat(block.level || 1)} ${block.title}\n\n${text}\n\n`;
        } else if (block.type === 'list') {
            md += `${text}\n`;
            block.items?.forEach(item => {
                const fullPart = item.includes('|') ? 
                    item.split('|')[1].replace(/^FULL:\s*/i, '').trim() : item;
                md += `${indent}- ${fullPart}\n`;
            });
            md += '\n';
        } else {
            md += `${indent}${text}\n\n`;
        }
    });
    
    const filename = `${currentData.title || 'study-notes'}.md`;
    downloadFile(md, filename, 'text/markdown');
}

// Utilities
function saveToLocalStorage() {
    if (currentData) {
        localStorage.setItem('studyNotes', JSON.stringify(currentData));
    }
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('studyNotes');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            loadJSON(data);
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }
}

// Load notes library from /notes folder
async function loadNotesLibrary() {
    // Hardcoded list of available notes (most reliable for static sites)
    const availableNotes = [
        {
            name: 'Information Systems',
            path: 'notes/information-systems.json'
        }
    ];
    
    // Try to dynamically load from notes/index.html
    try {
        const indexResponse = await fetch('notes/index.html');
        if (indexResponse.ok) {
            const html = await indexResponse.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const links = doc.querySelectorAll('a[href$=".json"]');
            
            if (links.length > 0) {
                notesLibrary = Array.from(links).map(link => {
                    const href = link.getAttribute('href');
                    const name = link.textContent.replace('.json', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    return {
                        name: name,
                        path: 'notes/' + href
                    };
                });
                console.log('Dynamically loaded notes:', notesLibrary);
            } else {
                // Fallback to hardcoded list
                notesLibrary = availableNotes;
                console.log('Using hardcoded notes list');
            }
        } else {
            // Fallback to hardcoded list
            notesLibrary = availableNotes;
            console.log('Could not load notes/index.html, using hardcoded list');
        }
    } catch (error) {
        // Fallback to hardcoded list
        notesLibrary = availableNotes;
        console.log('Error loading notes library, using hardcoded list:', error);
    }
    
    // Always show library view
    showLibraryView();
}

// Load a specific note file
async function loadNoteFromPath(path) {
    try {
        const response = await fetch(path);
        if (response.ok) {
            const data = await response.json();
            loadJSON(data);
            hideLibraryView();
        } else {
            showNotification('❌ Failed to load note', 'error');
            console.error('Failed to load:', path, 'Status:', response.status);
        }
    } catch (error) {
        // If fetch fails (like in file:// protocol), show helpful message
        if (window.location.protocol === 'file:') {
            showNotification('⚠️ Please run a local server. See README.md', 'error');
            console.error('Cannot use fetch with file:// protocol. Please run a local server.');
            console.log('Quick fix: Run "python3 -m http.server 8000" and open http://localhost:8000');
        } else {
            showNotification('❌ Error loading note', 'error');
            console.error('Error loading note:', error);
        }
    }
}

// Show library view
function showLibraryView() {
    const hasNotes = notesLibrary.length > 0;
    
    const libraryHTML = `
        <div class="library-view">
            <div class="library-header">
                <h2>📚 Study Notes Library</h2>
                <p>${hasNotes ? 'Select a note to start studying' : 'No notes found in library'}</p>
            </div>
            <div class="library-grid">
                ${hasNotes ? notesLibrary.map(note => `
                    <div class="library-card" onclick="loadNoteFromPath('${note.path}')">
                        <div class="card-icon">📄</div>
                        <div class="card-title">${note.name}</div>
                    </div>
                `).join('') : ''}
                <div class="library-card import-card" onclick="document.getElementById('fileInput').click()">
                    <div class="card-icon">📂</div>
                    <div class="card-title">Import File</div>
                </div>
            </div>
        </div>
    `;
    
    noteContent.innerHTML = libraryHTML;
    document.querySelector('.paper-sheet').classList.add('library-mode');
}

// Hide library view
function hideLibraryView() {
    document.querySelector('.paper-sheet').classList.remove('library-mode');
}

// Make functions globally accessible
window.loadNoteFromPath = loadNoteFromPath;

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Set initial mode styling and button state
    studyModeButtons.forEach(btn => {
        if (btn.dataset.mode === currentMode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    if (currentMode === 'exam') {
        document.body.classList.add('exam-mode');
        document.body.classList.remove('full-mode');
    } else {
        document.body.classList.add('full-mode');
        document.body.classList.remove('exam-mode');
    }
    
    // Restore checkbox states
    toggleTooltipsCheckbox.checked = showTooltips;
    togglePathsCheckbox.checked = showPaths;
    
    // Apply initial states
    if (!showTooltips) {
        document.body.classList.add('tooltips-disabled');
    }
    
    loadNotesLibrary();
    initHoverTooltips();
    initConfettiOnComplete();
});


// Confetti celebration when completing notes
function initConfettiOnComplete() {
    let jsConfetti = null;
    let startTime = null;
    let hasShownConfetti = false;
    let isAtBottom = false;
    
    const MIN_READ_TIME = 10000; // 10 seconds minimum
    const SCROLL_THRESHOLD = 50; // pixels from bottom
    
    // Initialize confetti instance
    try {
        if (typeof JSConfetti !== 'undefined') {
            jsConfetti = new JSConfetti();
        }
    } catch (error) {
        console.log('Confetti library not available');
        return;
    }
    
    // Track when user starts reading
    const resetTimer = () => {
        startTime = Date.now();
        hasShownConfetti = false;
        isAtBottom = false;
    };
    
    // Check if scrolled to bottom
    const checkScrollPosition = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        
        const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
        return distanceFromBottom <= SCROLL_THRESHOLD;
    };
    
    // Handle scroll event with throttling
    let scrollTimeout = null;
    const handleScroll = () => {
        if (scrollTimeout) return;
        
        scrollTimeout = setTimeout(() => {
            scrollTimeout = null;
            
            const nowAtBottom = checkScrollPosition();
            
            // User reached bottom
            if (nowAtBottom && !isAtBottom && !hasShownConfetti) {
                isAtBottom = true;
                
                const timeSpent = Date.now() - startTime;
                
                // Only show confetti if user spent enough time reading
                if (timeSpent >= MIN_READ_TIME && jsConfetti) {
                    hasShownConfetti = true;
                    
                    // Trigger confetti celebration
                    jsConfetti.addConfetti({
                        confettiColors: [
                            '#c9a57a', // margin-line color
                            '#d4a574', // important-mark color
                            '#f5e6d3', // warm beige
                            '#fff4d6', // highlight yellow
                            '#8b7355', // brown
                            '#fef9e7'  // critical-bg
                        ],
                        confettiRadius: 6,
                        confettiNumber: 150,
                    });
                    
                    // Optional: Show a subtle notification
                    showNotification('🎉 Great job completing this note!');
                }
            } else if (!nowAtBottom) {
                isAtBottom = false;
            }
        }, 100); // Throttle to every 100ms
    };
    
    // Reset timer when new content is loaded
    const originalLoadJSON = window.loadJSON || loadJSON;
    window.loadJSON = function(...args) {
        resetTimer();
        return originalLoadJSON.apply(this, args);
    };
    
    // Start timer on initial load
    resetTimer();
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Cleanup function (if needed)
    return () => {
        window.removeEventListener('scroll', handleScroll);
    };
}
