/**
 * vichan外のページに特定スレの画像リストを提供する.
 *
 * - 次のリソースがページに読み込まれること
 *   js/outside/vichan-path.js.php
 * - 使用例:
 *     <script src="//example.com/path/to/vichan/js/outside/vichan-path.js.php" async></script>
 *     <script src="//example.com/path/to/vichan/js/outside/threadfilelist1.js" async></script>
 *     <div data-vichan-threadfilelist1="true" data-board="jp" data-thread="1234">
 *       ここに //example.com/path/to/vichan/jp/res/1234.html のファイル一覧が挿入される
 *     </div>
 */

window.vichanThreadFileList1 = function() {
  async function phase1(v) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        phase2(v);
      });
    } else {
      phase2(v);
    };
  };

  async function phase2(v) {
    const tags = Array.from(document.querySelectorAll(
      '*[data-vichan-threadfilelist1="true"]'));

    for (const tag of tags) {
      phase3(v, tag);
    };
  };

  async function phase3(v, div) {
    const board = div.getAttribute('data-board');
    const thread = div.getAttribute('data-thread');
    function error(msg) {
      div.appendChild(document.createTextNode(''+msg));
    };
    {
      let errormsg = 'js/outside/threadfilelist1.js:';
      if (board === null) {
        errormsg += 'タグにdata-boardを設定して下さい.';
      };
      if (thread === null) {
        errormsg += 'タグにdata-threadを設定して下さい.';
      };
      if (board === null || thread === null) {
        error(errormsg);
        return;
      };
    };

    try {
      const response = await v.fetch_thread_json(board, thread);
      if (!response.ok) {
        error('error http-' + response.status);
      };
      const json = await response.json();
      phase4(v, div, json);
    } catch (e) {
      error(e);
      return;
    };
  };

  async function phase4(v, div, json) {
    const board = div.getAttribute('data-board');
    const thread = div.getAttribute('data-thread');
    const maximages = parseInt(div.getAttribute('data-max-images')) || 9999;
    const thumb_width = parseInt(div.getAttribute('data-thumb-width')) || null;
    const thumb_height = parseInt(div.getAttribute('data-thumb-height')) || null;
    let index = json.posts.length - 1;
    let count = 0;
    for (; 0 <= index; --index) {
      const post = json.posts[index];
      post.is_op = (index === 0);
      const files = v.post_json_list_files(post, board, thread);
      for (const file of files) {
        const thumb = create_thumb(file, post, thumb_width, thumb_height, v);
        div.appendChild(thumb);
        ++count;
        if (count >= maximages) {
          break;
        };
      };
    };
  };

  function create_thumb(file, post, thumb_width, thumb_height, v) {
    const div = document.createElement('div');
    div.className = 'vichan threadfilelist1';
    if (file.tn_w >= file.tn_h) {
      div.className += ' landscape';
    } else {
      div.className += ' portrait';
    };
    const img = document.createElement('img');
    img.className = 'thumb';
    img.src = file.thumb_url;
    if (thumb_width && post.is_op) {
      img.width = file.tn_w / v.thumb_op_width * thumb_width;
    } else if (thumb_width && !post.is_op) {
      img.width = file.tn_w / v.thumb_width * thumb_width;
    } else {
      img.width = file.tn_w;
    };
    if (thumb_height && post.is_op) {
      img.height = file.tn_h / v.thumb_op_height * thumb_height;
    } else if (thumb_height && !post.is_op) {
      img.height = file.tn_h / v.thumb_height * thumb_height;
    } else {
      img.height = file.tn_h;
    };
    img.alt = file.filename;

    const img_anchor = document.createElement('a');
    img_anchor.href = file.src_url;
    img_anchor.title = file.filename;
    img_anchor.target = '_blank';
    const post_anchor = document.createElement('a');
    post_anchor.href = file.post_url;
    post_anchor.textContent = '>>' + post.no;
    post_anchor.className = 'yalink';
    img_anchor.appendChild(img);
    div.appendChild(img_anchor);
    div.appendChild(document.createElement('br'));
    div.appendChild(post_anchor);
    return div;
  };

  window.VichanPath = window.VichanPath || [];
  window.VichanPath.push(phase1);
};

window.vichanThreadFileList1();