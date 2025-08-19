var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// options.ts
import { getRules, addRule, deleteRule } from './storage.js';
import { displayRules } from './ui.js';
document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소를 가져오고 타입을 지정합니다.
    const addRuleForm = document.getElementById('add-rule-form');
    const patternInput = document.getElementById('pattern-input');
    const groupNameInput = document.getElementById('group-name-input');
    const searchInput = document.getElementById('search-input');
    const rulesContainer = document.getElementById('rules-container');
    // 필수 요소가 존재하는지 확인합니다.
    if (!addRuleForm || !patternInput || !groupNameInput || !searchInput || !rulesContainer) {
        console.error("필수 DOM 요소를 찾을 수 없습니다.");
        return;
    }
    function loadAndDisplayRules() {
        return __awaiter(this, void 0, void 0, function* () {
            const rules = yield getRules();
            const query = searchInput.value.trim();
            displayRules(rules, query);
        });
    }
    // 새 규칙 추가
    addRuleForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        const pattern = patternInput.value.trim();
        const groupName = groupNameInput.value.trim();
        if (pattern && groupName) {
            yield addRule({ pattern, groupName });
            patternInput.value = '';
            groupNameInput.value = '';
            yield loadAndDisplayRules();
        }
    }));
    // 규칙 삭제
    rulesContainer.addEventListener('click', (e) => __awaiter(void 0, void 0, void 0, function* () {
        const target = e.target;
        const deleteButton = target.closest('.delete-btn');
        if (deleteButton) {
            const indexStr = deleteButton.dataset.index;
            if (indexStr) {
                const indexToDelete = parseInt(indexStr, 10);
                yield deleteRule(indexToDelete);
                yield loadAndDisplayRules();
            }
        }
    }));
    // 규칙 검색
    searchInput.addEventListener('input', () => {
        loadAndDisplayRules();
    });
    // 규칙 초기 표시
    loadAndDisplayRules();
});
