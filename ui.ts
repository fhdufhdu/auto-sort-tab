// ui.ts
import { Rule } from './storage.js';

/**
 * XSS를 방지하기 위해 HTML 특수 문자를 이스케이프 처리합니다.
 * @param {string} str - 이스케이프할 문자열입니다.
 * @returns {string} - 이스케이프 처리된 문자열입니다.
 */
function escapeHTML(str: string): string {
    return str.replace(/[&<>'"\/]/g, function (tag: string): string {
        const chars: {[key: string]: string} = {
            '&': '&amp;', '<': '&lt;', '>': '&gt;',
            "'": '&#39;', '"': '&quot;', '/': '&#x2F;'
        };
        return chars[tag] || tag;
    });
}

/**
 * UI에 규칙 목록을 렌더링합니다.
 * @param {Rule[]} rules - 표시할 규칙의 배열입니다.
 * @param {string} query - 규칙을 필터링하기 위한 검색어입니다.
 */
export function displayRules(rules: Rule[], query: string = ''): void {
    const rulesContainer = document.getElementById('rules-container');
    const emptyState = document.getElementById('empty-state');

    if (!rulesContainer || !emptyState) {
        console.error("UI elements not found");
        return;
    }

    rulesContainer.innerHTML = '';

    const searchTerm = query.toLowerCase();
    const filteredRules = rules.filter((rule: Rule) =>
        rule.pattern.toLowerCase().includes(searchTerm) ||
        rule.groupName.toLowerCase().includes(searchTerm)
    );

    if (filteredRules.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
    }

    filteredRules.forEach((rule: Rule) => {
        const originalIndex = rules.findIndex((r: Rule) => r.pattern === rule.pattern && r.groupName === rule.groupName);
        const ruleElement = document.createElement('div');
        ruleElement.className = 'rule-card';
        ruleElement.innerHTML = `
            <div>
                <p>${escapeHTML(rule.groupName)}</p>
                <p>${escapeHTML(rule.pattern)}</p>
            </div>
            <button data-index="${originalIndex}" class="delete-btn">Remove</button>
        `;
        rulesContainer.appendChild(ruleElement);
    });
}