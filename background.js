// background.js

const colors = [
  'grey',
  'blue',
  'red',
  'yellow',
  'green',
  'pink',
  'purple',
  'cyan'
];

/**
 * 문자열을 32비트 정수 해시로 변환한 뒤, 0~(n-1) 사이 인덱스로 매핑
 * @param {string} str - 해싱할 문자열
 * @param {number} n   - 원하는 범위(0 ~ n-1)의 크기
 * @returns {number}   - 0 <= x < n
 */
function hashStringToIndex(str, n) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash += str.charCodeAt(i);
  }
  // 음수 방지를 위해 절댓값, 그리고 원하는 범위로 모듈로
  return Math.abs(hash) % n;
}

// 기본 정렬 함수들
const extractBase = hostname =>
    hostname.split('.').slice(-2).join('.');
const extractSub = hostname =>
    hostname.split('.').slice(0, -2).join('.') || '';

const savePrevTabs = async (tabs) => {
    await chrome.storage.local.set({ autoSortedPrevTabs: tabs })
}

const clearPrevTabs = async () => {
    await chrome.storage.local.set({ autoSortedPrevTabs: [] });
}

const isSameAtPrevTabs = async (tabs) => {
    const prevTabs = (await chrome.storage.local.get({ autoSortedPrevTabs: [] })).autoSortedPrevTabs;

    return tabs.length === prevTabs.length &&
        tabs.every((tab, index) => tab.base === prevTabs[index].base);
}

// 탭 정렬 로직
async function sortTabs() {
    const tabs = await chrome.tabs.query({ currentWindow: true });

    // 도메인 + 서브도메인 키 생성
    let tabInfos = tabs.map(tab => {
        try {
            const { hostname } = new URL(tab.url);
            return {
                base: extractBase(hostname).toLowerCase(),
                url: hostname,
                ...tab
            };
        } catch {
            return { id: tab.id, base: '', sub: '' };
        }
    });

    // 그룹 내 정렬: 항상 base ↑, 그다음 sub ↑
    tabInfos = tabInfos.sort((a, b) => a.base < b.base ? -1 : 1);

    if (await isSameAtPrevTabs(tabInfos)) return false;

    // 실제 탭 이동
    for (let i = 0; i < tabInfos.length; i++) {
        await chrome.tabs.move(tabInfos[i].id, { index: i });
    }

    await savePrevTabs(tabInfos);
    return true;
}

async function sortAndGroupTabs() {
    // 1) 정렬 먼저
    const isSorted = await sortTabs();
    if (!isSorted) return;

    // 2) 정렬된 탭 정보 다시 가져오기
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const tabInfos = tabs.map(tab => {
        try {
            const hostname = new URL(tab.url).hostname;
            const base = hostname.split('.').slice(-2).join('.').toLowerCase();
            return { id: tab.id, base };
        } catch {
            return { id: tab.id, base: '' };
        }
    });

    // 3) 베이스 도메인별로 탭 아이디 묶기
    const groups = {};
    tabInfos.forEach(({ id, base }) => {
        if (!groups[base]) groups[base] = [];
        groups[base].push(id);
    });

    // 4) 각 그룹으로 묶기
    const tempGroups = Object.entries(groups);
    for (let i = 0; i < tempGroups.length; i++) {
        const [base, ids] = tempGroups[i];
        const color = colors[hashStringToIndex(base, colors.length)];
        if (ids.length > 0) {
            // 이미 그룹이 있으면 재사용, 없으면 새로 생성
            try {
                // (선택) 그룹에 이름/색상 지정
                const groupIds = await chrome.tabs.group({ tabIds: ids });
                let groupId = groupIds instanceof Array ? groupIds[0] : groupIds;
                await chrome.tabGroups.update(groupId, {
                    title: base,
                    color: color
                });
            } catch (e) {
                console.error('Tab grouping failed for', base, e);
            }
        }
    }
}

async function refresh() {
    await clearPrevTabs(); 
    await sortTabs();
}


// 아이콘 클릭 시 실행
chrome.action.onClicked.addListener(refresh);

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'complete') {
        sortTabs();
    }
});