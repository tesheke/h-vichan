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
 *
 * - タグ引数
 *
 *  - data-board: 必須. 例: "jp", "b"
 *      board urlを指定して下さい.
 *
 *  - data-thread: 必須. 例: 1234
 *      その板におけるスレッド番号(No.xxxのxxx)を指定して下さい.
 *
 *  - data-max-images: 省略可. 既定値: 9999 , 例: 2
 *      表示する画像の数の上限を指定.
 *
 *  - data-visual-only: 省略可. 既定値: "false".
 *      画像や動画のみを表示したい場合(zipやtxtなどを除外したい場合)に
 *      "true"を指定して下さい.
 *
 *  - data-thumb-width: 省略可. 既定値: null.
 *    data-thumb-height: 省略可. 既定値: null.
 *      サムネイルサイズの上限をそれぞれ指定して下さい.
 *      これらはimgタグのwidth, heightに設定されます.
 *      いずれの場合でもアスペクト比は維持されます.
 *      指定がない場合は、vichan側jsonのtn_w, tn_h値がimgのwidth, heightとして使われます.
 *      指定がある場合は、指定された値を上限として再計算されimgのwidth, heightに
 *      指定されます.
 *      widthのみが指定されている場合はheightに上限を設けずに再計算されます.
 *      heightのみが指定されている場合はwidthに上限を設けずに再計算されます.
 *
 * - タグのclass構成.
 *   例:
 *   <div data-vichan-threadfilelist1="true" data-board="jp" data-thread="1234">
 *     <div class="cell portrait">
 *       <a href=/path/to/vichan/jp/res/1234.html#1235>
 *         <img src=/path/to/vichan/jp/thumb/1763991120922.jpg>
 *       </a>
 *   </div>
 *   サムネイルが縦長の場合にはportrait, 横長の場合にはlandscapeが追加されます.
 *   このスクリプトはcssを提供しません.
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
    const visual_only = div.getAttribute('data-visual-only') === 'true';
    const visual_exts = [
      '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.mp4', '.webm', '.ts'];
    let index = json.posts.length - 1;
    let count = 0;
    for (; 0 <= index; --index) {
      const post = json.posts[index];
      post.is_op = (index === 0);
      const files = v.post_json_list_files(post, board, thread);
      for (const file of files) {
        if (visual_only && !visual_exts.includes(file.ext)) {
          continue;
        };
        const thumb = create_thumb(file, post, thumb_width, thumb_height, v);
        div.appendChild(thumb);
        ++count;
        if (count >= maximages) {
          return;
        };
      };
    };
  };

  function create_thumb(file, post, thumb_width, thumb_height, v) {
    const div = document.createElement('div');
    if (file.tn_w >= file.tn_h) {
      div.className = 'cell landscape';
    } else {
      div.className = 'cell portrait';
    };
    const img = document.createElement('img');
    img.className = 'thumb';
    img.src = file.thumb_url;

    if (!thumb_width && !thumb_height) {
      img.width = file.tn_w;
      img.height = file.tn_h;
    } else if (thumb_width && !thumb_height) {
      const scale = thumb_width / file.tn_w;
      img.width = thumb_width;
      img.height = file.tn_h * scale;
    } else if (!thumb_width && thumb_height) {
      const scale = thumb_height / file.tn_h;
      img.width = file.tn_w * scale;
      img.height = thumb_height;
    } else {
      const scalew = thumb_width / file.tn_w;
      const scaleh = thumb_height / file.tn_h;
      const scale = Math.min(scalew, scaleh);
      img.width = file.tn_w * scale;
      img.height = file.tn_h * scale;
    };

    img.alt = file.filename;

    const img_anchor = document.createElement('a');
    img_anchor.href = file.post_url;
    img_anchor.title = file.filename;
    img_anchor.target = '_blank';
    img_anchor.appendChild(img);
    div.appendChild(img_anchor);
    return div;
  };

  window.VichanPath = window.VichanPath || [];
  window.VichanPath.push(phase1);
};

window.vichanThreadFileList1();