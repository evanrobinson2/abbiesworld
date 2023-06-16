#!/bin/bash

count=1

for file in ./*.png; do
    mv -- "$file" "$count.png"
    let count=count+1
done
