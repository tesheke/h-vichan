// # js/quick-reply-singleton.js
// 
// 以下2つは外すこと
// - js/fix-google-recaptcha-v2.js
// - js/quick-reply.js
//
// - 移動可能な投稿フォームを実装する.
// - quick-reply.js とは違い投稿フォームを複製しない.
//   元々あるメインフォームを見掛け上移動できるようにする.
//   reCAPTCHAを動作するようにして、各種イベント設定を簡単にする.


function makeFormDraggable(el) {
  let isDragging = false;
  // クリック位置と要素左上の差分を保存する
  let offsetX = 0;
  let offsetY = 0;
  // 最低でも画面内にあるpixel数
  const minVisibility = 50;

  function ensureElementInViewport() {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      // 非表示中は何もしない
      return;
    };
    const vpwidth = window.innerWidth || document.documentElement.clientWidth;
    const vpheight = window.innerHeight || document.documentElement.clientHeight;
    const m = minVisibility;
    if (rect.bottom < m) {
      // 上すぎるのをなおす
      el.style.top = -(rect.height - m) + 'px';
    } else if (rect.top > vpheight - m) {
      // 下すぎるのをなおす
      el.style.top = (vpheight - m) + 'px';
    };
    if (rect.right < m) {
      // 右すぎるのをなおす
      el.style.left = -(rect.width - m) + 'px';
    } else if (rect.left > vpwidth - m) {
      // 左すぎるのをなおす
      el.style.left = (vpwidth - m) + 'px';
    };
  };
  function setWidthHeight(element) {
    const width = el.getBoundingClientRect().width;
    const height = el.getBoundingClientRect().height;
    element.style.minWidth = width + 'px';
    element.style.minHeight = height + 'px';
  };
  function setPlaceHolder() {
    const div = document.createElement('DIV');
    setWidthHeight(div);
    el.parentElement.insertBefore(div, el);
  };
  function startDragging(e) {
    isDragging = true;
    offsetX = e.clientX - el.getBoundingClientRect().left;
    offsetY = e.clientY - el.getBoundingClientRect().top;
  };
  function setCloseButton() {
    const origin = el.querySelector('input[name="name"]');
    const parent = origin.parentElement;
    const x = document.createElement('input');
    x.type = 'button';
    x.value = '　✖　';
    x.addEventListener('click', () => el.style.display = 'none');
    parent.appendChild(document.createTextNode(' '));
    parent.appendChild(x);
  };

  if (el.quick_reply_singleton_initialized === true) {
    if (el.style.display === 'none') {
      el.style.display = 'block';
    };
    return;
  };

  setCloseButton();
  setPlaceHolder();

  el.quick_reply_singleton_initialized = true;
  el.style.position = 'fixed';
  el.style.zIndex = 9999;
  el.style.backgroundColor = '#8883';
  {
    const r = el.getBoundingClientRect();
    const vpw = window.innerWidth || document.documentElement.clientWidth;
    const vph = window.innerHeight || document.documentElement.clientHeight;
    el.style.left = ((vpw - r.width) / 2) + 'px';
    el.style.top = ((vph - r.height) / 2) + 'px';
  };  

  el.addEventListener('mousedown', (e) => {
    if (e.shiftKey || e.ctrlKey || e.altKey) {
      return;
    };
    if (e.button !== 0) {
      return;
    };
    const toDrag = [
      'FORM', 'TABLE', 'CAPTION', 'THEAD', 'TR', 'TH', 'TD', 'TBODY', 'TFOOT'];
    const toNoDrag = ['TEXTAREA', 'INPUT'];
    if (toNoDrag.includes(e.target.tagName)) {
      return;
    };
    if (toDrag.includes(e.target.tagName)) {
      startDragging(e);
      e.preventDefault();
      return;
    };
    
    startDragging(e);
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      el.style.left = (e.clientX - offsetX) + 'px';
      el.style.top = (e.clientY - offsetY) + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    ensureElementInViewport();
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(ensureElementInViewport, 100);
  });
};

function set_new_reply_button() {
  const links = document.getElementById('thread-links');
  const anchor = document.createElement('A');
  anchor.textContent = '[New Reply]';
  anchor.addEventListener('click', () => {
    const target = document.querySelector('form[name="post"]');
    if (target) {
      makeFormDraggable(target);
    };
  });
  links.appendChild(document.createTextNode(' '));
  links.appendChild(anchor);
};

$(window).on('cite', function(e, id, with_link) {
  const target = document.querySelector('form[name="post"]');
  if (target) {
    makeFormDraggable(target);
  };
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    set_new_reply_button();
  });
} else {
  set_new_reply_button();
};

