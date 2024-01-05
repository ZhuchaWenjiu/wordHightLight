var wordList = new Array();

window.onload = function() {
    // 这里放置在DOM加载完全后执行的插件代码
    console.log('hightLight Start !!!');
        
    // 调用你的插件函数或其他操作
    getWordListAndHightLight();
}


// 双击单词时高亮或者取消高亮
document.addEventListener('dblclick', function(event) {
    console.log(wordList);
    var selectedText = window.getSelection().toString().trim();
    const indexOfWord = wordList.indexOf(selectedText);
    if(indexOfWord !== -1){
        // wordList中删除此单词并取消高亮
        removeHighlight();
        wordList.splice(indexOfWord, 1);
    }
    else{
        // 添加此单词
        wordList.push(selectedText);
    }
    console.log(wordList);
    wordList.forEach(element => {
        highlightText(element.trim());
    });
    setWordList(wordList);

});

// 获取单词列表
function highlightText(text) {
    console.log("hight light ," , text);
    const body = document.body;
    const regex = new RegExp(text, 'gi');
    let match;
    const nodesToHighlight = [];
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node) {
        if (node.parentNode.nodeName.match(/^(script|style)$/i)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }, false);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentNode.classList.contains('highlighted')) {
        continue;
      }
      while ((match = regex.exec(node.nodeValue))) {
        const span = document.createElement('span');
        span.style.backgroundColor = 'yellow';
        span.textContent = match[0];
        const range = document.createRange();
        range.setStart(node, match.index);
        range.setEnd(node, regex.lastIndex);
        nodesToHighlight.push({ range, span });
        regex.lastIndex -= match[0].length - span.textContent.length;
      }
    }
    const shadowHosts = document.querySelectorAll('*');
    shadowHosts.forEach(shadowHost => {
      if (shadowHost.shadowRoot) {
        const shadowRoot = shadowHost.shadowRoot;
        const walker = document.createTreeWalker(shadowRoot, NodeFilter.SHOW_TEXT, {
          acceptNode: function(node) {
            if (node.parentNode.nodeName.match(/^(script|style)$/i)) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        }, true);
        while (walker.nextNode()) {
          const node = walker.currentNode;
          if (node.parentNode.classList.contains('highlighted')) {
            continue;
          }
          while ((match = regex.exec(node.nodeValue))) {
            const span = document.createElement('span');
            span.style.backgroundColor = 'yellow';
            span.textContent = match[0];
            const range = document.createRange();
            range.setStart(node, match.index);
            range.setEnd(node, regex.lastIndex);
            nodesToHighlight.push({ range, span });
            regex.lastIndex -= match[0].length - span.textContent.length;
          }
        }
      }
    });
    nodesToHighlight.forEach(nodeToHighlight => {
      const range = nodeToHighlight.range;
      const span = nodeToHighlight.span;
      range.deleteContents();
      span.classList.add('highlighted');
      range.insertNode(span);
    });
  }

  function removeHighlight() {
    const highlightedSpans = document.querySelectorAll('span[style="background-color: yellow;"]');
    highlightedSpans.forEach(span => {
      const range = document.createRange();
      range.selectNode(span);
      range.deleteContents();
      range.insertNode(document.createTextNode(span.textContent));
    });
    const shadowHosts = document.querySelectorAll('*');
    shadowHosts.forEach(shadowHost => {
      if (shadowHost.shadowRoot) {
        const highlightedSpans = shadowHost.shadowRoot.querySelectorAll('span[style="background-color: yellow;"]');
        highlightedSpans.forEach(span => {
          const range = document.createRange();
          range.selectNode(span);
          range.deleteContents();
          range.insertNode(document.createTextNode(span.textContent));
        });
      }
    });
  }


function setWordList(savedData){
    chrome.storage.sync.set({ 'wordList': savedData }, function() {
        console.log('Word list saved to sync storage');
      });
}

function getWordList(){
    chrome.storage.sync.get(['wordList'], function(result) {
        if (Object.keys(result).length === 0) {
            console.log("wordList is Null");
          } else {
            console.log("find wordList ", result.wordList);
            wordList = result.wordList;
          }
      });
}

function getWordListAndHightLight(){
    chrome.storage.sync.get(['wordList'], function(result) {
        if (Object.keys(result).length === 0) {
            console.log("wordList is Null");
          } else {
            console.log("find wordList ", result.wordList);
            wordList = result.wordList;
            wordList.forEach(element => {
                console.log("element, ", element);
                highlightText(element.trim());
            });
          }
      });
}

