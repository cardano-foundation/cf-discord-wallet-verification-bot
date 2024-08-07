VERSION 0.8

IMPORT --allow-privileged github.com/cardano-foundation/cf-gha-workflows/./earthfiles/functions:main AS functions

ARG --global DOCKER_IMAGES_TARGETS="discord-wallet-verification-bot"

ARG --global DOCKER_IMAGES_PREFIX="cf"
ARG --global DOCKER_IMAGES_EXTRA_TAGS=""
ARG --global DOCKER_REGISTRIES=""
ARG --global RELEASE_TAG=""
ARG --global PUSH=false

all:
  LOCALLY
  FOR image_target IN $DOCKER_IMAGES_TARGETS
    BUILD +$image_target --PUSH=$PUSH
  END

docker-publish:
  BUILD +all --PUSH=$PUSH

discord-wallet-verification-bot:
  ARG EARTHLY_TARGET_NAME
  LET DOCKER_IMAGE_NAME=${DOCKER_IMAGES_PREFIX}-${EARTHLY_TARGET_NAME}

  WAIT
    FROM DOCKERFILE ./backend-services/${EARTHLY_TARGET_NAME}
  END
  WAIT
    SAVE IMAGE ${DOCKER_IMAGE_NAME}
  END
  DO functions+DOCKER_TAG_N_PUSH \
     --PUSH=$PUSH \
     --DOCKER_IMAGE_NAME=${DOCKER_IMAGE_NAME} \
     --DOCKER_IMAGES_EXTRA_TAGS="${DOCKER_IMAGES_EXTRA_TAGS}"
