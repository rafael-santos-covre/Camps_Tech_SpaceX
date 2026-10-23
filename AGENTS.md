# Project workflow

The owner requests that every previous stage remain recoverable.

Before each new user-requested change, preserve the current committed stage with
an annotated Git tag named `checkpoint/<short-description>` (use a unique suffix
if it already exists), and push that specific tag to origin. Never move or delete
an existing checkpoint. Preserve any uncommitted user work separately; do not
silently include it in your commit or discard it.

Record the checkpoint in the final response so the owner can identify the version
to return to. Restore an earlier stage only when requested, using a new commit;
do not rewrite shared branch history or force-push.
