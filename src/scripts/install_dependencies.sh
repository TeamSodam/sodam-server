echo '============================'
echo 'Running install_dependencies'
echo '============================'

cd /home/ubuntu/build
npx pm2 stop /home/ubuntu/build/src/app.js
sudo npm install