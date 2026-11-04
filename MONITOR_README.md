# iPhone 5 横置き AI モニター（試作版）

- ページ（既定）: https://ltakasi430.github.io/iphone-dashboard/
- `index.html` をAIモニターに変更し、元の画面を `classic.html` として保存しました。
- iOS 10 の古い Safari を想定して、ES5 JavaScript / XMLHttpRequest / 旧式 Flexbox 互換 CSS で実装しています（iPhone 5 実機での最終動作は要確認）。
- 時計・日付・京都の天気を左側に固定し、右側を **カレンダー / AI利用枠 / 開発状況** の3ページで左右スワイプまたは矢印操作できます。
- 縦向きにした場合は縦積みレイアウトになります。
- 時計は1秒、天気は15分、モニター情報は5分ごとに更新します。

## iPhone 5で試す手順

1. iPhone 5のSafariで `https://ltakasi430.github.io/iphone-dashboard/` を開きます。
2. 横向きにして時計・天気とカレンダーが並ぶか確認します。固定できない場合は本体の画面回転ロックを解除してください。
3. 右側を左スワイプするとAI利用枠、もう一度左スワイプすると開発状況が出ます。左右の矢印ボタンでも切り替えできます。
4. 以前の画面を開くには右上の「旧画面」を押してください。
5. 常時表示する場合は画面輝度を低めに設定し、端末の温度・バッテリー膨張・電源ケーブルの状態を確認してください。

## モニターデータの接続

現時点でCodex・OpenAI・Gemini・Modal・Coneco・GitHubの実データ収集は**未実装**です。すべて「未接続」「未取得」と表示し、数値を捏造しません。

`index.html` と `monitor.html` は同じディレクトリにある `monitor.json` だけを **GET** で取得する読み取り専用の設計です。ファイルがない場合（404）は「未接続」のままです。APIキーやGitHubトークンをiPhoneに入力・保存する必要はありません。

データ形式（すべて任意、数値が取得できないフィールドは `null`）:

```json
{
  "updated_at": "2026-11-05T08:00:00+09:00",
  "codex": {
    "five_hour_remaining_pct": null,
    "weekly_remaining_pct": null,
    "five_hour_reset_at": null
  },
  "openai": { "credit_remaining_usd": null },
  "gemini": { "remaining_pct": null },
  "modal": { "credit_remaining_usd": null },
  "services": {
    "coneco": { "status": "unknown", "detail": "未接続" },
    "github": { "status": "unknown", "detail": "未接続" },
    "api": { "status": "unknown", "detail": "未接続" }
  }
}
```

- `five_hour_remaining_pct`, `weekly_remaining_pct`, `remaining_pct`: 残量の割合（0～100）。使用率ではありません。
- `credit_remaining_usd`: **残高を正しく検証できた場合にのみ** 値を入れます。利用額からの推定値を残高として無断で表示しません。
- `status`: `ok` / `warn` / `error` / それ以外（未取得）。
- `updated_at`: データ自体の更新時刻です。端末が取得した時刻とは別です。

## セキュリティ上の注意

**このリポジトリとGitHub Pagesは公開状態です。** `monitor.json` に書いた情報は、アクセスできる人なら誰でも閲覧できる可能性があります。

- APIキー、アクセストークン、Codex認証情報、メールアドレス、個人の詳細な活動ログは絶対に配置しないでください。
- 将来の収集処理は最新のサーバー/クラウド側で行い、公開して差し支えない集計値だけを出力します。
- 私的な残高や進捗を外部に見せたくない場合、公開GitHub Pagesへ出力せず、認証付きの安全な配信方法に変更してください。iOS 10 はセキュリティ更新を受けられません。
- 古いiPhoneからGitHub等にログインさせず、表示専用端末として使ってください。

## 対応していないこと

- CodexのChatGPTプラン枠・APIクレジットをiPhone 5単体で取得すること。
- サーバー側の収集バックエンドやログイン処理。
- iPhone 5実機でのスワイプやレイアウトの自動検証。

最初は既存ページを壊さない独立した試作ページで表示を確かめ、動作が問題なければ通常ダッシュボードへの統合を検討します。