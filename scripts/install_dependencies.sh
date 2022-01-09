#!/bin/bash

echo '============================'
echo 'Running install_dependencies'
echo '============================'

cd /home/ubuntu/build
sudo npx pm2 stop src/app.js
sudo npm install