// storage.ts

// 규칙 객체의 타입을 정의합니다.
export interface Rule {
    pattern: string;
    groupName: string;
}

// 정렬 및 비교에 사용될 탭 정보 인터페이스
export interface TabInfo {
    id: number;
    tabGroupName: string;
    hostname: string;
    base: string; // 비교를 위한 기준 문자열
}

/**
 * 저장소에서 모든 규칙을 검색합니다.
 * @returns {Promise<Rule[]>} - 규칙 배열로 확인되는 프로미스입니다.
 */
export async function getRules(): Promise<Rule[]> {
    const { rules = [] } = await chrome.storage.sync.get('rules');
    return rules;
}

/**
 * 저장소에 새 규칙을 추가합니다.
 * @param {Rule} newRule - 추가할 규칙입니다(예: { pattern: '*.google.com', groupName: 'Google' }).
 * @returns {Promise<void>}
 */
export async function addRule(newRule: Rule): Promise<void> {
    const rules = await getRules();
    if (!rules.some((rule: Rule) => rule.pattern === newRule.pattern)) {
        rules.push(newRule);
        await chrome.storage.sync.set({ rules });
    }
}

/**
 * 인덱스로 저장소에서 규칙을 삭제합니다.
 * @param {number} indexToDelete - 삭제할 규칙의 인덱스입니다.
 * @returns {Promise<void>}
 */
export async function deleteRule(indexToDelete: number): Promise<void> {
    const rules = await getRules();
    if (indexToDelete >= 0 && indexToDelete < rules.length) {
        rules.splice(indexToDelete, 1);
        await chrome.storage.sync.set({ rules });
    }
}

/**
 * 이전에 정렬된 탭을 로컬 저장소에 저장합니다.
 * @param {TabInfo[]} tabs - 정렬된 탭 정보의 배열입니다.
 * @returns {Promise<void>}
 */
export async function savePrevTabs(tabs: TabInfo[]): Promise<void> {
    await chrome.storage.local.set({ autoSortedPrevTabs: tabs });
}

/**
 * 로컬 저장소에서 이전에 정렬된 탭을 지웁니다.
 * @returns {Promise<void>}
 */
export async function clearPrevTabs(): Promise<void> {
    await chrome.storage.local.set({ autoSortedPrevTabs: [] });
}

/**
 * 로컬 저장소에서 이전에 정렬된 탭을 가져옵니다.
 * @returns {Promise<TabInfo[]>}
 */
export async function getPrevTabs(): Promise<TabInfo[]> {
    const { autoSortedPrevTabs = [] } = await chrome.storage.local.get('autoSortedPrevTabs');
    return autoSortedPrevTabs;
}
