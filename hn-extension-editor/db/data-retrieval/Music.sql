-- Hopefully one of the easier to implemnt into an Extension Builder

-- Default music files are already included in the Hacknet game so we can safely ignore them.
-- All we need is to move / copy the files from directory into our "BUILD_PATH/Music" folder.
-- I.E. if we have a track with ID 7 then we need to copy the file out of the user's directory into this extension.

-- Query to retrieve a list of all music tracks for this Extension
-- @PARAM: "ownerId" --> User ID of the owner who requested this extension be built.
SELECT "musicId", "title"
FROM "hn_Music"
WHERE "ownerId" = ?;

-- Path to the user_data can be relative to the builder, but perhaps an environmental variable to this directory may be easier in case it changes in future?
-- Copy example:
-- FROM:    user_data/<USER_ID>/<MUSIC_ID>.ogg
-- TO:      <BUILD_PATH>/Music/<MUSIC_ID>.ogg