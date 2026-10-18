/**
 * manabi_anim / tiles.html 用：Google ドライブのフォルダ中継スクリプト
 *
 * 使い方（README.md の「Apps Script」の項も参照）
 *   1. https://script.google.com/ で新しいプロジェクトを作り、このファイルの内容を貼り付ける
 *   2. 下の FOLDER_ID に、公開したいフォルダの ID を入れる
 *   3. 上の関数選択で「checkSetup」を選んで「実行」→ 権限を承認する（ドライブの閲覧・作成）
 *      ※ 承認しないと、アップロード時に「createFile を呼び出す権限がありません」となる
 *   4. 「デプロイ」→「新しいデプロイ」→ 種類「ウェブアプリ」
 *        次のユーザーとして実行: 自分
 *        アクセスできるユーザー: 全員
 *   5. 表示された「ウェブアプリの URL」（…/exec）を tiles.html / paint.html に貼り付ける
 *   ※ このファイルを書き換えたら checkSetup を実行し直し、
 *     「デプロイを管理」→ 編集 → バージョン「新バージョン」で再デプロイ
 *
 * GET  … FOLDER_ID のフォルダ直下にある動画の一覧・中身を返す（tiles.html 用）
 * POST … 動画を FOLDER_ID のフォルダに保存する（paint.html の「ドライブにアップロード」用）
 * URL を知っている人は誰でも閲覧・アップロードできるので、必要なら UPLOAD_PASSWORD を設定してください。
 */

// ↓ フォルダ URL「https://drive.google.com/drive/folders/XXXXXXXX」の XXXXXXXX 部分
const FOLDER_ID = 'ここにフォルダIDを貼り付け';

// アップロード用のパスワード（空なら誰でもアップロード可）。paint.html の「パスワード」欄に同じ値を入れる
const UPLOAD_PASSWORD = '';

// 1 ファイルの上限（MB）
const MAX_UPLOAD_MB = 20;

function doGet(e) {
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const id = e && e.parameter && e.parameter.id;

    // ?id=ファイルID … ファイルの中身を Base64 で返す
    if (id) {
      const file = DriveApp.getFileById(id);
      if (!isInFolder_(file, folder) || !isVideo_(file)) {
        return json_({ error: '対象フォルダの動画ではありません' });
      }
      const blob = file.getBlob();
      return json_({
        id: id,
        name: file.getName(),
        mimeType: blob.getContentType(),
        data: Utilities.base64Encode(blob.getBytes()),
      });
    }

    // パラメータなし … フォルダ内の動画一覧を返す
    const files = [];
    const it = folder.getFiles();
    while (it.hasNext()) {
      const f = it.next();
      if (f.isTrashed() || !isVideo_(f)) continue;
      files.push({
        id: f.getId(),
        name: f.getName(),
        mimeType: f.getMimeType(),
        size: f.getSize(),
        updated: f.getLastUpdated().getTime(),
      });
    }
    files.sort(function (a, b) { return a.name.localeCompare(b.name); });
    return json_({ folder: folder.getName(), files: files });
  } catch (err) {
    return json_({ error: String(err && err.message || err) });
  }
}

function doPost(e) {
  try {
    const req = JSON.parse(e.postData.contents);
    if (UPLOAD_PASSWORD && req.password !== UPLOAD_PASSWORD) {
      return json_({ error: 'パスワードが違います' });
    }
    const mimeType = String(req.mimeType || '');
    if (mimeType.indexOf('video/') !== 0) {
      return json_({ error: '動画以外はアップロードできません' });
    }
    const bytes = Utilities.base64Decode(String(req.data || ''));
    if (!bytes.length) return json_({ error: 'データが空です' });
    if (bytes.length > MAX_UPLOAD_MB * 1024 * 1024) {
      return json_({ error: 'ファイルが大きすぎます（上限 ' + MAX_UPLOAD_MB + ' MB）' });
    }
    // ファイル名に使えない文字を置き換える
    let name = String(req.name || 'flipbook.webm').replace(/[\\/:*?"<>|\r\n]/g, '_').slice(0, 120);
    if (!/\.webm$/i.test(name)) name += '.webm';

    const file = DriveApp.getFolderById(FOLDER_ID).createFile(Utilities.newBlob(bytes, mimeType, name));
    return json_({ ok: true, id: file.getId(), name: file.getName() });
  } catch (err) {
    return json_({ error: String(err && err.message || err) });
  }
}

function isVideo_(file) {
  return file.getMimeType().indexOf('video/') === 0 || /\.webm$/i.test(file.getName());
}

function isInFolder_(file, folder) {
  const parents = file.getParents();
  while (parents.hasNext()) {
    if (parents.next().getId() === folder.getId()) return true;
  }
  return false;
}

/**
 * エディタから実行する確認用の関数。
 * 初回実行時に、このスクリプトが使う権限（ドライブの閲覧・ファイル作成）の承認画面が出る。
 * 実行ログにフォルダ名と動画の数が出れば準備完了。
 */
function checkSetup() {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  let count = 0;
  const it = folder.getFiles();
  while (it.hasNext()) if (isVideo_(it.next())) count++;
  // ここまで動けば、承認画面で許可した権限（閲覧・ファイル作成）が有効になっている
  Logger.log('フォルダ「%s」：動画 %s 本 / 準備 OK', folder.getName(), count);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
