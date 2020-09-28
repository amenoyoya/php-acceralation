# PHP高速化くん

OPcache, APCu を導入して PHP 環境を高速化する支援ツール

- OPCache, APCu:
    - PHP言語のプリコンパイルバイナリをキャッシュして、PHPそのものの実行速度を向上させるモジュール
    - インストールするだけで、サーバ実行が2～5倍高速化されるため、もしインストールされていない環境であればインストールを推奨

## Environment

- Shell: `bash`
- Node.js: `12.18.2`
    - Yarn package manager: `1.22.4`

### Setup
```bash
# install node_modules
$ yarn
```

### Usage
現状、CLIツールの提供のみ

```bash
$ node cli.js -h <host> -p <port> -u <username> -s <password> -i <privatekey>
# -h: 接続先サーバIPを指定
# -p: 接続先サーバのSSHポートを指定（デフォルト: 22）
# -u: SSH接続ユーザ名を指定
# -s: SSH接続がパスワード認証の場合、パスワードを指定
# -i: SSH接続が公開鍵認証の場合、秘密鍵ファイルへのパスを指定

# 例) IP: 12.34.5.67:22 のサーバに User: ec2-user, SSHKey: ~/.ssh/aws.pem で接続する場合
$ node cli.js -h 12.34.5.67 -p 22 -u ec2-user -i ~/.ssh/aws.pem
```

***

## Issues

### 実装済み機能
- 接続先サーバの情報取得
    - root権限コマンド実行可能判定
    - OS名 (`amazon_linux` | `centos` | `debian`)
    - パッケージマネージャ + インストール済みリポジトリ (`yum` | `apt-get`)
    - サービスコマンド (`systemctl` | `service`)
- 接続先サーバのPHP関連情報取得
    - PHPバージョン
    - インストール済みモジュール
    - OPcache, APCu をインストール可能か判定
- OPcache, APCu インストール
    - 以下の環境で動作確認済み
        - AWS AmazonLinux2:
            - Apache 2.4 + PHP 5.6
            - Apache 2.4 + PHP 7.3
        - CentOS 7:
            - Apache 2.4 + PHP 5.6
            - Apache 2.4 + PHP 7.3
        - Debian 9:
            - Apache 2.4 + PHP 5.6
            - Apache 2.4 + PHP 7.3

### TODO
- WEBサーバ再起動機能の実装
    - Apache or Nginx を再起動しないとインストールモジュールが反映されないため実装必須
- フロント画面を実装しGUI化
    - CLIツールでは使いにくいと思われるため順次実装したい
- 実サーバでの動作確認
    - インストールコマンドは環境毎に大きく変わるため、実サーバでの動作確認が必要
