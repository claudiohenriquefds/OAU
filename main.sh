#!/bin/bash

base_path=$1

main_yaml=$(cat "$base_path/main.yaml")

paths=$(echo "$main_yaml" | grep '^  $ref: .*$')

paths_yaml=$(cat "$base_path/paths.yaml")

while read -r line; do
    route=$(echo "$line" | awk '{print $2}')

    first_substituition="${route/'"./'/''}"
    second_substituition="${first_substituition/'"'/''}"
    finnally=$second_substituition

    route_yaml=$(cat "$base_path/$finnally")
    route_yaml=$(echo "$route_yaml" | sed 's/^/ /')

    paths_yaml="${paths_yaml/$line/$route_yaml}"
done <<< "$paths"
main_yaml="${main_yaml/$paths/$paths_yaml}"

echo "$main_yaml" > "$base_path/openapi.yaml"

# Second treatment

# openapi_yaml=$(cat "$base_path/openapi.yaml")

# imports=$(echo "$main_yaml" | grep '^  $ref: .*$')

# while read -r line; do
#   route=$(echo "$line" | awk '{print $2}')
#   removed_first_characters="${route/'"./'/''}"
#   removed_second_characters="${removed_first_characters/'"'/''}"
#   import_route_yaml=$(cat "$base_path/$removed_second_characters")
#   indent=$(echo "$line" | awk '{print substr($0,1,length($0)-length($3))}')
#   import_route_yaml=$(echo "$import_route_yaml" | awk -v ind="$indent" '{print ind$0}')
#   openapi_yaml=${openapi_yaml/$line/$import_route_yaml}
# done <<< "$imports"

# echo "$openapi_yaml" > "$base_path/openapi.yaml"