@echo off
cd /d D:\web\crepikacom
node scripts/publish-tool-once.mjs >> scripts/scheduler.log 2>&1
