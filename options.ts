// options.ts
import { getRules, addRule, deleteRule, Rule } from './storage.js';
import { displayRules } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소를 가져오고 타입을 지정합니다.
    const addRuleForm = document.getElementById('add-rule-form') as HTMLFormElement;
    const patternInput = document.getElementById('pattern-input') as HTMLInputElement;
    const groupNameInput = document.getElementById('group-name-input') as HTMLInputElement;
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    const rulesContainer = document.getElementById('rules-container') as HTMLDivElement;

    // 필수 요소가 존재하는지 확인합니다.
    if (!addRuleForm || !patternInput || !groupNameInput || !searchInput || !rulesContainer) {
        console.error("필수 DOM 요소를 찾을 수 없습니다.");
        return;
    }

    async function loadAndDisplayRules(): Promise<void> {
        const rules: Rule[] = await getRules();
        const query: string = searchInput.value.trim();
        displayRules(rules, query);
    }

    // 새 규칙 추가
    addRuleForm.addEventListener('submit', async (e: SubmitEvent) => {
        e.preventDefault();
        const pattern = patternInput.value.trim();
        const groupName = groupNameInput.value.trim();

        if (pattern && groupName) {
            await addRule({ pattern, groupName });
            patternInput.value = '';
            groupNameInput.value = '';
            await loadAndDisplayRules();
        }
    });

    // 규칙 삭제
    rulesContainer.addEventListener('click', async (e: MouseEvent) => {
        const target = e.target as Element;
        const deleteButton = target.closest('.delete-btn') as HTMLButtonElement | null;
        
        if (deleteButton) {
            const indexStr = deleteButton.dataset.index;
            if (indexStr) {
                const indexToDelete = parseInt(indexStr, 10);
                await deleteRule(indexToDelete);
                await loadAndDisplayRules();
            }
        }
    });

    // 규칙 검색
    searchInput.addEventListener('input', () => {
        loadAndDisplayRules();
    });

    // 규칙 초기 표시
    loadAndDisplayRules();
});
