/**
 * js/outside/_vichan-path.js
 *
 * - このファイルは js/outside/vichan-path.js.php からのみ利用される.
 * - このファイル(js/outside/_vichan-path.js)を直接読み込まないこと.
 */
 
window.VichanPath.vichan.format_thread_json_url = function(board, thread) {
  const v = this;
  return '//'
    + v.host
    + v.pathname
    + v.board_path.replace('%s', board)
    + v.dir.res
    + thread
    + '.json';
};

window.VichanPath.vichan.format_thread_html_url = function(board, thread) {
  const v = this;
  return '//'
    + v.host
    + v.pathname
    + v.board_path.replace('%s', board)
    + v.dir.res
    + v.file_page.replace('%d', thread);
};

window.VichanPath.vichan.get_root = function() {
  const v = this;
  return '//'
    + v.host
    + v.pathname;
};


window.VichanPath.vichan.fetch_thread_json = function(board, thread) {
  return fetch(this.format_thread_json_url(board, thread));
};

window.VichanPath.vichan.fetch_thread_html = function(board, thread) {
  return fetch(this.format_thread_json_url(board, thread));
};

window.VichanPath.vichan.post_json_list_files = function(post, board, thread) {
  const files = [];
  if (post.tim === undefined) {
    return files;
  };
  files.push({
    tn_h: post.tn_h,
    tn_w: post.tn_w,
    h: post.h,
    w: post.w,
    fsize: post.fsize,
    ext: post.ext,
    tim: post.tim,
    filename: post.filename,
    md5: post.md5
  });
  for (const extra_file of post.extra_files || []) {
    files.push(extra_file);
  };
  const v = this;
  const post_url = v.format_thread_html_url(board, thread) + '#' + post.no;
  for (const file of files) {
    file.thumb_url = '//'
      + v.host
      + v.pathname
      + v.board_path.replace('%s', board)
      + v.dir.thumb
      + file.tim
      + '.' + v.thumb_ext;
    file.src_url =  '//'
      + v.host
      + v.pathname
      + v.board_path.replace('%s', board)
      + v.dir.img
      + file.tim
      + file.ext;
    file.post_url = post_url;
  };
  return files;
};

window.VichanPath.process = function(callback) {
    callback(window.VichanPath.vichan);
};


while (window.VichanPath.length !== 0) {
    try {
        window.VichanPath.process(window.VichanPath.shift());
    } catch (e) {
        console.error(e);
    };
};

window.VichanPath.push = function(func) {
    window.VichanPath.process(func);
};

window.VichanPath.unshift = window.VichanPath.push;
