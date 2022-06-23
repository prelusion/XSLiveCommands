#! /bin/bash

set -ex

npx tsc
supervisorctl restart xssync
