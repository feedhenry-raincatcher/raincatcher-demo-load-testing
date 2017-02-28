'use strict';

module.exports = function makeUser(id) {
  return {
    "id": id,
    "password": "123",
    "name" : "Jim Loader",
    "phone" : "(999) 999 9999",
    "username" : `loaduser${id}`,
    "group": "Syl1GdSS", // Drivers
    "position" : "Senior Load Tester",
    "email" : `loaduser${id}@example.com`,
    "notes" : "There certainly are a lot of Jim's around here...",
    "banner" : "https://www.walldevil.com/wallpapers/w01/awesome-face-meme-wallpaper.jpg",
    "avatar" : "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/718smiley.svg/2000px-718smiley.svg.png"
  };
};
