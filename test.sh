#!/usr/bin/env bash
set -e

if [[ -z "$1" ]]; then
  forge test --use solc:0.8.9
else
  forge test --match "$1" -vvvv --use solc:0.8.9
fi
