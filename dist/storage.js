// storage.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * 저장소에서 모든 규칙을 검색합니다.
 * @returns {Promise<Rule[]>} - 규칙 배열로 확인되는 프로미스입니다.
 */
export function getRules() {
    return __awaiter(this, void 0, void 0, function* () {
        const { rules = [] } = yield chrome.storage.sync.get('rules');
        return rules;
    });
}
/**
 * 저장소에 새 규칙을 추가합니다.
 * @param {Rule} newRule - 추가할 규칙입니다(예: { pattern: '*.google.com', groupName: 'Google' }).
 * @returns {Promise<void>}
 */
export function addRule(newRule) {
    return __awaiter(this, void 0, void 0, function* () {
        const rules = yield getRules();
        if (!rules.some((rule) => rule.pattern === newRule.pattern)) {
            rules.push(newRule);
            yield chrome.storage.sync.set({ rules });
        }
    });
}
/**
 * 인덱스로 저장소에서 규칙을 삭제합니다.
 * @param {number} indexToDelete - 삭제할 규칙의 인덱스입니다.
 * @returns {Promise<void>}
 */
export function deleteRule(indexToDelete) {
    return __awaiter(this, void 0, void 0, function* () {
        const rules = yield getRules();
        if (indexToDelete >= 0 && indexToDelete < rules.length) {
            rules.splice(indexToDelete, 1);
            yield chrome.storage.sync.set({ rules });
        }
    });
}
/**
 * 이전에 정렬된 탭을 로컬 저장소에 저장합니다.
 * @param {TabInfo[]} tabs - 정렬된 탭 정보의 배열입니다.
 * @returns {Promise<void>}
 */
export function savePrevTabs(tabs) {
    return __awaiter(this, void 0, void 0, function* () {
        yield chrome.storage.local.set({ autoSortedPrevTabs: tabs });
    });
}
/**
 * 로컬 저장소에서 이전에 정렬된 탭을 지웁니다.
 * @returns {Promise<void>}
 */
export function clearPrevTabs() {
    return __awaiter(this, void 0, void 0, function* () {
        yield chrome.storage.local.set({ autoSortedPrevTabs: [] });
    });
}
/**
 * 로컬 저장소에서 이전에 정렬된 탭을 가져옵니다.
 * @returns {Promise<TabInfo[]>}
 */
export function getPrevTabs() {
    return __awaiter(this, void 0, void 0, function* () {
        const { autoSortedPrevTabs = [] } = yield chrome.storage.local.get('autoSortedPrevTabs');
        return autoSortedPrevTabs;
    });
}
