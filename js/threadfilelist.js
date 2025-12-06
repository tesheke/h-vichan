/**
 * スレッドページに画像一覧を提供する
 */

// polyfill of Promise.withResolvers
function PromiseWithResolvers() {
  // https://github.com/tc39/proposal-promise-with-resolvers
  const out = {};
  out.promise = new Promise((resolve_, reject_) => {
    out.resolve = resolve_;
    out.reject = reject_;
  });
  return out;
};


var ThreadFileList = class ThreadFileList {

  static default_css = `
.thread_file_list_outer {
  border: 2px solid;
  border-radius: 10px;
  margin: 5px;
  overflow-y: scroll;
  overflow-x: hidden;
  --padding_y: 5px;
  --padding_x: 5px;
  height: calc(80vh - (2 * var(--padding_y)));
  width: calc(90vw - (2 * var(--padding_x)));
  padding: var(--padding_y) var(--padding_x) var(--padding_y) var(--padding_x);
  background: #8882;
  resize: both;
}

.thread_file_list_inner div {
  display: inline-block;
  text-align: center;
}

/* .yalink はサムネ画像の下につける文字リンクのこと */

.thread_file_list_inner .yalink {
  opacity: 20%;
}

.thread_file_list_inner *:hover .yalink,
.thread_file_list_inner *:active .yalink {
  opacity: 100%;
}

#thread_file_list_show_yalink:checked ~ * .yalink {
  opacity: 100%;
}

.label_for_showhide_yalink:after {
  content: '[無]';
}

#thread_file_list_show_yalink:checked ~ * .label_for_showhide_yalink:after {
    content: '[強]';
}

#thread_file_list_show_yalink {
  display: none;
}

.thread_file_list_outer:hover, .thread_file_list_outer:active {
  background: radial-gradient(#fff0, #8881);
}

.thread_file_list_outer img {
  height: 125px;
  margin: 0 0.5px 0 0.5px;
}

.thread_file_list_outer .landscape img {
  /* 横長の場合 */
}

.thread_file_list_outer .portrait img {
  /* 縦長の場合 */
}

.thread_file_list_outer .video img {
  /* 動画の場合 */
  border: 2px dashed;
  border-radius: 10px;
}


`;


  static list_post_images() {
    return Array.from(document.getElementsByClassName('post-image'));
  };


  static get_src_by_post_image(post_image) {
    const p = post_image.parentElement.parentElement;
    const q = p.querySelector('.fileinfo > a');
    if (q === null) {
      return null;  // 削除されたファイルの場合にここに来る
    };
    return q.href;
  };


  static get_post_id_by_post_image(post_image) {
    let elt = post_image.parentElement;
    const root = document.body.parentElement;
    while (root !== elt) {
      if (elt.classList.contains('thread')
          || elt.classList.contains('post')
          || elt.classList.contains('reply')) {
        const anchor = elt.querySelector('.post_anchor');
        return anchor.id;
      };

      elt = elt.parentElement;
    };
    return null;
  };


  static post_image_to_info(post_image) {
    const width = parseInt(post_image.style.width) || 0;
    const height = parseInt(post_image.style.height) || 0;
    
    const src = ThreadFileList.get_src_by_post_image(post_image);
    const id = ThreadFileList.get_post_id_by_post_image(post_image);
    return {
      deleted: src === null,
      id: ThreadFileList.get_post_id_by_post_image(post_image),
      src: src,
      thumb: post_image.src,
      width: width,
      height: height
    };
  };


  static info_to_element(info) {
    const div = document.createElement('DIV');
    const anchor = document.createElement('A');
    const img = document.createElement('IMG');
    img.src = info.thumb;
    if (info.src !== null) {
      const label = info.src.replace(/.*\//,'');
      anchor.title = label;
      img.alt = label;
      if (info.width >= info.height) {
        anchor.classList.add('landscape');
      }
      else {
        anchor.classList.add('portrait');
      };
    };

    const videoexts = ['flv', 'wmv', 'asf', 'mp4', 'mpeg', 'mpg', 'avi', 'ts', 'm2ts', 'webm', 'mov', 'mkv', 'wav', 'mp3', 'swf'];
    if (info.src !== null) {
      if (videoexts.some(x => info.src.endsWith('.' + x))) {
        anchor.classList.add('video');
      };
    };

    anchor.href = info.src;
    anchor.target = "_blank";
    anchor.appendChild(img);

    const anchor2 = document.createElement('A');
    anchor2.className = 'yalink';
    anchor2.href = '#' + info.id;
    anchor2.textContent = '>>' + info.id;  // レス番号をテキストに

    div.appendChild(anchor);
    div.appendChild(document.createElement('BR'));
    div.appendChild(anchor2);
    return div;
  };


  static async create_info_list(post_image_list) {
    const o = [];
    if (post_image_list === undefined) {
      post_image_list = ThreadFileList.list_post_images();
    };

    // 負荷を時間に分散するための async
    async function f(post_image) {
      const info = ThreadFileList.post_image_to_info(post_image);
      if (! info.deleted) {
        o.push(info);
      };
    };

    for (const post_image of post_image_list) {
      await f(post_image);
    };
    return o;
  };


  static initialized = PromiseWithResolvers();

  static async setup_image_list() {
    // この関数は1ページ1回だけ

    {
      const style = document.createElement('STYLE');
      style.innerHTML = ThreadFileList.default_css;
      document.head.appendChild(style);
    };

    const outer = document.createElement('DIV');
    outer.className = 'thread_file_list_outer';
    const div = document.createElement('DIV');
    div.className = 'thread_file_list_inner';
    const showhide_yalink = document.createElement('INPUT');
    showhide_yalink.id = 'thread_file_list_show_yalink';
    showhide_yalink.type = 'checkbox';
    const showhide_labels = Array(2).fill()
            .map(() => document.createElement('A'));
    showhide_labels.forEach(a => {
      const x = document.createElement('LABEL');
      x.htmlFor = showhide_yalink.id;
      x.className = 'label_for_showhide_yalink';
      x.textContent = 'リンク透明度';
      a.appendChild(x);
      /* label を anchor で囲うのは見た目ためだけの理由 */
    });

    outer.appendChild(showhide_yalink);
    outer.appendChild(showhide_labels[0]);
    outer.appendChild(div);
    outer.appendChild(showhide_labels[1]);
    const outer_observer = new MutationObserver(() => {
      const w = outer.style.width;
      const h = outer.style.height;
      if (w !== '') {
        localStorage.threadfilelist_width = w;
      };
      if (h !== '') {
        localStorage.threadfilelist_height = h;
      };
    });
    outer_observer.observe(outer, {
      attriblutes: true,
      attributeFilter: ['style']
    });
    if (localStorage.threadfilelist_width !== undefined) {
      outer.style.width = localStorage.threadfilelist_width;
    };
    if (localStorage.threadfilelist_height !== undefined) {
      outer.style.height = localStorage.threadfilelist_height;
    };

    const bottom = document.body.querySelector('body .bottom')
            || document.body.querySelector('footer');

    const info_list = await ThreadFileList.create_info_list();

    async function f(o) {
      const anchor = ThreadFileList.info_to_element(o);
      div.appendChild(anchor);
    };

    for (const o of info_list.reverse()) {
      await f(o);
    };

    document.body.insertBefore(outer, bottom);

    ThreadFileList.initialized.resolve();
  };


  static async new_post(unused, post) {
    await ThreadFileList.initialized.promise;

    const div = document.querySelector('.thread_file_list_inner');
    const post_image_list = Array.from(post.querySelectorAll('.post-image'));
    for (const post_image of post_image_list) {
      const info = ThreadFileList.post_image_to_info(post_image);
      if (info.deleted) {
        continue;
      };
      const anchor = ThreadFileList.info_to_element(info);

      div.insertBefore(anchor, div.firstChild);
    };
  };
};


/* 初動 */
(function init() {
  if (window.active_page !== 'thread') {
    return;  // do not run threadfilelist
  };

  if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", function() {

      ThreadFileList.setup_image_list();
      $(document).on("new_post", ThreadFileList.new_post);
    });
  } else {

    ThreadFileList.setup_image_list();
    $(document).on("new_post", ThreadFileList.new_post);
  };
})();
