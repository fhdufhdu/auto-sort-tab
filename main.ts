// main.js
import { sortAndGroupTabs, refresh } from './tabs.js';

// 이벤트 리스너 추가
chrome.action.onClicked.addListener(refresh);

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'complete') {
        sortAndGroupTabs();
    }
});
