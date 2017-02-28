'use strict';

module.exports = function createUserAndGroup(request, baseUrl, user) {
  return request.post({
    url: `${baseUrl}/api/wfm/user`,
    body: user
  })
  .then(createdUser => request.post({
    url: `${baseUrl}/api/wfm/membership`,
    body: {group: createdUser.group, user: createdUser.id}
  }).then(() => createdUser));
};
