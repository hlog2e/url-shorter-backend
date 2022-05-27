FROM node:alpine

# 디렉토리 지정
WORKDIR /usr/src/app

# 의존성 설치를 위해 package.json, yarn.lock 복사
COPY package.json ./
COPY yarn.lock ./

# 의존성 설치
RUN yarn

# 필요한 모든 파일을 복사
COPY . .

# 애플리케이션 실행
CMD [ "node", "app.js" ]