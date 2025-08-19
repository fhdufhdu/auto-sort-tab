// tabs.ts
import { getRules, savePrevTabs, getPrevTabs, clearPrevTabs, Rule, TabInfo } from './storage.js';

// 탭 그룹에 사용될 색상 배열
const COLORS = [
  'grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan'
];

/**
 * 와일드카드 패턴을 정규식으로 변환합니다.
 * @param {string} pattern - 와일드카드 패턴입니다(예: *.example.com).
 * @returns {RegExp} - 정규식 개체입니다.
 */
function wildcardToRegex(pattern: string): RegExp {
  const escapedPattern = pattern.replace(/[.+?^${}()|[\/]/g, '\$&');
  const regexPattern = escapedPattern.replace(/\*/g, '.*');
  return new RegExp(`^${regexPattern}$`);
}

/**
 * 저장된 규칙을 기반으로 호스트 이름의 기본 그룹 이름을 찾습니다.
 * @param {string} hostname - URL의 호스트 이름입니다.
 * @param {Rule[]} rules - 규칙의 배열입니다.
 * @returns {string} - 일치하는 그룹 이름 또는 원래 호스트 이름입니다.
 */
function getTabGroupName(hostname: string, rules: Rule[]): string {
    const foundRule = rules.find(rule => wildcardToRegex(rule.pattern).test(hostname));
    return foundRule ? foundRule.groupName : hostname;
}

/**
 * 문자열을 지정된 범위(0 ~ n-1) 내의 인덱스로 해시합니다.
 * @param {string} str - 해시할 문자열입니다.
 * @param {number} n - 원하는 범위의 크기입니다.
 * @returns {number} - 0 <= index < n과 같은 인덱스입니다.
 */
function hashStringToIndex(str: string, n: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash += str.charCodeAt(i);
  }
  return Math.abs(hash) % n;
}

/**
 * 현재 탭 순서가 이전에 저장된 순서와 동일한지 확인합니다.
 * @param {TabInfo[]} tabs - 현재 탭 정보의 배열입니다.
 * @returns {Promise<boolean>} - 순서가 같으면 true이고, 그렇지 않으면 false입니다.
 */
async function isSameAsPrevTabs(tabs: TabInfo[]): Promise<boolean> {
    const prevTabs = await getPrevTabs();
    return tabs.length === prevTabs.length &&
        tabs.every((tab, index) => tab.base === prevTabs[index].base);
}

/**
 * 현재 창의 탭을 도메인별로 정렬합니다.
 * @returns {Promise<{isSorted: boolean, tabs: TabInfo[]}>} - 정렬 상태 및 탭 정보가 있는 개체입니다.
 */
async function sortTabs(): Promise<{isSorted: boolean, tabs: TabInfo[]}> {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const rules = await getRules();

    let tabInfos: TabInfo[] = (await Promise.all(tabs.map(async (tab): Promise<TabInfo | null> => {
        if (!tab.url || !tab.id) return null;
        try {
            const { hostname } = new URL(tab.url);
            const lowerHostname = hostname.toLowerCase();
            const tabGroupName = getTabGroupName(lowerHostname, rules);
            return { id: tab.id, tabGroupName, hostname: lowerHostname, base: lowerHostname };
        } catch {
            return { id: tab.id, tabGroupName: '', hostname: '', base: '' };
        }
    }))).filter((info): info is TabInfo => info !== null);

    tabInfos.sort((a, b) => a.hostname.localeCompare(b.hostname));

    if (await isSameAsPrevTabs(tabInfos)) {
        return { isSorted: false, tabs: [] };
    }

    for (let i = 0; i < tabInfos.length; i++) {
        await chrome.tabs.move(tabInfos[i].id, { index: i });
    }

    await savePrevTabs(tabInfos);
    return { isSorted: true, tabs: tabInfos };
}

/**
 * 현재 정렬된 탭을 그룹화합니다.
 * @param {TabInfo[]} tabInfos - 정렬된 탭 정보의 배열입니다.
 */
async function groupTabs(tabInfos: TabInfo[]): Promise<void> {
    const groups: { [key: string]: number[] } = {};
    tabInfos.forEach(({ id, tabGroupName }) => {
        if (!groups[tabGroupName]) groups[tabGroupName] = [];
        groups[tabGroupName].push(id);
    });

    for (const [tabGroupName, tabIds] of Object.entries(groups)) {
        if (tabIds.length > 0 && tabGroupName) {
            try {
                const color = COLORS[hashStringToIndex(tabGroupName, COLORS.length)] as chrome.tabGroups.Color;
                const groupId = await chrome.tabs.group({ tabIds: tabIds as [number, ...number[]] });
                await chrome.tabGroups.update(groupId, { title: tabGroupName, color });
            } catch (e) {
                console.error(`Tab grouping failed for "${tabGroupName}":`, e);
            }
        }
    }
}

/**
 * 현재 창에서 탭을 정렬한 다음 그룹화합니다.
 */
export async function sortAndGroupTabs(): Promise<void> {
    const result = await sortTabs();
    if (result && result.isSorted) {
        await groupTabs(result.tabs);
    }
}

/**
 * 이전 탭 상태를 지우고 정렬 및 그룹화를 다시 실행합니다.
 */
export async function refresh(): Promise<void> {
    await clearPrevTabs();
    await sortAndGroupTabs();
}
