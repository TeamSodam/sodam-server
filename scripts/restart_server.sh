#!/bin/bash

echo '======================'
echo 'Running restart_server'
echo '======================'

npx pm2 start src/app.js --watch