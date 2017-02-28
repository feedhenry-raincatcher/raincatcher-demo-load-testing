'use strict';

module.exports = function makeMessage(user) {
  return {
    "receiver": user,
    "subject": "Test Message",
    "content": "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptas ipsum fuga id nulla inventore reiciendis ducimus suscipit minima quibusdam error asperiores eius quia ab velit numquam, quod possimus impedit totam!",
    "receiverId": user.id,
    "status": "unread",
    "sender": user
  };
};
