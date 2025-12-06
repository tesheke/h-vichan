
// - 投稿後にgoogle reCAPTCHAをリセットする.
// - ajax_after_post だと投稿を弾かれた場合にリセットされないからタイマーで対応する.
// - この秒数に根拠はない.
$(document).on('ajax_before_post', () => {setTimeout(() => grecaptcha.reset(), 2000);});