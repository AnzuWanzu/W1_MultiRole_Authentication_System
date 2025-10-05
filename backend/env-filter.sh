#!/bin/sh
if [ "$GIT_COMMITTER_EMAIL" = "gituser@example.com" ]; then
  export GIT_COMMITTER_NAME="Angie Samson"
  export GIT_COMMITTER_EMAIL="m.angelinesamson@gmail.com"
fi
if [ "$GIT_AUTHOR_EMAIL" = "gituser@example.com" ]; then
  export GIT_AUTHOR_NAME="Angie Samson"
  export GIT_AUTHOR_EMAIL="m.angelinesamson@gmail.com"
fi
