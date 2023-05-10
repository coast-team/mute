set -e 
#Script to update the reverse proxy configuration by adding a new domain.
#This script uses two parameters : 
#$1 is the current merge request branch name.
#$2 is the port exposed by the docker container running the review image
#The domain name that will be added to caddy's configuration is relative to the current merge request branch name.

#Testing if arguments were provided, if not, script will fail
if [ -z "$1" ] || [ -z "$2" ] || [ -z "$*" ] 
    then 
        echo "Error : there is a problem with the arguments provided (not enough or empty)"
        echo "There should be two arguments provided : the review branch name and the port to be exposed by docker container running mute review image"
        exit 1
fi

#Variables assignments
reviewEnvironmentName=$1
mutePort=$2
signalingServerPort=$((mutePort+1))


#Testing if the caddy configuration has already been set
testIfConfigurationIsAlreadySet=$(curl localhost:2019/id/$reviewEnvironmentName)
errorMessageAPI="{\"error\":\"unknown object ID '$reviewEnvironmentName'\"}"


if [ "$testIfConfigurationIsAlreadySet" = "$errorMessageAPI" ]
  then
    echo "There is no configuration just yet"
    curl localhost:2019/config/apps/http/servers/srv1/routes/ -X POST -H "Content-Type: application/json" -d @- << EOF
    { "@id": "$reviewEnvironmentName","handle":[{"handler":"subroute","routes":[{"handle":[{"handler": "headers","response": {"set": {"Strict-Transport-Security": ["max-age=31536000;"]}}}],"match": [{"path": ["/"]}]},{"handle": [{"handler": "reverse_proxy","upstreams": [{"dial": "localhost:$mutePort"}]}]}]}],"match": [{"host": ["$reviewEnvironmentName.mute.loria.fr"]}],"terminal": true}
EOF
    curl localhost:2019/config/apps/http/servers/srv1/routes/ -X POST -H "Content-Type: application/json" -d @- << EOF
    { "@id": "$reviewEnvironmentName-signaling","handle":[{"handler":"subroute","routes":[{"handle":[{"handler": "headers","response": {"set": {"Strict-Transport-Security": ["max-age=31536000;"]}}}],"match": [{"path": ["/"]}]},{"handle": [{"handler": "reverse_proxy","upstreams": [{"dial": "localhost:$signalingServerPort"}]}]}]}],"match": [{"host": ["$reviewEnvironmentName-signaling.mute.loria.fr"]}],"terminal": true}
EOF

fi