FROM node:20 AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

FROM nginx:alpine
# Angular 20's production build outputs files under "dist/frontend/browser".
# Copy that directory so nginx serves "index.html" from the web root.
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]