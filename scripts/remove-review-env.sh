set -e 
# This script handles the removal of content created during a merge request
# Environment is automatically stopped if it was created during a merge request and the merge request is closed.
# This script will stop and remove the docker containers, and also delete the review image on the host
# this script will also remove the configuration of the review environment from our reverse proxy
# After all of this, the only manual action that devs need to do will be to delete the review environment in gitlab via the UI
# This script uses one parameter : 
# $1 is the name of the review branch (used as the environment name for docker-compose, but also in the image of mute and sigver, as the tag)

if [ -z $1 ]
    then   
        echo "Error : there is no argument provided : you should provide the review branch name as a parameter"
fi

# Stopping the docker processes on the host
dockerComposeEnvironmentName=$1
docker-compose -p $dockerComposeEnvironmentName stop
docker-compose -p $dockerComposeEnvironmentName rm -f

# Removing the review images
muteReviewImage=$(docker images registry.gitlab.inria.fr/coast-team/mute/mute:$1 -q)
sigverReviewImage=$(docker images registry.gitlab.inria.fr/coast-team/mute/mute/sigver:$1 -q)
docker rmi $muteReviewImage -f
docker rmi $sigverReviewImage -f

# Removing the configuration from the proxy
curl -X DELETE localhost:2019/id/$1
curl -X DELETE localhost:2019/id/$1-signaling