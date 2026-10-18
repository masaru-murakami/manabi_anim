# manabi_anim

ブラウザだけで動くパラパラアニメ作成ツール集です。HTML ファイルを Chrome / Edge で開くだけで使えます（インストール不要）。

| ファイル | 内容 |
|---|---|
| [index.html](index.html) | Webcam 映像の一部をクロップして撮影し、パラパラ再生（8FPS）。サムネイルはドラッグ＆ドロップで並べ替え可能 |
| [strips.html](strips.html) | Webcam の 16:9 画面を 2行×4列 に分割し、8 コマのパラパラとして再生 |
| [paint.html](paint.html) | 2行×4列 のシートにお絵かきしてパラパラ再生。最大 5 ページ（40 コマ）、コマごとの背景画像・WebM 読込・Webcam 撮影に対応 |
| [tiles.html](tiles.html) | 書き出した複数の WebM をタイル状に並べて同時再生。Google ドライブのフォルダからの読み込み・自動更新に対応 |

## 共通の操作

- 再生 / 停止: Enter
- FPS は初期値 8（変更可）
- 「WebM 保存」で動画として書き出し、`tiles.html` で並べて再生できます

## 注意

- Webcam を使うページは、`file://` で開いてカメラが起動しない場合、簡易サーバー経由で開いてください。

  ```bash
  python -m http.server 8000
  ```

- 作画内容はブラウザのメモリ上にのみ保持されます。再読み込みすると消えるので、PNG / WebM で保存してください。

## tiles.html で Google ドライブのフォルダを読み込む

「☁ Google ドライブ」を押し、接続方法を選んで「フォルダを読み込む」。
「自動更新」をオンにすると、フォルダに追加されたファイルを定期的に取り込みます。

### A. Apps Script（おすすめ・API キー不要）

Google アカウントだけで使えます。Google Cloud Console の設定は不要です。

1. [script.google.com](https://script.google.com/) で「新しいプロジェクト」を作成
2. [gas/Code.gs](gas/Code.gs) の内容をすべて貼り付け、`FOLDER_ID` に対象フォルダの ID を入れて保存
   - フォルダ URL `https://drive.google.com/drive/folders/XXXXXXXX` の `XXXXXXXX` 部分
3. 「デプロイ」→「新しいデプロイ」→ 種類の選択で「ウェブアプリ」
   - 次のユーザーとして実行: **自分**
   - アクセスできるユーザー: **全員**
4. 初回はアクセスの承認を求められるので許可する（「このアプリは確認されていません」と出たら「詳細」→「（安全ではないページ）に移動」）
5. 表示された「ウェブアプリの URL」（`…/exec`）を tiles.html の「Apps Script のウェブアプリ URL」欄に貼り付け

- 返すのは `FOLDER_ID` のフォルダ直下の動画だけです。ただし URL を知っている人は誰でもそれらを見られます。
- `Code.gs` を書き換えたときは「デプロイを管理」→ 編集 →「新バージョン」で再デプロイが必要です。
- フォルダを変えたいときは `FOLDER_ID` を書き換えて再デプロイします。

### B. API キー（公開フォルダ）

1. フォルダの共有を「リンクを知っている全員（閲覧者）」にする
2. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成し、**Google Drive API** を有効化
3. 「認証情報」→「API キーを作成」。制限をかける場合は「API の制限」で Google Drive API のみに
   - `file://` で開く場合、「ウェブサイトの制限（リファラー）」を付けると動きません
4. 接続方法「API キー」を選び、フォルダ URL と API キーを入力

### C. Google ログイン（非公開フォルダ）

1. B-2 に加え、「OAuth 同意画面」を設定し、「OAuth クライアント ID（ウェブ アプリケーション）」を作成
2. 「承認済みの JavaScript 生成元」に、ページを開く URL の生成元（例: `http://localhost:8000`）を登録
3. `python -m http.server 8000` などで http から開き、接続方法「Google ログイン」でクライアント ID を入力して「Google でログイン」
   - `file://` で開いた場合はログインできません

入力した URL・API キー等はそのブラウザの localStorage にのみ保存されます。
