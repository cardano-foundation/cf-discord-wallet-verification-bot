VERSION 0.8

ARG --global DOCKER_IMAGES_TARGETS="discord-wallet-verification-bot"

ARG --global DOCKER_IMAGE_PREFIX="cf"
ARG --global DOCKER_IMAGES_EXTRA_TAGS=""
ARG --global DOCKER_REGISTRIES="hub.docker.com"
ARG --global HUB_DOCKER_COM_USER=cardanofoundation
ARG --global PUSH=false

all:
  LOCALLY
  FOR image_target IN $DOCKER_IMAGES_TARGETS
    BUILD +$image_target --PUSH=$PUSH
  END

docker-publish:
  BUILD +all --PUSH=$PUSH

TEMPLATED_DOCKER_TAG_N_PUSH:
  FUNCTION
  ARG EARTHLY_GIT_SHORT_HASH
  ARG PUSH # we use this as --push is not supported in LOCALLY blocks
  ARG DOCKER_IMAGE_NAME
  ARG DOCKER_IMAGES_EXTRA_TAGS
  LOCALLY
  FOR registry IN $DOCKER_REGISTRIES
    FOR image_tag IN $DOCKER_IMAGES_EXTRA_TAGS
      IF [ "$registry" = "hub.docker.com" ]
        RUN docker tag ${DOCKER_IMAGE_NAME}:latest ${HUB_DOCKER_COM_USER}/${DOCKER_IMAGE_NAME}:${image_tag}
        RUN if [ "$PUSH" = "true" ]; then docker push ${HUB_DOCKER_COM_USER}/${DOCKER_IMAGE_NAME}:${image_tag}; fi
      ELSE
        RUN docker tag ${DOCKER_IMAGE_NAME}:latest ${registry}/${DOCKER_IMAGE_NAME}:${image_tag}
        RUN if [ "$PUSH" = "true" ]; then docker push ${registry}/${DOCKER_IMAGE_NAME}:${image_tag}; fi
      END
    END
    IF [ "$registry" = "hub.docker.com" ]
      RUN docker tag ${DOCKER_IMAGE_NAME}:latest ${HUB_DOCKER_COM_USER}/${DOCKER_IMAGE_NAME}:${EARTHLY_GIT_SHORT_HASH}
      RUN if [ "$PUSH" = "true" ]; then docker push ${HUB_DOCKER_COM_USER}/${DOCKER_IMAGE_NAME}:${EARTHLY_GIT_SHORT_HASH}; fi
    ELSE
      RUN docker tag ${DOCKER_IMAGE_NAME}:latest ${registry}/${DOCKER_IMAGE_NAME}:${EARTHLY_GIT_SHORT_HASH}
      RUN if [ "$PUSH" = "true" ]; then docker push ${registry}/${DOCKER_IMAGE_NAME}:${EARTHLY_GIT_SHORT_HASH}; fi
    END
  END

discord-wallet-verification-bot:
  ARG EARTHLY_TARGET_NAME
  LET DOCKER_IMAGE_NAME=${DOCKER_IMAGE_PREFIX}-${EARTHLY_TARGET_NAME}

  WAIT
    FROM DOCKERFILE -f Dockerfile .
  END
  WAIT
    SAVE IMAGE ${DOCKER_IMAGE_NAME}
  END
  DO +TEMPLATED_DOCKER_TAG_N_PUSH \
     --PUSH=$PUSH \
     --DOCKER_IMAGE_NAME=${DOCKER_IMAGE_NAME} \
     --DOCKER_IMAGES_EXTRA_TAGS="${DOCKER_IMAGES_EXTRA_TAGS}"
