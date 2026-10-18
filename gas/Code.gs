/**
 * manabi_anim / tiles.html 用：Google ドライブのフォルダ中継スクリプト
 *
 * 使い方（README.md の「Apps Script」の項も参照）
 *   1. https://script.google.com/ で新しいプロジェクトを作り、このファイルの内容を貼り付ける
 *   2. 下の FOLDER_ID に、公開したいフォルダの ID を入れる
 *   3. 「デプロイ」→「新しいデプロイ」→ 種類「ウェブアプリ」
 *        次のユーザーとして実行: 自分
 *        アクセスできるユーザー: 全員
 *   4. 表示された「ウェブアプリの URL」（…/exec）を tiles.html に貼り付ける
 *
 * このスクリプトが返すのは FOLDER_ID のフォルダ直下にある動画ファイルだけです。
 * URL を知っている人は誰でもその動画を見られるので、共有範囲に注意してください。
 */

// ↓ フォルダ URL「https://drive.google.com/drive/folders/XXXXXXXX」の XXXXXXXX 部分
const FOLDER_ID = 'ここにフォルダIDを貼り付け';

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

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
