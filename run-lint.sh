#!/bin/bash
cd /workspaces/watch-party/front-end
npx next lint 2>&1 | head -100
