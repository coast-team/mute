set -e 
# Script to find available port on the server to deploy a review environment
# Review environment : Port X is Mute, port X+1 is the Mute Signaling Server. 
# Range 8040 - 8050 will be used for review environments.
# This script uses 1 parameter : $1 is the current review image for mute
availablePortIsFound=false
portToTest=8040
availablePort=0

if [ -z "$1" ]
    then 
        echo "Error : there is no argument provided : you should provide the review image for mute as a parameter"
        exit 1
fi

# Check if there is a mute container running using the review environment image (passed as a parameter to this script - accessible via variable $1)
outputDockerImageTest=$( docker ps | grep "$1" | awk '{print $1}')
if [ ! -z "$outputDockerImageTest" ]
    then
        availablePortIsFound=true
        portToTest=$(docker inspect --format="{{(index (index .NetworkSettings.Ports \"4200/tcp\") 0).HostPort}}" $outputDockerImageTest)
fi

# If there is no current deployment of a mute container running using the review environment image, check for available port
while ! $availablePortIsFound
do
    outputDockerPortTest=$( docker ps | grep ":"$portToTest | awk '{print $1}' )
    if [ -z "$outputDockerPortTest" ]
        then
            availablePort=$portToTest
            availablePortIsFound=true
        else
            portToTest=$((portToTest+=2)) #+2 as if port X is already used, X+1 must be used (for the signaling server)  
    fi 
done
echo $portToTest