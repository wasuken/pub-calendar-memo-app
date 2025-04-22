FROM node:22.12.0-alpine

WORKDIR /app

# npmをバージョン11.0.0にアップデート
RUN npm install -g npm@11.0.0

# バージョン確認
RUN node -v && npm -v

# package.jsonとpackage-lock.jsonをコピー（存在する場合）
COPY package*.json ./

# 依存関係のインストール
RUN npm install

# ソースコードをコピー
COPY . .

# Next.jsアプリケーションをビルド
RUN npm run build

# ポート3000を公開
EXPOSE 3000

# Next.jsアプリケーションを起動
CMD ["npm", "run", "start"]
