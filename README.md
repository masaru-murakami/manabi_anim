# manabi_anim

ブラウザだけで動くパラパラアニメ作成ツール集です。HTML ファイルを Chrome / Edge で開くだけで使えます（インストール不要）。

| ファイル | 内容 |
|---|---|
| [index.html](index.html) | Webcam 映像の一部をクロップして撮影し、パラパラ再生（8FPS）。サムネイルはドラッグ＆ドロップで並べ替え可能 |
| [strips.html](strips.html) | Webcam の 16:9 画面を 2行×4列 に分割し、8 コマのパラパラとして再生 |
| [paint.html](paint.html) | 2行×4列 のシートにお絵かきしてパラパラ再生。最大 5 ページ（40 コマ）、コマごとの背景画像・WebM 読込・Webcam 撮影に対応 |
| [tiles.html](tiles.html) | 書き出した複数の WebM をタイル状に並べて同時再生 |

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
